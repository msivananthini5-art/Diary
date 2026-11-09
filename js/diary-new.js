/* ============================================================
   DIARY-NEW.JS  —  SABI Living Diary
   Your spread.jpg is the background. This script manages
   the text/photo content overlaid on top of it.
   ============================================================ */

/* ── Default content for all 6 spreads ── */
const DEFAULT_SPREADS = [
  {
    id: 's1',
    left:  {
      date: '12 April 2024', title: 'the little things',
      body: "It's funny how the smallest moments end up meaning the most.\n\nA song, a random text, the way you laugh at silly things, or just sitting in comfortable silence — these are the pieces I want to hold on to.\n\nSomeday, when we look back, I want you to know that you were my little things, and they were everything.",
      list: [], elements: [
        { id:'e1a', type:'polaroid', top:8,  left:52, w:128, h:146, rot:3,  src:'', caption:'' },
        { id:'e1b', type:'polaroid', top:60, left:2,  w:116, h:136, rot:-4, src:'', caption:'' }
      ]
    },
    right: {
      date: '18 April 2024', title: '',
      body: 'Some days are just good for the soul.',
      list: [], elements: [
        { id:'e1c', type:'note', top:26, left:28, w:156, h:126, rot:-3, color:'white', noteTitle:'Note to self', noteText:"You don't have to have it all figured out. You just have to keep showing up.", flower:true }
      ]
    }
  },
  {
    id: 's2',
    left:  {
      date: '25 April 2024', title: 'A little reminder',
      body: '', list: ['You are enough.','You are doing better than you think.','You are so loved.','And you matter.','Always.'],
      elements: []
    },
    right: {
      date: '27 April 2024', title: '',
      body: 'Collect beautiful moments...', list: [],
      elements: [{ id:'e2a', type:'polaroid', top:6, left:12, w:146, h:166, rot:2, src:'', caption:'' }]
    }
  },
  {
    id: 's3',
    left:  {
      date: '30 April 2024', title: "Today I'm grateful for:",
      body: '', list: ['Good food','Warm hugs','Kind people','New beginnings','You'],
      elements: []
    },
    right: {
      date: '2 May 2024', title: '', body: '', list: [],
      elements: [
        { id:'e3a', type:'note',    top:4,  left:18, w:156, h:116, rot:4,  color:'yellow', noteTitle:'', noteText:"Not every day is meant to be perfect. Some days just need to be lived.", flower:false },
        { id:'e3b', type:'polaroid',top:46, left:8,  w:140, h:160, rot:-2, src:'', caption:'' }
      ]
    }
  },
  {
    id: 's4',
    left:  {
      date: '5 May 2024', title: '',
      body: "I hope you know how special you are. Not just today, but always.\n\nYou make the ordinary days feel extraordinary.",
      list: [], elements: []
    },
    right: {
      date: '8 May 2024', title: '',
      body: 'Still so much to be grateful for...', list: [],
      elements: [{ id:'e4a', type:'polaroid', top:8, left:16, w:138, h:158, rot:-3, src:'', caption:'' }]
    }
  },
  {
    id: 's5',
    left:  {
      date: '10 May 2024', title: 'Little dreams:',
      body: '', list: ['Travel the world','Build a life we love','Keep growing together','Create more memories','Be happy, always'],
      elements: []
    },
    right: {
      date: '12 May 2024', title: '', body: '', list: [],
      elements: [{ id:'e5a', type:'note', top:10, left:14, w:154, h:126, rot:3, color:'pink', noteTitle:'', noteText:"Thank you for being part of my story.", flower:true }]
    }
  },
  {
    id: 's6',
    left:  {
      date: '22 April 2024', title: 'Things I Love About you',
      body: '', list: ['Your smile','The way you care','How you make me laugh','Your kind heart','Just you, always'],
      elements: []
    },
    right: {
      date: '22 April 2024', title: '', body: '', list: [],
      elements: [
        { id:'e6a', type:'note',    top:6,  left:18, w:154, h:110, rot:-4, color:'white', noteTitle:'', noteText:"Same sky\nDifferent places\nSame heart", flower:false },
        { id:'e6b', type:'polaroid',top:48, left:8,  w:140, h:160, rot:3,  src:'', caption:'' }
      ]
    }
  }
];

