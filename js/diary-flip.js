/* ============================================================
   DIARY-FLIP.JS — Real physical diary page turning
   
   HOW IT WORKS:
   • Pages stack inside .book like a real book
   • Each page = one full spread (left + right) showing spread.jpg
   • Clicking or dragging the RIGHT bottom corner turns the page forward
   • Clicking or dragging the LEFT bottom corner turns back
   • The page rotates around the center spine (left edge of right half)
   • During the turn the page folds in 3D around the spine
   • Content lives on top of the spread photo
   ============================================================ */

/* ════════════════════════════════════════════════════
   SPREAD DATA
════════════════════════════════════════════════════ */
const SPREADS = [
  {
    id:'s1',
    left:{
      date:'12 April 2024', title:'the little things',
      body:"It's funny how the smallest moments end up meaning the most.\n\nA song, a random text, the way you laugh at silly things, or just sitting in comfortable silence — these are the pieces I want to hold on to.\n\nSomeday, when we look back, I want you to know that you were my little things, and they were everything.",
      list:[], els:[
        {id:'e1a',type:'pol',top:8, left:50,w:126,h:144,rot:3, src:'',cap:''},
        {id:'e1b',type:'pol',top:58,left:1, w:114,h:132,rot:-4,src:'',cap:''}
      ]
    },
    right:{
      date:'18 April 2024', title:'',
      body:'Some days are just good for the soul.',
      list:[], els:[
        {id:'e1c',type:'note',top:24,left:26,w:154,h:124,rot:-3,color:'w',ntitle:'Note to self',ntext:"You don't have to have it all figured out. You just have to keep showing up.",flower:true}
      ]
    }
  },
  {
    id:'s2',
    left:{
      date:'25 April 2024', title:'A little reminder',
      body:'', list:['You are enough.','You are doing better than you think.','You are so loved.','And you matter.','Always.'],
      els:[]
    },
    right:{
      date:'27 April 2024', title:'',
      body:'Collect beautiful moments...', list:[], els:[
        {id:'e2a',type:'pol',top:6,left:10,w:144,h:164,rot:2,src:'',cap:''}
      ]
    }
  },
  {
    id:'s3',
    left:{
      date:'30 April 2024', title:"Today I'm grateful for:",
      body:'', list:['Good food','Warm hugs','Kind people','New beginnings','You'],
      els:[]
    },
    right:{
      date:'2 May 2024', title:'', body:'', list:[], els:[
        {id:'e3a',type:'note',top:4, left:16,w:154,h:114,rot:4,  color:'y',ntitle:'',ntext:"Not every day is meant to be perfect. Some days just need to be lived.",flower:false},
        {id:'e3b',type:'pol', top:44,left:6, w:138,h:158,rot:-2,src:'',cap:''}
      ]
    }
  },
  {
    id:'s4',
    left:{
      date:'5 May 2024', title:'',
      body:"I hope you know how special you are. Not just today, but always.\n\nYou make the ordinary days feel extraordinary.",
      list:[], els:[]
    },
    right:{
      date:'8 May 2024', title:'',
      body:'Still so much to be grateful for...', list:[], els:[
        {id:'e4a',type:'pol',top:8,left:14,w:136,h:156,rot:-3,src:'',cap:''}
      ]
    }
  },
  {
    id:'s5',
    left:{
      date:'10 May 2024', title:'Little dreams:',
      body:'', list:['Travel the world','Build a life we love','Keep growing together','Create more memories','Be happy, always'],
      els:[]
    },
    right:{
      date:'12 May 2024', title:'', body:'', list:[], els:[
        {id:'e5a',type:'note',top:10,left:12,w:152,h:124,rot:3,color:'p',ntitle:'',ntext:"Thank you for being part of my story.",flower:true}
      ]
    }
  },
  {
    id:'s6',
    left:{
      date:'22 April 2024', title:'Things I Love About you',
      body:'', list:['Your smile','The way you care','How you make me laugh','Your kind heart','Just you, always'],
      els:[]
    },
    right:{
      date:'22 April 2024', title:'', body:'', list:[], els:[
        {id:'e6a',type:'note',top:6, left:16,w:152,h:108,rot:-4,color:'w',ntitle:'',ntext:"Same sky\nDifferent places\nSame heart",flower:false},
        {id:'e6b',type:'pol', top:46,left:6, w:138,h:158,rot:3, src:'',cap:''}
      ]
    }
  }
];

