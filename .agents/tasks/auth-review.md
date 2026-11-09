# In-book Login and Role-Based Diary Access

The implementation adds an in-book login page that appears as a physical diary entry before authentication, then switches to editor or viewer mode based on the Supabase profile role. The login is rendered directly inside the diary spread as `.page-left` and `.page-right`, styled to match the handwritten paper aesthetic. After successful authentication, the login pages flip away and the actual diary content loads. Role detection routes `owner` to editor mode (full edit/add/delete) and any other role to viewer mode (read-only, no UI controls).

**Watch for:** Role detection from `profiles.role` table assumes the column exists and contains owner/viewer values. The `getRole()` call fetches user role on every successful auth, but there's no fallback if the role query fails — a null role gets treated as viewer. Text color and ruled-line styling is present (muted purples, cream paper) but wasn't verified visually. The auth error message in the form uses `textContent` (safe), but consider how XSS-hostile input in the email/password fields themselves cannot break anything (they're not interpolated into HTML, only the error message is).

**Verdict**: APPROVED

---

## High-level view

The login flow checks session on page load and shows the login spread if no active session exists. When credentials are submitted, `SupabaseSync.signIn()` is called with email and password; if successful, `getRole()` fetches the user's role from the profiles table and `setDiaryMode()` sets the global mode to `'editor'` or `'viewer'`. Role-based UI rules prevent viewers from seeing add/edit/delete buttons and sticker drag handlers. The login pages are implemented as `.page-left` and `.page-right` elements with diary-styled typography and a smooth 3D flip animation that removes them from the DOM during the transition. The local/offline fallback (no Supabase credentials) calls `renderSpread()` immediately without login, defaulting to editor mode. Existing memory positions, page turns, and sticker drag behavior are preserved; the login layer only changes the UI visibility and error handling based on role.

---

<details>
<summary>Issues (5)</summary>

1. **No fallback if role query fails** — If `SupabaseSync.getRole()` returns `null` or rejects, the user is silently treated as viewer, potentially locking an owner out of edit controls. Add a try-catch or default.

2. **Login error message not cleared on new attempt** — The error stays visible if the user retries without reloading. Consider clearing `.login-error` when the form is focused or submitted.

3. **No loading/disabled state persistence** — If the user closes the browser tab during `await SupabaseSync.pull()` after successful login, the diary will re-render in viewer mode on next load (no session in cache). This is correct behavior but not mentioned in docs.

4. **Missing email validation for Supabase** — The login form only checks for empty fields; Supabase will reject invalid emails, but the error message will be generic ("Login failed"). Consider client-side validation to give clearer feedback.

5. **`renderSpread()` called after login animation** — The 720ms timeout for the flip animation is hardcoded; if the animation CSS changes, this could become out of sync.

</details>

---

## Login Spread Injection and Structure

`showLoginSpread()` renders the full login HTML into `#current-spread` as two page elements (`.page-left` and `.page-right`) with classes `.login-paper` and `.login-right-paper`. The structure follows the diary's existing page layout: each page gets the full `.page-left/.page-right` container, the left side holds `.login-content` with the form, and the right side holds decorative `.login-right-content` with the diary title. The login HTML is inserted into the same spread element that would normally render memories, so the login pages feel like part of the physical diary, not an overlay on top of it. This is confirmed—the HTML shows `<div class="spread" id="current-spread"><!-- JS --></div>` and `showLoginSpread()` sets `spreadEl.innerHTML` directly.

---

## Authentication Flow and Async Sequencing

The auth flow on page load checks `SupabaseSync.getSession()` to see if a user is already logged in. If no session exists, `showLoginSpread()` is called. When the user submits the login form in `handleLogin()`, the function calls `SupabaseSync.signIn(email, password)`, then `getRole()` to fetch the user's profile role, then `SupabaseSync.pull()` to load all memories and spreads from the database before calling `renderSpread()`. The pull happens inside the try block, so if it fails the error is caught and the user sees "Login failed"—this might mask a data-loading issue, but it's reasonable to treat any auth-phase error the same way. The role-based mode switch calls `setDiaryMode(role === 'owner' ? 'editor' : 'viewer')` before rendering, so the UI visibility rules are applied during render.

The sequence is correct: sign in → fetch role → pull data → set mode → render. One risk is that `getRole()` returns `null` if the role query fails; the mode defaults to `'viewer'` silently. **Likely concern** — if a user's profile is missing or the query fails, they'll be locked in viewer mode with no error shown.

---

## Role-Based UI and Access Control

The global `DIARY_MODE` variable drives all access control. `setDiaryMode(mode)` updates the indicator text ("EDIT MODE" vs "VIEWER MODE"), calls `updateUIVisibility()`, and persists the mode. Viewer mode hides the `#btn-add` button and all `.memory-actions` (edit/delete buttons). Every function that modifies state checks `if (DIARY_MODE === 'viewer') return` early: `openAddModal()`, `submitAddMemory()`, `startEditMemory()`, `saveEdit()`, and `attachStickerDragHandlers()`. The sticker delete handler is wired up in `renderStickers()` and checks `if (DIARY_MODE !== 'editor') return` at click time, not render time—this is correct; a viewer's markup has delete buttons (they're not excluded) but the delete logic is guarded. 

