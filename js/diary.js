/* ============================================================
   DIARY.JS — Core diary engine
   - Default spread data (6 spreads matching reference images)
   - Spread renderer (builds DOM from data)
   - State management
   - Edit mode toggling
   - Add page / delete element
   ============================================================ */

/* ════════════════════════════════════════════════════════════
   DEFAULT SPREAD DATA
   Mirrors the 6 two-page spreads from the reference images.
   Each spread has a left page and a right page.
   Each page has: date, title, text, list items, and elements
   (polaroids and note cards with position/rotation/size).
════════════════════════════════════════════════════════════ */
const DEFAULT_SPREADS = [
  /* ── SPREAD 1 ── 12 April / 18 April ── */
  {
    id: 'spread-1',
    left: {
      date: '12 April 2024',
      title: 'the little things',
      text: "It's funny how the smallest moments end up meaning the most.\n\nA song, a random text, the way you laugh at silly things, or just sitting in comfortable silence — these are the pieces I want to hold on to.\n\nSomeday, when we look back, I want you to know that you were my little things, and they were everything.",
      listItems: [],
      elements: [
        {
          id: 'el-1-1',
          type: 'polaroid',
          top: 12, left: 52,
          width: 130, height: 150,
          rotation: 3,
          imageSrc: '',
          caption: ''
        },
        {
          id: 'el-1-2',
          type: 'polaroid',
          top: 62, left: 4,
          width: 120, height: 140,
          rotation: -4,
          imageSrc: '',
          caption: ''
        }
      ]
    },
    right: {
      date: '18 April 2024',
      title: '',
      text: "Some days are just good for the soul.",
      listItems: [],
      elements: [
        {
          id: 'el-1-3',
          type: 'note',
          top: 30, left: 35,
          width: 160, height: 130,
          rotation: -3,
          color: 'white',
          noteTitle: 'Note to self',
          noteText: "You don't have to have it all figured out. You just have to keep showing up.",
          hasFlower: true
        }
      ]
    }
  },

  /* ── SPREAD 2 ── 25 April / 27 April ── */
  {
    id: 'spread-2',
    left: {
      date: '25 April 2024',
      title: 'A little reminder',
      text: '',
      listItems: [
        'You are enough.',
        'You are doing better than you think.',
        'You are so loved.',
        'And you matter.',
        'Always.'
      ],
      elements: []
    },
    right: {
      date: '27 April 2024',
      title: '',
      text: 'Collect beautiful moments...',
      listItems: [],
      elements: [
        {
          id: 'el-2-1',
          type: 'polaroid',
          top: 8, left: 15,
          width: 150, height: 170,
          rotation: 2,
          imageSrc: '',
          caption: ''
        }
      ]
    }
  },

  /* ── SPREAD 3 ── 30 April / 2 May ── */
  {
    id: 'spread-3',
    left: {
      date: '30 April 2024',
      title: "Today I'm grateful for:",
      text: '',
      listItems: [
        'Good food',
        'Warm hugs',
        'Kind people',
        'New beginnings',
        'You'
      ],
      elements: []
    },
    right: {
      date: '2 May 2024',
      title: '',
      text: "Not every day is meant to be perfect. Some days just need to be lived.",
      listItems: [],
      elements: [
        {
          id: 'el-3-1',
          type: 'note',
          top: 4, left: 20,
          width: 155, height: 120,
          rotation: 4,
          color: 'yellow',
          noteTitle: '',
          noteText: "Not every day is meant to be perfect. Some days just need to be lived.",
          hasFlower: false
        },
        {
          id: 'el-3-2',
          type: 'polaroid',
          top: 48, left: 10,
          width: 145, height: 165,
          rotation: -2,
          imageSrc: '',
          caption: ''
        }
      ]
    }
  },

  /* ── SPREAD 4 ── 5 May / 8 May ── */
  {
    id: 'spread-4',
    left: {
      date: '5 May 2024',
      title: '',
      text: "I hope you know how special you are. Not just today, but always.\n\nYou make the ordinary days feel extraordinary.",
      listItems: [],
      elements: []
    },
    right: {
      date: '8 May 2024',
      title: '',
      text: 'Still so much to be grateful for...',
      listItems: [],
      elements: [
        {
          id: 'el-4-1',
          type: 'polaroid',
          top: 10, left: 18,
          width: 140, height: 160,
          rotation: -3,
          imageSrc: '',
          caption: ''
        }
      ]
    }
  },

  /* ── SPREAD 5 ── 10 May / 12 May ── */
  {
    id: 'spread-5',
    left: {
      date: '10 May 2024',
      title: 'Little dreams:',
      text: '',
      listItems: [
        'Travel the world',
        'Build a life we love',
        'Keep growing together',
        'Create more memories',
        'Be happy, always'
      ],
      elements: []
    },
    right: {
      date: '12 May 2024',
      title: '',
      text: '',
      listItems: [],
      elements: [
        {
          id: 'el-5-1',
          type: 'note',
          top: 10, left: 15,
          width: 155, height: 130,
          rotation: 3,
          color: 'pink',
          noteTitle: '',
          noteText: "Thank you for being part of my story.",
          hasFlower: true
        }
      ]
    }
  },

  /* ── SPREAD 6 ── 22 April / 22 April ── */
  {
    id: 'spread-6',
    left: {
      date: '22 April 2024',
      title: 'Things I Love About you',
      text: '',
      listItems: [
        'Your smile',
        'The way you care',
        'How you make me laugh',
        'Your kind heart',
        'Just you, always'
      ],
      elements: []
    },
    right: {
      date: '22 April 2024',
      title: '',
      text: '',
      listItems: [],
      elements: [
        {
          id: 'el-6-1',
          type: 'note',
          top: 8, left: 20,
          width: 155, height: 115,
          rotation: -4,
          color: 'white',
          noteTitle: '',
          noteText: "Same sky\nDifferent places\nSame heart",
          hasFlower: false
        },
        {
          id: 'el-6-2',
          type: 'polaroid',
          top: 50, left: 10,
          width: 145, height: 165,
          rotation: 3,
          imageSrc: '',
          caption: ''
        }
      ]
    }
  }
];