/* ════════════════════════════════════════════════════
   STATE
════════════════════════════════════════════════════ */
const S = {
  spreads: [],
  topIdx:  0,       // index of the currently visible (top) page
  turning: false,
  editMode: false,
  selEl: null,

  init() {
    const saved = DiaryStorage.load();
    this.spreads = (saved && saved.length) ? saved : JSON.parse(JSON.stringify(SPREADS));
  },
  cur()  { return this.spreads[this.topIdx]; },
  save() { return DiaryStorage.save(this.spreads); }
};

/* ════════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════════ */
const $ = id => document.getElementById(id);
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
const genId = () => 'el' + Date.now().toString(36) + Math.random().toString(36).slice(2,5);
function getXY(e) {
  const t = e.touches?.[0] || e.changedTouches?.[0];
  return t ? {x:t.clientX, y:t.clientY} : {x:e.clientX, y:e.clientY};
}

/* ════════════════════════════════════════════════════
   BUILD ONE PAGE (spread DOM node)
════════════════════════════════════════════════════ */
function buildPage(spreadData, index) {
  const page = document.createElement('div');
  page.className = 'page';
  page.dataset.index = index;

  // Front face (the spread photo + content)
  const front = document.createElement('div');
  front.className = 'page__face page__face--front';

  // Spine shadow overlay
  const spine = document.createElement('div');
  spine.className = 'page__spine';
  front.appendChild(spine);

  // Left page content
  const leftArea = document.createElement('div');
  leftArea.className = 'page__left';
  leftArea.dataset.side = 'left';
  fillPageArea(leftArea, spreadData.left);
  front.appendChild(leftArea);

  // Right page content
  const rightArea = document.createElement('div');
  rightArea.className = 'page__right';
  rightArea.dataset.side = 'right';
  fillPageArea(rightArea, spreadData.right);
  front.appendChild(rightArea);

  // Turn shadow (animates during flip)
  const shadow = document.createElement('div');
  shadow.className = 'page__turn-shadow';
  front.appendChild(shadow);

  // Right corner hit area — click/drag to turn forward
  const cornerR = document.createElement('div');
  cornerR.className = 'page__corner-hit page__corner-hit--right';
  cornerR.setAttribute('aria-label', 'Turn to next page');
  front.appendChild(cornerR);

  // Left corner hit area — click/drag to turn back
  const cornerL = document.createElement('div');
  cornerL.className = 'page__corner-hit page__corner-hit--left';
  cornerL.setAttribute('aria-label', 'Turn to previous page');
  front.appendChild(cornerL);

  page.appendChild(front);

  // Back face (reverse side of the paper — slightly muted)
  const back = document.createElement('div');
  back.className = 'page__face page__face--back';
  page.appendChild(back);

  return page;
}

/* ── Fill one page area with content ── */
function fillPageArea(area, data) {
  // Date
  const date = document.createElement('div');
  date.className = 'pg-date';
  date.dataset.field = 'date';
  date.textContent = data.date || '';
  area.appendChild(date);

  const heart = document.createElement('div');
  heart.className = 'pg-heart';
  heart.textContent = '♡';
  area.appendChild(heart);

  // Title
  const title = document.createElement('div');
  title.className = 'pg-title';
  title.dataset.field = 'title';
  title.textContent = data.title || '';
  area.appendChild(title);

  // Body
  const body = document.createElement('div');
  body.className = 'pg-body';
  body.dataset.field = 'body';
  body.textContent = data.body || '';
  area.appendChild(body);

  // List
  if (data.list && data.list.length) {
    const ul = document.createElement('ul');
    ul.className = 'pg-list';
    ul.dataset.field = 'list';
    data.list.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      ul.appendChild(li);
    });
    area.appendChild(ul);
  }

  // Draggable elements
  (data.els || []).forEach(el => {
    const node = buildEl(el);
    area.appendChild(node);
  });
}

