let DIARY_MODE = 'editor';
let isAnimating = false;

const STICKERS = [
  { label: 'Purple Flower', emoji: 'ðŸŒ¸' },
  { label: 'Lavender',      emoji: 'ðŸ’œ' },
  { label: 'Leaf',          emoji: 'ðŸƒ' },
  { label: 'Heart',         emoji: 'ðŸ¤' },
  { label: 'Star',          emoji: 'â­' },
  { label: 'Butterfly',     emoji: 'ðŸ¦‹' },
  { label: 'Branch',        emoji: 'ðŸŒ¿' },
  { label: 'Daisy',         emoji: 'ðŸŒ¼' },
  { label: 'Small Heart',   emoji: 'ðŸ©·' },
];

function setDiaryMode(mode) {
  DIARY_MODE = mode;
  const indicator = document.getElementById('mode-indicator');
  if (indicator) {
    indicator.textContent = mode === 'editor' ? 'EDIT MODE' : 'VIEWER MODE';
    indicator.style.background = mode === 'editor' ? 'rgba(60,15,30,0.85)' : 'rgba(100,100,100,0.85)';
  }
  updateUIVisibility();
}

function updateUIVisibility() {
  const addBtn = document.getElementById('btn-add');
  const actions = document.querySelectorAll('.memory-actions');
  
  if (DIARY_MODE === 'viewer') {
    addBtn.classList.add('hidden');
    actions.forEach(a => a.style.display = 'none');
  } else {
    addBtn.classList.remove('hidden');
  }
}

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('mode') === 'viewer') {
  setDiaryMode('viewer');
}

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
    // Migration: ensure all existing memories have a stickers array
    this.spreads.forEach(sp => {
      [...(sp.leftMemories || []), ...(sp.rightMemories || [])].forEach(m => {
        m.stickers = m.stickers || [];
      });
    });
  },
  
  getCurrentSpread() {
    return this.spreads[this.currentSpreadIndex] || null;
  },
  
  addMemory(memory) {
    const spread = this.getCurrentSpread();
    if (!spread) return;
    
    memory.id = 'mem_' + Date.now();
    memory.stickers = memory.stickers || [];
    const MAX_PER_SIDE = 2;
    
    if (spread.leftMemories.length < MAX_PER_SIDE) {
      spread.leftMemories.push(memory);
    } else if (spread.rightMemories.length < MAX_PER_SIDE) {
      spread.rightMemories.push(memory);
    } else {
      const newSpread = {
        spreadNum: this.spreads[this.spreads.length - 1].spreadNum + 1,
        leftMemories: [memory],
        rightMemories: []
      };
      this.spreads.push(newSpread);
      this.currentSpreadIndex++;
    }
    this.save();
  },
  
  editMemory(memoryId, updates) {
    const spread = this.getCurrentSpread();
    if (!spread) return;
    
    let memory = spread.leftMemories.find(m => m.id === memoryId);
    if (!memory) memory = spread.rightMemories.find(m => m.id === memoryId);
    
    if (memory) {
      Object.assign(memory, updates);
      this.save();
    }
  },
  
  deleteMemory(memoryId) {
    const spread = this.getCurrentSpread();
    if (!spread) return;
    
    spread.leftMemories = spread.leftMemories.filter(m => m.id !== memoryId);
    spread.rightMemories = spread.rightMemories.filter(m => m.id !== memoryId);
    this.save();
  },
  
  nextSpread() {
    if (this.currentSpreadIndex < this.spreads.length - 1) {
      this.currentSpreadIndex++;
    } else {
      const newSpread = {
        spreadNum: this.spreads[this.spreads.length - 1].spreadNum + 1,
        leftMemories: [],
        rightMemories: []
      };
      this.spreads.push(newSpread);
      this.currentSpreadIndex++;
    }
    this.save();
  },
  
  prevSpread() {
    if (this.currentSpreadIndex > 0) {
      this.currentSpreadIndex--;
      this.save();
    }
  },
  
  save() {
    DiaryStorage.save(this);
  }
};

DiaryState.init();

function handleLeftPageClick(e) {
  if (DIARY_MODE === 'viewer') {
    handleLeftPageTurn();
    return;
  }
  const isContent = e.target.closest('.memory-item, .memory-edit, .action-btn, input, textarea, button, .empty-state');
  if (!isContent) handleLeftPageTurn();
}

function handleRightPageClick(e) {
  if (DIARY_MODE === 'viewer') {
    handleRightPageTurn();
    return;
  }
  const isContent = e.target.closest('.memory-item, .memory-edit, .action-btn, input, textarea, button, .empty-state');
  if (!isContent) handleRightPageTurn();
}

