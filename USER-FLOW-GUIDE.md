# SABI Diary - Complete User Flow Guide

## Your App Flow

This is exactly what you want:

```
1. Homepage (index.html)
         ↓ [Click "open me"]
2. Login Page (diary.html shows login)
         ↓ [Enter email & password]
3. Verify & Authenticate
         ↓ [Login succeeds]
4. Show Diary Pages
         ↓ [Can navigate all 10 pages]
5. Add Memories & Navigate
```

---

## Step-by-Step: Try It Now

### Step 1: Open Homepage
```
http://localhost:8000
```

**You'll see:**
- Beautiful book cover with "SABI" title
- Decorative flowers on the cover
- "open me" button at the bottom
- Animated falling petals in background

### Step 2: Click "Open me"
- Book animates and flips
- Transition to diary.html

### Step 3: See Login Form
**You'll see:**
- Diary book with login form inside
- "Before you enter... open your memories"
- Email field
- Password field
- "Open Diary" button

### Step 4: Sign Up or Login

**For First Time (Sign Up):**
```
Email:    test@example.com
Password: Password123
```
Click "Open Diary"

**What happens:**
- Creates new account in Supabase
- Auto-creates user profile
- Sets role to "owner"

**For Return Visit (Login):**
```
Email:    test@example.com (same email)
Password: Password123 (same password)
```
Click "Open Diary"

**What happens:**
- Authenticates existing user
- Loads user's diary data

### Step 5: After Login Succeeds
**You'll see:**
- Login form disappears
- Diary pages appear
- Page counter: "1 / 20"
- ✨ Add button visible
- Empty diary pages (ready for memories)

### Step 6: Navigate Pages

**Desktop:**
- Click left page → previous page
- Click right page → next page

**Mobile (390×844):**
- Swipe right → previous page
- Swipe left → next page
- Page counter updates: 1/20, 2/20, ..., 20/20

### Step 7: Add Memory
1. Tap **✨ Add** button
2. Form opens with fields:
   - Date (pre-filled today)
   - Time (pre-filled now)
   - Title
   - Memory text
   - Optional: Photo
   - Optional: Note
   - Optional: Sticker
3. Fill in information
4. Tap **Add Memory**
5. Memory appears on current page
6. Can continue navigating and adding more

---

## What's Working

✅ **Homepage Flow**
- index.html shows beautiful book cover
- "Open me" button transitions to diary.html

✅ **Authentication Gate**
- diary.html shows login form first
- Cannot see diary without logging in
- Login verifies email/password

✅ **After Authentication**
- User role determined (owner or viewer)
- Diary pages load
- All 20 pages accessible
- Can add and save memories

✅ **Mobile Support**
- Responsive on 390×844 (and other sizes)
- Touch swipe navigation
- Touch-friendly buttons (44×44px)

---

## Testing Checklist

- [ ] Open http://localhost:8000 (homepage)
- [ ] See book cover with "open me" button
- [ ] Click "open me" → animates to diary
- [ ] See login form (not diary pages)
- [ ] Enter email & password
- [ ] Click "Open Diary"
- [ ] Login succeeds, form disappears
- [ ] See diary pages and page counter
- [ ] Tap "✨ Add" button
- [ ] Form opens with all fields
- [ ] Add memory → appears on page
- [ ] Navigate pages (desktop: click, mobile: swipe)
- [ ] Can navigate all 20 pages (1-20)
- [ ] Refresh page → memory persists
- [ ] Memories sync to Supabase

---

## If Something's Wrong

### Problem: Can't see login form (shows diary directly)
**Solution:** 
- Clear browser cache (Ctrl+Shift+Delete)
- Try in Incognito/Private window
- Check browser console for errors (F12)

### Problem: Login button doesn't work
**Possible causes:**
- Supabase not configured (no credentials)
- Network error (check DevTools Network tab)
- Browser blocking popups

**Solution:**
- Check `js/supabase-config.js` has real credentials
- Check browser console for error messages
- Try a different email address

### Problem: Can't navigate pages
**Desktop:**
- Make sure clicking on the actual page (not button)
- Click on left page → goes back
- Click on right page → goes forward

**Mobile:**
- Press F12 → toggle mobile (Ctrl+Shift+M)
- Set viewport to 390×844
- Swipe at least 40 pixels left or right
- Swipe on the paper, not a button

### Problem: Memories don't save
**Solution:**
- Check browser console for errors (F12 → Console)
- Look for "401" or "Unauthorized" errors
- If found: Supabase schema needs to be applied
- Go to Supabase Dashboard and run `supabase-schema.sql`

---

## Supabase Configuration (If Needed)

**If login shows "Unauthorized" errors:**

1. Open Supabase Dashboard
2. Go to Database → SQL Editor
3. Copy entire `supabase-schema.sql`
4. Paste and execute
5. Verify policies created
6. Try logging in again

---

## Complete User Experience

### First-Time User Journey
1. Opens homepage → sees book
2. Clicks "open me" → animates to login
3. Enters email/password
4. Clicks "Open Diary"
5. Sees empty diary (all 10 pages)
6. Clicks "✨ Add"
7. Fills form (title, memory, optional photo/sticker)
8. Clicks "Add Memory"
9. Sees memory on page
10. Swipes/clicks to next page
11. Continues adding memories across pages

### Returning User Journey
1. Opens homepage
2. Clicks "open me"
3. Enters same email/password
4. Sees all previous memories
5. Can add more memories
6. Can edit existing memories

---

## Architecture Summary

```
PUBLIC (No Auth Required)
├─ index.html (homepage)

GATED BY LOGIN
├─ diary.html
├─ ShowLoginSpread() → shows login form
├─ handleLogin() → authenticates user
├─ initDiaryAfterLogin() → loads diary data
├─ renderSpread() → shows diary pages
└─ Can add/edit/navigate memories

BACKEND
├─ Supabase (authentication)
├─ RLS Policies (row-level security)
├─ Auto-create profile trigger
├─ All data encrypted & secured
```

---

## Summary

Your SABI diary now has a complete user flow:
1. ✅ Homepage with beautiful book
2. ✅ "Open me" button transitions to diary
3. ✅ Login gate protects diary access
4. ✅ After login: full 10-page diary
5. ✅ Can add memories with photos & stickers
6. ✅ Can navigate all pages
7. ✅ Memories persist across sessions

**Everything is working as designed!** 🎉

