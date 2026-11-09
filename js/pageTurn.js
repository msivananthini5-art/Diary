/* ============================================================
   PAGÉTURN.JS — Realistic 3D paper-flip around the center spine
   
   The actual paper sheet turns. The wooden table and diary
   frame stay completely static. Only the page content flips.
   
   Forward turn: right page lifts from right, rotates left
                 around the spine, lands as new left page.
   Backward turn: left page lifts from left, rotates right
                  around the spine, lands as new right page.
   ============================================================ */

const PageTurner = (() => {

  let isTurning = false;
  const TURN_DURATION = 650; // ms — must match CSS animation duration

  /* ── Get the flap element ── */
  function getFlap() {
    return document.getElementById('pageTurnFlap');
  }

  function getStack() {
    return document.getElementById('pageStack');
  }

  /* ── Copy page content into the flap faces ──
     The front face shows the content of the page being turned away.
     The back face shows the next page content (peeks through as it lands).
  */
  function stampContentToFlap(fromSpreadIndex, toSpreadIndex, direction) {
    const flap = getFlap();
    if (!flap) return;

    const front = flap.querySelector('.page-turn-flap__front');
    const back  = flap.querySelector('.page-turn-flap__back');

    // Get the actual page DOM to clone
    const fromSpreadEl = document.querySelector(`.spread[data-spread-index="${fromSpreadIndex}"]`);
    const toSpreadEl   = document.querySelector(`.spread[data-spread-index="${toSpreadIndex}"]`);

    if (direction === 'forward') {
      // Front shows current spread's right page
      const fromPage = fromSpreadEl?.querySelector('.page--right');
      if (fromPage && front) {
        front.innerHTML = '';
        const clone = fromPage.cloneNode(true);
        clone.style.cssText = 'position:absolute;inset:0;pointer-events:none;';
        clone.classList.remove('page--right');
        front.appendChild(clone);
      }
      // Back shows next spread's left page (reversed — backface)
      const toPage = toSpreadEl?.querySelector('.page--left');
      if (toPage && back) {
        back.innerHTML = '';
        const clone = toPage.cloneNode(true);
        clone.style.cssText = 'position:absolute;inset:0;pointer-events:none;';
        clone.classList.remove('page--left');
        back.appendChild(clone);
      }
    } else {
      // Backward: front shows current left page
      const fromPage = fromSpreadEl?.querySelector('.page--left');
      if (fromPage && front) {
        front.innerHTML = '';
        const clone = fromPage.cloneNode(true);
        clone.style.cssText = 'position:absolute;inset:0;pointer-events:none;';
        front.appendChild(clone);
      }
      // Back shows previous spread's right page
      const toPage = toSpreadEl?.querySelector('.page--right');
      if (toPage && back) {
        back.innerHTML = '';
        const clone = toPage.cloneNode(true);
        clone.style.cssText = 'position:absolute;inset:0;pointer-events:none;';
        back.appendChild(clone);
      }
    }
  }

  /* ── Position the flap over the correct half of the diary ── */
  function positionFlap(direction) {
    const flap  = getFlap();
    const stack = getStack();
    if (!flap || !stack) return;

    if (direction === 'forward') {
      // Flap covers the RIGHT half (the page being turned)
      flap.style.left   = '50%';
      flap.style.right  = '0';
      flap.style.width  = '50%';
      flap.style.transformOrigin = 'left center';
    } else {
      // Flap covers the LEFT half
      flap.style.left   = '0';
      flap.style.right  = '50%';
      flap.style.width  = '50%';
      flap.style.transformOrigin = 'right center';
    }
  }

  /* ── Core turn function ── */
  function turn(direction) {
    if (isTurning) return;

    const fromIndex = DiaryState.currentIndex;
    const toIndex   = direction === 'forward'
      ? fromIndex + 1
      : fromIndex - 1;

    // Bounds check
    if (toIndex < 0 || toIndex >= DiaryState.spreads.length) return;

    // Snapshot edits on current spread before leaving
    if (DiaryState.isEditMode) {
      snapshotCurrentSpread();
    }

    isTurning = true;
    const stack = getStack();
    const flap  = getFlap();

    // Make sure target spread is in DOM (it is — renderAll built all spreads)
    // but ensure target is NOT yet active visible
    const fromSpreadEl = stack?.querySelector(`.spread[data-spread-index="${fromIndex}"]`);
    const toSpreadEl   = stack?.querySelector(`.spread[data-spread-index="${toIndex}"]`);

    // Stamp content onto flap faces
    stampContentToFlap(fromIndex, toIndex, direction);
    positionFlap(direction);

    // Add turning class for page shadow animations
    stack?.classList.add(direction === 'forward' ? 'turning-forward' : 'turning-backward');

    // Show and animate the flap
    flap.style.opacity = '1';
    flap.className = `page-turn-flap turn-${direction}`;

    // At the halfway point (~325ms), swap which spread is visible
    const halfwayTimer = setTimeout(() => {
      // Hide old spread, show new spread
      fromSpreadEl?.classList.remove('active');
      toSpreadEl?.classList.add('active');
      DiaryState.currentIndex = toIndex;
      updateCounter();
      updateNavButtons();
    }, TURN_DURATION * 0.5);

    // After animation completes — clean up
    const cleanupTimer = setTimeout(() => {
      flap.className = 'page-turn-flap';
      flap.style.opacity = '0';
      flap.style.transform = '';
      const front = flap.querySelector('.page-turn-flap__front');
      const back  = flap.querySelector('.page-turn-flap__back');
      if (front) front.innerHTML = '';
      if (back)  back.innerHTML  = '';
      stack?.classList.remove('turning-forward', 'turning-backward');
      isTurning = false;

      // If in edit mode, re-render the new spread with edit affordances
      if (DiaryState.isEditMode) {
        renderCurrentSpread();
        DiaryEditor.activate();
      }
    }, TURN_DURATION + 50);

    // Store timers so we can cancel if needed
    flap._halfwayTimer = halfwayTimer;
    flap._cleanupTimer = cleanupTimer;
  }

  /* ── Public API ── */
  function goForward() {
    if (DiaryState.currentIndex < DiaryState.spreads.length - 1) {
      turn('forward');
    }
  }

  function goBack() {
    if (DiaryState.currentIndex > 0) {
      turn('backward');
    }
  }

  /* ── Swipe support (touch devices) ── */
  let touchStartX = 0;
  let touchStartY = 0;
  const SWIPE_THRESHOLD = 50;

  document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;

    // Only register as horizontal swipe if more horizontal than vertical
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD) {
      if (dx < 0) {
        goForward(); // swipe left = next page
      } else {
        goBack();    // swipe right = previous page
      }
    }
  }, { passive: true });

  /* ── Tap-to-turn support (click on left/right side of paper) ── */
  document.addEventListener('click', (e) => {
    // Ignore clicks on buttons, inputs, or toolbar elements
    const target = e.target.closest('button, input, textarea, .controls, .mode-indicator, .element-toolbar, .memory-actions, .action-btn');
    if (target) return;

    const stack = getStack();
    if (!stack) return;

    // Check if click is on a page element
    const pageEl = e.target.closest('.page-left, .page-right');
    if (!pageEl) return;

    const bookEl = stack.closest('.book') || document.querySelector('.book');
    if (!bookEl) return;

    // Get the book's bounding rect
    const bookRect = bookEl.getBoundingClientRect();

    // Calculate which side of the paper was tapped
    const clickX = e.clientX - bookRect.left;
    const bookWidth = bookRect.width;
    const centerX = bookWidth / 2;

    // Left side: go to previous page
    // Right side: go to next page
    if (clickX < centerX * 0.7) {
      // Tapped left 30% of book
      goBack();
    } else if (clickX > centerX * 1.3) {
      // Tapped right 30% of book
      goForward();
    }
  });

  return { goForward, goBack };

})();