function handleLeftPageTurn() {
  if (isAnimating) return;
  if (DiaryState.currentSpreadIndex === 0) return;
  const leftPage = document.querySelector('.page-left');
  if (!leftPage) return;
  isAnimating = true;
  leftPage.classList.add('flip-backward');
  setTimeout(() => {
    DiaryState.prevSpread();
    renderSpread();
    isAnimating = false;
  }, 640);
}

function handleRightPageTurn() {
  if (isAnimating) return;
  const rightPage = document.querySelector('.page-right');
  if (!rightPage) return;
  isAnimating = true;
  rightPage.classList.add('flip-forward');
  setTimeout(() => {
    DiaryState.nextSpread();
    renderSpread();
    isAnimating = false;
  }, 640);
}

// Rotate through 3 layout patterns based on spread number + side
function getPatternClass(spreadNum, side) {
  const patterns = ['pattern-a', 'pattern-b', 'pattern-c'];
  const base = (spreadNum - 1) * 2 + (side === 'right' ? 1 : 0);
  return patterns[base % patterns.length];
}

function renderPageMemories(memories, pattern) {
  if (memories.length === 0) {
    return `<div class="empty-state"><div class="empty-icon">âœ¨</div></div>`;
  }
  const singleClass = memories.length === 1 ? ' single-memory' : '';
  let html = `<div class="page-content ${pattern}${singleClass}">`;
  memories.forEach((mem, idx) => {
    html += `<div class="memory-zone zone-${idx}">`;
    html += renderMemoryItem(mem, idx);
    html += `</div>`;
    // Insert a natural gap between memories
    if (idx < memories.length - 1) {
      html += `<div class="zone-gap"></div>`;
    }
  });
  html += `</div>`;
  return html;
}

function renderSpread() {
  const spread = DiaryState.getCurrentSpread();
  if (!spread) return;
  
  const spreadEl = document.getElementById('current-spread');
  
  const leftPattern = getPatternClass(spread.spreadNum, 'left');
  const rightPattern = getPatternClass(spread.spreadNum, 'right');

  let html = `<div class="page-left">`;
  html += renderPageMemories(spread.leftMemories, leftPattern);
  html += `</div><div class="page-right">`;
  html += renderPageMemories(spread.rightMemories, rightPattern);
  html += `</div>`;
  
  spreadEl.innerHTML = html;
  
  const leftPage = spreadEl.querySelector('.page-left');
  const rightPage = spreadEl.querySelector('.page-right');
  
  if (leftPage) leftPage.addEventListener('click', handleLeftPageClick);
  if (rightPage) rightPage.addEventListener('click', handleRightPageClick);
  
  spreadEl.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const memId = btn.dataset.memoryId;
      const action = btn.dataset.action;
      
      if (action === 'edit') startEditMemory(memId);
      else if (action === 'delete') {
        if (confirm('Delete this memory?')) {
          DiaryState.deleteMemory(memId);
          renderSpread();
        }
      }
    });
  });
  
  document.getElementById('spread-num').textContent = spread.spreadNum;
  document.getElementById('spread-total').textContent = DiaryState.spreads.length;
  updateUIVisibility();
  
  // Add botanical elements to new pages
  setTimeout(addBotanicalElements, 50);
  // Apply any saved drag offsets, then wire up drag handlers
  setTimeout(() => { applyOffsets(); attachDragHandlers(); renderStickers(); attachStickerDragHandlers(); }, 80);
}

function renderMemoryItem(mem, slot) {
  const actions = DIARY_MODE === 'editor' ? `
    <div class="memory-actions">
      <button class="action-btn" data-memory-id="${mem.id}" data-action="edit">âœï¸</button>
      <button class="action-btn" data-memory-id="${mem.id}" data-action="delete">âœ•</button>
    </div>
  ` : '';

  const dateDisplay = mem.time ? `${mem.date} â€¢ ${mem.time}` : (mem.date || 'no date');

  // Alternate tilt: even slots lean left, odd slots lean right
  const tilt = slot % 2 === 0 ? 'rotate(-2deg)' : 'rotate(2.5deg)';

  const photoHtml = mem.photo ? `
      <div class="memory-photo-wrapper" data-mem-id="${mem.id}" style="transform:${tilt}">
        <img src="${mem.photo}" class="memory-photo" alt="memory photo">
      </div>` : '';

  return `
    <div class="memory-item" data-mem-id="${mem.id}">
      <div class="memory-layout">
        <div class="memory-date-line">
          <span class="memory-date">${dateDisplay}</span>
        </div>
        <div class="memory-body">
          <div class="memory-text-area">
            <div class="memory-title">${mem.title || ''}</div>
            <div class="memory-text">${mem.text || ''}</div>
            ${mem.notes ? `<div class="memory-notes">${mem.notes}</div>` : ''}
          </div>
          ${photoHtml}
        </div>
      </div>
      ${actions}
    </div>`;
}