/* ── State ── */
const State = {
  spreads:  [],
  idx:      0,
  editMode: false,
  selEl:    null,
  turning:  false,

  init() {
    const saved = DiaryStorage.load();
    this.spreads = (saved && saved.length) ? saved : JSON.parse(JSON.stringify(DEFAULT_SPREADS));
  },
  cur()  { return this.spreads[this.idx]; },
  save() { return DiaryStorage.save(this.spreads); }
};

/* ── Tiny helpers ── */
const $ = id => document.getElementById(id);
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function genId() { return 'el' + Date.now().toString(36); }
function getXY(e) {
  const t = e.touches?.[0] || e.changedTouches?.[0];
  return t ? { x: t.clientX, y: t.clientY } : { x: e.clientX, y: e.clientY };
}

/* ══════════════════════════════════════════════════
   RENDER — paints both pages of the current spread
══════════════════════════════════════════════════ */
function render() {
  const s = State.cur();

  // ── Left page text ──
  $('leftDate').textContent  = s.left.date  || '';
  $('leftTitle').textContent = s.left.title || '';
  $('leftBody').textContent  = s.left.body  || '';
  fillList($('leftList'), s.left.list);

  // ── Right page text ──
  $('rightDate').textContent  = s.right.date  || '';
  $('rightTitle').textContent = s.right.title || '';
  $('rightBody').textContent  = s.right.body  || '';
  fillList($('rightList'), s.right.list);

  // ── Draggable elements ──
  paintElements('left',  s.left.elements);
  paintElements('right', s.right.elements);

  // ── Nav / counter ──
  $('prevBtn').disabled = State.idx === 0;
  $('nextBtn').disabled = State.idx === State.spreads.length - 1;
  $('curPage').textContent = State.idx + 1;
  $('totPage').textContent = State.spreads.length;

  // ── Edit affordances ──
  applyEditAffordances();
}

function fillList(ul, items) {
  ul.innerHTML = '';
  (items || []).forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    ul.appendChild(li);
  });
}

/* ── Build and inject draggable elements into a page ── */
function paintElements(side, elements) {
  const pageEl = $(side === 'left' ? 'leftPage' : 'rightPage');
  // Remove old ones
  pageEl.querySelectorAll('.d-el').forEach(n => n.remove());
  // Add new ones
  (elements || []).forEach(elData => {
    const node = buildNode(elData);
    pageEl.appendChild(node);
  });
}

