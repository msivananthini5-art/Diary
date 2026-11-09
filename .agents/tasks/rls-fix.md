# Supabase RLS 401 Error Fix

## Error Symptoms
The SABI diary app was failing with 401 Unauthorized errors when trying to create or read data:

```
POST /rest/v1/spreads?on_conflict=spread_num  → 401 Unauthorized
pushSpread: new row violates row-level security policy for table "spreads"

POST /rest/v1/memories?on_conflict=id         → 401 Unauthorized
pushMemory: new row violates row-level security policy for table "memories"
```

## Root Cause Analysis

### Problem 1: Missing Profile Row on First Login
The original RLS policies used direct subqueries:
```sql
create policy "owner full" on spreads for all
  using ((select role from profiles where id = auth.uid()) = 'owner');
```

When a user logs in for the first time, no row exists in the `profiles` table yet. The subquery returns `NULL`, which evaluates as `false` in the policy check, and Supabase rejects the operation with 401 Unauthorized.

This is a race condition: the user needs to write to trigger profile creation, but the policy blocks the write because the profile doesn't exist yet.

### Problem 2: Policy Failure on `NULL` Comparison
Even the "viewer read" policy had the same issue:
```sql
create policy "viewer read" on spreads for select
  using ((select role from profiles where id = auth.uid()) = 'viewer');
```

A `NULL` value compared to any string (`'viewer'` or `'owner'`) always returns `NULL`, which is treated as `false` in policy logic. This blocked all reads for users without a profile row.

## Solution Overview

The fix has three parts:

### 1. Auto-Create Profile Rows with a Trigger
Added a `handle_new_user()` trigger that fires when a new row is inserted into `auth.users` (Supabase's built-in auth table). The trigger automatically inserts a profile row with the default role `'viewer'`.

This ensures every authenticated user has a profile row immediately after signup, preventing the missing-profile scenario.

### 2. Graceful Fallback with `COALESCE`
Updated all RLS policies to use `coalesce()` to handle missing profile rows:

**Before:**
```sql
using ((select role from profiles where id = auth.uid()) = 'owner')
```

**After:**
```sql
using (coalesce((select role from profiles where id = auth.uid()), 'viewer') = 'owner')
```

If the subquery returns `NULL`, `coalesce()` returns `'viewer'` instead. This ensures:
- Owner policy: only evaluates true if role is explicitly 'owner' (since no profile means 'viewer')
- Viewer read policy: simplified to just check `auth.uid() is not null` — any authenticated user can read

### 3. Fallback in JavaScript Client
Updated the `getRole()` function in `supabase-sync.js` to fallback to `'viewer'` when no profile row exists:

**Before:**
```javascript
_role = data?.role || null;
```

**After:**
```javascript
_role = data?.role || 'viewer'; // fallback: no profile row = viewer
```

This prevents `DIARY_MODE` from being left unset on first login, ensuring the UI can render in viewer mode while the profile row is being created server-side.

## Files Changed

### 1. `supabase-schema.sql`
- Added `handle_new_user()` trigger function to auto-create profile rows on auth signup
- Added `on_auth_user_created` trigger on `auth.users` table
- Added `drop policy if exists` statements before `create policy` to make the script idempotent
- Updated policies on `spreads`, `memories`, `memory_photos`, `memory_stickers` to use `coalesce()`
- Simplified `viewer read` policy to just check `auth.uid() is not null`
- Updated storage bucket policies to use `coalesce()` for owner checks

### 2. `supabase-sync.js`
- Changed `getRole()` fallback from `null` to `'viewer'`

## How to Apply the Fix

### Step 1: Deploy the Updated Schema
1. Open your Supabase project dashboard
2. Go to **Database → SQL Editor**
3. Create a new query
4. Copy the entire contents of the updated `supabase-schema.sql`
5. Paste it into the SQL Editor
6. Click **Run** to execute

The `drop policy if exists` statements at the top of each table section ensure the script can be re-run safely without errors.

### Step 2: Handle Existing Users Without Profile Rows
If you have existing auth users who signed up before this fix was deployed and don't have a profile row yet, manually insert them:

```sql
INSERT INTO profiles (id, role)
SELECT id, 'viewer' FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles);
```

This query:
- Finds all users in `auth.users` who don't have a corresponding row in `profiles`
- Inserts them with the default role `'viewer'`
- Is safe to run multiple times (no duplicates)

Paste this into the same SQL Editor and run it.

### Step 3: Redeploy the Updated Client
Update your deployed `supabase-sync.js` file with the fallback change to `getRole()`.

## Verification

After applying the fix, users should be able to:
1. Sign in successfully without 401 errors
2. Create spreads and memories
3. Read spreads and memories
4. Upload and manage photos and stickers
5. See consistent DIARY_MODE in both editor and viewer contexts

If you still see 401 errors after deploying, verify:
- The schema SQL was executed successfully
- No custom RLS policies are overriding the new ones
- The user's profile row was created (check in Database → Table Editor → profiles)
- The user's JWT is valid and recent

## Security Notes

- The viewer read policy now allows ANY authenticated user to read all spreads and memories. This is intentional for shared diary scenarios. If you need per-user or per-diary access control, add an `owner_id` column to `spreads` and check ownership in the policy.
- The owner write policy still requires role='owner' in the profile, so unprivileged users cannot accidentally write as owner.
- The auto-create trigger ensures all new users get a profile row with role='viewer', preventing accidental 401 errors on first login.
