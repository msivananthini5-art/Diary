/* ============================================================
   SUPABASE-SYNC.JS — Supabase sync layer for SABI diary
   Depends on: supabase-client.js (_supabaseClient), storage.js (DiaryStorage)
   Provides: SupabaseSync global object
   ============================================================ */

const SupabaseSync = (() => {
  const QUEUE_KEY = 'sabi_pending_queue';
  let _role = null;
  let _pendingQueue = [];

  /* ─────────────────────────────────────────────────────────
     QUEUE HELPERS
  ───────────────────────────────────────────────────────── */
  function _loadQueue() {
    try {
      const raw = localStorage.getItem(QUEUE_KEY);
      _pendingQueue = raw ? JSON.parse(raw) : [];
    } catch { _pendingQueue = []; }
  }

  function _saveQueue() {
    try { localStorage.setItem(QUEUE_KEY, JSON.stringify(_pendingQueue)); } catch {}
  }

  function _enqueue(op) {
    _pendingQueue.push(op);
    _saveQueue();
  }

  /* ─────────────────────────────────────────────────────────
     AUTH
  ───────────────────────────────────────────────────────── */
  async function signIn(email, password) {
    if (!_supabaseClient) throw new Error('Supabase not configured');
    const { data, error } = await _supabaseClient.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    _role = null;
    if (_supabaseClient) await _supabaseClient.auth.signOut();
  }

  async function getSession() {
    if (!_supabaseClient) return null;
    const { data } = await _supabaseClient.auth.getSession();
    return data?.session || null;
  }

  async function getRole() {
    if (_role) return _role;
    const { data: { user } } = await _supabaseClient.auth.getUser();
    if (!user) return null;
    const { data, error } = await _supabaseClient.from('profiles').select('role').eq('id', user.id).maybeSingle();
    
    if (error) {
      console.warn('getRole query error:', error);
      console.warn('getRole full error:', error);
      return null;
    }
    
    // If no profile row exists yet, we need to create one
    if (!data) {
      try {
        const { data: newProfile, error: insertErr } = await _supabaseClient.from('profiles')
          .insert({ id: user.id, role: 'owner' })
          .select('role')
          .maybeSingle();
        if (insertErr) {
          console.warn('getRole insert error:', insertErr);
          console.warn('getRole insert full error:', insertErr);
          return 'owner'; // Assume owner; fallback
        }
        _role = newProfile?.role || 'owner';
        return _role;
      } catch (e) {
        console.warn('getRole insert exception:', e);
        return 'owner'; // Fallback
      }
    }
    
    _role = data?.role || 'viewer';
    
    // Auto-promote: if profile is viewer (old default), upgrade to owner
    if (_role === 'viewer') {
      try {
        await _supabaseClient.from('profiles').upsert({ id: user.id, role: 'owner' });
        _role = 'owner';
      } catch (e) {
        console.warn('getRole auto-promote error:', e);
      }
    }
    
    return _role;
  }

  /* ─────────────────────────────────────────────────────────
     AUTH STATE CHANGE LISTENER
     Sets DIARY_MODE and re-renders when auth changes.
  ───────────────────────────────────────────────────────── */
  if (_supabaseClient) {
    _supabaseClient.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        _role = null; // reset cached role
        const role = await getRole();
        // DIARY_MODE is a global in diary.html
        window.DIARY_MODE = role === 'owner' ? 'editor' : 'viewer';
        if (typeof renderSpread === 'function') renderSpread();
      } else {
        window.DIARY_MODE = 'viewer';
      }
    });
  }

  /* ─────────────────────────────────────────────────────────
     PULL — load everything from Supabase into DiaryState
  ───────────────────────────────────────────────────────── */
  async function pull() {
    if (!_supabaseClient) return;
    try {
      const { data: spreadsRows, error: sErr } = await _supabaseClient
        .from('spreads')
        .select('*')
        .order('spread_num', { ascending: true });
      if (sErr) { console.warn('SupabaseSync pull spreads:', sErr.message); return; }

      const { data: memRows, error: mErr } = await _supabaseClient
        .from('memories')
        .select('*')
        .order('slot_index', { ascending: true });
      if (mErr) { console.warn('SupabaseSync pull memories:', mErr.message); return; }

      const { data: photoRows, error: phErr } = await _supabaseClient
        .from('memory_photos')
        .select('*');
      if (phErr) { console.warn('SupabaseSync pull photos:', phErr.message); return; }

      const { data: stickerRows, error: stErr } = await _supabaseClient
        .from('memory_stickers')
        .select('*');
      if (stErr) { console.warn('SupabaseSync pull stickers:', stErr.message); return; }

      if (!spreadsRows || spreadsRows.length === 0) return;

      // Generate signed URLs for photos
      const photoMap = {}; // memoryId -> photo row (first photo per memory)
      for (const ph of (photoRows || [])) {
        if (!photoMap[ph.memory_id]) {
          let signedUrl = ph.public_url || '';
          if (ph.storage_path) {
            const { data: urlData } = await _supabaseClient.storage
              .from('diary-photos')
              .createSignedUrl(ph.storage_path, 3600);
            if (urlData?.signedUrl) signedUrl = urlData.signedUrl;
          }
          photoMap[ph.memory_id] = { ...ph, signedUrl };
        }
      }

      // Group stickers by memory_id
      const stickerMap = {};
      for (const st of (stickerRows || [])) {
        if (!stickerMap[st.memory_id]) stickerMap[st.memory_id] = [];
        stickerMap[st.memory_id].push({
          id: st.id,
          emoji: st.emoji,
          x: st.pos_pct_x,
          y: st.pos_pct_y,
          rot: st.rotation_deg,
          scale: st.scale
        });
      }

      // Build spread objects matching DiaryState.spreads shape
      const spreadList = spreadsRows.map(sp => {
        const spreadMems = (memRows || []).filter(m => m.spread_num === sp.spread_num);
        const leftMems = spreadMems
          .filter(m => m.page_side === 'left')
          .sort((a, b) => a.slot_index - b.slot_index)
          .map(m => _mapMemory(m, photoMap, stickerMap));
        const rightMems = spreadMems
          .filter(m => m.page_side === 'right')
          .sort((a, b) => a.slot_index - b.slot_index)
          .map(m => _mapMemory(m, photoMap, stickerMap));
        return {
          spreadNum: sp.spread_num,
          leftMemories: leftMems,
          rightMemories: rightMems
        };
      });

      // Populate OffsetStore with positions from DB
      for (const m of (memRows || [])) {
        if ((m.text_pct_x || m.text_pct_y) && typeof OffsetStore !== 'undefined') {
          OffsetStore.set(m.id, 'text', m.text_pct_x || 0, m.text_pct_y || 0);
        }
      }
      for (const ph of (photoRows || [])) {
        if ((ph.pos_pct_x || ph.pos_pct_y) && typeof OffsetStore !== 'undefined') {
          OffsetStore.set(ph.memory_id, 'photo', ph.pos_pct_x || 0, ph.pos_pct_y || 0);
        }
      }

      // Merge into DiaryState (create spreads that don't exist, update existing)
      if (typeof DiaryState !== 'undefined') {
        // Replace spreads in DiaryState with pulled data
        if (!DiaryState.spreads) DiaryState.spreads = [];
        for (const pulled of spreadList) {
          const idx = DiaryState.spreads.findIndex(s => s.spreadNum === pulled.spreadNum);
          if (idx >= 0) {
            DiaryState.spreads[idx] = pulled;
          } else {
            DiaryState.spreads.push(pulled);
          }
        }
        // Sort by spreadNum
        DiaryState.spreads.sort((a, b) => a.spreadNum - b.spreadNum);
        // Cache to localStorage
        DiaryStorage.save(DiaryState);
      }
    } catch (e) {
      console.warn('SupabaseSync pull error:', e.message);
    }
  }

  function _mapMemory(m, photoMap, stickerMap) {
    const ph = photoMap[m.id];
    return {
      id: m.id,
      date: m.date_val || '',
      time: m.time_val || '',
      title: m.title || '',
      text: m.body_text || '',
      notes: m.notes || '',
      photo: ph ? ph.signedUrl : '',
      stickers: stickerMap[m.id] || []
    };
  }

  /* ─────────────────────────────────────────────────────────
     PUSH HELPERS
  ───────────────────────────────────────────────────────── */

  async function pushSpread(spreadNum) {
    if (!_supabaseClient) return;
    const op = { type: 'upsertSpread', spreadNum };
    try {
      const { error } = await _supabaseClient.from('spreads')
        .upsert({ spread_num: spreadNum }, { onConflict: 'spread_num' });
      if (error) {
        console.warn('pushSpread error:', error.message);
        console.warn('pushSpread full error:', error);
        throw error;
      }
    } catch (e) {
      if (_isNetworkError(e)) { _enqueue(op); }
      else {
        console.warn('pushSpread:', e.message);
        console.warn('pushSpread full error:', e);
      }
    }
  }

  async function pushMemory(memory, spreadNum, pageSide, slotIndex) {
    if (!_supabaseClient) return;
    const op = { type: 'upsertMemory', memory, spreadNum, pageSide, slotIndex };
    try {
      // Ensure the spread row exists first
      await pushSpread(spreadNum);

      // Fetch spread id — use maybeSingle() to handle replication lag gracefully
      const { data: spData, error: spErr } = await _supabaseClient.from('spreads')
        .select('id').eq('spread_num', spreadNum).maybeSingle();
      
      if (spErr) {
        console.warn('pushMemory fetch spread error:', spErr.message);
        console.warn('pushMemory fetch spread full error:', spErr);
        throw spErr;
      }
      
      const spreadId = spData?.id || null;
      
      // If spread still doesn't exist after pushSpread and re-query, log and return early
      if (!spreadId) {
        console.warn(`pushMemory: spread_num ${spreadNum} not found after pushSpread; cannot insert memory without spread_id`);
        _enqueue(op);
        return;
      }

      const row = {
        id: memory.id,
        spread_id: spreadId,
        spread_num: spreadNum,
        page_side: pageSide,
        slot_index: slotIndex,
        date_val: memory.date || null,
        time_val: memory.time || null,
        title: memory.title || null,
        body_text: memory.text || null,
        notes: memory.notes || null,
        updated_at: new Date().toISOString()
      };
      const { error } = await _supabaseClient.from('memories').upsert(row, { onConflict: 'id' });
      if (error) {
        console.warn('pushMemory upsert error:', error.message);
        console.warn('pushMemory upsert full error:', error);
        throw error;
      }
    } catch (e) {
      if (_isNetworkError(e)) { _enqueue(op); }
      else {
        console.warn('pushMemory error:', e.message);
        console.warn('pushMemory full error:', e);
      }
    }
  }

  async function pushPhoto(memoryId, file) {
    if (!_supabaseClient) return;
    const op = { type: 'uploadPhoto', memoryId };
    try {
      // Ensure the memory exists in Supabase first
      const { data: memExists } = await _supabaseClient.from('memories')
        .select('id').eq('id', memoryId).maybeSingle();
      
      if (!memExists) {
        // Memory doesn't exist yet, enqueue for later
        _enqueue(op);
        return;
      }

      let blob;
      if (typeof file === 'string' && file.startsWith('data:')) {
        // Convert base64 data URL to Blob
        const res = await fetch(file);
        blob = await res.blob();
      } else {
        blob = file;
      }

      const timestamp = Date.now();
      const storagePath = `memories/${memoryId}/${timestamp}.jpg`;

      const { error: upErr } = await _supabaseClient.storage
        .from('diary-photos')
        .upload(storagePath, blob, { contentType: blob.type || 'image/jpeg', upsert: true });
      if (upErr) throw upErr;

      const { error: dbErr } = await _supabaseClient.from('memory_photos')
        .upsert({ memory_id: memoryId, storage_path: storagePath }, { onConflict: 'memory_id' });
      if (dbErr) throw dbErr;
    } catch (e) {
      if (_isNetworkError(e)) { _enqueue(op); }
      else console.warn('pushPhoto:', e.message);
    }
  }

  async function pushPhotoPosition(memoryId, pctX, pctY) {
    if (!_supabaseClient) return;
    const op = { type: 'updatePhotoPos', memoryId, pctX, pctY };
    try {
      // Ensure the memory exists in Supabase first
      const { data: memExists } = await _supabaseClient.from('memories')
        .select('id').eq('id', memoryId).maybeSingle();
      
      if (!memExists) {
        // Memory doesn't exist yet, enqueue for later
        _enqueue(op);
        return;
      }

      const { error } = await _supabaseClient.from('memory_photos')
        .update({ pos_pct_x: pctX, pos_pct_y: pctY })
        .eq('memory_id', memoryId);
      if (error) throw error;
    } catch (e) {
      if (_isNetworkError(e)) { _enqueue(op); }
      else console.warn('pushPhotoPosition:', e.message);
    }
  }

  async function pushTextPosition(memoryId, pctX, pctY) {
    if (!_supabaseClient) return;
    const op = { type: 'updateTextPos', memoryId, pctX, pctY };
    try {
      const { error } = await _supabaseClient.from('memories')
        .update({ text_pct_x: pctX, text_pct_y: pctY })
        .eq('id', memoryId);
      if (error) throw error;
    } catch (e) {
      if (_isNetworkError(e)) { _enqueue(op); }
      else console.warn('pushTextPosition:', e.message);
    }
  }

  async function pushSticker(memoryId, sticker) {
    if (!_supabaseClient) return;
    const op = { type: 'upsertSticker', memoryId, sticker };
    try {
      // Ensure the memory exists in Supabase first
      const { data: memExists } = await _supabaseClient.from('memories')
        .select('id').eq('id', memoryId).maybeSingle();
      
      if (!memExists) {
        // Memory doesn't exist yet, enqueue for later
        _enqueue(op);
        return;
      }

      const row = {
        id: sticker.id,
        memory_id: memoryId,
        emoji: sticker.emoji,
        pos_pct_x: sticker.x,
        pos_pct_y: sticker.y,
        rotation_deg: sticker.rot,
        scale: sticker.scale
      };
      const { error } = await _supabaseClient.from('memory_stickers')
        .upsert(row, { onConflict: 'id' });
      if (error) throw error;
    } catch (e) {
      if (_isNetworkError(e)) { _enqueue(op); }
      else console.warn('pushSticker:', e.message);
    }
  }

  async function deleteSticker(stickerId) {
    if (!_supabaseClient) return;
    const op = { type: 'deleteSticker', stickerId };
    try {
      const { error } = await _supabaseClient.from('memory_stickers')
        .delete().eq('id', stickerId);
      if (error) throw error;
    } catch (e) {
      if (_isNetworkError(e)) { _enqueue(op); }
      else console.warn('deleteSticker:', e.message);
    }
  }

  async function deleteMemory(memoryId) {
    if (!_supabaseClient) return;
    const op = { type: 'deleteMemory', memoryId };
    try {
      // Delete storage objects for this memory's photos first
      const { data: photos } = await _supabaseClient.from('memory_photos')
        .select('storage_path').eq('memory_id', memoryId);
      if (photos && photos.length > 0) {
        const paths = photos.map(p => p.storage_path).filter(Boolean);
        if (paths.length > 0) {
          await _supabaseClient.storage.from('diary-photos').remove(paths);
        }
      }
      // Cascade delete in DB (photos and stickers cascade)
      const { error } = await _supabaseClient.from('memories').delete().eq('id', memoryId);
      if (error) throw error;
    } catch (e) {
      if (_isNetworkError(e)) { _enqueue(op); }
      else console.warn('deleteMemory:', e.message);
    }
  }

  /* ─────────────────────────────────────────────────────────
     OFFLINE QUEUE FLUSH
  ───────────────────────────────────────────────────────── */
  async function flushQueue() {
    if (_pendingQueue.length === 0) return;
    const toRetry = [..._pendingQueue];
    _pendingQueue = [];
    _saveQueue();
    for (const op of toRetry) {
      try {
        switch (op.type) {
          case 'upsertSpread':   await pushSpread(op.spreadNum); break;
          case 'upsertMemory':   await pushMemory(op.memory, op.spreadNum, op.pageSide, op.slotIndex); break;
          case 'uploadPhoto':    /* re-upload requires the original file; skip silently */ break;
          case 'updatePhotoPos': await pushPhotoPosition(op.memoryId, op.pctX, op.pctY); break;
          case 'updateTextPos':  await pushTextPosition(op.memoryId, op.pctX, op.pctY); break;
          case 'upsertSticker':  await pushSticker(op.memoryId, op.sticker); break;
          case 'deleteSticker':  await deleteSticker(op.stickerId); break;
          case 'deleteMemory':   await deleteMemory(op.memoryId); break;
        }
      } catch (e) {
        // Re-enqueue failed items
        _pendingQueue.push(op);
      }
    }
    _saveQueue();
  }

  // Listen for connectivity restore
  window.addEventListener('online', () => { flushQueue(); });

  /* ─────────────────────────────────────────────────────────
     NETWORK ERROR DETECTION
  ───────────────────────────────────────────────────────── */
  function _isNetworkError(e) {
    const msg = (e.message || '').toLowerCase();
    return msg.includes('network') || msg.includes('fetch') ||
           msg.includes('failed to fetch') || !navigator.onLine;
  }

  /* ─────────────────────────────────────────────────────────
     INIT
  ───────────────────────────────────────────────────────── */
  _loadQueue();

  return {
    isConfigured: () => _supabaseClient !== null,
    signIn, signOut, getSession, getRole,
    pull,
    pushSpread, pushMemory, pushPhoto,
    pushPhotoPosition, pushTextPosition,
    pushSticker, deleteSticker, deleteMemory,
    flushQueue
  };
})();
