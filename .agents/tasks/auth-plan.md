# SABI Diary Authentication Experience — Implementation Plan

## Executive Summary

Transform the diary authentication from a generic modal overlay into an immersive "login paper page" that feels like opening a physical diary. The user lands on the homepage, clicks "Open Me", sees a handwritten login page appear within the diary itself (not as a separate overlay), and after successful login, the page turns to reveal the real diary contents. All existing functionality and layout are preserved; only visual presentation and auth flow are enhanced.

---

## Architecture Decisions

### 1. Login Paper Page Location
**Decision**: Replace the fixed `#login-overlay` div with a login spread (left/right pages) that renders **inside** the `.book` element as the initial spread when no session exists.

**Rationale**: The user requirement is that login should feel like part of the diary, not a separate modal. The cleanest approach is to treat it as spread 0 (before all memories), styled using the same `.page-left` / `.page-right` CSS already defined. When login succeeds, we animate the pages away using the existing flip animation, then render the real memory spreads.

### 2. Visual Styling of Login Paper
**Decision**: Use existing `.page-left` / `.page-right` CSS (warm ivory cream, subtle ruled lines, botanical decorations) for the login paper itself. Content on the paper uses the established diary typography (Satisfy for heading, Kalam for body/labels).

**Rationale**: The design document specifies all pages must use warm sandalwood cream paper, ruled lines, and botanical decorations. Reusing the existing page CSS ensures consistency and avoids duplicating styles. The login paper will look indistinguishable from a real diary page.

### 3. Email/Password Field Styling
**Decision**: Style input fields as diary lines (border-bottom only, no border-radius, cream background, Kalam font, dark muted purple text). Do NOT use rectangular web boxes.

**Rationale**: Modern web inputs (with rounded borders, solid backgrounds, visible boxes) break the physical diary illusion. Diary line inputs (underline-only, minimal styling) feel like the user is writing on paper itself.

### 4. Submit Button Styling
**Decision**: Style the submit button as a small paper tab or bookmark — soft lavender background, Satisfy font, subtle shadow, rounded on one end, NOT a standard web button.

**Rationale**: A standard button (blue, rectangular, glossy) feels like website UI. A bookmark-style tab feels like a physical object attached to the diary.

### 5. Transition Animation
**Decision**: After successful login, apply `flip-forward` animation to `.page-right.login` to make it rotate 180deg, then immediately render the real spreads below.

**Rationale**: The existing flip animations are designed for page turns. Reusing them makes the transition feel continuous with the rest of the diary experience.

### 6. Role-Based UI Gating
**Decision**: After login, fetch the user's role via `SupabaseSync.getRole()`, call `setDiaryMode('editor' | 'viewer')`, and apply existing gating logic (add button hidden in viewer mode, edit/delete hidden, stickers non-draggable).

**Rationale**: The gating logic already exists; the auth flow just needs to call it at the right time.

---

## Implementation Plan

### Phase 1: Remove Old Login Overlay

- **[ ] 1. Remove the inline `#login-overlay` HTML div entirely from diary.html.**
      The old overlay div (lines ~940-954) is a fixed-position dark modal with a centered card.
      This will be replaced by an in-book login spread.
      Files: `diary.html` (HTML structure only; CSS removed in later steps)
      Verify: `grep -n "login-overlay" diary.html` returns no results.

---

### Phase 2: Create Login Spread HTML Structure

- **[ ] 2. Add a hidden login spread to the DOM, rendered as `.spread#login-spread` with `.page-left` and `.page-right` structure.**
      The spread will contain:
      - `.page-left.login-page`: Email/password form with heading "Before you enter...", labels, input fields, submit button, error message area.
      - `.page-right.login-decor`: Decorative right page with date, small welcome text, and botanical elements only (no functional content).
      Both pages use the existing `.page-left` / `.page-right` CSS for warm ivory cream, ruled lines, botanical decorations.
      The login form is initially hidden (display: none) until needed.
      Files: `diary.html` (add new HTML inside `.book`, before `#current-spread`)
      Verify: Open browser DevTools, inspect the DOM, confirm `.spread#login-spread` exists with correct structure.