/* ── Build one draggable element DOM node ── */
function buildNode(el) {
  const wrap = document.createElement('div');
  wrap.className = 'd-el ' + el.type + (el.color ? ' ' + el.type + '--' + el.color : '');
  wrap.dataset.id   = el.id;
  wrap.dataset.type = el.type;
  wrap.style.position  = 'absolute';
  wrap.style.top       = el.top  + '%';
  wrap.style.left      = el.left + '%';
  wrap.style.width     = el.w    + 'px';
  wrap.style.transform = 'rotate(' + el.rot + 'deg)';
  if (el.type === 'polaroid') wrap.style.height = el.h + 'px';

  if (el.type === 'polaroid') {
    const img = document.createElement('img');
    img.className = 'polaroid__img' + (el.src ? ' has-src' : '');
    img.style.cssText = 'width:100%;aspect-ratio:1/1;object-fit:cover;display:block;';
    if (el.src) { img.src = el.src; }
    else { img.style.background = 'linear-gradient(135deg,#d4a76a,#a06830)'; }
    wrap.appendChild(img);

    const cap = document.createElement('div');
    cap.className = 'polaroid__caption';
    cap.dataset.field = 'caption';
    cap.textContent = el.caption || '';
    wrap.appendChild(cap);

    const hint = document.createElement('div');
    hint.className = 'polaroid__hint';
    hint.innerHTML = '📷<br><span>tap to add photo</span>';
    hint.addEventListener('click', () => pickPhoto(wrap));
    wrap.appendChild(hint);

  } else if (el.type === 'note') {
    if (el.noteTitle) {
      const t = document.createElement('div');
      t.className = 'note-card__title';
      t.dataset.field = 'noteTitle';
      t.textContent = el.noteTitle;
      wrap.appendChild(t);
    }
    const tx = document.createElement('div');
    tx.className = 'note-card__text';
    tx.dataset.field = 'noteText';
    tx.textContent = el.noteText || '';
    wrap.appendChild(tx);

    const h = document.createElement('span');
    h.className = 'note-card__heart';
    h.textContent = '♡';
    wrap.appendChild(h);

    if (el.flower) {
      const f = document.createElement('span');
      f.style.cssText = 'position:absolute;bottom:7px;right:9px;font-size:1.1rem;opacity:0.5;pointer-events:none;';
      f.textContent = '✿';
      wrap.appendChild(f);
    }
  }

  // Drag/resize/rotate handles (always in DOM, shown only in edit mode via CSS)
  const rz = document.createElement('div'); rz.className = 'rz-handle'; wrap.appendChild(rz);
  const ro = document.createElement('div'); ro.className = 'rot-handle'; ro.textContent = '↻'; wrap.appendChild(ro);

  return wrap;
}

/* ══════════════════════════════════════════════════
   EDIT MODE
══════════════════════════════════════════════════ */
function applyEditAffordances() {
  const on = State.editMode;

  // Scene class drives CSS
  $('diaryScene').classList.toggle('edit-mode', on);

  // Text field editability
  ['leftDate','leftTitle','leftBody','rightDate','rightTitle','rightBody'].forEach(id => {
    const el = $(id);
    if (el) el.contentEditable = on ? 'true' : 'false';
  });

  // List items
  document.querySelectorAll('#leftList li, #rightList li').forEach(li => {
    li.contentEditable = on ? 'true' : 'false';
  });

  // Element fields + drag listeners
  document.querySelectorAll('.d-el').forEach(node => {
    node.querySelectorAll('[data-field]').forEach(f => {
      f.contentEditable = on ? 'true' : 'false';
    });
    if (on) attachInteraction(node);
  });
}

function setEditMode(on) {
  if (!on) {
    snapshotBothPages();
    deselect();
  }
  State.editMode = on;

  $('editBtn').classList.toggle('active', on);
  $('saveBtn').style.display    = on ? 'flex' : 'none';
  $('addPageBtn').style.display = on ? 'flex' : 'none';
  $('addPalette').style.display = on ? 'flex' : 'none';

  render();
}

/* ══════════════════════════════════════════════════
   SNAPSHOT — read DOM text back into State
══════════════════════════════════════════════════ */
function snapshotBothPages() {
  snapshotSide('left');
  snapshotSide('right');
}

