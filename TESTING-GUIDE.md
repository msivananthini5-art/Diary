# SABI Diary Mobile Testing Guide

This guide walks through manual testing of the three critical fixes:
1. Supabase RLS / 401 Errors
2. Mobile 10-Page Navigation
3. Mobile Add-Memory Form

## Setup

### 1. Start Local Server
```bash
cd "c:\Users\r21ec\Downloads\New folder"
python -m http.server 8000
```

### 2. Open Browser and Emulate Mobile
- Open http://localhost:8000/diary.html
- DevTools: Ctrl+Shift+I (or Cmd+Opt+I on Mac)
- Toggle Device Toolbar: Ctrl+Shift+M (or Cmd+Shift+M)
- Set viewport to **390 × 844** (iPhone 13 Pro Mini)
- Reload page

### 3. Run Automated Tests (Optional)
In DevTools Console:
```javascript
runAllTests()
```

---

## TEST 1: Supabase RLS / 401 Errors

### Scenario A: Local Mode (No Supabase)
If Supabase credentials are not configured or unreachable:

**Expected:**
- App loads and shows login screen
- All functionality works in local mode (DiaryStorage only)
- No 401 or RLS errors in console

**Steps:**
1. Open http://localhost:8000/diary.html
2. Observe console: should see "Supabase not configured — running in local mode"
3. Test add-memory locally (should work without network)

### Scenario B: With Supabase Credentials
If Supabase credentials are configured:

**Expected:**
- User can sign up and create a profile
- Profile row is auto-created by trigger (no 401 before profile exists)
- User can insert spreads and memories without RLS errors

**Steps:**
1. Open http://localhost:8000/diary.html
2. Click "Open Diary" button
3. Sign up with new email: `test+TIMESTAMP@example.com`
4. Check console: should see "Session found — pulling data..."
5. Check Supabase Dashboard → Authentication → Users: new user exists
6. Check Supabase Dashboard → SQL Editor, run:
   ```sql
   SELECT id, role FROM profiles WHERE id = 'USER_ID_HERE';
   ```
   Expected: one row with role='owner'

**Verify No 401 Errors:**
- Console tab should have NO 401 errors
- Network tab (DevTools → Network) should show no failed requests to `/rest/v1/spreads` with 401 status
- If you see 401 errors, RLS policies may not be deployed to Supabase

---

## TEST 2: Mobile 10-Page Navigation

### Scenario: Navigate All 10 Spreads (20 Papers)

**Expected:**
- Page counter shows "1 / 20", "2 / 20", ..., "20 / 20"
- Swiping left advances to next paper
- Swiping right goes to previous paper
- Cannot swipe beyond first or last paper
- Each paper displays the correct memories (left or right side of its spread)

**Steps:**
1. On mobile (390×844), open diary after login or in local mode
2. Observe page counter: should show "1 / 20" (first paper of spread 1)
3. **Swipe left** (drag from right edge to left, 40+ pixels): should advance to "2 / 20"
4. **Swipe left again**: advance to "3 / 20" (first paper of spread 2)
5. Repeat 18 more times until you reach "20 / 20" (right page of spread 10)
6. **Swipe left at paper 20**: nothing happens (end of diary)
7. **Swipe right 19 times**: return to "1 / 20"
8. **Swipe right at paper 1**: nothing happens (start of diary)

**Verify Spread Mapping:**
- Papers 1-2 = Spread 1 (left, right)
- Papers 3-4 = Spread 2 (left, right)
- Papers 19-20 = Spread 10 (left, right)

**Check Browser Console:**
- You may see logs: `renderSpread - isMobile: true`
- No JavaScript errors (look for red X icons)

---

## TEST 3: Mobile Add-Memory Form

### Scenario A: Add Text-Only Memory

**Steps:**
1. On mobile, tap the **✨ Add** button (bottom right)
2. Modal should slide in from bottom
3. Form should be fully visible and scrollable if needed
4. Pre-filled: today's date and current time
5. Enter Title: "Test Memory"
6. Enter Memory: "This is my first memory on mobile"
7. Leave photo blank
8. Leave note blank
9. Don't select a sticker
10. Tap **Add Memory** button
11. Modal should close
12. "✨ Memory saved!" toast should appear briefly
13. Memory should appear on the current paper

**Expected:**
- No form fields are cut off
- All buttons are tap-friendly (44×44px minimum)
- Text inputs don't trigger iOS auto-zoom
- Form dismisses and memory appears on screen

### Scenario B: Add Memory with Photo

**Steps:**
1. Tap ✨ Add button
2. Enter Title: "Photo Test"
3. Enter Memory: "Here's a photo"
4. Tap **Photo (optional)** input
5. Select an image from device or camera
6. Preview should appear below the input
7. Tap **Add Memory**
8. Memory should appear with the photo (polaroid style)

**Expected:**
- Photo preview shows before submission
- Photo is rendered on the correct paper
- No crashes or broken image links

### Scenario C: Add Memory with Sticker

**Steps:**
1. Tap ✨ Add button
2. Enter Title and memory text
3. Scroll down to "Add Sticker" section
4. Click on any emoji (e.g., 🌸 or 💜)
5. Emoji should highlight with a border
6. Tap **Add Memory**
7. Sticker should appear on the page, rotated and scaled

**Expected:**
- Sticker picker is visible and responsive
- Selected sticker highlights
- Sticker renders with random rotation/position