let addPhotoFile = null;

function openAddModal() {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date();
  const currentTime = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
  
  document.getElementById('add-date').value = today;
  document.getElementById('add-time').value = currentTime;
  document.getElementById('add-title').value = '';
  document.getElementById('add-text').value = '';
  document.getElementById('add-notes').value = '';
  document.getElementById('add-photo').value = '';
  addPhotoFile = null;
  document.getElementById('add-photo-preview').innerHTML = '';
  buildStickerPicker('add-sticker-picker');
  document.getElementById('add-modal').classList.add('show');
}

function closeAddModal() {
  document.getElementById('add-modal').classList.remove('show');
  addPhotoFile = null;
}

async function submitAddMemory() {
  const date = document.getElementById('add-date').value;
  const time = document.getElementById('add-time').value;
  const title = document.getElementById('add-title').value;
  const text = document.getElementById('add-text').value;
  const notes = document.getElementById('add-notes').value;
  
  if (!text.trim()) {
    alert('Please write your memory');
    return;
  }
  
  let photo = null;
  if (addPhotoFile) {
    photo = await fileToBase64(addPhotoFile);
  }
  
  const selectedStickerEl = document.querySelector('#add-sticker-picker .sticker-option.selected');
  const addStickerEmoji = selectedStickerEl ? selectedStickerEl.textContent.trim() : null;
  const stickers = addStickerEmoji ? [{
    id: 'stk_' + Date.now(),
    emoji: addStickerEmoji,
    x: 55 + (Math.random() * 6 - 3),
    y: 8  + (Math.random() * 4 - 2),
    rot: Math.round(Math.random() * 30 - 15),
    scale: 1.0
  }] : [];

  DiaryState.addMemory({date, time, title, text, photo, notes, stickers});
  renderSpread();
  closeAddModal();
}

function startEditMemory(memId) {
  const spread = DiaryState.getCurrentSpread();
  let memory = spread.leftMemories.find(m => m.id === memId);
  const isLeft = !!memory;
  if (!memory) memory = spread.rightMemories.find(m => m.id === memId);
  
  if (!memory) return;
  
  const side = isLeft ? 'left' : 'right';
  showEditForm(memory, side);
}

function showEditForm(memory, side) {
  const pageContent = document.querySelector(side === 'left' ? '.page-left .page-content' : '.page-right .page-content');
  if (!pageContent) return;
  
  const top = Math.random() * 25 + 10 + '%';
  const left = Math.random() * 25 + 10 + '%';

  const existingStickerList = (memory.stickers || []).map(s =>
    `<span style="font-size:1.2rem;margin-right:4px;filter:saturate(0.75)">${s.emoji}</span>`
  ).join('');
  
  const editHTML = `
    <div class="memory-edit" data-memory-id="${memory.id}" style="top:${top};left:${left};">
      <div class="edit-field">
        <label>Date</label>
        <input type="date" class="edit-date" value="${memory.date || ''}">
      </div>
      <div class="edit-field">
        <label>Time</label>
        <input type="time" class="edit-time" value="${memory.time || ''}">
      </div>
      <div class="edit-field">
        <label>Title</label>
        <input type="text" class="edit-title" value="${memory.title || ''}">
      </div>
      <div class="edit-field">
        <label>Memory</label>
        <textarea class="edit-text">${memory.text || ''}</textarea>
      </div>
      <div class="edit-field">
        <label>Photo</label>
        <input type="file" class="edit-photo" accept="image/*">
        ${memory.photo ? `<img src="${memory.photo}" style="width:60px;height:60px;object-fit:cover;border-radius:2px;margin-top:0.4rem;border:2px solid #ccc;">` : ''}
      </div>
      <div class="edit-field">
        <label>Note</label>
        <input type="text" class="edit-notes" value="${memory.notes || ''}">
      </div>
      <div class="edit-field">
        <label>Add Sticker</label>
        ${existingStickerList ? `<div style="margin-bottom:6px;">Current: ${existingStickerList}</div>` : ''}
        <div class="sticker-picker-row" id="edit-sticker-picker-${memory.id}">
          <!-- populated by JS -->
        </div>
        <small style="color:#8b6040;font-size:0.75rem;margin-top:3px;display:block;">Select to add another sticker</small>
      </div>
      <div class="edit-actions">
        <button class="btn-cancel" onclick="cancelEdit()">Cancel</button>
        <button class="btn-save" onclick="saveEdit('${memory.id}', '${side}')">Save</button>
      </div>
    </div>
  `;
  
  pageContent.insertAdjacentHTML('beforeend', editHTML);
  buildStickerPicker('edit-sticker-picker-' + memory.id);
}

