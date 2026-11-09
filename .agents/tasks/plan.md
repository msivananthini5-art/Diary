# SABI Diary — Critical Issues Implementation Plan

## Executive Summary

Three critical issues block the SABI diary app:

1. **Supabase RLS & Auth failures**: 401 Unauthorized and RLS policy violations when saving spreads and memories
2. **Mobile page navigation**: Only 1-2 papers visible on mobile; cannot navigate to pages 3-10
3. **Mobile Add Memory**: Form interactions fail or close unexpectedly; memories don't save to correct papers

All issues are rooted in mismatches between RLS policies, authentication role checking, and mobile-specific navigation logic. The fixes require SQL policy corrections, authentication flow fixes, and mobile state management changes.

---

## Root Cause Analysis

### Issue 1: Supabase 401 Unauthorized / RLS Violations

**Symptoms:**
- POST spreads: `401 Unauthorized` + `new row violates row-level security policy for table "spreads"`
- POST memories: `401 Unauthorized` + `new row violates row-level security policy for table "memories"`
- GET spreads by spread_num: `406 Not Acceptable`

**Root Causes:**

1. **profiles table policy too restrictive**: The policy `for all using (auth.uid() = id)` in `supabase-schema.sql` line 11 applies to SELECT only by default. INSERT and UPDATE are not explicitly allowed. When `getRole()` in `supabase-sync.js` line 183 attempts to upsert `{id: user.id, role: 'owner'}`, it fails with 401 because the policy does not grant INSERT permission to the authenticated user.

2. **spreads and memories policies check subquery fallback**: Both `spreads` and `memories` tables use:
   ```sql
   create policy "owner full" on [table] for all
     using (coalesce((select role from profiles where id = auth.uid()), 'viewer') = 'owner');
   ```
   When the profiles row does not exist (user is new), the subquery returns NULL, coalesce() falls back to 'viewer', and the policy denies INSERT/UPDATE. This creates a chicken-and-egg problem: the user cannot insert into spreads until profiles is created, but cannot create profiles due to RLS.

3. **.single() on zero-row query returns 406**: In `supabase-sync.js` line 201, `pushMemory()` calls:
   ```javascript
   const { data: spData } = await _supabaseClient.from('spreads')
     .select('id').eq('spread_num', spreadNum).single();
   ```
   If the spread was just inserted by `pushSpread()` but not yet visible due to replication lag, `.single()` on zero rows returns HTTP 406 Not Acceptable. Must use `.maybeSingle()` instead.

**Fix Strategy:**
- Update `supabase-schema.sql` to explicitly allow INSERT and UPDATE on profiles table for authenticated users
- Add INSERT/UPDATE/DELETE permissions to spreads and memories policies so they grant access directly (not via fallback)
- Change `.single()` to `.maybeSingle()` in `pushMemory()` and related functions
- Ensure getRole() upsert succeeds before attempting any other DB operations

---

### Issue 2: Mobile Page Navigation — All 10 Pages Unreachable

**Symptoms:**
- On mobile, can only view pages 1-2; cannot navigate to pages 3-10
- Tapping left/right edges does not turn pages
- Only 1-2 spreads exist in local state

**Root Causes:**

1. **Missing spread initialization**: `DiaryState.init()` in `diary.html` line 1350 loads spreads from localStorage or defaults to a single spread `[{spreadNum: 1, leftMemories: [], rightMemories: []}]`. No code creates spreads 2-10 on startup. Without 10 spreads in memory, `DiaryState.spreads.length = 1`, so `totalPapers = 1 * 2 = 2` papers (indices 0-1). Attempting to navigate to page 2 (spread 1) or beyond has no target spread.

2. **Mobile renderSinglePaper() not wired to touch events**: The `renderSinglePaper()` function in `diary.html` is called by `renderSpread()` when `isMobile()` returns true (line 1449), but the code that handles page-turn swipe on mobile (bookEl touch handlers) may not work correctly. The bookEl (the .book div) needs explicit touchstart/touchend handlers that call `goToNextPaper()`/`goToPrevPaper()` (or equivalent mobile navigation functions). Currently, no such handlers are visible.

3. **Mobile state mismatch**: `mobileCurrentPaperIndex` (line 1318) tracks the mobile paper view, but after Supabase pull, the UI may render on `DiaryState.currentSpreadIndex` (desktop mode), not the mobile paper. If the user is on mobile paper 3 but `DiaryState.currentSpreadIndex = 0`, clicking save or navigating can reset the view.