/* ════════════════════════════════════════════════════════════
   DIARY STATE
════════════════════════════════════════════════════════════ */
const DiaryState = {
  spreads: [],
  currentIndex: 0,
  isEditMode: false,
  selectedElement: null,

  init() {
    // Try loading from localStorage first
    const saved = DiaryStorage.load();
    if (saved && saved.length > 0) {
      this.spreads = saved;
    } else {
      // Deep-clone defaults so mutations don't affect the original
      this.spreads = JSON.parse(JSON.stringify(DEFAULT_SPREADS));
    }
  },

  getCurrentSpread() {
    return this.spreads[this.currentIndex];
  },

  addSpread() {
    const id = 'spread-' + Date.now();
    const newSpread = {
      id,
      left: {
        date: formatDate(new Date()),
        title: '',
        text: '',
        listItems: [],
        elements: []
      },
      right: {
        date: formatDate(new Date()),
        title: '',
        text: '',
        listItems: [],
        elements: []
      }
    };
    this.spreads.push(newSpread);
    return this.spreads.length - 1;
  },

  save() {
    return DiaryStorage.save(this.spreads);
  }
};

/* ════════════════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════════════════ */
function formatDate(d) {
  const day   = d.getDate();
  const month = d.toLocaleString('en-GB', { month: 'long' });
  const year  = d.getFullYear();
  return `${day} ${month} ${year}`;
}

function generateId() {
  return 'el-' + Math.random().toString(36).slice(2, 9);
}

/* Corner flower sets — alternate per page to vary decoration */
const CORNER_SETS = [
  { tl: '✿', tr: '❀', bl: '✾', br: '✿' },
  { tl: '❀', tr: '✿', bl: '✿', br: '✾' },
  { tl: '✾', tr: '❀', bl: '✿', br: '❀' }
];

/* ════════════════════════════════════════════════════════════
   ELEMENT BUILDERS — create DOM nodes for each element type
════════════════════════════════════════════════════════════ */

