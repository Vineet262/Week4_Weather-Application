// storage.js — LocalStorage Service (Cache, Favorites, Recent Searches)

const STORAGE_KEYS = {
  CACHE:     'skywatch_cache',
  FAVORITES: 'skywatch_favorites',
  RECENT:    'skywatch_recent',
  UNIT:      'skywatch_unit',
};

const Storage = (() => {
  // --- Generic helpers ---
  /**
   * Safely retrieves and parses a JSON object from LocalStorage.
   * @param {string} key - The LocalStorage key
   * @returns {any|null} The parsed object or null if it doesn't exist/fails
   */
  function _get(key) {
    try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
  }
  /**
   * Safely stringifies and saves a value to LocalStorage.
   * @param {string} key - The LocalStorage key
   * @param {any} val - The value to store
   */
  function _set(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {
      console.warn('[Storage] Could not write:', e);
    }
  }

  // --- Weather Cache ---
  const cache = new Map(); // in-memory (fastest)

  function cacheKey(city, unit) { return `${city.toLowerCase()}_${unit}`; }

  function cacheKey(city, unit) { return `${city.toLowerCase()}_${unit}`; }

  /**
   * Retrieves weather data from cache if it is fresh (under 10 minutes old).
   * Checks the fast in-memory map first, then falls back to LocalStorage.
   * @param {string} city - The city name
   * @param {string} unit - The temperature unit ('celsius' or 'fahrenheit')
   * @returns {object|null} The cached data, or null if expired/not found
   */
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

  /**
   * Saves weather data to both the in-memory cache and LocalStorage.
   * @param {string} city - The city name
   * @param {string} unit - The temperature unit
   * @param {object} data - The weather data payload to cache
   */
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
  /**
   * Returns the list of favorited cities from LocalStorage.
   * @returns {string[]} Array of city names
   */
  function getFavorites() { return _get(STORAGE_KEYS.FAVORITES) || []; }

  /**
   * Adds a new city to the beginning of the favorites list.
   * Limits the list to a maximum of 10 items.
   * @param {string} city - The city to add
   * @returns {string[]} The updated favorites array
   */
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
  /**
   * Returns the list of recent searches from LocalStorage.
   * @returns {string[]} Array of city names
   */
  function getRecent() { return _get(STORAGE_KEYS.RECENT) || []; }

  /**
   * Adds a city to the recent searches list, moving it to the top if it exists.
   * Limits the list to a maximum of 8 items.
   * @param {string} city - The city to add
   * @returns {string[]} The updated recent searches array
   */
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
