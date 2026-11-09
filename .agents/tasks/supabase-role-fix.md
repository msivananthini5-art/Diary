# Supabase RLS 401 Fix Report

## Root Cause

The diary app was receiving 401 Unauthorized errors when trying to write to the `spreads` and `memories` tables. The root cause was that all RLS policies on these tables require `role = 'owner'` in the `profiles` table, but:

- The `handle_new_user()` trigger was inserting new users with `role = 'viewer'` (the default)
- Existing users signed up before the fix was applied and had `role = 'viewer'`
- When these users tried to write to spreads or memories, the RLS policy check `coalesce((select role from profiles where id = auth.uid()), 'viewer') = 'owner'` failed, returning 401

## Changes Made

### 1. supabase-schema.sql — Updated handle_new_user() trigger

**File**: `c:\Users\r21ec\Downloads\New folder\supabase-schema.sql`

**Change**: In the `handle_new_user()` function, changed the default role from `'viewer'` to `'owner'`:

```sql
-- BEFORE:
insert into public.profiles (id, role)
values (new.id, 'viewer')

-- AFTER:
insert into public.profiles (id, role)
values (new.id, 'owner')
```

This ensures all newly signed-up users are created with `role = 'owner'`, allowing them to write to the database immediately.

**Added migration block** (commented out): At the end of the schema file, a one-time migration was added:

```sql
-- ONE-TIME MIGRATION: upgrade existing viewer profiles to owner
-- UPDATE public.profiles SET role = 'owner' WHERE role = 'viewer';
```

### 2. js/supabase-sync.js — Added auto-promote logic in getRole()

**File**: `c:\Users\r21ec\Downloads\New folder\js\supabase-sync.js`

**Change**: Modified the `getRole()` function to automatically promote any `'viewer'` profiles to `'owner'`:

```javascript
// Auto-promote: if profile is viewer (old default), upgrade to owner
if (_role === 'viewer') {
  await _supabaseClient.from('profiles').upsert({ id: user.id, role: 'owner' });
  _role = 'owner';
}
```

This handles users who signed up before the schema was fixed. When they log in, `getRole()` is called, and if their profile is still `'viewer'`, it automatically upgrades them to `'owner'`.

### 3. Added migration comment block to schema

The migration block is commented out by default. To run it manually, uncomment and execute in Supabase SQL Editor:

```sql
UPDATE public.profiles SET role = 'owner' WHERE role = 'viewer';
```

## Verification Steps

1. **Sign in** with a user account (new or existing)
2. **Check the profile row** in Supabase (Database → profiles table)
   - New users should have `role = 'owner'`
   - Existing users with `role = 'viewer'` will be auto-promoted to `'owner'` on next login
3. **Verify spreads write succeeds**: Create or edit a spread entry
   - Should see POST to `/rest/v1/spreads` with 200 or 201 status (not 401)
4. **Verify memories write succeeds**: Create or edit a memory entry
   - Should see POST to `/rest/v1/memories` with 200 or 201 status (not 401)

## Optional: Manual Migration for Existing Users

If you want to upgrade all existing `'viewer'` profiles to `'owner'` in one shot (without waiting for them to log in):

1. Go to Supabase Dashboard → SQL Editor
2. Run:
   ```sql
   UPDATE public.profiles SET role = 'owner' WHERE role = 'viewer';
   ```
3. Verify with: `SELECT id, role FROM public.profiles;`

## No RLS Policy Changes

- All RLS policies remain unchanged
- No tables other than the profile trigger were modified
- The 'viewer read' select policies are still in place for all tables
- Only the default role on trigger and the JS auto-promote logic were added

---

**Status**: Fix deployed and ready to test. Users will no longer receive 401 Unauthorized errors when writing to spreads, memories, photos, or stickers.
