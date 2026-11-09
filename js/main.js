/* ============================================================
   MAIN.JS — Homepage logic
   - "open me" click triggers diary opening animation
   - Handles the CSS transition from closed cover → diary.html
   ============================================================ */

(function () {

  /* ── Elements ── */
  const scene    = document.getElementById('homepageScene');
  const cover    = document.getElementById('diaryCover');
  const tag      = document.getElementById('openMeTag');
  const overlay  = document.getElementById('openingOverlay');

  if (!tag || !cover) return; // not on homepage

  let hasOpened = false;

  /* ── Open sequence ── */
  function openDiary(e) {
    if (hasOpened) return;
    hasOpened = true;

    // Prevent double-trigger
    tag.removeEventListener('click',   openDiary);
    tag.removeEventListener('keydown', handleTagKey);
    cover.removeEventListener('click', openDiary);

    // Step 1 — show the translucent overlay with "opening…" text
    if (overlay) {
      overlay.classList.add('visible');
    }

    // Step 2 — animate the cover opening (CSS handles the 3D flip)
    if (cover) {
      cover.classList.add('opening');
    }

    // Step 3 — fade out the scene
    if (scene) {
      scene.classList.add('fading-out');
    }

    // Step 4 — navigate to diary.html after animation completes
    setTimeout(() => {
      window.location.href = 'diary.html';
    }, 1350);
  }

  /* ── Keyboard trigger (Enter / Space on tag) ── */
  function handleTagKey(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openDiary(e);
    }
  }

  /* ── Attach listeners ── */
  tag.addEventListener('click',   openDiary);
  tag.addEventListener('keydown', handleTagKey);
  // Also allow clicking the diary cover itself
  cover.addEventListener('click', openDiary);

  /* ── Entrance animation — page loaded ── */
  // The scene fades in gently on first load
  if (scene) {
    scene.style.opacity = '0';
    scene.style.transition = 'opacity 0.9s ease';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scene.style.opacity = '1';
      });
    });
  }

  /* ── Handle back navigation from diary.html ──
     If user presses browser Back from diary.html, the homepage
     should re-appear without the opening animation playing.
  */
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
      // Page was loaded from BFCache — reset any animation state
      hasOpened = false;
      if (cover)   cover.classList.remove('opening');
      if (scene)   scene.classList.remove('fading-out');
      if (overlay) overlay.classList.remove('visible');
      if (scene) {
        scene.style.opacity = '1';
        scene.style.transition = '';
      }
    }
  });

})();