async function saveEdit(memId, side) {
  const editForm = document.querySelector(`[data-memory-id="${memId}"]`);
  if (!editForm) return;
  
  const date = editForm.querySelector('.edit-date').value;
  const time = editForm.querySelector('.edit-time').value;
  const title = editForm.querySelector('.edit-title').value;
  const text = editForm.querySelector('.edit-text').value;
  const notes = editForm.querySelector('.edit-notes').value;
  const photoInput = editForm.querySelector('.edit-photo');
  
  if (!text.trim()) {
    alert('Memory cannot be empty');
    return;
  }
  
  const spread = DiaryState.getCurrentSpread();
  const memory = side === 'left' 
    ? spread.leftMemories.find(m => m.id === memId)
    : spread.rightMemories.find(m => m.id === memId);
  
  if (!memory) return;
  
  if (photoInput.files.length > 0) {
    memory.photo = await fileToBase64(photoInput.files[0]);
  }

  const editPickerEl = document.querySelector(`#edit-sticker-picker-${memId} .sticker-option.selected`);
  const editStickerEmoji = editPickerEl ? editPickerEl.textContent.trim() : null;
  if (editStickerEmoji) {
    memory.stickers = memory.stickers || [];
    memory.stickers.push({
      id: 'stk_' + Date.now(),
      emoji: editStickerEmoji,
      x: 55 + (Math.random() * 6 - 3),
      y: 8  + (Math.random() * 4 - 2),
      rot: Math.round(Math.random() * 30 - 15),
      scale: 1.0
    });
  }
  
  DiaryState.editMemory(memId, {date, time, title, text, notes});
  renderSpread();
}

function cancelEdit() {
  renderSpread();
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('add-photo').addEventListener('change', (e) => {
    addPhotoFile = e.target.files[0] || null;
    const preview = document.getElementById('add-photo-preview');
    if (addPhotoFile) {
      const url = URL.createObjectURL(addPhotoFile);
      preview.innerHTML = `<img src="${url}" style="width:80px;height:80px;object-fit:cover;border-radius:2px;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.2);">`;
    } else {
      preview.innerHTML = '';
    }
  });
  
  document.getElementById('btn-add').addEventListener('click', openAddModal);
  document.getElementById('add-modal').addEventListener('click', (e) => {
    if (e.target.id === 'add-modal') closeAddModal();
  });
  
  const container = document.getElementById('petals');
  const colors = ['rgba(180,80,100,0.45)','rgba(200,110,120,0.38)','rgba(220,140,140,0.32)','rgba(160,60,90,0.42)','rgba(240,170,170,0.28)','rgba(200,100,110,0.4)'];
  for (let i = 0; i < 22; i++) {
    const p = document.createElement('div');
    p.className = 'petal';
    const size = 4 + Math.random() * 9;
    const left = Math.random() * 100;
    const delay = Math.random() * 18;
    const dur = 12 + Math.random() * 16;
    const color = colors[Math.floor(Math.random() * colors.length)];
    p.style.cssText = `width:${size}px;height:${size*0.65}px;left:${left}%;top:-${size}px;background:${color};animation-duration:${dur}s;animation-delay:${delay}s;`;
    container.appendChild(p);
  }
  
  // Add spine stitching
  const spineStitching = document.getElementById('spine-stitching');
  for (let i = 0; i < 6; i++) {
    const stitch = document.createElement('div');
    stitch.className = 'spine-stitch';
    spineStitching.appendChild(stitch);
  }
  
  // Initialize botanical elements on pages
  setTimeout(addBotanicalElements, 100);
  
  renderSpread();
});

function addBotanicalElements() {
  const leftPage = document.querySelector('.page-left');
  const rightPage = document.querySelector('.page-right');
  
  if (leftPage) addBotanicalToPage(leftPage, 'left');
  if (rightPage) addBotanicalToPage(rightPage, 'right');
}

