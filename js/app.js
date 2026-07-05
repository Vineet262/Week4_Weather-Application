// app.js — Main Controller (wires everything together)

(() => {
  // ---------- State ----------
  let currentCity = CONFIG.DEFAULT_CITY;
  let currentUnit = Storage.getUnit();
  let autocompleteTimeout = null;
  let lastData = null;

  // ---------- Init ----------
  async function init() {
    await CONFIG.loadEnv(); // Read the .env file first
    UI.setUnitBtn(currentUnit);
    bindEvents();
    loadWeather(currentCity);
    refreshSidebar();
    // Update clock every minute
    setInterval(UI.updateDatetime, 60000);
  }

  // ---------- Load weather ----------
  async function loadWeather(city) {
    UI.showLoading();
    UI.clearAutocomplete();
    UI.els.searchInput.value = '';

    try {
      const data = await WeatherService.getWeather(city, currentUnit);
      lastData = data;
      currentCity = data.current.cityName || city;

      UI.renderCurrent(data);
      UI.renderHourly(data.hourly);
      UI.renderForecast(data.forecast);
      UI.setFavBtn(Storage.isFavorite(currentCity));
      Storage.addRecent(currentCity);
      refreshSidebar();
    } catch (err) {
      console.error('[App] Weather load error:', err);
      UI.showError(err.message || 'Failed to load weather. Check your connection.');
    } finally {
      UI.hideLoading();
    }
  }

  // ---------- Refresh sidebar lists ----------
  function refreshSidebar() {
    UI.renderFavorites(
      Storage.getFavorites(),
      city => loadWeather(city),
      city => { Storage.removeFavorite(city); refreshSidebar(); UI.setFavBtn(Storage.isFavorite(currentCity)); }
    );
    UI.renderRecent(
      Storage.getRecent(),
      city => loadWeather(city),
      city => { Storage.removeRecent(city); refreshSidebar(); }
    );
  }

  // ---------- Autocomplete ----------
  async function handleSearchInput(val) {
    clearTimeout(autocompleteTimeout);
    if (!val || val.length < 2) { UI.clearAutocomplete(); return; }
    autocompleteTimeout = setTimeout(async () => {
      try {
        const suggestions = await WeatherService.fetchAutocomplete(val);
        UI.renderAutocomplete(suggestions, city => {
          UI.clearAutocomplete();
          loadWeather(city);
        });
      } catch (e) { console.warn('[App] Autocomplete error:', e); }
    }, CONFIG.AUTOCOMPLETE_DELAY);
  }

  // ---------- Geolocation ----------
  function handleGeoLocate() {
    if (!navigator.geolocation) {
      UI.showError('Geolocation is not supported by your browser.');
      return;
    }
    UI.showLoading();
    navigator.geolocation.getCurrentPosition(
      async pos => {
        try {
          const data = await WeatherService.fetchByCoords(pos.coords.latitude, pos.coords.longitude, currentUnit);
          lastData = data;
          currentCity = data.current.cityName;
          UI.renderCurrent(data);
          UI.renderHourly(data.hourly);
          UI.renderForecast(data.forecast);
          UI.setFavBtn(Storage.isFavorite(currentCity));
          Storage.addRecent(currentCity);
          refreshSidebar();
        } catch (err) {
          UI.showError(err.message || 'Could not fetch weather for your location.');
        } finally {
          UI.hideLoading();
        }
      },
      err => {
        UI.hideLoading();
        UI.showError('Location access denied. Please search manually.');
        console.warn('[App] Geolocation error:', err);
      }
    );
  }

  // ---------- Share ----------
  function handleShare() {
    if (!lastData) return;
    const c = lastData.current;
    const text = `🌤️ Weather in ${c.cityName}: ${c.temp}, ${c.description}. Humidity: ${c.humidity}, Wind: ${c.windSpeed} via SkyWatch`;
    if (navigator.share) {
      navigator.share({ title: `${c.cityName} Weather`, text, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => {
        const btn = UI.els.shareBtn;
        const orig = btn.innerHTML;
        btn.innerHTML = '<span>✅</span> Copied!';
        setTimeout(() => { btn.innerHTML = orig; }, 2000);
      }).catch(() => UI.showError('Could not copy to clipboard.'));
    }
  }

  // ---------- Bind events ----------
  function bindEvents() {
    // Search input
    UI.els.searchInput.addEventListener('input', e => handleSearchInput(e.target.value.trim()));
    UI.els.searchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const val = e.target.value.trim();
        if (val) { UI.clearAutocomplete(); loadWeather(val); }
      }
      if (e.key === 'Escape') UI.clearAutocomplete();
    });

    // Hide autocomplete on outside click
    document.addEventListener('click', e => {
      if (!e.target.closest('.search-wrapper')) UI.clearAutocomplete();
    });

    // Geo button
    UI.els.geoBtn.addEventListener('click', handleGeoLocate);

    // Unit toggle
    UI.els.btnCelsius.addEventListener('click', () => {
      if (currentUnit === 'celsius') return;
      currentUnit = 'celsius';
      Storage.setUnit(currentUnit);
      UI.setUnitBtn(currentUnit);
      loadWeather(currentCity);
    });
    UI.els.btnFahrenheit.addEventListener('click', () => {
      if (currentUnit === 'fahrenheit') return;
      currentUnit = 'fahrenheit';
      Storage.setUnit(currentUnit);
      UI.setUnitBtn(currentUnit);
      loadWeather(currentCity);
    });

    // Retry button
    UI.els.retryBtn.addEventListener('click', () => {
      UI.hideError();
      loadWeather(currentCity);
    });

    // Share
    UI.els.shareBtn.addEventListener('click', handleShare);

    // Favorite toggle
    UI.els.favBtn.addEventListener('click', () => {
      if (!currentCity) return;
      if (Storage.isFavorite(currentCity)) {
        Storage.removeFavorite(currentCity);
        UI.setFavBtn(false);
      } else {
        Storage.addFavorite(currentCity);
        UI.setFavBtn(true);
      }
      refreshSidebar();
    });
  }

  // ---------- Start ----------
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