function buildPolaroid(el, isEditMode) {
  const wrap = document.createElement('div');
  wrap.className = 'draggable-element polaroid';
  wrap.dataset.id = el.id;
  wrap.dataset.type = 'polaroid';
  wrap.style.cssText = `
    top: ${el.top}%;
    left: ${el.left}%;
    width: ${el.width}px;
    height: ${el.height}px;
    transform: rotate(${el.rotation}deg);
    --el-rotation: rotate(${el.rotation}deg);
  `;

  const photo = document.createElement('div');
  photo.className = 'polaroid__photo' + (el.imageSrc ? ' has-image' : '');
  if (el.imageSrc) {
    photo.style.backgroundImage = `url('${el.imageSrc}')`;
    photo.style.backgroundSize  = 'cover';
    photo.style.backgroundPosition = 'center';
    photo.style.backgroundImage = 'none';
    const img = document.createElement('img');
    img.src = el.imageSrc;
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
    photo.appendChild(img);
  }
  wrap.appendChild(photo);

  const caption = document.createElement('div');
  caption.className = 'polaroid__caption';
  caption.textContent = el.caption || '';
  caption.dataset.field = 'caption';
  if (isEditMode) caption.contentEditable = 'true';
  wrap.appendChild(caption);

  const uploadHint = document.createElement('div');
  uploadHint.className = 'polaroid__upload-hint';
  uploadHint.innerHTML = '📷<br><span>tap to add photo</span>';
  uploadHint.addEventListener('click', () => triggerPhotoUpload(wrap));
  wrap.appendChild(uploadHint);

  // Resize + rotate handles (shown when selected in edit mode)
  const resizeHandle = document.createElement('div');
  resizeHandle.className = 'resize-handle';
  wrap.appendChild(resizeHandle);

  const rotateHandle = document.createElement('div');
  rotateHandle.className = 'rotate-handle';
  rotateHandle.textContent = '↻';
  wrap.appendChild(rotateHandle);

  const rotBadge = document.createElement('div');
  rotBadge.className = 'rotation-badge';
  rotBadge.textContent = `${el.rotation}°`;
  wrap.appendChild(rotBadge);

  return wrap;
}

function buildNoteCard(el, isEditMode) {
  const wrap = document.createElement('div');
  wrap.className = `draggable-element note-card note-card--${el.color || 'white'}`;
  wrap.dataset.id = el.id;
  wrap.dataset.type = 'note';
  wrap.style.cssText = `
    top: ${el.top}%;
    left: ${el.left}%;
    width: ${el.width}px;
    transform: rotate(${el.rotation}deg);
    --el-rotation: rotate(${el.rotation}deg);
  `;

  if (el.noteTitle) {
    const title = document.createElement('div');
    title.className = 'note-card__title';
    title.textContent = el.noteTitle;
    title.dataset.field = 'noteTitle';
    if (isEditMode) title.contentEditable = 'true';
    wrap.appendChild(title);
  }

  const text = document.createElement('div');
  text.className = 'note-card__text';
  text.textContent = el.noteText || '';
  text.dataset.field = 'noteText';
  if (isEditMode) text.contentEditable = 'true';
  wrap.appendChild(text);

  const heart = document.createElement('span');
  heart.className = 'note-card__heart';
  heart.textContent = '♡';
  wrap.appendChild(heart);

  if (el.hasFlower) {
    const flower = document.createElement('span');
    flower.className = 'note-card__flower';
    flower.textContent = '✿';
    flower.setAttribute('aria-hidden', 'true');
    wrap.appendChild(flower);
  }

  const resizeHandle = document.createElement('div');
  resizeHandle.className = 'resize-handle';
  wrap.appendChild(resizeHandle);

  const rotateHandle = document.createElement('div');
  rotateHandle.className = 'rotate-handle';
  rotateHandle.textContent = '↻';
  wrap.appendChild(rotateHandle);

  const rotBadge = document.createElement('div');
  rotBadge.className = 'rotation-badge';
  rotBadge.textContent = `${el.rotation}°`;
  wrap.appendChild(rotBadge);

  return wrap;
}