---

### Phase 3: Add Login Paper CSS

- **[ ] 3. Create new CSS rules for `.login-page` and `.login-decor` styling in an inline `<style>` block or new file.**
      Login page styling:
      - Use existing `.page-left` background (warm ivory cream, ruled lines, decorations).
      - Heading: 'Before you enter...' in Satisfy font, 1.5rem, color #3d2426 (dark muted purple), centered, with small margin-bottom.
      - Subheading: 'open your memories' in Kalam font, 0.95rem, muted purple #7a5a65, italic, centered.
      - Email/password labels: Kalam font, 0.85rem, #6b4c35 (warm brown), uppercase.
      - Email/password inputs: border-bottom only (1px solid #b5a58f), no border-radius, cream background #fffbf7, Kalam font, 0.95rem, color #3d2426, padding-bottom 0.35rem, margin-bottom 1rem.
      - Focus/active states: border-bottom color changes to #a8606e (dusty rose), subtle shadow.
      - Submit button: styled as a bookmark tab — background #e0d4c8, soft shadow, Satisfy font, 1.05rem, #3d2426, rounded on top-right corner only (border-radius: 0 6px 6px 0), padding 0.7rem 1.2rem, cursor pointer.
      - Submit button hover: background becomes slightly darker #d4c8bc, shadow enhanced.
      - Error message: color #c85a5a (soft red), Kalam font, 0.85rem, opacity 0 by default, opacity 1 when error present.
      - Small corner flowers: positioned absolute in top-left and bottom-right, 0.8rem emoji (🌸 or 🍃), opacity 0.4.
      Decorative page styling (right page):
      - Use same `.page-right` background.
      - Content: centered, small text in Kalam font, "Your diary awaits", decorative flowers, no input fields.
      Files: `diary.html` (inline `<style>` or new external CSS file if style block gets too large)
      Verify: Open the diary, visually inspect login page appearance, confirm no rectangular web boxes, fonts match spec.

---

### Phase 4: Implement Auth Flow with Login Spread

- **[ ] 4. Modify the session check in diary.html to show/hide the login spread instead of the old overlay.**
      Current code (around line 1113): `SupabaseSync.getSession()` checks if session exists.
      Update to:
      - If session exists: hide `#login-spread`, show `#current-spread` (normal diary rendering).
      - If no session: show `#login-spread`, hide `#current-spread`.
      - Unbind the old `document.getElementById('login-overlay').style.display` calls.
      Function to modify: The session check block around line 1113-1137.
      Files: `diary.html` (JS section)
      Verify: Load diary.html with no session, confirm login spread is visible; check browser console for errors.

---

### Phase 5: Implement Login Form Submission

- **[ ] 5. Add event listener to the login submit button in the login spread.**
      When user clicks the button:
      1. Prevent default.
      2. Collect email and password from input fields.
      3. Call `SupabaseSync.signIn(email, password)`.
      4. On success:
         - Get the user's role via `SupabaseSync.getRole()`.
         - Call `setDiaryMode(role === 'owner' ? 'editor' : 'viewer')`.
         - Call `SupabaseSync.pull()` to load memories.
         - Apply the flip animation to `.page-right.login-page` (add class `flip-forward`).
         - Wait for animation to complete (0.65s).
         - Hide `#login-spread`, show `#current-spread`, call `renderSpread()`.
      5. On error: display error message in the error area (opacity 1, text = error.message).
      Files: `diary.html` (JS section)
      Verify: Test login with valid credentials, confirm page flips and memory spread renders; test invalid credentials, confirm error message appears.

---

### Phase 6: Apply Page Turn Animation to Login Page

- **[ ] 6. Define a flip animation for the login page transition.**
      After successful login, add the `.flip-forward` class to `.page-right.login-page` to trigger the existing `flipPageForward` keyframe animation (0.65s).
      Ensure the animation class is applied only after the submit button is clicked and auth succeeds.
      Files: `diary.html` (JS — add class after SupabaseSync.pull() completes)
      Verify: Perform login, visually confirm right page rotates 180 degrees smoothly.

---

### Phase 7: Ensure Initial UI State

- **[ ] 7. Verify that the `.page-left.login-page` and `.page-right.login-decor` are hidden initially (display: none) and shown only when no session exists.**
      Also ensure `#current-spread` (real memories) is hidden initially and shown after login.
      Files: `diary.html` (both HTML display properties and JS logic)
      Verify: Open diary in fresh browser (no session), confirm login spread visible and memory spread hidden.

---

### Phase 8: Preserve Existing Functionality

- **[ ] 8. Verify that all existing diary functionality (add/edit/delete memories, page turns, stickers, drag, Supabase sync) works correctly after authentication.**
      Test in both editor and viewer modes.
      Confirm role detection and UI gating work as designed.
      Files: `diary.html` (existing functions, no changes needed unless bugs found)
      Verify: Full end-to-end user flow — login as owner, add memory, save, refresh, confirm data persists; logout (if implemented) or clear session, confirm login page reappears.

---

### Phase 9: Visual Polish and Accessibility

- **[ ] 9. Add accessible contrast and readable spacing to login form.**
      Ensure email/password fields have sufficient contrast ratio (4.5:1 minimum for normal text per WCAG AA).
      Test with browser zoom (200%) to confirm fields remain usable.
      Add `aria-label` or visible labels for screen reader users.
      Files: `diary.html` (CSS and HTML)
      Verify: Lighthouse accessibility audit passes; screen reader reads form correctly.

---

### Phase 10: Error Handling and Edge Cases

- **[ ] 10. Handle network errors, invalid credentials, and Supabase unavailability gracefully.**
      If Supabase is unreachable, fall back to localStorage-only mode (existing behavior).
      If sign-in fails, display specific error message (e.g., "Invalid email or password").
      If role fetch fails, default to 'viewer' mode.
      Files: `diary.html` (JS error handling in signIn handler)
      Verify: Test with Supabase URL temporarily incorrect, confirm fallback activates; test invalid credentials, confirm error message displays.

---

### Phase 11: Verify No Existing Layout Changes

- **[ ] 11. Confirm that the existing memory layout, page positioning, botanical decorations, and all visual elements are unchanged.**
      The login spread is a separate spread (spread 0), so it does not affect the numbering or positioning of memory spreads.
      All CSS changes are isolated to login form styling; no changes to `.memory-item`, `.memory-photo-wrapper`, `.memory-text`, etc.
      Files: `diary.html` (CSS and HTML structure)
      Verify: After login, navigate through memory pages, confirm all existing memories appear exactly as before; no repositioning or reflow.

---

### Phase 12: Final Deployment

- **[ ] 12. Deploy the updated diary.html and any new CSS files to production.**
      If a new CSS file was created (e.g., `css/login-paper.css`), ensure it is linked in the HTML.
      Test on staging environment before production.
      Files: `diary.html`, `css/login-paper.css` (if created)
      Verify: Run full test suite, manual QA, confirm no regressions in existing features.

---

## Key Implementation Details

### Login Spread Structure (HTML)
```html
<div class="spread" id="login-spread" style="display: none;">
  <div class="page-left login-page">
    <div class="login-container">
      <h2 class="login-heading">Before you enter...</h2>
      <p class="login-subheading">open your memories</p>
      
      <div class="login-form">
        <label for="login-email" class="login-label">Email</label>
        <input id="login-email" type="email" class="login-input" placeholder="">
        
        <label for="login-password" class="login-label">Password</label>
        <input id="login-password" type="password" class="login-input" placeholder="">
        
        <button id="login-submit" class="login-button">Enter</button>
        
        <p id="login-error" class="login-error"></p>
      </div>
    </div>
    <div class="login-flowers">🌸</div>
  </div>
  <div class="page-right login-decor">
    <p class="decor-text">Your diary awaits...</p>
    <div class="decor-flowers">🍃 🌸 🍃</div>
  </div>
</div>
```

### Auth Flow (JS)
```javascript
// When no session exists:
const overlay = document.getElementById('login-spread');
overlay.style.display = 'flex'; // or 'grid' to show within book

// On login submit:
async function handleLoginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const pwd = document.getElementById('login-password').value;
  
  try {
    await SupabaseSync.signIn(email, pwd);
    const role = await SupabaseSync.getRole();
    setDiaryMode(role === 'owner' ? 'editor' : 'viewer');
    await SupabaseSync.pull();
    
    // Animate page turn
    const rightPage = document.querySelector('#login-spread .page-right');
    rightPage.classList.add('flip-forward');
    
    // After animation completes, show real diary
    setTimeout(() => {
      document.getElementById('login-spread').style.display = 'none';
      document.getElementById('current-spread').style.display = 'flex';
      renderSpread();
    }, 650);
  } catch (err) {
    document.getElementById('login-error').textContent = err.message;
    document.getElementById('login-error').style.opacity = '1';
  }
}
```

### CSS Basics
```css
.login-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
}

.login-heading {
  font-family: 'Satisfy', cursive;
  font-size: 1.5rem;
  color: #3d2426;
  margin-bottom: 0.5rem;
  text-align: center;
}

.login-input {
  border: none;
  border-bottom: 1px solid #b5a58f;
  background: #fffbf7;
  font-family: 'Kalam', cursive;
  padding: 0.5rem 0 0.35rem 0;
  margin-bottom: 1.5rem;
  width: 280px;
  color: #3d2426;
}

.login-input:focus {
  outline: none;
  border-bottom-color: #a8606e;
  box-shadow: 0 2px 4px rgba(168, 96, 110, 0.15);
}

.login-button {
  background: #e0d4c8;
  border: none;
  border-radius: 0 6px 6px 0;
  font-family: 'Satisfy', cursive;
  font-size: 1.05rem;
  color: #3d2426;
  padding: 0.7rem 1.2rem;
  margin-top: 1rem;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
  transition: background 0.3s, box-shadow 0.3s;
}

.login-button:hover {
  background: #d4c8bc;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.login-error {
  color: #c85a5a;
  font-family: 'Kalam', cursive;
  font-size: 0.85rem;
  margin-top: 1rem;
  opacity: 0;
  transition: opacity 0.3s;
}
```

---

## Success Criteria

1. ✅ User lands on index.html, sees diary cover (unchanged).
2. ✅ User clicks "Open Me" button.
3. ✅ Diary opens and displays a login page styled as a physical diary page (warm cream, ruled lines, handwritten fonts).
4. ✅ Login page contains email/password fields styled as diary lines (no web boxes), a bookmark-style submit button, and a decorative right page.
5. ✅ User enters credentials and clicks submit.
6. ✅ On success, the right page animates away (flip 180°), and the real memory spread fades in.
7. ✅ Role is detected: owner → editor mode (add/edit/delete visible), viewer → view-only mode (actions hidden).
8. ✅ All existing diary functionality works as before (add, edit, delete, page turns, stickers, sync).
9. ✅ No existing memory positions, layout, or visual elements are changed.
10. ✅ Error messages display gracefully if login fails.
11. ✅ No console errors; accessibility audit passes.

---

## Files to Modify

- `diary.html` — Remove old login overlay, add login spread HTML, update auth flow, add login form CSS
- (Optional) `css/login-paper.css` — If the inline CSS block becomes too large, extract to external file

---

## Files NOT to Modify

- `index.html` — Homepage remains unchanged
- `js/supabase-sync.js` — No changes needed (API already supports signIn, getRole, pull)
- `js/storage.js` — No changes needed
- All memory rendering, page turning, and sticker logic — Functions remain unchanged

---

## Deployment Notes

- Test on staging with multiple browsers (Chrome, Firefox, Safari) before production.
- Verify Supabase credentials are correctly configured in `supabase-config.js`.
- Confirm fonts load correctly (Google Fonts CDN).
- Test on mobile (if supported) — login form must remain usable at narrow widths.
- Monitor browser console for errors during login flow.