/* ── Build a draggable element node ── */
function buildEl(el) {
  const wrap = document.createElement('div');
  wrap.className = 'd-el ' + (el.type === 'pol' ? 'polaroid' : 'note-card nc-' + (el.color||'w'));
  wrap.dataset.id   = el.id;
  wrap.dataset.type = el.type;
  wrap.style.cssText = `position:absolute;top:${el.top}%;left:${el.left}%;width:${el.w}px;transform:rotate(${el.rot}deg);`;
  if (el.type === 'pol') wrap.style.height = el.h + 'px';

  if (el.type === 'pol') {
    const img = document.createElement('img');
    img.className = 'pol-img' + (el.src ? ' loaded' : '');
    img.style.cssText = 'width:100%;aspect-ratio:1/1;object-fit:cover;display:block;';
    if (el.src) { img.src = el.src; } else { img.style.background = 'linear-gradient(135deg,#d4a76a,#a06830)'; }
    wrap.appendChild(img);

    const cap = document.createElement('div');
    cap.className = 'pol-cap';
    cap.dataset.field = 'cap';
    cap.textContent = el.cap || '';
    wrap.appendChild(cap);

    const hint = document.createElement('div');
    hint.className = 'pol-hint';
    hint.innerHTML = '📷<br>tap to add photo';
    hint.addEventListener('click', () => pickPhoto(wrap));
    wrap.appendChild(hint);

  } else {
    if (el.ntitle) {
      const t = document.createElement('div');
      t.className = 'nc-title';
      t.dataset.field = 'ntitle';
      t.textContent = el.ntitle;
      wrap.appendChild(t);
    }
    const tx = document.createElement('div');
    tx.className = 'nc-text';
    tx.dataset.field = 'ntext';
    tx.textContent = el.ntext || '';
    wrap.appendChild(tx);
    const h = document.createElement('span');
    h.className = 'nc-heart'; h.textContent = '♡'; wrap.appendChild(h);
    if (el.flower) {
      const f = document.createElement('span');
      f.className = 'nc-flower'; f.textContent = '✿'; wrap.appendChild(f);
    }
  }

  // Handles
  const rz = document.createElement('div'); rz.className = 'rz'; wrap.appendChild(rz);
  const ro = document.createElement('div'); ro.className = 'ro'; ro.textContent = '↻'; wrap.appendChild(ro);

  return wrap;
}

/* ════════════════════════════════════════════════════
   RENDER ALL PAGES INTO THE BOOK
   Pages stack z-index = total - index
   so spread[0] is on top with highest z-index
════════════════════════════════════════════════════ */
function renderBook() {
  const book = $('book');
  book.innerHTML = '';

  const total = S.spreads.length;
  S.spreads.forEach((spread, i) => {
    const page = buildPage(spread, i);
    // Pages below the current top are hidden for performance
    // only the top 2-3 need to be visible
    if (i < S.topIdx) {
      page.style.display = 'none'; // already turned pages — hidden
    }
    page.style.zIndex = total - i;
    book.appendChild(page);
  });

  attachCornerListeners();
  if (S.editMode) applyEditMode(true);
}

/* ════════════════════════════════════════════════════
   PAGE CORNER LISTENERS
   Right corner → turn forward
   Left corner  → turn backward
════════════════════════════════════════════════════ */
function attachCornerListeners() {
  // Only attach to the TOP (visible) page
  const topPage = getTopPage();
  if (!topPage) return;

  const cornerR = topPage.querySelector('.page__corner-hit--right');
  const cornerL = topPage.querySelector('.page__corner-hit--left');

  if (cornerR) {
    cornerR.addEventListener('pointerdown', e => { e.preventDefault(); startTurn(e, 'fwd', topPage); });
    cornerR.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); snapTurn('fwd'); });
  }
  if (cornerL) {
    cornerL.addEventListener('pointerdown', e => { e.preventDefault(); startTurn(e, 'bck', topPage); });
    cornerL.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); snapTurn('bck'); });
  }
}

function getTopPage() {
  const book = $('book');
  // Top page = first visible page (lowest index that isn't hidden)
  return book.querySelector(`.page[data-index="${S.topIdx}"]`) || null;
}