/* ════════════════════════════════════════════════════════════
   PAGE BUILDER — renders one page (left or right)
════════════════════════════════════════════════════════════ */
function buildPage(pageData, side, spreadIndex, isEditMode) {
  const page = document.createElement('div');
  page.className = `page page--${side}`;
  page.dataset.side = side;
  page.dataset.spread = spreadIndex;

  // Alternate corner flower sets
  const corners = CORNER_SETS[spreadIndex % CORNER_SETS.length];
  ['tl','tr','bl','br'].forEach(pos => {
    const c = document.createElement('div');
    c.className = `page-corner page-corner--${pos}`;
    c.textContent = corners[pos];
    c.setAttribute('aria-hidden', 'true');
    page.appendChild(c);
  });

  const content = document.createElement('div');
  content.className = 'page-content';

  // Date
  const date = document.createElement('div');
  date.className = 'page-date';
  date.textContent = pageData.date || '';
  date.dataset.field = 'date';
  if (isEditMode) date.contentEditable = 'true';
  content.appendChild(date);

  // Heart under date
  const dateHeart = document.createElement('div');
  dateHeart.className = 'page-date-heart';
  dateHeart.textContent = '♡';
  dateHeart.setAttribute('aria-hidden', 'true');
  content.appendChild(dateHeart);

  // Title
  if (pageData.title || isEditMode) {
    const title = document.createElement('div');
    title.className = 'page-title';
    title.textContent = pageData.title || '';
    title.dataset.field = 'title';
    if (isEditMode) title.contentEditable = 'true';
    content.appendChild(title);
  }

  // Body text
  if (pageData.text || isEditMode) {
    const text = document.createElement('div');
    text.className = 'page-text';
    text.textContent = pageData.text || '';
    text.dataset.field = 'text';
    if (isEditMode) text.contentEditable = 'true';
    content.appendChild(text);
  }

  // List items
  if (pageData.listItems && pageData.listItems.length > 0) {
    const ul = document.createElement('ul');
    ul.className = 'page-list';
    ul.dataset.field = 'listItems';
    pageData.listItems.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      if (isEditMode) li.contentEditable = 'true';
      ul.appendChild(li);
    });
    content.appendChild(ul);
  }

  // Heart divider at bottom of text content
  const heartDiv = document.createElement('span');
  heartDiv.className = 'page-heart';
  heartDiv.textContent = '♡';
  heartDiv.setAttribute('aria-hidden', 'true');
  content.appendChild(heartDiv);

  page.appendChild(content);

  // Draggable elements (polaroids, note cards)
  if (pageData.elements) {
    pageData.elements.forEach(el => {
      let node;
      if (el.type === 'polaroid') {
        node = buildPolaroid(el, isEditMode);
      } else if (el.type === 'note') {
        node = buildNoteCard(el, isEditMode);
      }
      if (node) {
        page.appendChild(node);
        if (isEditMode) {
          DiaryEditor.attachElementListeners(node);
        }
      }
    });
  }

  return page;
}

/* ════════════════════════════════════════════════════════════
   SPREAD BUILDER — builds one full two-page spread DOM node
════════════════════════════════════════════════════════════ */
function buildSpread(spreadData, index, isActive, isEditMode) {
  const spread = document.createElement('div');
  spread.className = 'spread' + (isActive ? ' active' : '');
  spread.dataset.spreadId  = spreadData.id;
  spread.dataset.spreadIndex = index;

  const leftPage  = buildPage(spreadData.left,  'left',  index, isEditMode);
  const rightPage = buildPage(spreadData.right, 'right', index, isEditMode);

  spread.appendChild(leftPage);
  spread.appendChild(rightPage);
  return spread;
}

/* ════════════════════════════════════════════════════════════
   RENDER — renders all spreads into the DOM
════════════════════════════════════════════════════════════ */
function renderAll() {
  const stack = document.getElementById('pageStack');
  if (!stack) return;
  stack.innerHTML = '';

  DiaryState.spreads.forEach((spreadData, i) => {
    const isActive = i === DiaryState.currentIndex;
    const spread   = buildSpread(spreadData, i, isActive, DiaryState.isEditMode);
    stack.appendChild(spread);
  });

  updateCounter();
  updateNavButtons();
}

/* Re-render only the current spread (faster, used after edits) */
function renderCurrentSpread() {
  const stack = document.getElementById('pageStack');
  if (!stack) return;

  const existing = stack.querySelector(`.spread[data-spread-index="${DiaryState.currentIndex}"]`);
  const spreadData = DiaryState.getCurrentSpread();
  const newSpread  = buildSpread(spreadData, DiaryState.currentIndex, true, DiaryState.isEditMode);

  if (existing) {
    stack.replaceChild(newSpread, existing);
  } else {
    stack.appendChild(newSpread);
  }
}

