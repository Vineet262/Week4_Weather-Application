// storage.js — LocalStorage Service (Cache, Favorites, Recent Searches)

const STORAGE_KEYS = {
  CACHE:     'skywatch_cache',
  FAVORITES: 'skywatch_favorites',
  RECENT:    'skywatch_recent',
  UNIT:      'skywatch_unit',
};

const Storage = (() => {
  // --- Generic helpers ---
  function _get(key) {
    try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
  }
  function _set(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {
      console.warn('[Storage] Could not write:', e);
    }
  }

  // --- Weather Cache ---
  const cache = new Map(); // in-memory (fastest)

  function cacheKey(city, unit) { return `${city.toLowerCase()}_${unit}`; }

  function getCached(city, unit) {
    const k = cacheKey(city, unit);
    // 1. In-memory
    if (cache.has(k)) {
      const entry = cache.get(k);
      if (Date.now() - entry.ts < CONFIG.CACHE_DURATION) return entry.data;
      cache.delete(k);
    }
    // 2. LocalStorage
    const store = _get(STORAGE_KEYS.CACHE) || {};
    const entry = store[k];
    if (entry && Date.now() - entry.ts < CONFIG.CACHE_DURATION) {
      cache.set(k, entry); // promote to in-memory
      return entry.data;
    }
    return null;
  }

  function setCache(city, unit, data) {
    const k = cacheKey(city, unit);
    const entry = { ts: Date.now(), data };
    cache.set(k, entry);
    const store = _get(STORAGE_KEYS.CACHE) || {};
    store[k] = entry;
    _set(STORAGE_KEYS.CACHE, store);
  }

  function clearCache() {
    cache.clear();
    _set(STORAGE_KEYS.CACHE, {});
  }

  // --- Favorites ---
  function getFavorites() { return _get(STORAGE_KEYS.FAVORITES) || []; }

  function addFavorite(city) {
    const favs = getFavorites();
    if (!favs.some(f => f.toLowerCase() === city.toLowerCase())) {
      favs.unshift(city);
      _set(STORAGE_KEYS.FAVORITES, favs.slice(0, 10));
    }
    return getFavorites();
  }

  function removeFavorite(city) {
    const favs = getFavorites().filter(f => f.toLowerCase() !== city.toLowerCase());
    _set(STORAGE_KEYS.FAVORITES, favs);
    return favs;
  }

  function isFavorite(city) {
    return getFavorites().some(f => f.toLowerCase() === city.toLowerCase());
  }

  // --- Recent Searches ---
  function getRecent() { return _get(STORAGE_KEYS.RECENT) || []; }

  function addRecent(city) {
    let recent = getRecent().filter(r => r.toLowerCase() !== city.toLowerCase());
    recent.unshift(city);
    _set(STORAGE_KEYS.RECENT, recent.slice(0, 8));
    return getRecent();
  }

  function removeRecent(city) {
    const recent = getRecent().filter(r => r.toLowerCase() !== city.toLowerCase());
    _set(STORAGE_KEYS.RECENT, recent);
    return recent;
  }

  // --- Unit Preference ---
  function getUnit() { return _get(STORAGE_KEYS.UNIT) || CONFIG.DEFAULT_UNIT; }
  function setUnit(unit) { _set(STORAGE_KEYS.UNIT, unit); }

  return { getCached, setCache, clearCache, getFavorites, addFavorite, removeFavorite, isFavorite, getRecent, addRecent, removeRecent, getUnit, setUnit };
})();