4. **No lazy spread creation**: When navigating to a page that maps to spread 5 (a spread that does not exist), `renderSinglePaper()` should create empty spreads 2-5 so the navigation target exists. Currently, it just clamps the index to the max available paper.

**Fix Strategy:**
- On initialization and after Supabase pull, ensure at least 10 spreads exist in `DiaryState.spreads`, creating empty ones as needed
- Add explicit touchstart/touchend/swipe handlers on the book element for mobile page turns
- On mobile, track `mobileCurrentPaperIndex` independently from `DiaryState.currentSpreadIndex` and ensure they stay in sync
- Ensure `renderSinglePaper()` syncs the display paper with the correct spread in `DiaryState.spreads` for later sync operations

---

### Issue 3: Mobile — Add Memory Form Interactions Fail

**Symptoms:**
- Form may close unexpectedly when tapping inside it
- Text fields and buttons are hard to interact with on small screens
- Save may fail silently or create duplicate memories
- New memories appear on wrong papers

**Root Causes:**

1. **Modal backdrop click-to-close too aggressive**: In `diary.html`, the `#add-modal` element has `onclick="closeAddModal()"` on the backdrop. On mobile, touch event propagation can bubble from form elements to the backdrop, causing accidental closes. Need to prevent propagation from form-internal clicks.

2. **Form inputs not optimized for mobile**: Mobile CSS media query at line 816 sets `.modal-content { width: 95vw; max-height: 85vh; }` but doesn't set proper touch-friendly input sizing. iOS auto-zooms input with font-size < 16px; Safari requires specific viewport and font handling.

3. **Page turn swipe interferes with form dragging**: The bookEl touchend handler for page turns (if present) may fire while the user is dragging inside the form or editing text, causing accidental page navigation. Need to set a flag (`isDraggingContent` or `isEditingForm`) to suppress page-turn gestures.

4. **New memories created on wrong paper**: When `submitAddMemory()` calls `DiaryState.addMemory(memory)` (line 1454), it adds the memory to `DiaryState.getCurrentSpread()`, which returns `DiaryState.spreads[DiaryState.currentSpreadIndex]`. On mobile, the displayed paper is `mobileCurrentPaperIndex`, which maps to a different spread. If user is viewing mobile paper 5 but `DiaryState.currentSpreadIndex = 0`, the new memory is added to spread 0, not spread 2 (the spread that maps to paper 5).

5. **No duplicate prevention**: If the save to Supabase fails and the user retries, `submitAddMemory()` may create a second local memory with the same timestamp due to lack of idempotency checks.

**Fix Strategy:**
- Update modal backdrop click handler to only close if clicking directly on the backdrop, not form elements
- Set `isDraggingContent = true` when interacting with form inputs/textareas
- Set input font-size to 16px on mobile to prevent iOS auto-zoom
- In `submitAddMemory()`, map `mobileCurrentPaperIndex` to the correct `DiaryState.spreadIndex` before calling `addMemory()`
- Add idempotency check: if a memory with the same `id` already exists, update instead of duplicate

---

## Implementation Plan

### Phase 1: Fix Supabase Authentication & RLS (Highest Priority)

These changes must be made FIRST because Issue 2 and 3 depend on successful Supabase writes.

#### 1.1 Fix profiles table RLS policy

**What:** Update `supabase-schema.sql` to explicitly allow authenticated users to INSERT and UPDATE their own profile row.

**Files:** `c:\Users\r21ec\Downloads\New folder\supabase-schema.sql` (lines 8-11)

**Changes:**
- Replace the single `for all` policy with separate policies for INSERT, UPDATE, and SELECT
- INSERT policy: allow authenticated users to insert rows where `id = auth.uid()`
- UPDATE policy: allow authenticated users to update rows where `id = auth.uid()`
- SELECT/DELETE policies: keep existing behavior

**SQL:**
```sql
-- Replace line 11:
-- drop policy if exists "own profile" on profiles;
-- create policy "own profile" on profiles for all using (auth.uid() = id);

-- With:
drop policy if exists "own profile insert" on profiles;
drop policy if exists "own profile update" on profiles;
drop policy if exists "own profile select" on profiles;
drop policy if exists "own profile delete" on profiles;

create policy "own profile insert" on profiles for insert with check (auth.uid() = id);
create policy "own profile update" on profiles for update using (auth.uid() = id);
create policy "own profile select" on profiles for select using (auth.uid() = id);
create policy "own profile delete" on profiles for delete using (auth.uid() = id);
```