/* ════════════════════════════════════════════════════════════
   COUNTER + NAV STATE
════════════════════════════════════════════════════════════ */
function updateCounter() {
  const cur   = document.getElementById('currentSpreadNum');
  const total = document.getElementById('totalSpreadNum');
  if (cur)   cur.textContent   = DiaryState.currentIndex + 1;
  if (total) total.textContent = DiaryState.spreads.length;
}

function updateNavButtons() {
  const prev = document.getElementById('prevBtn');
  const next = document.getElementById('nextBtn');
  if (prev) prev.disabled = DiaryState.currentIndex === 0;
  if (next) next.disabled = DiaryState.currentIndex === DiaryState.spreads.length - 1;
}

/* ════════════════════════════════════════════════════════════
   SNAPSHOT — read current page content back from DOM into state
   Called before navigating away or saving
════════════════════════════════════════════════════════════ */
function snapshotCurrentSpread() {
  const stack = document.getElementById('pageStack');
  if (!stack) return;

  const spreadEl = stack.querySelector(`.spread[data-spread-index="${DiaryState.currentIndex}"]`);
  if (!spreadEl) return;

  const spread = DiaryState.getCurrentSpread();

  ['left','right'].forEach(side => {
    const pageEl  = spreadEl.querySelector(`.page--${side}`);
    const pageData = spread[side];
    if (!pageEl || !pageData) return;

    const content = pageEl.querySelector('.page-content');
    if (!content) return;

    // Text fields
    const dateEl  = content.querySelector('.page-date');
    const titleEl = content.querySelector('.page-title');
    const textEl  = content.querySelector('.page-text');
    const listEl  = content.querySelector('.page-list');

    if (dateEl)  pageData.date  = dateEl.textContent.trim();
    if (titleEl) pageData.title = titleEl.textContent.trim();
    if (textEl)  pageData.text  = textEl.textContent.trim();
    if (listEl) {
      pageData.listItems = Array.from(listEl.querySelectorAll('li'))
        .map(li => li.textContent.trim())
        .filter(t => t.length > 0);
    }

    // Draggable elements — read position/rotation back
    const elements = pageEl.querySelectorAll('.draggable-element');
    elements.forEach(elNode => {
      const elId   = elNode.dataset.id;
      const elData = pageData.elements.find(e => e.id === elId);
      if (!elData) return;

      // Position is stored as % in style.top/left
      const topPct  = parseFloat(elNode.style.top)  || 0;
      const leftPct = parseFloat(elNode.style.left) || 0;
      elData.top  = topPct;
      elData.left = leftPct;

      // Size
      if (elNode.style.width)  elData.width  = parseInt(elNode.style.width);
      if (elNode.style.height) elData.height = parseInt(elNode.style.height);

      // Rotation (extract from transform)
      const rotate = elNode.style.transform.match(/rotate\(([^)]+)deg\)/);
      if (rotate) elData.rotation = parseFloat(rotate[1]);

      // Text content
      if (elData.type === 'note') {
        const titleNode = elNode.querySelector('.note-card__title');
        const textNode  = elNode.querySelector('.note-card__text');
        if (titleNode) elData.noteTitle = titleNode.textContent.trim();
        if (textNode)  elData.noteText  = textNode.textContent.trim();
      }
      if (elData.type === 'polaroid') {
        const capNode = elNode.querySelector('.polaroid__caption');
        if (capNode) elData.caption = capNode.textContent.trim();
        const imgEl = elNode.querySelector('img');
        if (imgEl) elData.imageSrc = imgEl.src;
      }
    });
  });
}

/* ════════════════════════════════════════════════════════════
   PHOTO UPLOAD — triggered from upload hint in polaroid
════════════════════════════════════════════════════════════ */
function triggerPhotoUpload(polaroidNode) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target.result;
      // Store in state
      const elId   = polaroidNode.dataset.id;
      const spread = DiaryState.getCurrentSpread();
      ['left','right'].forEach(side => {
        const el = spread[side].elements.find(e => e.id === elId);
        if (el) el.imageSrc = src;
      });
      // Update DOM
      let photo = polaroidNode.querySelector('.polaroid__photo');
      if (!photo) {
        photo = document.createElement('div');
        photo.className = 'polaroid__photo';
        polaroidNode.insertBefore(photo, polaroidNode.firstChild);
      }
      photo.innerHTML = '';
      const img = document.createElement('img');
      img.src = src;
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
      photo.appendChild(img);
      photo.classList.add('has-image');
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