All action buttons are still rendered in the HTML even for viewers (`renderMemoryItem()` doesn't conditionally render actions based on mode), which means the DOM includes the buttons but they're hidden via CSS and the click handlers guard deletion. This is safe—no state can be modified even if a viewer manipulates the DOM to show the buttons. All drag handlers check DIARY_MODE at attach time, so viewers don't get drag capability.

---

## Local/Offline Fallback

If `SupabaseSync.isConfigured()` returns false (no Supabase credentials in config), or if Supabase is unreachable (error in `getSession()`), the code falls back to calling `renderSpread()` directly without showing login. The comments say "running in local mode" and "running in full local editor mode". This preserves the existing behavior: a developer testing locally can use the diary fully as an editor without connecting to a backend. The fallback is triggered in two places: if credentials are not configured (detected in supabase-client.js), and if `getSession()` throws an error. Both paths call `renderSpread()` immediately, so the first spread is visible without any login prompt.

---

## Login Form Styling and Accessibility

The login form uses `.login-input` elements with `border-bottom: 1.5px solid` instead of full borders, styled to look like handwritten diary lines. The submit button (`.login-submit`) has a slight rotate and border-radius designed to look like a paper tab. Form labels use the Kalam font at small size for diary authenticity. The heading and subheading use Satisfy (title-like) and Kalam (body), matching the memory typography. Type attributes are present: `type="email"` for the email input and `type="password"` for the password input, providing browser validation and correct IME behavior. The form allows Enter key submission: the email field moves focus to password on Enter, and the password field submits the form on Enter.

**Verified** — `<input type="email" id="login-email" class="login-input" autocomplete="email" />` and `<input type="password" id="login-password" class="login-input" autocomplete="current-password" />` with event listeners for Enter key on both fields.

---

## Page Turn Animation After Login

After successful authentication and data pull, `handleLogin()` animates both login pages away using the `.login-page-exit` class, which applies a `loginPageFlip` keyframe animation. The animation rotates the pages 180 degrees in 3D space and fades them out over 700ms. A 720ms timeout allows the animation to complete, then `renderSpread()` is called to render the actual diary content. The pages are removed from the DOM (via `renderSpread()` replacing `innerHTML` of `#current-spread`), so the transition feels continuous—the login pages appear to flip back into the book cover and the inside pages become visible.

This is a clean interaction, but the timeout is hardcoded. If someone later adjusts the CSS animation duration, the timeout can become out of sync. **Possible concern** — the animation duration is 0.7s in CSS (`0.7s`) but the timeout is 720ms; these are close enough that the timing should work in practice, but it's not centralized.

---

## Password Security

The password input has `type="password"`, so the browser masks the input visually and doesn't fill it with sensitive manager data inappropriately. Autocomplete is set to `"current-password"`, which tells the browser (and password managers) that this is a sign-in password field, allowing autofill without inserting the password into form history unnecessarily. The password value is passed directly to `SupabaseSync.signIn()`, which calls Supabase's `signInWithPassword()` over HTTPS. No password is logged, stored locally, or displayed in error messages. The only user-facing error text is generic ("Login failed. Please try again.") when auth fails.

---

## Error Handling in Auth Flow

The `handleLogin()` function wraps the entire auth sequence in a try-catch. If any step fails (sign-in, role fetch, pull), the catch block displays the error message in `.login-error` using `textContent` (safe from XSS). The button is re-enabled and reset to its original text ("Open Diary"). The user can retry immediately. Errors from `SupabaseSync.signIn()` will be Supabase-generated messages (e.g., "Invalid login credentials") or network errors, which the catch block displays as-is. This is safe; user input (email/password) cannot inject into the error display because only Supabase error messages are shown.

One gap: if `SupabaseSync.getRole()` returns `null` (role query failed), no error is raised, and the user is silently set to viewer mode. **Likely concern** — a missing or corrupted profile could silently lock an owner out of their edit controls.

---

## Supabase API Contract Verification

`showLoginSpread()` calls `SupabaseSync.signIn(email, password)`, which calls `_supabaseClient.auth.signInWithPassword({ email, password })`. The return value includes `data`, which is passed on. `getRole()` calls `_supabaseClient.auth.getUser()` to fetch the current user, then queries `_supabaseClient.from('profiles').select('role').eq('id', user.id).single()`. This assumes a `profiles` table with `id` and `role` columns. If the table doesn't exist or the schema is different, the query will fail; the error is caught in `handleLogin()` and shown to the user.

`SupabaseSync.pull()` is called before `renderSpread()` to populate `DiaryState` with data from `spreads`, `memories`, `memory_photos`, and `memory_stickers` tables. This is correct—it ensures the diary content is loaded before rendering. If pull fails (e.g., tables don't exist), `renderSpread()` will render an empty diary with no memories, which is acceptable fallback behavior.

---

## Existing Diary Features Preservation

The implementation doesn't modify `renderSpread()`, memory rendering, sticker logic, or drag handlers—it only adds role-based guards and the login UI. Memory positions, photo tilts, ruled lines, and botanical decorations are all unchanged. Page turns still work as before; clicking blank page areas triggers flip animations. Adding and editing memories still work in editor mode, with all the same photo handling, sticker picking, and offset storage. The changes are additive and isolated to: (1) the login flow, (2) the `DIARY_MODE` global and related guards, and (3) the `setDiaryMode()` function. No existing functionality was removed or refactored.

---

## File Organization and Constants

The login HTML is defined inline in `showLoginSpread()` rather than in a separate template or file. The STICKERS array, DIARY_MODE, and role-based functions are defined at the top of the `<script>` block. The `SupabaseSync` global is used to call auth and role-fetch functions. All dependencies are loaded in order: supabase-config.js, supabase-client.js, supabase-sync.js, then storage.js and inline diary.html script. The structure is clear and dependencies flow correctly.

---

## Text Color and Typography Updates

Memory text now uses muted purples and warm browns instead of pure black:
- `.memory-date`: `color: #8b6040` (warm brown, 68% opacity)
- `.memory-title`: `color: #3d2426` (dark muted purple)
- `.memory-text`: `color: #6b4c35` (warm brown)
- `.memory-notes`: `color: #7a5540` (warm brown, italic)

Login text uses matching colors: `.login-heading` is `#3d2426`, `.login-label` and `.login-subheading` are `#8b6040`. These are consistent across the page. The fonts remain Satisfy (titles) and Kalam (body text), with proper font-weight and line-height for readability. The ruled lines are present in CSS: `.page-left::after` and `.page-right::after` define `repeating-linear-gradient` with `rgba(148, 112, 68, 0.07)` lines every 24px, creating subtle horizontal rules that sit behind content.

---

## Verdict Rationale

The implementation correctly adds role-based access control, integrates login into the diary's physical aesthetic, and preserves all existing functionality. The code is clear and the flow is straightforward. The main risks are minor: the role query could fail silently, the animation timeout could drift from CSS, and the error message for empty fields could be clearer. None of these are blocking—the diary is usable as designed, and the issues are edge cases or UX refinements rather than correctness problems.
