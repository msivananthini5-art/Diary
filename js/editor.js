/* ============================================================
   EDITOR.JS — Drag, resize, and rotate for diary elements
   
   Handles:
   - Pointer-based drag (mouse + touch) for polaroids and note cards
   - Corner resize handle drag
   - Rotation handle drag (rotate around element center)
   - Selection and deselection
   - Keyboard nudge (arrow keys when element is selected)
   ============================================================ */

const DiaryEditor = (() => {

  let activeListeners = []; // track so we can remove them on deactivate

  /* ════════════════════════════════════════════════════════
     ATTACH — add all interaction listeners to one element
  ════════════════════════════════════════════════════════ */
  function attachElementListeners(elNode) {
    // Main drag
    const onDown = (e) => {
      // Don't start drag if clicking on a handle or contenteditable
      if (e.target.classList.contains('resize-handle')) return;
      if (e.target.classList.contains('rotate-handle')) return;
      if (e.target.classList.contains('polaroid__upload-hint')) return;
      if (e.target.closest('[contenteditable="true"]')) return;

      e.preventDefault();
      selectElement(elNode);
      startDrag(e, elNode);
    };

    // Resize handle
    const resizeHandle = elNode.querySelector('.resize-handle');
    const onResizeDown = (e) => {
      e.preventDefault();
      e.stopPropagation();
      selectElement(elNode);
      startResize(e, elNode);
    };

    // Rotate handle
    const rotateHandle = elNode.querySelector('.rotate-handle');
    const onRotateDown = (e) => {
      e.preventDefault();
      e.stopPropagation();
      selectElement(elNode);
      startRotate(e, elNode);
    };

    elNode.addEventListener('pointerdown', onDown);
    if (resizeHandle)  resizeHandle.addEventListener('pointerdown', onResizeDown);
    if (rotateHandle)  rotateHandle.addEventListener('pointerdown', onRotateDown);

    // Double-click to open photo upload on polaroids
    if (elNode.dataset.type === 'polaroid') {
      elNode.addEventListener('dblclick', () => {
        if (DiaryState.isEditMode) triggerPhotoUpload(elNode);
      });
    }

    // Track for cleanup
    activeListeners.push({ elNode, onDown, onResizeDown, onRotateDown });
  }

  /* ════════════════════════════════════════════════════════
     SELECT / DESELECT
  ════════════════════════════════════════════════════════ */
  function selectElement(elNode) {
    // Deselect previously selected
    document.querySelectorAll('.draggable-element.is-selected').forEach(el => {
      if (el !== elNode) el.classList.remove('is-selected');
    });

    elNode.classList.add('is-selected');
    DiaryState.selectedElement = elNode;
    showElementToolbar(elNode);
  }

  /* ════════════════════════════════════════════════════════
     DRAG
     Position is stored as % of the parent page dimensions
     so elements stay proportionally placed if window resizes.
  ════════════════════════════════════════════════════════ */
  function startDrag(e, elNode) {
    const page = elNode.closest('.page');
    if (!page) return;

    const pageRect = page.getBoundingClientRect();
    const startPointer = getPointerPos(e);

    const startLeft = parseFloat(elNode.style.left) || 0;
    const startTop  = parseFloat(elNode.style.top)  || 0;

    function onMove(ev) {
      const pos = getPointerPos(ev);
      const dx  = pos.x - startPointer.x;
      const dy  = pos.y - startPointer.y;

      // Convert px delta to % of page
      const newLeft = startLeft + (dx / pageRect.width  * 100);
      const newTop  = startTop  + (dy / pageRect.height * 100);

      // Clamp so element stays inside the page
      elNode.style.left = clamp(newLeft, -5, 90) + '%';
      elNode.style.top  = clamp(newTop,  -2, 88) + '%';

      // Keep element toolbar near the element
      showElementToolbar(elNode);
    }

    function onUp() {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup',   onUp);
      // Write position back to state immediately
      patchElementState(elNode);
    }

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup',   onUp);
  }

  /* ════════════════════════════════════════════════════════
     RESIZE
     Drag the bottom-right corner handle to resize.
  ════════════════════════════════════════════════════════ */
  function startResize(e, elNode) {
    const startPointer = getPointerPos(e);
    const startWidth   = parseInt(elNode.style.width)  || elNode.offsetWidth;
    const startHeight  = parseInt(elNode.style.height) || elNode.offsetHeight;

    function onMove(ev) {
      const pos = getPointerPos(ev);
      const dx  = pos.x - startPointer.x;
      const dy  = pos.y - startPointer.y;

      const newWidth  = clamp(startWidth  + dx, 80,  320);
      const newHeight = clamp(startHeight + dy, 60,  320);

      elNode.style.width  = newWidth  + 'px';
      elNode.style.height = newHeight + 'px';
    }

    function onUp() {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup',   onUp);
      patchElementState(elNode);
    }

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup',   onUp);
  }

  /* ════════════════════════════════════════════════════════
     ROTATE
     Drag the rotate handle (top-right) to rotate around center.
  ════════════════════════════════════════════════════════ */
  function startRotate(e, elNode) {
    const rect   = elNode.getBoundingClientRect();
    const centerX = rect.left + rect.width  / 2;
    const centerY = rect.top  + rect.height / 2;

    const startPointer = getPointerPos(e);
    const startAngle   = Math.atan2(
      startPointer.y - centerY,
      startPointer.x - centerX
    ) * (180 / Math.PI);

    const currentMatch = elNode.style.transform.match(/rotate\(([^)]+)deg\)/);
    const initialRot   = currentMatch ? parseFloat(currentMatch[1]) : 0;

    function onMove(ev) {
      const rect2   = elNode.getBoundingClientRect();
      const cx = rect2.left + rect2.width  / 2;
      const cy = rect2.top  + rect2.height / 2;
      const pos = getPointerPos(ev);
      const angle = Math.atan2(pos.y - cy, pos.x - cx) * (180 / Math.PI);
      const delta = angle - startAngle;
      const newRot = Math.round((initialRot + delta) * 10) / 10;

      elNode.style.transform = `rotate(${newRot}deg)`;

      const badge = elNode.querySelector('.rotation-badge');
      if (badge) badge.textContent = `${Math.round(newRot)}°`;
    }

    function onUp() {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup',   onUp);
      patchElementState(elNode);
    }

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup',   onUp);
  }

  /* ════════════════════════════════════════════════════════
     PATCH ELEMENT STATE
     Write current DOM position/size/rotation back into DiaryState
     without doing a full re-render.
  ════════════════════════════════════════════════════════ */
  function patchElementState(elNode) {
    const elId   = elNode.dataset.id;
    const spread = DiaryState.getCurrentSpread();

    ['left','right'].forEach(side => {
      const elData = spread[side].elements.find(e => e.id === elId);
      if (!elData) return;

      elData.top  = parseFloat(elNode.style.top)  || 0;
      elData.left = parseFloat(elNode.style.left) || 0;
      if (elNode.style.width)  elData.width  = parseInt(elNode.style.width);
      if (elNode.style.height) elData.height = parseInt(elNode.style.height);

      const rotMatch = elNode.style.transform.match(/rotate\(([^)]+)deg\)/);
      if (rotMatch) elData.rotation = parseFloat(rotMatch[1]);
    });
  }

  /* ════════════════════════════════════════════════════════
     KEYBOARD NUDGE (1px per arrow key press when selected)
  ════════════════════════════════════════════════════════ */
  function handleKeyNudge(e) {
    const el = DiaryState.selectedElement;
    if (!el || !DiaryState.isEditMode) return;
    if (e.target && e.target.isContentEditable) return;

    const step = e.shiftKey ? 5 : 1;
    const page = el.closest('.page');
    if (!page) return;
    const pageRect = page.getBoundingClientRect();
    const pctX = step / pageRect.width  * 100;
    const pctY = step / pageRect.height * 100;

    const curLeft = parseFloat(el.style.left) || 0;
    const curTop  = parseFloat(el.style.top)  || 0;

    if (e.key === 'ArrowLeft')  el.style.left = (curLeft - pctX) + '%';
    if (e.key === 'ArrowRight') el.style.left = (curLeft + pctX) + '%';
    if (e.key === 'ArrowUp')    el.style.top  = (curTop  - pctY) + '%';
    if (e.key === 'ArrowDown')  el.style.top  = (curTop  + pctY) + '%';

    if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)) {
      e.preventDefault();
      patchElementState(el);
      showElementToolbar(el);
    }

    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (!e.target.isContentEditable) {
        removeElement(el.dataset.id);
      }
    }
  }

  /* ════════════════════════════════════════════════════════
     ACTIVATE / DEACTIVATE
     Called by diary.js when edit mode toggles.
  ════════════════════════════════════════════════════════ */
  function activate() {
    // Re-attach listeners to all current draggable elements
    document.querySelectorAll('.draggable-element').forEach(el => {
      attachElementListeners(el);
    });
    document.addEventListener('keydown', handleKeyNudge);
  }

  function deactivate() {
    // Remove contenteditable from all fields
    document.querySelectorAll('[contenteditable="true"]').forEach(el => {
      el.contentEditable = 'false';
    });
    // Deselect all
    document.querySelectorAll('.draggable-element.is-selected').forEach(el => {
      el.classList.remove('is-selected');
    });
    hideElementToolbar();
    document.removeEventListener('keydown', handleKeyNudge);
  }

  /* ════════════════════════════════════════════════════════
     UTILITIES
  ════════════════════════════════════════════════════════ */
  function getPointerPos(e) {
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    if (e.changedTouches && e.changedTouches.length > 0) {
      return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  }

  function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
  }

  return {
    activate,
    deactivate,
    attachElementListeners
  };

})();