/* ════════════════════════════════════════════════════════════
   EDIT MODE TOGGLE
════════════════════════════════════════════════════════════ */
function setEditMode(active) {
  DiaryState.isEditMode = active;

  const scene   = document.getElementById('diaryScene');
  const editBtn = document.getElementById('editToggleBtn');
  const saveBtn = document.getElementById('saveBtn');
  const addBtn  = document.getElementById('addPageBtn');
  const palette = document.getElementById('addPalette');

  document.body.classList.toggle('edit-mode-active', active);
  if (scene) scene.classList.toggle('edit-mode', active);
  if (editBtn) editBtn.classList.toggle('active', active);
  if (saveBtn) saveBtn.style.display = active ? 'flex' : 'none';
  if (addBtn)  addBtn.style.display  = active ? 'flex' : 'none';
  if (palette) palette.style.display = active ? 'flex' : 'none';

  // Re-render current spread with/without edit affordances
  renderCurrentSpread();

  if (active) {
    DiaryEditor.activate();
  } else {
    DiaryEditor.deactivate();
  }
}

/* ════════════════════════════════════════════════════════════
   ADD NEW ELEMENT to current spread
════════════════════════════════════════════════════════════ */
function addElementToCurrentPage(type, side) {
  side = side || 'right'; // default to right page
  const spread = DiaryState.getCurrentSpread();
  const page   = spread[side];

  const newEl = {
    id: generateId(),
    type,
    top:      10,
    left:     20,
    width:    type === 'polaroid' ? 140 : 155,
    height:   type === 'polaroid' ? 160 : 120,
    rotation: Math.round((Math.random() * 8) - 4), // -4 to +4 degrees
    ...(type === 'polaroid' ? { imageSrc: '', caption: '' } : {}),
    ...(type === 'note' ? {
      color: ['white','yellow','pink'][Math.floor(Math.random()*3)],
      noteTitle: 'Note to self',
      noteText: '',
      hasFlower: Math.random() > 0.5
    } : {})
  };

  page.elements.push(newEl);
  renderCurrentSpread();
  DiaryEditor.activate();
}

/* ════════════════════════════════════════════════════════════
   REMOVE ELEMENT from current spread
════════════════════════════════════════════════════════════ */
function removeElement(elId) {
  const spread = DiaryState.getCurrentSpread();
  ['left','right'].forEach(side => {
    spread[side].elements = spread[side].elements.filter(e => e.id !== elId);
  });
  renderCurrentSpread();
  DiaryEditor.activate();
  hideElementToolbar();
}

/* ════════════════════════════════════════════════════════════
   ELEMENT TOOLBAR show/hide
════════════════════════════════════════════════════════════ */
function showElementToolbar(elNode) {
  const tb    = document.getElementById('elementToolbar');
  const scene = document.getElementById('diaryScene');
  if (!tb || !scene) return;

  const elRect    = elNode.getBoundingClientRect();
  const sceneRect = scene.getBoundingClientRect();

  // Position the toolbar just above the selected element,
  // using coordinates relative to .diary-scene (position:relative)
  const topPx  = elRect.top  - sceneRect.top  - 46;
  const leftPx = elRect.left - sceneRect.left;

  // Clamp so it never goes off the top or left edge
  const clampedTop  = Math.max(4,  topPx);
  const clampedLeft = Math.max(4,  Math.min(leftPx, sceneRect.width - 180));

  tb.style.top     = clampedTop  + 'px';
  tb.style.left    = clampedLeft + 'px';
  tb.style.display = 'flex';
  tb.dataset.targetId = elNode.dataset.id;
}

function hideElementToolbar() {
  const tb = document.getElementById('elementToolbar');
  if (tb) { tb.style.display = 'none'; tb.dataset.targetId = ''; }
  DiaryState.selectedElement = null;
}