### Scenario D: Form Validation

**Steps:**
1. Tap ✨ Add button
2. Leave Memory text empty
3. Tap **Add Memory**
4. Alert should appear: "Please write your memory"
5. Form should remain open

**Expected:**
- Validation prevents empty memories
- User can correct and resubmit

---

## TEST 4: Swipe Blocking During Form

### Scenario: Prevent Page Turn While Typing

**Expected:**
- While add-memory modal is open, swiping does NOT advance pages
- User can type in text field without accidentally turning pages

**Steps:**
1. On mobile, tap ✨ Add button
2. In the Memory text area, start typing text
3. Try to swipe left on the text field
4. Page should NOT advance (swipe is blocked)
5. Close modal (tap Cancel)
6. Swipe should work again

**Verify:**
- isDraggingContent flag blocks swipes when modal is open
- modal-content has stopPropagation() guards

---

## TEST 5: Memory Persistence

### Scenario A: Refresh After Adding Memory (Local)

**Steps:**
1. Add a memory with text and sticker
2. Press F5 (refresh)
3. Page should reload with the same memory visible

**Expected:**
- Memory persists in localStorage
- Position and sticker are retained

### Scenario B: Refresh After Adding Memory (Supabase)

**Steps:**
1. Sign in to Supabase-connected diary
2. Add memory with photo and sticker
3. Wait 2 seconds for Supabase push to complete
4. Open browser DevTools → Application → IndexedDB or Network
5. Verify memory was sent to Supabase (check Network tab)
6. Press F5 (refresh)
7. App pulls from Supabase
8. Memory should reappear with photo and sticker

**Expected:**
- Memory syncs to Supabase
- After refresh, memory is re-fetched and displayed

---

## TEST 6: Viewer Mode (Supabase Only)

### Scenario: Login as Viewer, Verify Editing is Blocked

**Steps:**
1. In Supabase Dashboard, manually create a new user with role='viewer'
2. Or use an existing viewer account
3. Sign in to diary with viewer email/password
4. Observe mode indicator: should say "VIEWER MODE"
5. ✨ Add button should be hidden
6. Memory action buttons (✏️ delete) should not appear
7. Try clicking on a memory: nothing should happen

**Expected:**
- Viewer cannot add, edit, or delete memories
- Edit button is not visible
- RLS policies prevent Supabase mutations

---

## Troubleshooting

### Issue: 401 Unauthorized on Spreads/Memories

**Diagnosis:**
- Open DevTools Network tab
- Filter for `/rest/v1/spreads` or `/rest/v1/memories`
- Check requests returning 401

**Solution:**
1. Verify Supabase credentials in `js/supabase-config.js`
2. Verify RLS policies were applied: Supabase Dashboard → Database → Tables → Policies
   - Should see: `own profile insert`, `owner insert`, `owner update`, `viewer read` for each table
3. Verify the trigger exists: Supabase Dashboard → Database → Functions
   - Should see: `handle_new_user()` function
4. Run the migration SQL:
   ```sql
   UPDATE public.profiles SET role = 'owner' WHERE role = 'viewer';
   ```

### Issue: Swipes Not Working on Mobile

**Diagnosis:**
1. Check isMobile() function returns true:
   ```javascript
   console.log('isMobile:', isMobile());
   ```
2. Verify book element has touch handlers wired

**Solution:**
1. Ensure viewport meta tag is set: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
2. Clear browser cache and reload
3. Check for JavaScript errors in console

### Issue: Form Fields Are Too Small to Tap

**Diagnosis:**
- Button appears smaller than 44×44px in DevTools

**Solution:**
1. Verify media query is applied: check DevTools Styles
2. Check `max-width: 80vw` and `max-height: 70vh` on mobile
3. Verify button size CSS: `min-width: 44px; min-height: 44px;`

### Issue: Photo Upload Not Working

**Diagnosis:**
1. Check console for errors
2. Verify storage bucket exists in Supabase
3. Check RLS policies on storage.objects

**Solution:**
1. Ensure storage bucket "diary-photos" exists
2. Verify storage RLS policies:
   - `owner upload`, `owner delete`, `auth read`
3. Try uploading a small image (~100KB)

---

## Test Completion Checklist

- [ ] RLS: No 401 errors when creating user/profile
- [ ] Mobile Nav: Can navigate all 20 papers with swipes
- [ ] Add-Memory: Form is fully visible on 390×844
- [ ] Add-Memory: Can add text-only memory
- [ ] Add-Memory: Can add memory with photo
- [ ] Add-Memory: Can add memory with sticker
- [ ] Add-Memory: Form validation works (no empty memories)
- [ ] Swipe Blocking: Modal prevents page turns
- [ ] Persistence: Memory survives page refresh (local)
- [ ] Persistence: Memory syncs to Supabase
- [ ] Viewer Mode: Edit button hidden, mutations blocked
- [ ] Console: No JavaScript errors
- [ ] Console: No 401 or 406 errors from Supabase

---

## Next Steps

If all tests pass:
1. Deploy schema changes to production Supabase (if not already done)
2. Notify users they can now use the diary on mobile
3. Monitor production logs for 401/406 errors
4. Gather user feedback on swipe gestures and form UX

If any tests fail:
1. Check the troubleshooting section above
2. Review the semantic review document at `.agents/tasks/review.md`
3. File an issue with steps to reproduce