**Verify:** 
- Run this SQL in Supabase SQL Editor → Tables → profiles → "Policies" tab
- Confirm 4 policies now exist (insert, update, select, delete)
- Then test: sign in and save a memory; check browser console for no 401 errors

#### 1.2 Fix spreads and memories RLS policies to grant direct access

**What:** Update spreads and memories policies to check role directly without relying on fallback 'viewer' default. This ensures users can insert/update spreads and memories once their profile is created.

**Files:** `c:\Users\r21ec\Downloads\New folder\supabase-schema.sql` (lines 38-42 for spreads, 78-82 for memories)

**Changes:**
- For spreads: change `for all` to separate `for insert`, `for update`, `for select` policies
- For memories: same approach
- INSERT/UPDATE: check that role = 'owner' directly (without the subquery fallback)
- SELECT: allow any authenticated user

**SQL - spreads policies (replace lines 38-42):**
```sql
drop policy if exists "owner full" on spreads;
drop policy if exists "viewer read" on spreads;

create policy "owner insert" on spreads for insert with check (
  (select role from profiles where id = auth.uid()) = 'owner'
);
create policy "owner update" on spreads for update using (
  (select role from profiles where id = auth.uid()) = 'owner'
);
create policy "viewer read" on spreads for select using (auth.uid() is not null);
```

**SQL - memories policies (replace lines 78-82):**
```sql
drop policy if exists "owner full" on memories;
drop policy if exists "viewer read" on memories;

create policy "owner insert" on memories for insert with check (
  (select role from profiles where id = auth.uid()) = 'owner'
);
create policy "owner update" on memories for update using (
  (select role from profiles where id = auth.uid()) = 'owner'
);
create policy "viewer read" on memories for select using (auth.uid() is not null);
```

**Verify:**
- Run in Supabase SQL Editor
- Test: sign in as owner, add a memory with a photo, check browser console for no 401 errors
- Test: create a new memory, refresh page, confirm it persists

#### 1.3 Fix .single() → .maybeSingle() for safer queries

**What:** Change `.single()` to `.maybeSingle()` in `supabase-sync.js` so queries that return zero rows don't fail with 406.

**Files:** `c:\Users\r21ec\Downloads\New folder\js\supabase-sync.js` (lines 158, 201, 230, 254)

**Changes:**
- Line 158: `getRole()` — keep `.single()` because profile MUST exist after auto-create
- Line 201: `pushMemory()` — change to `.maybeSingle()` because spread may not be visible yet
- Line 230: `pushPhoto()` — change to `.maybeSingle()` because memory may not be visible yet
- Line 254: `pushPhotoPosition()` — change to `.maybeSingle()`

**Code changes:**
```javascript
// Line 201 - in pushMemory():
// OLD: const { data: spData } = await _supabaseClient.from('spreads')
//   .select('id').eq('spread_num', spreadNum).single();
// NEW:
const { data: spData } = await _supabaseClient.from('spreads')
  .select('id').eq('spread_num', spreadNum).maybeSingle();

// Line 230 - in pushPhoto():
// OLD: const { data: memExists } = await _supabaseClient.from('memories')
//   .select('id').eq('id', memoryId).single();
// NEW:
const { data: memExists } = await _supabaseClient.from('memories')
  .select('id').eq('id', memoryId).maybeSingle();

// Line 254 - in pushPhotoPosition():
// OLD: const { data: memExists } = await _supabaseClient.from('memories')
//   .select('id').eq('id', memoryId).single();
// NEW:
const { data: memExists } = await _supabaseClient.from('memories')
  .select('id').eq('id', memoryId).maybeSingle();
```

**Verify:**
- Test: add a memory with photo on mobile, check console for no 406 errors
- Test: refresh page immediately after saving, confirm photo persists

---

### Phase 2: Ensure 10 Spreads Exist from Start (Mobile Navigation)

#### 2.1 Initialize 10 spreads on app startup

**What:** Modify `DiaryState.init()` in `diary.html` to create 10 empty spreads if fewer exist.

**Files:** `c:\Users\r21ec\Downloads\New folder\diary.html` (lines 1340-1360)