/* ════════════════════════════════════════════════════
   SNAP TURN — instant animated flip (click without drag)
════════════════════════════════════════════════════ */
function snapTurn(dir) {
  if (S.turning) return;
  const toIdx = S.topIdx + (dir === 'fwd' ? 1 : -1);
  if (toIdx < 0 || toIdx >= S.spreads.length) return;

  snapshotCurrent();
  S.turning = true;

  const book     = $('book');
  const topPage  = getTopPage();
  const nextPage = book.querySelector(`.page[data-index="${toIdx}"]`);

  if (!topPage) { S.turning = false; return; }

  if (dir === 'fwd') {
    // Show the next page below — make it visible
    if (nextPage) nextPage.style.display = '';

    // Rotate the top page from 0 → -180deg around the spine
    // spine is at 50% from left edge of the page
    topPage.classList.add('is-turning');
    topPage.style.transformOrigin = '50% 50%'; // center spine
    topPage.style.transition = 'transform 0.65s cubic-bezier(0.4,0,0.2,1)';
    topPage.style.transform  = 'rotateY(-180deg)';

    setTimeout(() => {
      // After flip — hide the turned page, update state
      topPage.style.display = 'none';
      topPage.style.transition = '';
      topPage.style.transform  = '';
      topPage.classList.remove('is-turning');
      S.topIdx  = toIdx;
      S.turning = false;
      attachCornerListeners();
    }, 680);

  } else {
    // Going back: show the previous page, animate it from -180 → 0
    if (!nextPage) { S.turning = false; return; }
    nextPage.style.display    = '';
    nextPage.style.transition = 'none';
    nextPage.style.transformOrigin = '50% 50%';
    nextPage.style.transform  = 'rotateY(-180deg)';

    // Force reflow
    void nextPage.offsetWidth;

    nextPage.classList.add('is-turning');
    nextPage.style.transition = 'transform 0.65s cubic-bezier(0.4,0,0.2,1)';
    nextPage.style.transform  = 'rotateY(0deg)';

    // Hide current top page when animation is halfway
    setTimeout(() => {
      if (topPage) topPage.style.display = 'none';
    }, 340);

    setTimeout(() => {
      nextPage.style.transition = '';
      nextPage.classList.remove('is-turning');
      S.topIdx  = toIdx;
      S.turning = false;
      attachCornerListeners();
    }, 680);
  }
}

/* ════════════════════════════════════════════════════
   DRAG TURN — follow the pointer, release to complete
════════════════════════════════════════════════════ */
function startTurn(e, dir, page) {
  if (S.turning) return;
  const toIdx = S.topIdx + (dir === 'fwd' ? 1 : -1);
  if (toIdx < 0 || toIdx >= S.spreads.length) return;

  // If this was just a click (not a real drag), snapTurn handles it
  const startXY = getXY(e);
  let dragged   = false;

  const book   = $('book');
  const bookR  = book.getBoundingClientRect();
  const spineX = bookR.left + bookR.width / 2; // center spine x

  const nextPage = book.querySelector(`.page[data-index="${toIdx}"]`);
  if (nextPage) nextPage.style.display = '';

  // Disable transition for live drag
  page.style.transition   = 'none';
  page.style.transformOrigin = '50% 50%';

  function onMove(ev) {
    const p = getXY(ev);
    const dx = Math.abs(p.x - startXY.x);
    if (dx > 6) dragged = true;
    if (!dragged) return;

    if (!S.turning) S.turning = true;

    // Map pointer x → rotation angle
    // Moving left  → negative angle (forward turn)
    // Moving right → positive angle (backward turn)
    const raw = (p.x - spineX) / (bookR.width / 2); // -1 to +1
    let angle;

    if (dir === 'fwd') {
      // Forward: right page flips left (0 → -180)
      angle = clamp(raw * -180, -180, 0);
    } else {
      // Backward: page restores from -180 → 0
      angle = clamp((raw + 1) * -180, -180, 0);
    }

    page.style.transform = `rotateY(${angle}deg)`;
  }

  function onUp(ev) {
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerup',   onUp);

    if (!dragged) {
      // Pure click — let the click handler do it
      if (nextPage) nextPage.style.display = 'none';
      page.style.transform  = '';
      page.style.transition = '';
      S.turning = false;
      return;
    }

    // Determine current angle
    const match = page.style.transform.match(/rotateY\(([^)]+)deg\)/);
    const curAngle = match ? parseFloat(match[1]) : 0;

    // If more than halfway, complete; otherwise revert
    const complete = Math.abs(curAngle) > 90;

    page.style.transition = 'transform 0.35s cubic-bezier(0.4,0,0.2,1)';

    if (complete) {
      snapshotCurrent();
      page.style.transform = dir === 'fwd' ? 'rotateY(-180deg)' : 'rotateY(0deg)';
      setTimeout(() => {
        if (dir === 'fwd') {
          page.style.display = 'none';
        } else {
          if (nextPage) nextPage.style.display = 'none'; // this was the old top
        }
        page.style.transform  = '';
        page.style.transition = '';
        page.classList.remove('is-turning');
        S.topIdx  = toIdx;
        S.turning = false;
        attachCornerListeners();
      }, 380);
    } else {
      // Revert
      page.style.transform = dir === 'fwd' ? 'rotateY(0deg)' : 'rotateY(-180deg)';
      if (nextPage) {
        setTimeout(() => {
          if (dir !== 'fwd') nextPage.style.display = '';
          else nextPage.style.display = 'none';
          page.style.transform  = '';
          page.style.transition = '';
          S.turning = false;
        }, 380);
      } else {
        setTimeout(() => {
          page.style.transform  = '';
          page.style.transition = '';
          S.turning = false;
        }, 380);
      }
    }
  }

  document.addEventListener('pointermove', onMove);
  document.addEventListener('pointerup',   onUp);
}