function addBotanicalToPage(page, side) {
  // Remove old decorations
  page.querySelectorAll('.botanical-element').forEach(el => el.remove());

  /* â”€â”€ SVG helpers â”€â”€ */
  const flower = (c, sz) => `<svg width="${sz}" height="${sz}" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="22" cy="11" rx="4" ry="7"  fill="${c}" opacity="0.55"/>
    <ellipse cx="22" cy="33" rx="4" ry="7"  fill="${c}" opacity="0.55"/>
    <ellipse cx="11" cy="22" rx="7" ry="4"  fill="${c}" opacity="0.55"/>
    <ellipse cx="33" cy="22" rx="7" ry="4"  fill="${c}" opacity="0.55"/>
    <ellipse cx="13" cy="13" rx="4" ry="6.5" transform="rotate(45 13 13)"  fill="${c}" opacity="0.45"/>
    <ellipse cx="31" cy="13" rx="4" ry="6.5" transform="rotate(-45 31 13)" fill="${c}" opacity="0.45"/>
    <ellipse cx="13" cy="31" rx="4" ry="6.5" transform="rotate(-45 13 31)" fill="${c}" opacity="0.45"/>
    <ellipse cx="31" cy="31" rx="4" ry="6.5" transform="rotate(45 31 31)"  fill="${c}" opacity="0.45"/>
    <circle cx="22" cy="22" r="4.5" fill="${c}" opacity="0.85"/>
    <circle cx="22" cy="22" r="2.5" fill="#fff8f0" opacity="0.6"/>
  </svg>`;

  const leaf = (c, sz) => `<svg width="${sz}" height="${Math.round(sz*0.65)}" viewBox="0 0 38 25" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 13 Q10 2 24 3 Q35 4 36 12 Q35 20 24 22 Q10 23 2 13Z" fill="${c}" opacity="0.5"/>
    <path d="M2 13 Q19 11 36 12" stroke="${c}" stroke-width="0.8" fill="none" opacity="0.6"/>
    <path d="M12 6 Q15 12 14 18" stroke="${c}" stroke-width="0.6" fill="none" opacity="0.4"/>
    <path d="M24 5 Q23 12 22 19" stroke="${c}" stroke-width="0.6" fill="none" opacity="0.4"/>
  </svg>`;

  const heart = (c, sz) => `<svg width="${sz}" height="${sz}" viewBox="0 0 32 30" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 27 C16 27 3 18 3 10 C3 5 7 2 11 3 C13 3.5 15 5 16 7 C17 5 19 3.5 21 3 C25 2 29 5 29 10 C29 18 16 27 16 27Z" fill="${c}" opacity="0.6"/>
  </svg>`;

  const star = (c, sz) => `<svg width="${sz}" height="${sz}" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
    <polygon points="15,2 18,11 28,11 20,17 23,27 15,21 7,27 10,17 2,11 12,11" fill="${c}" opacity="0.55"/>
  </svg>`;

  const tape = (w, h, c) => `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${w}" height="${h}" rx="2" fill="${c}" opacity="0.35"/>
    <rect x="0" y="${h*0.3}" width="${w}" height="${h*0.4}" fill="${c}" opacity="0.12"/>
  </svg>`;

  const flowerColors = ['#c06080','#d4908a','#b87060','#c090a0','#a06840','#d4a0b0'];
  const leafColors   = ['#607040','#708050','#506030','#7a9050'];
  const heartColors  = ['#d46080','#c05070','#e08090'];
  const starColors   = ['#c09040','#b08030','#d4b060'];
  const tapeColors   = ['rgba(200,180,140,1)','rgba(160,200,160,1)','rgba(180,160,200,1)','rgba(220,180,140,1)'];

  // Place decorations in safe zones: corners + mid-edge areas
  // (We deliberately avoid the center 60%Ã—60% content area)
  const placements = [
    // top-left corner cluster
    { top:'2%',  left:'1%',  rot:12,  type:'flower', ci:0, sz:20 },
    { top:'4%',  left:'5%',  rot:-8,  type:'leaf',   ci:0, sz:22 },
    // top-right corner cluster
    { top:'1%',  right:'2%', rot:-15, type:'flower', ci:2, sz:18 },
    { top:'5%',  right:'5%', rot:20,  type:'leaf',   ci:1, sz:20 },
    // bottom-left cluster
    { bottom:'2%', left:'2%', rot:-12, type:'flower', ci:3, sz:19 },
    { bottom:'5%', left:'6%', rot:30,  type:'leaf',   ci:2, sz:18 },
    // bottom-right cluster
    { bottom:'2%', right:'1%', rot:18,  type:'flower', ci:1, sz:20 },
    { bottom:'6%', right:'6%', rot:-25, type:'leaf',   ci:3, sz:17 },
    // mid-left edge accent
    { top:'45%', left:'0%', rot:50, type:'leaf', ci:0, sz:16 },
    // mid-right edge accent
    { top:'48%', right:'0%', rot:-40, type:'leaf', ci:2, sz:15 },
    // tiny hearts + stars scattered near corners
    { top:'8%',  left:'2%',  rot:0,   type:'heart', ci:0, sz:12 },
    { bottom:'8%', right:'2%', rot:5, type:'heart', ci:1, sz:11 },
    { top:'3%',  left:'30%', rot:0,  type:'star',  ci:0, sz:10 },
    { bottom:'3%', right:'28%', rot:0, type:'star', ci:1, sz:9  },
    // tape strips near top + bottom edges
    { top:'-1%', left:'20%', rot:'-2', type:'tape', tw:55, th:10, ci:0 },
    { bottom:'-1%', right:'18%', rot:'3', type:'tape', tw:48, th:9, ci:2 },
  ];

  placements.forEach((p) => {
    // Skip right-edge items on left page, left-edge items on right page
    // to keep decorations near the actual paper edge they belong to
    if (side === 'left'  && p.right && parseFloat(p.right) < 8) return;
    if (side === 'right' && p.left  && parseFloat(p.left)  < 8) return;

    const el = document.createElement('div');
    el.className = 'botanical-element';
    el.style.position = 'absolute';
    el.style.pointerEvents = 'none';
    el.style.zIndex = '4';
    el.style.lineHeight = '0';

    if (p.top)    el.style.top    = p.top;
    if (p.bottom) el.style.bottom = p.bottom;
    if (p.left)   el.style.left   = p.left;
    if (p.right)  el.style.right  = p.right;
    el.style.transform = `rotate(${p.rot}deg)`;

    if (p.type === 'flower') {
      el.style.opacity = '0.7';
      el.style.filter  = 'drop-shadow(0 1px 2px rgba(80,40,20,0.25))';
      el.innerHTML = flower(flowerColors[p.ci % flowerColors.length], p.sz);
    } else if (p.type === 'leaf') {
      el.style.opacity = '0.65';
      el.style.filter  = 'drop-shadow(0 1px 1px rgba(40,60,20,0.2))';
      el.innerHTML = leaf(leafColors[p.ci % leafColors.length], p.sz);
    } else if (p.type === 'heart') {
      el.style.opacity = '0.6';
      el.innerHTML = heart(heartColors[p.ci % heartColors.length], p.sz);
    } else if (p.type === 'star') {
      el.style.opacity = '0.55';
      el.innerHTML = star(starColors[p.ci % starColors.length], p.sz);
    } else if (p.type === 'tape') {
      el.style.opacity = '0.7';
      el.style.filter  = 'drop-shadow(0 1px 2px rgba(80,60,30,0.15))';
      el.innerHTML = tape(p.tw, p.th, tapeColors[p.ci % tapeColors.length]);
    }
    page.appendChild(el);
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeAddModal();
});

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   DRAG-TO-REPOSITION  (editor mode only)
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Strategy:
   â€¢ We never touch existing CSS layout. The first render is
     always pixel-identical to the pre-drag version.
   â€¢ After render, we read any saved pixel offsets from
     localStorage and apply them as CSS translate().
   â€¢ On drag we update that translate live, then persist.
   â€¢ Page-turn is already blocked by the existing
     closest('.memory-item') guard in the click handlers.
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

// â”€â”€ Offset store (separate from DiaryStorage so data model is untouched) â”€â”€
const OffsetStore = {
  _key: 'sabi_offsets_v1',
  _data: {},
  load() {
    try { this._data = JSON.parse(localStorage.getItem(this._key) || '{}'); }
    catch(e) { this._data = {}; }
  },
  get(id, type) {
    const k = id + '_' + type;
    return this._data[k] || { dx: 0, dy: 0 };
  },
  set(id, type, dx, dy) {
    this._data[id + '_' + type] = { dx, dy };
    localStorage.setItem(this._key, JSON.stringify(this._data));
  }
};
OffsetStore.load();

// â”€â”€ Render stickers for all memories on the current spread â”€â”€
function renderStickers() {
  const spread = DiaryState.getCurrentSpread();
  if (!spread) return;

  const allMemories = [
    ...spread.leftMemories,
    ...spread.rightMemories
  ];

  allMemories.forEach(mem => {
    if (!mem.stickers || mem.stickers.length === 0) return;
    const memEl = document.querySelector(`.memory-item[data-mem-id="${mem.id}"]`);
    if (!memEl) return;
    const pageEl = memEl.closest('.page-left, .page-right');
    if (!pageEl) return;

    mem.stickers.forEach(sticker => {
      const el = document.createElement('div');
      el.className = 'memory-sticker';
      el.dataset.stickerId = sticker.id;
      el.dataset.memId = mem.id;
      el.style.left  = sticker.x + '%';
      el.style.top   = sticker.y + '%';
      el.style.transform = `rotate(${sticker.rot || 0}deg) scale(${sticker.scale || 1})`;

      const deleteBtn = document.createElement('span');
      deleteBtn.className = 'sticker-delete';
      deleteBtn.textContent = 'âœ•';
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        mem.stickers = mem.stickers.filter(s => s.id !== sticker.id);
        DiaryState.save();
        renderSpread();
      });

      el.appendChild(document.createTextNode(sticker.emoji));
      el.appendChild(deleteBtn);
      pageEl.appendChild(el);
    });
  });
}