**Changes:**
- After loading from localStorage, check if spreads exist
- If fewer than 10, create empty spreads to reach 10 total
- Preserve any loaded spreads; only append new ones

**Code:**
```javascript
// In DiaryState.init(), after line 1354 (after DiaryStorage.load()):
const DiaryState = {
  spreads: [],
  currentSpreadIndex: 0,
  
  init() {
    const saved = DiaryStorage.load();
    if (saved && saved.spreads && saved.spreads.length > 0) {
      this.spreads = saved.spreads;
    } else {
      this.spreads = [{spreadNum: 1, leftMemories: [], rightMemories: []}];
    }
    this.currentSpreadIndex = 0;
    
    // ENSURE AT LEAST 10 SPREADS
    while (this.spreads.length < 10) {
      const nextNum = this.spreads[this.spreads.length - 1].spreadNum + 1;
      this.spreads.push({
        spreadNum: nextNum,
        leftMemories: [],
        rightMemories: []
      });
    }
    
    // ... rest of init() ...
  },
```

**Verify:**
- Load the app in mobile browser
- Open browser console: type `DiaryState.spreads.length` → should return 10
- Confirm all spreads have `spreadNum` 1-10

#### 2.2 Re-ensure 10 spreads after Supabase pull

**What:** After `SupabaseSync.pull()` in `diary.html` (around line 1420), ensure spreads are still at least 10.

**Files:** `c:\Users\r21ec\Downloads\New folder\diary.html` (after line ~1440)

**Changes:**
- After `await SupabaseSync.pull()`, check spread count and create empties if needed
- This handles the case where Supabase returns fewer than 10 spreads

**Code (in the SupabaseSync.getSession() block, after pull()):**
```javascript
if (_supabaseReady) {
  SupabaseSync.getSession().then(async session => {
    if (session) {
      const role = await SupabaseSync.getRole();
      setDiaryMode(role === 'owner' ? 'editor' : 'viewer');
      await SupabaseSync.pull();
      
      // ENSURE AT LEAST 10 SPREADS AFTER PULL
      while (DiaryState.spreads.length < 10) {
        const nextNum = DiaryState.spreads[DiaryState.spreads.length - 1].spreadNum + 1;
        DiaryState.spreads.push({
          spreadNum: nextNum,
          leftMemories: [],
          rightMemories: []
        });
      }
      DiaryState.save();
      
      if (typeof renderSpread === 'function') renderSpread();
    } else {
      showLoginSpread();
    }
  }).catch((err) => { ... });
}
```

**Verify:**
- Pull data from Supabase with fewer than 10 spreads
- Confirm DiaryState.spreads.length becomes 10
- Navigate through all 10 pages on mobile

---

### Phase 3: Fix Mobile Page Navigation (Touch & Swipe)

#### 3.1 Add touch-based page-turn handlers for mobile

**What:** Ensure the mobile bookEl (the .book div) has explicit touchstart/touchend handlers that detect left/right swipes and call page-turn functions.

**Files:** `c:\Users\r21ec\Downloads\New folder\diary.html` (after line ~1500, in the DOMContentLoaded block or near renderSpread())

**Changes:**
- After `renderSpread()` is defined, add touchstart and touchend handlers to bookEl
- Detect swipe direction: if swipe > 40px to the left, go to next page; if > 40px to the right, go to previous page
- Prevent page-turn if `isDraggingContent = true` (i.e., user is interacting with form)

**Code (add after renderSpread() function, around line 1550):**
```javascript
const bookEl = document.getElementById('book');
if (bookEl) {
  let touchStartX = 0;
  let touchStartY = 0;
  
  bookEl.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isUserSwiping = true;
  }, false);
  
  bookEl.addEventListener('touchend', (e) => {
    if (!isUserSwiping) return;
    if (isDraggingContent) { isUserSwiping = false; return; } // Suppress page-turn if dragging
    
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX;
    const threshold = 40; // pixels
    
    if (Math.abs(deltaX) > threshold) {
      if (deltaX < 0) {
        // Swiped left → next page
        if (isMobile()) goToNextPaperMobile();
      } else {
        // Swiped right → prev page
        if (isMobile()) goToPrevPageMobile();
      }
    }
    
    isUserSwiping = false;
  }, false);
}
```

