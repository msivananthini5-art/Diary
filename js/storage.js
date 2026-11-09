/* ============================================================
   STORAGE.JS — localStorage persistence for SABI diary
   Saves and loads the complete diary state:
   - Pages with multiple memory blocks per page
   - Each memory has date, title, text, photos (base64), notes
   - Handles new format (pages) and legacy format (spreads)
   ============================================================ */

const DiaryStorage = (() => {

  const STORAGE_KEY = 'sabi_diary_v1';

  /* ── Save the complete diary state ── */
  function save(diaryState) {
    try {
      let payload;
      
      if (Array.isArray(diaryState)) {
        // Legacy format - old spreads array
        payload = {
          version: 1,
          format: 'spreads_legacy',
          savedAt: new Date().toISOString(),
          spreads: diaryState
        };
      } else if (diaryState && diaryState.spreads) {
        // Current format - spreads array with leftMemories/rightMemories
        payload = {
          version: 3,
          format: 'spreads',
          savedAt: new Date().toISOString(),
          spreads: diaryState.spreads,
          currentSpreadIndex: diaryState.currentSpreadIndex || 0
        };
      } else {
        console.warn('DiaryStorage: Invalid diary state format');
        return false;
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      return true;
    } catch (e) {
      console.warn('DiaryStorage: save failed —', e.message);
      return false;
    }
  }

  /* ── Load the complete diary state ── */
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      
      const payload = JSON.parse(raw);
      if (!payload) return null;
      
      // Detect format and return appropriate structure
      if (payload.format === 'spreads' && payload.spreads) {
        // Current format - spreads with left/right memories
        return {
          spreads: payload.spreads,
          currentSpreadIndex: payload.currentSpreadIndex || 0
        };
      } else if (payload.format === 'pages' && payload.pages) {
        // Old pages format - return null to start fresh
        console.log('DiaryStorage: Found legacy pages format. Starting fresh.');
        return null;
      } else if (payload.spreads && Array.isArray(payload.spreads)) {
        // Legacy spreads format - return as-is
        return {
          spreads: payload.spreads,
          currentSpreadIndex: payload.currentSpreadIndex || 0
        };
      }
      
      return null;
    } catch (e) {
      console.warn('DiaryStorage: load failed —', e.message);
      return null;
    }
  }

  /* ── Clear all saved data ── */
  function clear() {
    localStorage.removeItem(STORAGE_KEY);
  }

  /* ── Clear all old storage keys ── */
  function clearAll() {
    // Remove the current storage key
    localStorage.removeItem(STORAGE_KEY);
    // Remove any old diary keys
    Object.keys(localStorage).forEach(key => {
      if (key.includes('diary') || key.includes('sabi') || key.includes('spread')) {
        localStorage.removeItem(key);
      }
    });
  }

  /* ── Check if saved data exists ── */
  function hasSavedData() {
    return localStorage.getItem(STORAGE_KEY) !== null;
  }

  /* ── Export diary as a downloadable JSON file ── */
  function exportJSON(spreadsData) {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      spreads: spreadsData
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'sabi-diary-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  /* ── Import diary from a JSON file ── */
  function importJSON(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const payload = JSON.parse(e.target.result);
        if (payload && Array.isArray(payload.spreads)) {
          callback(null, payload.spreads);
        } else {
          callback(new Error('Invalid diary file format'));
        }
      } catch (err) {
        callback(err);
      }
    };
    reader.readAsText(file);
  }

  return { save, load, clear, clearAll, hasSavedData, exportJSON, importJSON };

})();
