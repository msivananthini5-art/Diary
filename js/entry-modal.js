/**
 * SABI Diary — New Entry Modal
 * Handles creation of new diary entries with text, photos, and stickers
 * 
 * Mode Support:
 * - OWNER: Can create, edit, delete entries
 * - VIEWER: Can only view entries (read-only mode)
 */

const EntryModal = (() => {
  let state = {
    isOpen: false,
    currentDate: new Date(),
    isViewerMode: false, // true = girlfriend/viewer, false = owner
    formData: {
      date: '',
      time: '',
      title: '',
      body: '',
      photos: [],
      stickers: []
    },
    selectedElement: null,
    dragState: null
  };

  // Check if viewer mode (add ?viewer to URL)
  function checkViewerMode() {
    const params = new URLSearchParams(window.location.search);
    state.isViewerMode = params.has('viewer');
    if (state.isViewerMode) {
      console.log('📖 VIEWER MODE: Read-only access');
      disableEditFeatures();
    }
  }

  // Sticker library
  const stickerLibrary = {
    flowers: [
      { id: 'rose-1', emoji: '🌹', name: 'Rose' },
      { id: 'flower-1', emoji: '🌸', name: 'Cherry Blossom' },
      { id: 'flower-2', emoji: '🌼', name: 'Sunflower' },
      { id: 'flower-3', emoji: '🌷', name: 'Tulip' },
    ],
    hearts: [
      { id: 'heart-1', emoji: '♥', name: 'Heart' },
      { id: 'heart-2', emoji: '💕', name: 'Two Hearts' },
      { id: 'heart-3', emoji: '💖', name: 'Sparkling Heart' },
    ],
    nature: [
      { id: 'leaf-1', emoji: '🍃', name: 'Leaf' },
      { id: 'clover-1', emoji: '🍀', name: 'Clover' },
      { id: 'butterfly-1', emoji: '🦋', name: 'Butterfly' },
    ],
    stars: [
      { id: 'star-1', emoji: '✨', name: 'Sparkles' },
      { id: 'star-2', emoji: '⭐', name: 'Star' },
      { id: 'star-3', emoji: '💫', name: 'Dizzy' },
    ]
  };

  function initModal() {
    createModalDOM();
    attachEventListeners();
    setDefaultDate();
    checkViewerMode();
    
    // Clean up old entries format if they exist
    const stored = DiaryStorage.load();
    if (stored && Array.isArray(stored)) {
      // Filter out any old-format entries (those without proper left/right structure)
      const cleaned = stored.filter(entry => entry.left && entry.right);
      if (cleaned.length !== stored.length) {
        DiaryStorage.save(cleaned);
      }
    }
  }

  function disableEditFeatures() {
    // Hide the new entry button and edit controls
    setTimeout(() => {
      const newEntryBtn = document.getElementById('newEntryBtn');
      const editBtn = document.getElementById('editBtn');
      const addBtn = document.getElementById('addBtn');
      
      if (newEntryBtn) newEntryBtn.style.display = 'none';
      if (editBtn) editBtn.style.display = 'none';
      if (addBtn) addBtn.style.display = 'none';
    }, 100);
  }

  function createModalDOM() {
    const modal = document.createElement('div');
    modal.id = 'entryModal';
    modal.className = 'entry-modal';
    modal.innerHTML = `
      <div class="entry-modal__backdrop"></div>
      <div class="entry-modal__container">
        <div class="entry-modal__header">
          <h2 class="entry-modal__title">✨ new memory</h2>
          <button class="entry-modal__close" id="closeModal" aria-label="Close">&times;</button>
        </div>

        <div class="entry-modal__body">
          <!-- Date & Time -->
          <div class="entry-form__row">
            <div class="entry-form__group">
              <label for="entryDate">date</label>
              <input type="date" id="entryDate" class="entry-form__input" />
            </div>
            <div class="entry-form__group">
              <label for="entryTime">time</label>
              <input type="time" id="entryTime" class="entry-form__input" />
            </div>
          </div>

          <!-- Title -->
          <div class="entry-form__group">
            <label for="entryTitle">title (optional)</label>
            <input type="text" id="entryTitle" class="entry-form__input entry-form__input--large" placeholder="the moment I..." />
          </div>

          <!-- Body Text -->
          <div class="entry-form__group">
            <label for="entryBody">what's on your mind?</label>
            <textarea id="entryBody" class="entry-form__textarea" placeholder="write here..."></textarea>
          </div>

          <!-- Media Controls -->
          <div class="entry-form__controls">
            <button class="entry-form__btn entry-form__btn--secondary" id="addPhotoBtn">
              📷 add photo
            </button>
            <button class="entry-form__btn entry-form__btn--secondary" id="addStickerBtn">
              🎨 add sticker
            </button>
          </div>

          <!-- Hidden file input for photo upload -->
          <input type="file" id="photoInput" accept="image/*" style="display:none;" />

          <!-- Photo Preview Area -->
          <div id="photoPreview" class="entry-form__preview" style="display:none;">
            <div class="entry-form__preview-label">uploaded photos:</div>
            <div id="photoList" class="entry-form__photo-list"></div>
          </div>

          <!-- Sticker Palette -->
          <div id="stickerPalette" class="entry-form__sticker-palette" style="display:none;">
            <div class="entry-form__palette-header">
              <span>pick a sticker:</span>
              <button class="entry-form__palette-close" id="closeStickerPalette">&times;</button>
            </div>
            <div id="stickerCategories" class="entry-form__categories"></div>
          </div>

          <!-- Canvas Preview -->
          <div class="entry-form__canvas">
            <div class="entry-form__canvas-label">preview:</div>
            <div id="entryCanvas" class="entry-form__canvas-area">
              <div class="entry-form__canvas-empty">your entry will appear here</div>
            </div>
          </div>

          <!-- Preview Content (hidden, for display) -->
          <div id="previewContent" class="entry-form__preview-content" style="display:none;"></div>
        </div>

        <div class="entry-modal__footer">
          <button class="entry-modal__btn entry-modal__btn--cancel" id="cancelBtn">cancel</button>
          <button class="entry-modal__btn entry-modal__btn--save" id="saveEntryBtn">save entry</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  function attachEventListeners() {
    const modal = document.getElementById('entryModal');
    
    // Close buttons
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('backdrop')?.addEventListener('click', closeModal);

    // Photo upload
    document.getElementById('addPhotoBtn').addEventListener('click', () => {
      document.getElementById('photoInput').click();
    });
    document.getElementById('photoInput').addEventListener('change', handlePhotoUpload);

    // Sticker button
    document.getElementById('addStickerBtn').addEventListener('click', showStickerPalette);
    document.getElementById('closeStickerPalette').addEventListener('click', hideStickerPalette);

    // Save entry
    document.getElementById('saveEntryBtn').addEventListener('click', saveEntry);

    // Keyboard close (Escape)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.isOpen) closeModal();
    });

    // Backdrop click
    modal.querySelector('.entry-modal__backdrop').addEventListener('click', closeModal);

    // Form inputs
    document.getElementById('entryDate').addEventListener('change', (e) => {
      state.formData.date = e.target.value;
    });
    document.getElementById('entryTime').addEventListener('change', (e) => {
      state.formData.time = e.target.value;
    });
    document.getElementById('entryTitle').addEventListener('input', (e) => {
      state.formData.title = e.target.value;
    });
    document.getElementById('entryBody').addEventListener('input', (e) => {
      state.formData.body = e.target.value;
    });
  }

  function setDefaultDate() {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const timeStr = today.toTimeString().slice(0, 5);
    
    document.getElementById('entryDate').value = dateStr;
    document.getElementById('entryTime').value = timeStr;
    state.formData.date = dateStr;
    state.formData.time = timeStr;
  }

  function handlePhotoUpload(e) {
    const files = Array.from(e.target.files);
    
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const photo = {
          id: 'photo-' + Date.now() + Math.random().toString(36).slice(2, 5),
          src: event.target.result,
          caption: ''
        };
        state.formData.photos.push(photo);
        renderPhotos();
        updatePreview();
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = '';
  }

  function renderPhotos() {
    const photoList = document.getElementById('photoList');
    const preview = document.getElementById('photoPreview');

    if (state.formData.photos.length === 0) {
      preview.style.display = 'none';
      return;
    }

    preview.style.display = 'block';
    photoList.innerHTML = '';

    state.formData.photos.forEach((photo, idx) => {
      const photoEl = document.createElement('div');
      photoEl.className = 'entry-form__photo-item';
      photoEl.innerHTML = `
        <div class="entry-form__photo-img-wrap">
          <img src="${photo.src}" alt="Uploaded photo" class="entry-form__photo-img" />
        </div>
        <input type="text" class="entry-form__photo-caption" placeholder="caption (optional)" value="${photo.caption}" 
          data-idx="${idx}" />
        <button class="entry-form__photo-remove" data-idx="${idx}">✕</button>
      `;
      
      // Update caption
      photoEl.querySelector('.entry-form__photo-caption').addEventListener('input', (e) => {
        state.formData.photos[idx].caption = e.target.value;
        updatePreview();
      });

      // Remove photo
      photoEl.querySelector('.entry-form__photo-remove').addEventListener('click', () => {
        state.formData.photos.splice(idx, 1);
        renderPhotos();
        updatePreview();
      });

      photoList.appendChild(photoEl);
    });
  }

  function showStickerPalette() {
    const palette = document.getElementById('stickerPalette');
    palette.style.display = 'block';

    if (!palette.querySelector('.entry-form__categories').children.length) {
      renderStickerPalette();
    }
  }

  function hideStickerPalette() {
    document.getElementById('stickerPalette').style.display = 'none';
  }

  function renderStickerPalette() {
    const container = document.getElementById('stickerCategories');
    container.innerHTML = '';

    Object.entries(stickerLibrary).forEach(([category, stickers]) => {
      const catDiv = document.createElement('div');
      catDiv.className = 'entry-form__category';
      catDiv.innerHTML = `<div class="entry-form__category-name">${category}</div>`;

      const stickerRow = document.createElement('div');
      stickerRow.className = 'entry-form__sticker-row';

      stickers.forEach((sticker) => {
        const stickerBtn = document.createElement('button');
        stickerBtn.className = 'entry-form__sticker-btn';
        stickerBtn.textContent = sticker.emoji;
        stickerBtn.title = sticker.name;
        stickerBtn.addEventListener('click', () => addSticker(sticker));
        stickerRow.appendChild(stickerBtn);
      });

      catDiv.appendChild(stickerRow);
      container.appendChild(catDiv);
    });
  }

  function addSticker(sticker) {
    const newSticker = {
      id: 'sticker-' + Date.now(),
      type: sticker.id,
      emoji: sticker.emoji,
      x: Math.random() * 80 + 10,
      y: Math.random() * 60 + 20,
      rotation: Math.random() * 30 - 15
    };
    
    state.formData.stickers.push(newSticker);
    updatePreview();
    hideStickerPalette();
  }

  function updatePreview() {
    const canvas = document.getElementById('entryCanvas');
    const canvasEmpty = canvas.querySelector('.entry-form__canvas-empty');

    if (state.formData.photos.length === 0 && state.formData.stickers.length === 0) {
      canvasEmpty.style.display = 'block';
    } else {
      canvasEmpty.style.display = 'none';
    }

    // Render photos as polaroids
    const photoArea = canvas.querySelectorAll('.entry-form__preview-polaroid');
    photoArea.forEach(el => el.remove());

    state.formData.photos.forEach((photo) => {
      const pol = document.createElement('div');
      pol.className = 'entry-form__preview-polaroid';
      pol.style.cssText = `
        position: absolute;
        left: ${Math.random() * 60 + 10}%;
        top: ${Math.random() * 40 + 10}%;
        transform: rotate(${Math.random() * 8 - 4}deg);
      `;
      pol.innerHTML = `
        <img src="${photo.src}" alt="Preview" class="entry-form__preview-pol-img" />
        ${photo.caption ? `<div class="entry-form__preview-pol-cap">${photo.caption}</div>` : ''}
      `;
      canvas.appendChild(pol);
    });

    // Render stickers
    const stickerArea = canvas.querySelectorAll('.entry-form__preview-sticker');
    stickerArea.forEach(el => el.remove());

    state.formData.stickers.forEach((sticker) => {
      const stick = document.createElement('div');
      stick.className = 'entry-form__preview-sticker';
      stick.textContent = sticker.emoji;
      stick.style.cssText = `
        position: absolute;
        left: ${sticker.x}%;
        top: ${sticker.y}%;
        transform: rotate(${sticker.rotation}deg);
        font-size: 2rem;
        cursor: grab;
      `;
      stick.addEventListener('mousedown', (e) => {
        startDragSticker(e, sticker);
      });
      canvas.appendChild(stick);
    });
  }

  function startDragSticker(e, sticker) {
    e.preventDefault();
    const canvas = document.getElementById('entryCanvas');
    const rect = canvas.getBoundingClientRect();
    
    state.dragState = {
      sticker: sticker,
      startX: e.clientX,
      startY: e.clientY,
      startStickerX: sticker.x,
      startStickerY: sticker.y,
      canvasRect: rect
    };

    document.addEventListener('mousemove', dragSticker);
    document.addEventListener('mouseup', stopDragSticker);
  }

  function dragSticker(e) {
    if (!state.dragState) return;
    
    const { sticker, startX, startY, startStickerX, startStickerY, canvasRect } = state.dragState;
    const deltaX = (e.clientX - startX) / canvasRect.width * 100;
    const deltaY = (e.clientY - startY) / canvasRect.height * 100;
    
    sticker.x = Math.max(0, Math.min(100, startStickerX + deltaX));
    sticker.y = Math.max(0, Math.min(100, startStickerY + deltaY));
    
    updatePreview();
  }

  function stopDragSticker() {
    state.dragState = null;
    document.removeEventListener('mousemove', dragSticker);
    document.removeEventListener('mouseup', stopDragSticker);
  }

  function saveEntry() {
    // Get current form values
    const dateValue = document.getElementById('entryDate').value;
    const bodyValue = document.getElementById('entryBody').value;
    const titleValue = document.getElementById('entryTitle').value;
    
    // Validation
    if (!dateValue || !bodyValue || bodyValue.trim().length === 0) {
      alert('Please add a date and at least some text!');
      return;
    }

    // Create entry object matching diary spread format
    // Each entry gets its own spread (page pair)
    const entry = {
      id: 's' + Date.now().toString(36),
      left: {
        date: dateValue,
        title: titleValue || '',
        body: bodyValue,
        list: [],
        els: []
      },
      right: {
        date: dateValue,
        title: '',
        body: '',
        list: [],
        els: state.formData.photos.map((photo, idx) => ({
          id: photo.id,
          type: 'pol',
          top: 10 + idx * 25,
          left: 5 + idx * 20,
          w: 100,
          h: 120,
          rot: Math.random() * 8 - 4,
          src: photo.src,
          cap: photo.caption
        }))
      }
    };
    
    // Add stickers to LEFT page (same as text)
    state.formData.stickers.forEach((sticker, idx) => {
      entry.left.els.push({
        id: sticker.id,
        type: 'sticker',
        emoji: sticker.emoji,
        top: 60 + idx * 15,
        left: 70 + idx * 10,
        rot: sticker.rotation
      });
    });

    // Save to storage
    const allEntries = DiaryStorage.load() || [];
    allEntries.push(entry);
    DiaryStorage.save(allEntries);

    // Show success message
    showToast('✨ Entry saved! 📖');

    // Close modal
    closeModal();
    
    // Reload diary to show new entry
    setTimeout(() => {
      location.reload();
    }, 1000);
  }

  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'entry-modal__toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  function openModal() {
    // Don't open modal if in viewer mode
    if (state.isViewerMode) {
      console.log('⛔ Viewer mode: Cannot create new entries');
      return;
    }
    
    state.isOpen = true;
    document.getElementById('entryModal').classList.add('open');
    document.body.style.overflow = 'hidden';
    setDefaultDate();
    
    // Reset form completely
    state.formData = {
      date: document.getElementById('entryDate').value,
      time: document.getElementById('entryTime').value,
      title: '',
      body: '',
      photos: [],
      stickers: []
    };
    
    document.getElementById('entryTitle').value = '';
    document.getElementById('entryBody').value = '';
    document.getElementById('photoInput').value = '';
    renderPhotos();
    updatePreview();
  }

  function closeModal() {
    state.isOpen = false;
    document.getElementById('entryModal').classList.remove('open');
    document.body.style.overflow = '';
  }

  // Public API
  return {
    init: initModal,
    open: openModal,
    close: closeModal,
    isViewer: () => state.isViewerMode
  };
})();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', EntryModal.init);
} else {
  EntryModal.init();
}