function snapshotSide(side) {
  const data = State.cur()[side];
  const p    = side; // prefix

  const dateEl  = $(p + 'Date');
  const titleEl = $(p + 'Title');
  const bodyEl  = $(p + 'Body');
  const listEl  = $(p + 'List');

  if (dateEl)  data.date  = dateEl.textContent.trim();
  if (titleEl) data.title = titleEl.textContent.trim();
  if (bodyEl)  data.body  = bodyEl.textContent.trim();
  if (listEl)  data.list  = Array.from(listEl.querySelectorAll('li'))
                              .map(li => li.textContent.trim()).filter(Boolean);

  // Elements
  const pageEl = $(side === 'left' ? 'leftPage' : 'rightPage');
  if (!pageEl) return;
  pageEl.querySelectorAll('.d-el').forEach(node => {
    const elData = data.elements.find(e => e.id === node.dataset.id);
    if (!elData) return;
    elData.top  = parseFloat(node.style.top)  || 0;
    elData.left = parseFloat(node.style.left) || 0;
    if (node.style.width)  elData.w = parseInt(node.style.width);
    if (node.style.height) elData.h = parseInt(node.style.height);
    const rm = node.style.transform.match(/rotate\(([^)]+)deg\)/);
    if (rm) elData.rot = parseFloat(rm[1]);

    const tNode  = node.querySelector('[data-field="noteTitle"]');
    const txNode = node.querySelector('[data-field="noteText"]');
    const capNode= node.querySelector('[data-field="caption"]');
    const imgNode= node.querySelector('img');
    if (tNode)  elData.noteTitle = tNode.textContent.trim();
    if (txNode) elData.noteText  = txNode.textContent.trim();
    if (capNode) elData.caption  = capNode.textContent.trim();
    if (imgNode && imgNode.src && !imgNode.src.endsWith(window.location.href))
      elData.src = imgNode.src;
  });
}

/* ══════════════════════════════════════════════════
   PAGE TURN
══════════════════════════════════════════════════ */
function turnPage(dir) {
  if (State.turning) return;
  const toIdx = State.idx + (dir === 'fwd' ? 1 : -1);
  if (toIdx < 0 || toIdx >= State.spreads.length) return;

  snapshotBothPages();
  State.turning = true;

  const overlay = $('diaryOverlay');
  const flap    = $('turnFlap');
  const front   = $('turnFront');
  const back    = $('turnBack');

  // Stamp a screenshot of the bg photo onto each face
  // Front: the page side being turned away (right for fwd, left for bck)
  // Back:  the opposite face (back of the paper)
  function makePhotoClone(positionHint) {
    const img = document.createElement('img');
    img.src = 'assets/images/spread.jpg';
    img.style.cssText = [
      'position:absolute;inset:0;',
      'width:200%;height:100%;',           // 2x width so we can show just one half
      'object-fit:cover;',
      positionHint === 'right'
        ? 'left:-100%;'                    // shift to show right half
        : 'left:0;',                       // show left half
      'pointer-events:none;'
    ].join('');
    return img;
  }

  front.innerHTML = '';
  back.innerHTML  = '';
  front.appendChild(makePhotoClone(dir === 'fwd' ? 'right' : 'left'));
  back.appendChild(makePhotoClone( dir === 'fwd' ? 'left'  : 'right'));

  // Position and animate the flap
  if (dir === 'fwd') {
    flap.style.left   = '50%';
    flap.style.right  = 'auto';
    flap.style.transformOrigin = 'left center';
  } else {
    flap.style.right  = '50%';
    flap.style.left   = 'auto';
    flap.style.transformOrigin = 'right center';
  }

  flap.style.opacity = '1';
  // Remove old animation classes, force reflow, then add new one
  flap.classList.remove('flip-forward', 'flip-backward');
  void flap.offsetWidth; // reflow
  flap.classList.add(dir === 'fwd' ? 'flip-forward' : 'flip-backward');

  // At halfway — swap content (content crossfades)
  const halfway = setTimeout(() => {
    State.idx = toIdx;
    overlay.classList.add('fading');
    render();
    setTimeout(() => overlay.classList.remove('fading'), 320);
  }, 325);

  // After animation — clean up
  const cleanup = setTimeout(() => {
    flap.classList.remove('flip-forward', 'flip-backward');
    flap.style.opacity = '0';
    front.innerHTML = '';
    back.innerHTML  = '';
    State.turning = false;
  }, 720);
}