/* ════════════════════════════════════════════════════
   SNAPSHOT — read DOM text back to state before turning
════════════════════════════════════════════════════ */
function snapshotCurrent() {
  const topPage = getTopPage();
  if (!topPage) return;
  const data = S.cur();

  ['left','right'].forEach(side => {
    const area = topPage.querySelector(`.page__${side}`);
    if (!area) return;
    const d = data[side];

    const dateEl  = area.querySelector('[data-field="date"]');
    const titleEl = area.querySelector('[data-field="title"]');
    const bodyEl  = area.querySelector('[data-field="body"]');
    const listEl  = area.querySelector('[data-field="list"]');

    if (dateEl)  d.date  = dateEl.textContent.trim();
    if (titleEl) d.title = titleEl.textContent.trim();
    if (bodyEl)  d.body  = bodyEl.textContent.trim();
    if (listEl)  d.list  = Array.from(listEl.querySelectorAll('li')).map(li => li.textContent.trim()).filter(Boolean);

    area.querySelectorAll('.d-el').forEach(node => {
      const el = d.els.find(e => e.id === node.dataset.id);
      if (!el) return;
      el.top  = parseFloat(node.style.top)  || 0;
      el.left = parseFloat(node.style.left) || 0;
      if (node.style.width)  el.w = parseInt(node.style.width);
      if (node.style.height) el.h = parseInt(node.style.height);
      const rm = node.style.transform.match(/rotate\(([^)]+)deg\)/);
      if (rm) el.rot = parseFloat(rm[1]);

      const tNode = node.querySelector('[data-field="ntitle"]');
      const xNode = node.querySelector('[data-field="ntext"]');
      const cNode = node.querySelector('[data-field="cap"]');
      const iNode = node.querySelector('img');
      if (tNode) el.ntitle = tNode.textContent.trim();
      if (xNode) el.ntext  = xNode.textContent.trim();
      if (cNode) el.cap    = cNode.textContent.trim();
      if (iNode && iNode.src && iNode.classList.contains('loaded')) el.src = iNode.src;
    });
  });
}