// â”€â”€ Make rendered sticker elements draggable â”€â”€
function attachStickerDragHandlers() {
  if (DIARY_MODE !== 'editor') return;

  document.querySelectorAll('.memory-sticker').forEach(el => {
    const stickerId = el.dataset.stickerId;
    const memId     = el.dataset.memId;
    if (!stickerId || !memId) return;

    let startX, startY, startLeft, startTop, moved;

    el.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.sticker-delete')) return;
      e.stopPropagation();
      el.setPointerCapture(e.pointerId);
      moved = false;

      startLeft = parseFloat(el.style.left)  || 0;
      startTop  = parseFloat(el.style.top)   || 0;
      startX = e.clientX;
      startY = e.clientY;
      el.style.cursor = 'grabbing';
      el.style.zIndex = '50';

      const onMove = (ev) => {
        const page = el.closest('.page-left, .page-right');
        if (!page) return;
        const pr = page.getBoundingClientRect();

        const dxPct = ((ev.clientX - startX) / pr.width)  * 100;
        const dyPct = ((ev.clientY - startY) / pr.height) * 100;

        const newLeft = Math.max(0, Math.min(95, startLeft + dxPct));
        const newTop  = Math.max(0, Math.min(95, startTop  + dyPct));

        el.style.left = newLeft + '%';
        el.style.top  = newTop  + '%';
        el._newLeft = newLeft;
        el._newTop  = newTop;
        if (Math.abs(ev.clientX - startX) > 3 || Math.abs(ev.clientY - startY) > 3) moved = true;
      };

      const onUp = () => {
        el.style.cursor = 'grab';
        el.style.zIndex = '8';
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerup',   onUp);

        if (moved && el._newLeft !== undefined) {
          const spread = DiaryState.getCurrentSpread();
          if (!spread) return;
          const allMems = [...spread.leftMemories, ...spread.rightMemories];
          const mem = allMems.find(m => m.id === memId);
          if (!mem) return;
          const sticker = (mem.stickers || []).find(s => s.id === stickerId);
          if (!sticker) return;
          sticker.x = el._newLeft;
          sticker.y = el._newTop;
          DiaryState.save();
        }
      };

      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerup',   onUp);
    });
  });
}