/* ══════════════════════════════════════════════════
   DRAG / RESIZE / ROTATE
══════════════════════════════════════════════════ */
function attachInteraction(node) {
  if (node._hasInteraction) return;
  node._hasInteraction = true;

  // Main pointer drag
  node.addEventListener('pointerdown', e => {
    if (e.target.classList.contains('rz-handle'))    return;
    if (e.target.classList.contains('rot-handle'))   return;
    if (e.target.classList.contains('polaroid__hint')) return;
    if (e.target.closest('[contenteditable="true"]')) return;
    if (!State.editMode) return;
    e.preventDefault();
    selectEl(node);
    dragEl(e, node);
  });

  // Resize
  const rzH = node.querySelector('.rz-handle');
  if (rzH) rzH.addEventListener('pointerdown', e => {
    e.preventDefault(); e.stopPropagation();
    if (!State.editMode) return;
    selectEl(node);
    resizeEl(e, node);
  });

  // Rotate
  const roH = node.querySelector('.rot-handle');
  if (roH) roH.addEventListener('pointerdown', e => {
    e.preventDefault(); e.stopPropagation();
    if (!State.editMode) return;
    selectEl(node);
    rotateEl(e, node);
  });

  // Double-click to upload photo
  if (node.dataset.type === 'polaroid') {
    node.addEventListener('dblclick', () => { if (State.editMode) pickPhoto(node); });
  }
}

function dragEl(e, node) {
  const pageEl = node.closest('.page-area');
  if (!pageEl) return;
  const pr = pageEl.getBoundingClientRect();
  const p0 = getXY(e);
  const l0 = parseFloat(node.style.left) || 0;
  const t0 = parseFloat(node.style.top)  || 0;

  const onMove = ev => {
    const p = getXY(ev);
    node.style.left = clamp(l0 + (p.x - p0.x) / pr.width  * 100, -5, 88) + '%';
    node.style.top  = clamp(t0 + (p.y - p0.y) / pr.height * 100, -3, 88) + '%';
    repositionElToolbar(node);
  };
  const onUp = () => {
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerup',   onUp);
    patchElState(node);
  };
  document.addEventListener('pointermove', onMove);
  document.addEventListener('pointerup',   onUp);
}

function resizeEl(e, node) {
  const p0 = getXY(e);
  const w0 = parseInt(node.style.width)  || node.offsetWidth;
  const h0 = parseInt(node.style.height) || node.offsetHeight;

  const onMove = ev => {
    const p = getXY(ev);
    node.style.width  = clamp(w0 + (p.x - p0.x), 70,  300) + 'px';
    node.style.height = clamp(h0 + (p.y - p0.y), 55,  300) + 'px';
  };
  const onUp = () => {
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerup',   onUp);
    patchElState(node);
  };
  document.addEventListener('pointermove', onMove);
  document.addEventListener('pointerup',   onUp);
}

function rotateEl(e, node) {
  const getBounds = () => node.getBoundingClientRect();
  const p0  = getXY(e);
  const b0  = getBounds();
  const cx0 = b0.left + b0.width  / 2;
  const cy0 = b0.top  + b0.height / 2;
  const a0  = Math.atan2(p0.y - cy0, p0.x - cx0) * 180 / Math.PI;
  const rm  = node.style.transform.match(/rotate\(([^)]+)deg\)/);
  const r0  = rm ? parseFloat(rm[1]) : 0;

  const onMove = ev => {
    const p  = getXY(ev);
    const b  = getBounds();
    const cx = b.left + b.width  / 2;
    const cy = b.top  + b.height / 2;
    const a  = Math.atan2(p.y - cy, p.x - cx) * 180 / Math.PI;
    node.style.transform = `rotate(${Math.round((r0 + a - a0) * 10) / 10}deg)`;
  };
  const onUp = () => {
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerup',   onUp);
    patchElState(node);
  };
  document.addEventListener('pointermove', onMove);
  document.addEventListener('pointerup',   onUp);
}