/* ════════════════════════════════════════════════════
   EDIT MODE
════════════════════════════════════════════════════ */
function applyEditMode(on) {
  const scene = $('scene') || document.querySelector('.scene');
  if (scene) scene.classList.toggle('edit-mode', on);

  const topPage = getTopPage();
  if (!topPage) return;

  // Text fields
  topPage.querySelectorAll('[data-field]').forEach(el => {
    if (['date','title','body'].includes(el.dataset.field)) {
      el.contentEditable = on ? 'true' : 'false';
    }
  });
  topPage.querySelectorAll('.pg-list li').forEach(li => {
    li.contentEditable = on ? 'true' : 'false';
  });

  // Element fields
  topPage.querySelectorAll('.d-el').forEach(node => {
    node.querySelectorAll('[data-field="ntitle"],[data-field="ntext"],[data-field="cap"]').forEach(f => {
      f.contentEditable = on ? 'true' : 'false';
    });
    if (on) attachElInteraction(node);
  });

  // Corner hits should not work in edit mode (would conflict with drag)
  topPage.querySelectorAll('.page__corner-hit').forEach(c => {
    c.style.pointerEvents = on ? 'none' : '';
  });
}

function setEditMode(on) {
  if (!on) {
    snapshotCurrent();
    deselect();
  }
  S.editMode = on;
  $('editBtn').classList.toggle('active', on);
  $('saveBtn').style.display    = on ? 'flex' : 'none';
  $('addBtn').style.display     = on ? 'flex' : 'none';
  $('palette').style.display    = on ? 'flex' : 'none';
  applyEditMode(on);
}

/* ════════════════════════════════════════════════════
   DRAG / RESIZE / ROTATE (edit mode elements)
════════════════════════════════════════════════════ */
function attachElInteraction(node) {
  if (node._ei) return;
  node._ei = true;

  node.addEventListener('pointerdown', e => {
    if (e.target.classList.contains('rz')) return;
    if (e.target.classList.contains('ro')) return;
    if (e.target.classList.contains('pol-hint')) return;
    if (e.target.closest('[contenteditable="true"]')) return;
    if (!S.editMode) return;
    e.preventDefault(); e.stopPropagation();
    selectEl(node);
    dragEl(e, node);
  });

  const rz = node.querySelector('.rz');
  if (rz) rz.addEventListener('pointerdown', e => {
    e.preventDefault(); e.stopPropagation();
    if (!S.editMode) return;
    selectEl(node); resizeEl(e, node);
  });

  const ro = node.querySelector('.ro');
  if (ro) ro.addEventListener('pointerdown', e => {
    e.preventDefault(); e.stopPropagation();
    if (!S.editMode) return;
    selectEl(node); rotateEl(e, node);
  });

  if (node.dataset.type === 'pol') {
    node.addEventListener('dblclick', () => { if (S.editMode) pickPhoto(node); });
  }
}

function dragEl(e, node) {
  const area = node.closest('.page__left, .page__right');
  if (!area) return;
  const ar = area.getBoundingClientRect();
  const p0 = getXY(e);
  const l0 = parseFloat(node.style.left) || 0;
  const t0 = parseFloat(node.style.top)  || 0;
  const mv = ev => {
    const p = getXY(ev);
    node.style.left = clamp(l0+(p.x-p0.x)/ar.width*100,  -5, 88) + '%';
    node.style.top  = clamp(t0+(p.y-p0.y)/ar.height*100, -3, 88) + '%';
    repositionEltb(node);
  };
  const up = () => { document.removeEventListener('pointermove',mv); document.removeEventListener('pointerup',up); patchEl(node); };
  document.addEventListener('pointermove', mv);
  document.addEventListener('pointerup',   up);
}

function resizeEl(e, node) {
  const p0=getXY(e), w0=parseInt(node.style.width)||node.offsetWidth, h0=parseInt(node.style.height)||node.offsetHeight;
  const mv = ev => {
    const p=getXY(ev);
    node.style.width  = clamp(w0+(p.x-p0.x), 65, 295) + 'px';
    node.style.height = clamp(h0+(p.y-p0.y), 50, 295) + 'px';
  };
  const up = () => { document.removeEventListener('pointermove',mv); document.removeEventListener('pointerup',up); patchEl(node); };
  document.addEventListener('pointermove', mv);
  document.addEventListener('pointerup',   up);
}