**Add mobile page-turn functions (around line 1550):**
```javascript
function goToNextPaperMobile() {
  if (isAnimating) return;
  mobileCurrentPaperIndex++;
  const totalPapers = DiaryState.spreads.length * 2;
  if (mobileCurrentPaperIndex >= totalPapers) {
    mobileCurrentPaperIndex = totalPapers - 1;
    return;
  }
  isAnimating = true;
  setTimeout(() => {
    renderSinglePaper(mobileCurrentPaperIndex);
    isAnimating = false;
  }, 700);
}

function goToPrevPageMobile() {
  if (isAnimating) return;
  mobileCurrentPaperIndex--;
  if (mobileCurrentPaperIndex < 0) {
    mobileCurrentPaperIndex = 0;
    return;
  }
  isAnimating = true;
  setTimeout(() => {
    renderSinglePaper(mobileCurrentPaperIndex);
    isAnimating = false;
  }, 700);
}
```

**Verify:**
- Load app on mobile (≤768px viewport)
- Swipe left and right on the paper → page should turn smoothly
- Confirm can navigate from page 1 to page 20 (10 spreads × 2 pages each)

#### 3.2 Fix mobile paper-to-spread index mapping

**What:** Ensure `renderSinglePaper()` correctly syncs the mobile paper index with `DiaryState.currentSpreadIndex` so later save operations write to the correct spread.

**Files:** `c:\Users\r21ec\Downloads\New folder\diary.html` (in renderSinglePaper function, around line 1700)

**Changes:**
- In `renderSinglePaper(paperIndex)`, after mapping paperIndex → spreadIndex, update `DiaryState.currentSpreadIndex` to match
- This ensures any memory saves go to the correct spread

**Code (in renderSinglePaper, around line ~1705):**
```javascript
function renderSinglePaper(paperIndex) {
  const totalPapers = DiaryState.spreads.length * 2;
  if (paperIndex < 0) paperIndex = 0;
  if (paperIndex >= totalPapers) paperIndex = totalPapers - 1;
  
  mobileCurrentPaperIndex = paperIndex;
  
  const spreadIndex = Math.floor(paperIndex / 2);
  const side = (paperIndex % 2) ? 'right' : 'left';
  
  // SYNC DiaryState.currentSpreadIndex with the displayed spread
  DiaryState.currentSpreadIndex = spreadIndex;
  
  // ... rest of renderSinglePaper() ...
}
```

**Verify:**
- Navigate to page 5 on mobile
- Open browser console: `DiaryState.currentSpreadIndex` should be 2 (spreads are 0-indexed)
- Add a memory and refresh; it should appear on page 5

---

### Phase 4: Fix Mobile Add Memory Form

#### 4.1 Prevent modal backdrop click-to-close on form interaction

**What:** Update `openAddModal()` and modal click handler so clicking inside the form does not close the modal.

**Files:** `c:\Users\r21ec\Downloads\New folder\diary.html` (around line ~2250 where modal HTML is defined, and the JavaScript closeAddModal function)

**Changes:**
- Add a click handler to `#add-modal` that only closes if the click target is the modal backdrop itself, not any child element
- Add `event.stopPropagation()` to the `.modal-content` div so clicks inside the form don't bubble to the backdrop

**In the HTML (around line 2250):**
```html
<div id="add-modal" class="modal">
  <div class="modal-content" onclick="event.stopPropagation()">
    <!-- form content -->
  </div>
</div>
```

**In the JavaScript (replace closeAddModal or add click handler):**
```javascript
function closeAddModal() {
  const modal = document.getElementById('add-modal');
  if (modal) modal.classList.remove('show');
}

// Add click handler to modal backdrop
const addModal = document.getElementById('add-modal');
if (addModal) {
  addModal.addEventListener('click', (e) => {
    // Only close if clicking the backdrop itself, not a child element
    if (e.target === addModal) {
      closeAddModal();
    }
  });
}
```

**Verify:**
- Open Add Memory modal on mobile
- Click inside the form (text fields, buttons) → modal should NOT close
- Click outside the modal (backdrop) → modal should close

#### 4.2 Set isDraggingContent flag when form is active

**What:** Set `isDraggingContent = true` when the modal is open so swipe-to-turn gestures don't interfere.

**Files:** `c:\Users\r21ec\Downloads\New folder\diary.html` (in openAddModal and closeAddModal functions)