// â”€â”€ Populate sticker picker UI â”€â”€
function buildStickerPicker(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  STICKERS.forEach(s => {
    const span = document.createElement('span');
    span.className = 'sticker-option';
    span.textContent = s.emoji;
    span.title = s.label;
    span.addEventListener('click', () => {
      // Toggle selection â€” only one at a time
      container.querySelectorAll('.sticker-option').forEach(o => o.classList.remove('selected'));
      span.classList.toggle('selected');
    });
    container.appendChild(span);
  });
}

// â”€â”€ Apply saved offsets after every renderSpread â”€â”€
function applyOffsets() {
  if (DIARY_MODE !== 'editor') return;

  // Memory text blocks
  document.querySelectorAll('.memory-item').forEach(item => {
    const memId = item.dataset.memId;
    if (!memId) return;
    const o = OffsetStore.get(memId, 'text');
    if (o.dx !== 0 || o.dy !== 0) {
      item.style.transform = `translate(${o.dx}px, ${o.dy}px)`;
      item.style.willChange = 'transform';
      item.style.position = 'relative';
      item.style.zIndex = '5';
    }
  });

  // Photo wrappers
  document.querySelectorAll('.memory-photo-wrapper').forEach(wrapper => {
    const memId = wrapper.dataset.memId;
    if (!memId) return;
    const o = OffsetStore.get(memId, 'photo');
    if (o.dx !== 0 || o.dy !== 0) {
      const currentTransform = wrapper.style.transform || '';
      // Preserve existing rotation, add translate
      const rot = currentTransform.match(/rotate\([^)]+\)/) ?
                  currentTransform.match(/rotate\([^)]+\)/)[0] : '';
      wrapper.style.transform = `translate(${o.dx}px, ${o.dy}px) ${rot}`;
      wrapper.style.position = 'relative';
      wrapper.style.zIndex = '6';
    }
  });
}