function rotateEl(e, node) {
  const p0=getXY(e);
  const b=node.getBoundingClientRect();
  const cx=b.left+b.width/2, cy=b.top+b.height/2;
  const a0=Math.atan2(p0.y-cy, p0.x-cx)*180/Math.PI;
  const rm=node.style.transform.match(/rotate\(([^)]+)deg\)/);
  const r0=rm?parseFloat(rm[1]):0;
  const mv = ev => {
    const p=getXY(ev);
    const b2=node.getBoundingClientRect();
    const a=Math.atan2(p.y-(b2.top+b2.height/2), p.x-(b2.left+b2.width/2))*180/Math.PI;
    node.style.transform = `rotate(${Math.round((r0+a-a0)*10)/10}deg)`;
  };
  const up = () => { document.removeEventListener('pointermove',mv); document.removeEventListener('pointerup',up); patchEl(node); };
  document.addEventListener('pointermove', mv);
  document.addEventListener('pointerup',   up);
}

function patchEl(node) {
  const side = node.closest('.page__left') ? 'left' : 'right';
  const el   = S.cur()[side].els.find(e => e.id === node.dataset.id);
  if (!el) return;
  el.top  = parseFloat(node.style.top)  || 0;
  el.left = parseFloat(node.style.left) || 0;
  if (node.style.width)  el.w = parseInt(node.style.width);
  if (node.style.height) el.h = parseInt(node.style.height);
  const rm = node.style.transform.match(/rotate\(([^)]+)deg\)/);
  if (rm) el.rot = parseFloat(rm[1]);
}

/* ════════════════════════════════════════════════════
   SELECTION
════════════════════════════════════════════════════ */
function selectEl(node) {
  document.querySelectorAll('.d-el.sel').forEach(n => { if(n!==node) n.classList.remove('sel'); });
  node.classList.add('sel');
  S.selEl = node;
  $('eltb').style.display = 'flex';
  repositionEltb(node);
}

function deselect() {
  document.querySelectorAll('.d-el.sel').forEach(n => n.classList.remove('sel'));
  S.selEl = null;
  $('eltb').style.display = 'none';
}

function repositionEltb(node) {
  const tb = $('eltb');
  const sc = document.querySelector('.scene');
  if (!tb || !sc) return;
  const er = node.getBoundingClientRect();
  const sr = sc.getBoundingClientRect();
  tb.style.top  = Math.max(4, er.top-sr.top-44) + 'px';
  tb.style.left = Math.max(4, Math.min(er.left-sr.left, sr.width-190)) + 'px';
  tb.dataset.tid = node.dataset.id;
}

function rotateSelected(d) {
  if (!S.selEl) return;
  const rm=S.selEl.style.transform.match(/rotate\(([^)]+)deg\)/);
  const cur=rm?parseFloat(rm[1]):0;
  S.selEl.style.transform = `rotate(${cur+(d==='L'?-5:5)}deg)`;
  patchEl(S.selEl);
}

function deleteEl(id) {
  const sp=S.cur();
  ['left','right'].forEach(side => {
    sp[side].els = sp[side].els.filter(e => e.id !== id);
  });
  document.querySelector(`.d-el[data-id="${id}"]`)?.remove();
  deselect();
}

/* ════════════════════════════════════════════════════
   ADD ELEMENT
════════════════════════════════════════════════════ */
function addEl(type) {
  const side = 'right';
  const newEl = {
    id: genId(), type,
    top:10, left:20,
    w: type==='pol'?134:152,
    h: type==='pol'?152:116,
    rot: Math.round(Math.random()*8-4),
    ...(type==='pol'
      ? {src:'',cap:''}
      : {color:['w','y','p'][Math.floor(Math.random()*3)],ntitle:'Note to self',ntext:'',flower:Math.random()>0.5})
  };
  S.cur()[side].els.push(newEl);
  const topPage = getTopPage();
  if (!topPage) return;
  const area = topPage.querySelector('.page__right');
  const node = buildEl(newEl);
  area.appendChild(node);
  applyEditMode(true);
  selectEl(node);
}