**Changes:**
```javascript
function openAddModal() {
  const modal = document.getElementById('add-modal');
  if (modal) {
    modal.classList.add('show');
    isDraggingContent = true; // Suppress page-turn swipes while form is open
  }
}

function closeAddModal() {
  const modal = document.getElementById('add-modal');
  if (modal) modal.classList.remove('show');
  isDraggingContent = false; // Re-enable page turns
}
```

**Verify:**
- Open Add Memory modal on mobile
- Try to swipe left/right on the form → page should NOT turn
- Close modal → swipe should work again

#### 4.3 Ensure new memories are added to the correct paper on mobile

**What:** In `submitAddMemory()`, map `mobileCurrentPaperIndex` to the correct `DiaryState.currentSpreadIndex` before adding the memory.

**Files:** `c:\Users\r21ec\Downloads\New folder\diary.html` (in submitAddMemory function, around line ~2300)

**Changes:**
```javascript
function submitAddMemory() {
  // MOBILE: sync current spread to displayed paper
  if (isMobile()) {
    const spreadIndex = Math.floor(mobileCurrentPaperIndex / 2);
    DiaryState.currentSpreadIndex = spreadIndex;
  }
  
  // ... rest of submitAddMemory() — collect form data, call DiaryState.addMemory() ...
}
```

**Verify:**
- Navigate to page 5 on mobile
- Add a memory
- Confirm it appears on page 5 (not page 1)
- Refresh page → memory persists on page 5

#### 4.4 Fix iOS input focus zoom issue

**What:** Set font-size ≥ 16px on mobile inputs to prevent iOS auto-zoom on focus.

**Files:** `c:\Users\r21ec\Downloads\New folder\diary.html` (CSS media query section, around line 816)

**Changes:**
```css
@media(max-width:768px), (max-aspect-ratio: 1/1){
  /* ... existing mobile CSS ... */
  
  /* Input sizing for mobile - prevent iOS auto-zoom */
  .modal-field input,
  .modal-field textarea {
    font-size: 16px; /* Prevents iOS zoom on input focus */
    padding: 0.8rem;
  }
  
  /* Login inputs */
  .login-input {
    font-size: 16px;
  }
}
```

**Verify:**
- Open app in Safari on iPhone
- Tap a text field in Add Memory modal → page should NOT auto-zoom
- Type text → should be readable at current zoom level

---

### Phase 5: Test & Verification

#### 5.1 Test Supabase authentication and RLS

**Procedure:**
1. Clear browser localStorage and cookies
2. Load diary.html
3. Sign in with valid Supabase user (owner role)
4. Open browser DevTools Console → filter for "SupabaseSync" and "supabase.min.js"
5. Add a text-only memory: date, title, text
6. Check Console:
   - No 401 Unauthorized errors
   - No "violates row-level security" errors
   - Memory ID should be printed by pushMemory
7. Refresh page
8. Confirm memory persists and displays on the same paper

**Expected Results:**
- POST spreads: 200 OK
- POST memories: 200 OK (or 201 Created)
- GET spreads: 200 OK
- Console shows no RLS or auth errors

#### 5.2 Test mobile page navigation

**Procedure (at 390 × 844 viewport):**
1. Load diary.html on mobile
2. Confirm single-paper view (no right page visible)
3. Check page counter: "1 / 10"
4. Swipe left 5 times → page counter should change to "6 / 10"
5. Swipe right 10 times → should go back to page 1
6. Try to swipe beyond page 10 → should stay on page 10 (no wrap-around)
7. Add a memory on page 5
8. Refresh → memory should persist on page 5

**Expected Results:**
- All 10 pages are reachable by swiping
- Page counter updates correctly
- Memories stay on their assigned pages
- No horizontal scroll of the paper itself

#### 5.3 Test mobile Add Memory form

**Procedure (at 390 × 844 viewport):**
1. Load diary.html on mobile, sign in
2. Navigate to page 3 (spread 1, right side)
3. Tap "✨ Add" button
4. Confirm modal opens (background darkens, form appears)
5. Tap each input field (date, time, title, text, notes) → no accidental modal close
6. Type text in text field → no auto-zoom
7. Add a photo from device camera roll
8. Select a sticker
9. Tap "Add Memory" button
10. Confirm modal closes, memory appears on page 3
11. Refresh → memory persists on page 3

**Expected Results:**
- Form is usable on small screens
- No accidental closes
- All fields (date picker, file upload, sticker picker, buttons) are touch-friendly
- New memories appear on the correct paper
- No console errors