// â”€â”€ Make an element draggable â”€â”€
function makeDraggable(el, memId, type) {
  el.style.cursor = 'grab';
  el.style.touchAction = 'none';

  let startX, startY, startDx, startDy, moved;

  el.addEventListener('pointerdown', (e) => {
    // Don't steal from buttons / inputs / action buttons
    if (e.target.closest('.action-btn, button, input, textarea, .memory-edit')) return;

    moved = false;
    e.stopPropagation(); // prevent page-turn click
    el.setPointerCapture(e.pointerId);

    const saved = OffsetStore.get(memId, type);
    startX  = e.clientX;
    startY  = e.clientY;
    startDx = saved.dx;
    startDy = saved.dy;

    el.style.cursor = 'grabbing';
    el.style.zIndex = '50';

    const onMove = (ev) => {
      const dx = startDx + (ev.clientX - startX);
      const dy = startDy + (ev.clientY - startY);
      if (Math.abs(ev.clientX - startX) > 3 || Math.abs(ev.clientY - startY) > 3) {
        moved = true;
      }

      // â”€â”€ Clamp within the page half â”€â”€
      const page = el.closest('.page-left, .page-right');
      if (page) {
        const pr  = page.getBoundingClientRect();
        const er  = el.getBoundingClientRect();
        // Current un-translated position of element relative to page
        const elLeft = (er.left - pr.left) - startDx + (er.left - pr.left - (er.left - pr.left));
        // Simpler: just clamp the resulting dx/dy so element stays inside page
        const elW = el.offsetWidth  || er.width;
        const elH = el.offsetHeight || er.height;
        const minDx = -(er.left - pr.left - startDx) + 4;                 // don't go past left edge
        const maxDx = (pr.width  - (er.left - pr.left - startDx) - elW) - 4; // don't go past right edge
        const minDy = -(er.top  - pr.top  - startDy) + 4;
        const maxDy = (pr.height - (er.top  - pr.top  - startDy) - elH) - 4;

        const cdx = Math.max(minDx, Math.min(maxDx, dx));
        const cdy = Math.max(minDy, Math.min(maxDy, dy));

        if (type === 'photo') {
          const rot = (el.style.transform || '').match(/rotate\([^)]+\)/);
          el.style.transform = `translate(${cdx}px, ${cdy}px) ${rot ? rot[0] : ''}`;
        } else {
          el.style.transform = `translate(${cdx}px, ${cdy}px)`;
        }
        // Store tentative values for save on up
        el._pendingDx = cdx;
        el._pendingDy = cdy;
      } else {
        if (type === 'photo') {
          const rot = (el.style.transform || '').match(/rotate\([^)]+\)/);
          el.style.transform = `translate(${dx}px, ${dy}px) ${rot ? rot[0] : ''}`;
        } else {
          el.style.transform = `translate(${dx}px, ${dy}px)`;
        }
        el._pendingDx = dx;
        el._pendingDy = dy;
      }
    };

    const onUp = () => {
      el.style.cursor = 'grab';
      el.style.zIndex = type === 'photo' ? '6' : '5';
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup',   onUp);

      if (moved && el._pendingDx !== undefined) {
        OffsetStore.set(memId, type, el._pendingDx, el._pendingDy);
      }
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup',   onUp);
  });

  // Subtle selection ring on hover (editor only)
  el.addEventListener('mouseenter', () => {
    if (DIARY_MODE !== 'editor') return;
    el.style.outline = '1.5px dashed rgba(160,80,100,0.35)';
    el.style.outlineOffset = '4px';
  });
  el.addEventListener('mouseleave', () => {
    el.style.outline = '';
    el.style.outlineOffset = '';
  });
}

// â”€â”€ Attach drag handlers after every render â”€â”€
function attachDragHandlers() {
  if (DIARY_MODE !== 'editor') return;

  // Text: whole memory-item is draggable
  document.querySelectorAll('.memory-item').forEach(item => {
    const memId = item.dataset.memId;
    if (!memId) return;
    makeDraggable(item, memId, 'text');
  });

  // Photo card
  document.querySelectorAll('.memory-photo-wrapper').forEach(wrapper => {
    const memId = wrapper.dataset.memId;
    if (!memId) return;
    // Override hover to grabbing so it doesn't conflict with the rotate hover
    wrapper.style.cursor = 'grab';
    makeDraggable(wrapper, memId, 'photo');
  });
}