/* ════════════════════════════════════════════════════
   PHOTO UPLOAD
════════════════════════════════════════════════════ */
function pickPhoto(polaroidNode) {
  const inp = document.createElement('input');
  inp.type='file'; inp.accept='image/*';
  inp.onchange = e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const src = ev.target.result;
      const img = polaroidNode.querySelector('img');
      if (img) { img.src=src; img.classList.add('loaded'); img.style.background='none'; }
      patchEl(polaroidNode);
      const side = polaroidNode.closest('.page__left') ? 'left' : 'right';
      const el   = S.cur()[side].els.find(e => e.id === polaroidNode.dataset.id);
      if (el) el.src = src;
    };
    reader.readAsDataURL(file);
  };
  inp.click();
}

/* ════════════════════════════════════════════════════
   ADD NEW SPREAD
════════════════════════════════════════════════════ */
function addSpread() {
  snapshotCurrent();
  const d = new Date();
  const dt = d.getDate()+' '+d.toLocaleString('en-GB',{month:'long'})+' '+d.getFullYear();
  S.spreads.push({
    id:'spread-'+Date.now(),
    left:{date:dt,title:'',body:'',list:[],els:[]},
    right:{date:dt,title:'',body:'',list:[],els:[]}
  });
  S.topIdx = S.spreads.length - 1;
  renderBook();
  setEditMode(true);
}

/* ════════════════════════════════════════════════════
   KEYBOARD
════════════════════════════════════════════════════ */
function onKey(e) {
  if (e.target && e.target.isContentEditable) return;
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); snapTurn('fwd'); }
  if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   { e.preventDefault(); snapTurn('bck'); }
  if (e.key === 'Escape' && S.editMode) setEditMode(false);

  if (S.selEl && S.editMode && ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)) {
    e.preventDefault();
    const node = S.selEl;
    const area = node.closest('.page__left,.page__right');
    if (!area) return;
    const ar   = area.getBoundingClientRect();
    const step = e.shiftKey ? 3 : 0.6;
    const cl   = parseFloat(node.style.left)||0;
    const ct   = parseFloat(node.style.top) ||0;
    if (e.key==='ArrowLeft')  node.style.left = clamp(cl-step/ar.width*100, -5,88)+'%';
    if (e.key==='ArrowRight') node.style.left = clamp(cl+step/ar.width*100, -5,88)+'%';
    if (e.key==='ArrowUp')    node.style.top  = clamp(ct-step/ar.height*100,-3,88)+'%';
    if (e.key==='ArrowDown')  node.style.top  = clamp(ct+step/ar.height*100,-3,88)+'%';
    patchEl(node); repositionEltb(node);
  }
}

/* ════════════════════════════════════════════════════
   SWIPE (touch)
════════════════════════════════════════════════════ */
let tx0=0, ty0=0;
document.addEventListener('touchstart', e => { tx0=e.touches[0].clientX; ty0=e.touches[0].clientY; }, {passive:true});
document.addEventListener('touchend', e => {
  if (S.editMode) return;
  const dx=e.changedTouches[0].clientX-tx0, dy=e.changedTouches[0].clientY-ty0;
  if (Math.abs(dx)>Math.abs(dy) && Math.abs(dx)>45) {
    if (dx<0) snapTurn('fwd'); else snapTurn('bck');
  }
}, {passive:true});

/* ════════════════════════════════════════════════════
   TOAST
════════════════════════════════════════════════════ */
function showToast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

/* ════════════════════════════════════════════════════
   INIT
════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  S.init();
  renderBook();

  $('editBtn').addEventListener('click',    () => setEditMode(!S.editMode));
  $('saveBtn').addEventListener('click',    () => { snapshotCurrent(); showToast(S.save() ? 'Diary saved ♡' : 'Storage full'); });
  $('addBtn').addEventListener('click',     () => addSpread());
  $('addPhotoBtn').addEventListener('click',() => addEl('pol'));
  $('addNoteBtn').addEventListener('click', () => addEl('note'));

  $('eRotL').addEventListener('click', () => rotateSelected('L'));
  $('eRotR').addEventListener('click', () => rotateSelected('R'));
  $('eDel').addEventListener('click',  () => { const id=$('eltb').dataset.tid; if(id) deleteEl(id); });
  $('eDone').addEventListener('click', () => deselect());

  document.querySelector('.scene').addEventListener('click', e => {
    if (!e.target.closest('.d-el') && !e.target.closest('#eltb')) deselect();
  });

  document.addEventListener('keydown', onKey);
});