/* ════════════════════════════════════════════════════════════
   ROTATE ELEMENT (from toolbar buttons)
════════════════════════════════════════════════════════════ */
function rotateSelectedElement(direction) {
  const tb  = document.getElementById('elementToolbar');
  if (!tb) return;
  const elId   = tb.dataset.targetId;
  if (!elId) return;

  const elNode = document.querySelector(`.draggable-element[data-id="${elId}"]`);
  if (!elNode) return;

  const currentMatch = elNode.style.transform.match(/rotate\(([^)]+)deg\)/);
  const current = currentMatch ? parseFloat(currentMatch[1]) : 0;
  const newRot  = current + (direction === 'left' ? -5 : 5);

  elNode.style.transform = `rotate(${newRot}deg)`;

  // Update rotation badge
  const badge = elNode.querySelector('.rotation-badge');
  if (badge) badge.textContent = `${Math.round(newRot)}°`;

  // Update state
  const spread = DiaryState.getCurrentSpread();
  ['left','right'].forEach(side => {
    const el = spread[side].elements.find(e => e.id === elId);
    if (el) el.rotation = newRot;
  });
}

/* ════════════════════════════════════════════════════════════
   INIT — called on DOMContentLoaded
════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  DiaryState.init();
  renderAll();

  /* ── Navigation buttons ── */
  document.getElementById('prevBtn')?.addEventListener('click', () => {
    PageTurner.goBack();
  });
  document.getElementById('nextBtn')?.addEventListener('click', () => {
    PageTurner.goForward();
  });

  /* ── Keyboard navigation ── */
  document.addEventListener('keydown', (e) => {
    if (e.target && e.target.isContentEditable) return; // don't intercept typing
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      PageTurner.goForward();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      PageTurner.goBack();
    } else if (e.key === 'Escape') {
      if (DiaryState.isEditMode) setEditMode(false);
    }
  });

  /* ── Edit mode toggle ── */
  document.getElementById('editToggleBtn')?.addEventListener('click', () => {
    setEditMode(!DiaryState.isEditMode);
  });

  /* ── Save button ── */
  document.getElementById('saveBtn')?.addEventListener('click', () => {
    snapshotCurrentSpread();
    const ok = DiaryState.save();
    const toast = document.getElementById('saveToast');
    if (toast) {
      toast.textContent = ok ? 'Diary saved ♡' : 'Storage full — try exporting instead';
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2800);
    }
  });

  /* ── Add page button ── */
  document.getElementById('addPageBtn')?.addEventListener('click', () => {
    snapshotCurrentSpread();
    const newIndex = DiaryState.addSpread();
    DiaryState.currentIndex = newIndex;
    renderAll();
    setEditMode(true);
  });

  /* ── Add palette buttons ── */
  document.getElementById('addPhotoBtn')?.addEventListener('click', () => {
    addElementToCurrentPage('polaroid', 'right');
  });
  document.getElementById('addNoteBtn')?.addEventListener('click', () => {
    addElementToCurrentPage('note', 'right');
  });
  document.getElementById('addTextBtn')?.addEventListener('click', () => {
    addElementToCurrentPage('note', 'left');
  });

  /* ── Element toolbar actions ── */
  document.getElementById('elRotateLeft')?.addEventListener('click',  () => rotateSelectedElement('left'));
  document.getElementById('elRotateRight')?.addEventListener('click', () => rotateSelectedElement('right'));
  document.getElementById('elDelete')?.addEventListener('click', () => {
    const tb = document.getElementById('elementToolbar');
    if (tb?.dataset.targetId) removeElement(tb.dataset.targetId);
  });
  document.getElementById('elDone')?.addEventListener('click', () => {
    const stack = document.getElementById('pageStack');
    stack?.querySelectorAll('.draggable-element.is-selected')
      .forEach(el => el.classList.remove('is-selected'));
    hideElementToolbar();
  });

  // Deselect on clicking the scene background
  document.getElementById('diaryScene')?.addEventListener('click', (e) => {
    if (!e.target.closest('.draggable-element') && !e.target.closest('.element-toolbar')) {
      document.querySelectorAll('.draggable-element.is-selected')
        .forEach(el => el.classList.remove('is-selected'));
      hideElementToolbar();
    }
  });
});