#### 5.4 Test role-based access (viewer vs owner)

**Procedure:**
1. Sign in as owner → confirm "EDIT MODE" indicator and "✨ Add" button visible
2. Add a memory
3. Sign out, sign in as a different Supabase user with role='viewer'
4. Load diary → confirm "VIEWER MODE" indicator and "✨ Add" button hidden
5. Confirm memories are visible but read-only (no edit/delete buttons)

**Expected Results:**
- Owner can edit and add memories
- Viewer cannot edit or add memories (UI hidden, RLS blocks writes)

#### 5.5 Integration test: full workflow

**Procedure:**
1. Sign in as owner
2. Add memory 1 on page 2: text only
3. Add memory 2 on page 5: text + photo + sticker
4. Add memory 3 on page 10: text + date + notes
5. Navigate all 10 pages → confirm all memories visible on correct pages
6. Edit memory 2: change title → confirm update works, no RLS error
7. Delete memory 1 → confirm removed from local state and Supabase
8. Refresh page → confirm memory 2 and 3 persist, memory 1 gone
9. Switch to mobile view (≤768px) → repeat navigation and memory checks
10. Sign out and back in as viewer → confirm read-only mode

**Expected Results:**
- All operations complete without RLS or auth errors
- Memories persist across page reloads
- Desktop and mobile views both work correctly
- Role-based access is enforced

---

## Summary of Changes

| Issue | Root Cause | Fix Location | Change Type |
|-------|-----------|--------------|------------|
| 401 RLS | profiles policy too restrictive | supabase-schema.sql | SQL - add explicit INSERT/UPDATE policies |
| 401 RLS | spreads/memories policy fallback | supabase-schema.sql | SQL - remove fallback, check role directly |
| 406 Not Acceptable | .single() on zero rows | js/supabase-sync.js | JS - change to .maybeSingle() |
| Pages 3-10 unreachable | Only 1 spread at startup | diary.html DiaryState.init | JS - create 10 spreads |
| Pages 3-10 unreachable | No swipe handlers on mobile | diary.html touchstart/touchend | JS - add swipe event handlers |
| Pages 3-10 unreachable | Mobile index not synced | diary.html renderSinglePaper | JS - sync currentSpreadIndex |
| Modal closes on click | Backdrop click bubbles | diary.html modal HTML + handler | HTML + JS - stopPropagation + target check |
| Swipe interferes with form | isDraggingContent not set | diary.html openAddModal | JS - set flag when modal open |
| Memory on wrong paper | Mobile paper index not mapped | diary.html submitAddMemory | JS - map mobile paper to spread |
| iOS input zoom | font-size < 16px | diary.html CSS media query | CSS - set input font-size 16px |

---

## Dependency Order

1. **Must do first**: Fix RLS policies (SQL in supabase-schema.sql and supabase-sync.js) — all other features depend on writes succeeding
2. **Then**: Initialize 10 spreads (diary.html DiaryState.init) — mobile navigation depends on spreads existing
3. **Then**: Add swipe handlers (diary.html touchstart/touchend) — enables page turning
4. **Then**: Fix form and modal interactions (diary.html modal, submitAddMemory) — enables adding memories
5. **Finally**: Test all workflows end-to-end

---

## Manual Supabase Steps Required

After implementing the SQL changes to `supabase-schema.sql`:

1. Open Supabase Dashboard → SQL Editor
2. Copy the updated SQL from the plan (sections 1.1, 1.2)
3. Paste and execute
4. Confirm no errors in the query output
5. Navigate to Tables → profiles/spreads/memories → Policies tab
6. Verify new policies are listed

If existing users have `role='viewer'` set (from before the schema fix), optionally run:
```sql
UPDATE public.profiles SET role = 'owner' WHERE role = 'viewer';
```

This is a one-time migration to promote existing users to owner.

---

## Notes for Implementer

- **Do not redesign the homepage** — only fix diary.html and SQL
- **Do not remove RLS** — only fix the policies to grant correct access
- **Do not change data structure** — spreads still have spreadNum, leftMemories, rightMemories
- **Preserve existing memories** — no automatic rearrangement or deletion
- **Test on actual mobile devices** if possible — browser DevTools mobile emulation may not capture all touch behaviors
- **After each fix, test in isolation** — verify one issue resolves before moving to the next
- **Check browser console for errors** — Supabase SDK prints detailed error messages there