function patchElState(node) {
  const side = node.closest('#leftPage') ? 'left' : 'right';
  const el   = State.cur()[side].elements.find(e => e.id === node.dataset.id);
  if (!el) return;
  el.top  = parseFloat(node.style.top)  || 0;
  el.left = parseFloat(node.style.left) || 0;
  if (node.style.width)  el.w = parseInt(node.style.width);
  if (node.style.height) el.h = parseInt(node.style.height);
  const rm = node.style.transform.match(/rotate\(([^)]+)deg\)/);
  if (rm) el.rot = parseFloat(rm[1]);
}

/* ══════════════════════════════════════════════════
   SELECTION
══════════════════════════════════════════════════ */
function selectEl(node) {
  document.querySelectorAll('.d-el.selected').forEach(n => { if(n !== node) n.classList.remove('selected'); });
  node.classList.add('selected');
  State.selEl = node;
  $('elToolbar').style.display = 'flex';
  repositionElToolbar(node);
}

function deselect() {
  document.querySelectorAll('.d-el.selected').forEach(n => n.classList.remove('selected'));
  State.selEl = null;
  $('elToolbar').style.display = 'none';
}

function repositionElToolbar(node) {
  const tb = $('elToolbar');
  const sc = $('diaryScene');
  if (!tb || !sc) return;
  const er = node.getBoundingClientRect();
  const sr = sc.getBoundingClientRect();
  tb.style.top  = Math.max(4, er.top - sr.top - 44) + 'px';
  tb.style.left = Math.max(4, Math.min(er.left - sr.left, sr.width - 190)) + 'px';
  tb.dataset.targetId = node.dataset.id;
}

/* ══════════════════════════════════════════════════
   ROTATE SELECTED (toolbar buttons)
══════════════════════════════════════════════════ */
function rotateSelected(dir) {
  const node = State.selEl;
  if (!node) return;
  const rm  = node.style.transform.match(/rotate\(([^)]+)deg\)/);
  const cur = rm ? parseFloat(rm[1]) : 0;
  node.style.transform = `rotate(${cur + (dir === 'L' ? -5 : 5)}deg)`;
  patchElState(node);
}

/* ══════════════════════════════════════════════════
   DELETE SELECTED
══════════════════════════════════════════════════ */
function deleteEl(id) {
  const spread = State.cur();
  ['left','right'].forEach(side => {
    spread[side].elements = spread[side].elements.filter(e => e.id !== id);
    const node = document.querySelector(`.d-el[data-id="${id}"]`);
    if (node) node.remove();
  });
  deselect();
}

/* ══════════════════════════════════════════════════
   ADD NEW ELEMENT
══════════════════════════════════════════════════ */
function addEl(type) {
  const side = 'right';
  const newEl = {
    id: genId(), type,
    top: 10, left: 20,
    w: type === 'polaroid' ? 136 : 154,
    h: type === 'polaroid' ? 154 : 118,
    rot: Math.round(Math.random() * 8 - 4),
    ...(type === 'polaroid'
      ? { src: '', caption: '' }
      : { color: ['white','yellow','pink'][Math.floor(Math.random()*3)],
          noteTitle: 'Note to self', noteText: '', flower: Math.random() > 0.5 })
  };
  State.cur()[side].elements.push(newEl);
  const pageEl = $('rightPage');
  const node   = buildNode(newEl);
  pageEl.appendChild(node);
  applyEditAffordances();
  selectEl(node);
}

/* ══════════════════════════════════════════════════
   PHOTO UPLOAD
══════════════════════════════════════════════════ */
function pickPhoto(polaroidNode) {
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = 'image/*';
  inp.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const src = ev.target.result;
      const img = polaroidNode.querySelector('img');
      if (img) { img.src = src; img.classList.add('has-src'); img.style.background = 'none'; }
      patchElState(polaroidNode);
      const side  = polaroidNode.closest('#leftPage') ? 'left' : 'right';
      const elData = State.cur()[side].elements.find(e => e.id === polaroidNode.dataset.id);
      if (elData) elData.src = src;
    };
    reader.readAsDataURL(file);
  };
  inp.click();
}

/* ══════════════════════════════════════════════════
   ADD NEW SPREAD
══════════════════════════════════════════════════ */
function addSpread() {
  snapshotBothPages();
  const d = new Date();
  const dt = d.getDate() + ' ' + d.toLocaleString('en-GB',{month:'long'}) + ' ' + d.getFullYear();
  State.spreads.push({
    id: 'spread-' + Date.now(),
    left:  { date: dt, title: '', body: '', list: [], elements: [] },
    right: { date: dt, title: '', body: '', list: [], elements: [] }
  });
  State.idx = State.spreads.length - 1;
  render();
  setEditMode(true);
}

/* ══════════════════════════════════════════════════
   INIT — runs when page is ready
══════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  State.init();
  render();

  // ── Navigation ──
  $('prevBtn').addEventListener('click', () => turnPage('bck'));
  $('nextBtn').addEventListener('click', () => turnPage('fwd'));

  // ── Keyboard ──
  document.addEventListener('keydown', e => {
    if (e.target && e.target.isContentEditable) return;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); turnPage('fwd'); return; }
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   { e.preventDefault(); turnPage('bck'); return; }
    if (e.key === 'Escape' && State.editMode) { setEditMode(false); return; }

    // Nudge selected element
    if (State.selEl && State.editMode && ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)) {
      e.preventDefault();
      const node = State.selEl;
      const page = node.closest('.page-area');
      if (!page) return;
      const pr   = page.getBoundingClientRect();
      const step = e.shiftKey ? 3 : 0.6;
      const cl   = parseFloat(node.style.left) || 0;
      const ct   = parseFloat(node.style.top)  || 0;
      if (e.key==='ArrowLeft')  node.style.left = clamp(cl - step/pr.width*100, -5, 88) + '%';
      if (e.key==='ArrowRight') node.style.left = clamp(cl + step/pr.width*100, -5, 88) + '%';
      if (e.key==='ArrowUp')    node.style.top  = clamp(ct - step/pr.height*100,-3, 88) + '%';
      if (e.key==='ArrowDown')  node.style.top  = clamp(ct + step/pr.height*100,-3, 88) + '%';
      patchElState(node);
      repositionElToolbar(node);
    }
  });

  // ── Toolbar buttons ──
  $('editBtn').addEventListener('click',    () => setEditMode(!State.editMode));
  $('saveBtn').addEventListener('click',    () => {
    snapshotBothPages();
    const ok    = State.save();
    const toast = $('toast');
    toast.textContent = ok ? 'Diary saved ♡' : 'Storage full — export first';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
  });
  $('addPageBtn').addEventListener('click', () => addSpread());
  $('addPhotoBtn').addEventListener('click',() => addEl('polaroid'));
  $('addNoteBtn').addEventListener('click', () => addEl('note'));

  // ── Element toolbar ──
  $('elRotL').addEventListener('click', () => rotateSelected('L'));
  $('elRotR').addEventListener('click', () => rotateSelected('R'));
  $('elDel').addEventListener('click',  () => {
    const id = $('elToolbar').dataset.targetId;
    if (id) deleteEl(id);
  });
  $('elDone').addEventListener('click', () => deselect());

  // ── Deselect on background click ──
  $('diaryScene').addEventListener('click', e => {
    if (!e.target.closest('.d-el') && !e.target.closest('#elToolbar')) deselect();
  });

  // ── Touch swipe ──
  let tx = 0, ty = 0;
  document.addEventListener('touchstart', e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  document.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - tx;
    const dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 48) {
      if (dx < 0) turnPage('fwd'); else turnPage('bck');
    }
  }, { passive: true });
});
