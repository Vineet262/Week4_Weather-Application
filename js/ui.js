// ui.js — DOM Rendering & Display Logic

const UI = (() => {

  // ---------- Element refs ----------
  const $ = id => document.getElementById(id);

  const els = {
    bgLayer:        $('bgLayer'),
    loadingOverlay: $('loadingOverlay'),
    errorBanner:    $('errorBanner'),
    errorMsg:       $('errorMsg'),
    retryBtn:       $('retryBtn'),
    cityName:       $('cityName'),
    cityCountry:    $('cityCountry'),
    currentDatetime:$('currentDatetime'),
    mainWeatherEmoji:$('mainWeatherEmoji'),
    mainTemp:       $('mainTemp'),
    feelsLike:      $('feelsLike'),
    weatherDesc:    $('weatherDesc'),
    humidityVal:    $('humidityVal'),
    windVal:        $('windVal'),
    pressureVal:    $('pressureVal'),
    visibilityVal:  $('visibilityVal'),
    sunriseVal:     $('sunriseVal'),
    sunsetVal:      $('sunsetVal'),
    hourlyScroll:   $('hourlyScroll'),
    forecastList:   $('forecastList'),
    favList:        $('favList'),
    favEmpty:       $('favEmpty'),
    recentList:     $('recentList'),
    recentEmpty:    $('recentEmpty'),
    shareBtn:       $('shareBtn'),
    favBtn:         $('favBtn'),
    favIcon:        $('favIcon'),
    autocompleteList:$('autocompleteList'),
    searchInput:    $('searchInput'),
    btnCelsius:     $('btnCelsius'),
    btnFahrenheit:  $('btnFahrenheit'),
    geoBtn:         $('geoBtn'),
  };

  // ---------- Loading & Error ----------
  function showLoading() { els.loadingOverlay.classList.remove('hidden'); }
  function hideLoading() { els.loadingOverlay.classList.add('hidden'); }

  function showError(msg) {
    els.errorMsg.textContent = `⚠️ ${msg}`;
    els.errorBanner.classList.remove('hidden');
  }
  function hideError() { els.errorBanner.classList.add('hidden'); }

  // ---------- Theme ----------
  function applyTheme(weatherId, iconCode) {
    const body = document.body;
    const themes = ['theme-clear','theme-rain','theme-drizzle','theme-thunderstorm',
                    'theme-snow','theme-clouds','theme-fewclouds','theme-atmosphere','theme-night'];
    themes.forEach(t => body.classList.remove(t));

    let theme = 'theme-clear';
    
    // If it's night, use the night theme
    if (iconCode && iconCode.endsWith('n')) {
        theme = 'theme-night';
    } else {
        if (weatherId >= 200 && weatherId <= 232) theme = 'theme-thunderstorm';
        else if (weatherId >= 300 && weatherId <= 321) theme = 'theme-drizzle';
        else if (weatherId >= 500 && weatherId <= 531) theme = 'theme-rain';
        else if (weatherId >= 600 && weatherId <= 622) theme = 'theme-snow';
        else if (weatherId >= 700 && weatherId <= 781) theme = 'theme-atmosphere';
        else if (weatherId === 800) theme = 'theme-clear';
        else if (weatherId === 801 || weatherId === 802) theme = 'theme-fewclouds';
        else if (weatherId >= 803) theme = 'theme-clouds';
    }

    body.classList.add(theme);
  }

  // ---------- Current datetime ----------
  function updateDatetime() {
    const now = new Date();
    const opts = { weekday:'long', year:'numeric', month:'long', day:'numeric',
                   hour:'2-digit', minute:'2-digit' };
    if (els.currentDatetime) {
      els.currentDatetime.textContent = now.toLocaleDateString(undefined, opts);
    }
  }

  // ---------- Render current weather ----------
  function renderCurrent(data) {
    const c = data.current;
    hideError();
    updateDatetime();

    els.cityName.textContent      = c.cityName;
    els.cityCountry.textContent   = c.country ? `📍 ${c.country}` : '';
    els.mainWeatherEmoji.innerHTML = `<img src="${c.icon}" alt="Weather Icon" style="width: 80px; height: 80px; object-fit: contain;">`;
    els.mainTemp.textContent      = c.temp;
    els.feelsLike.textContent     = c.feelsLike;
    els.weatherDesc.textContent   = c.description;
    els.humidityVal.textContent   = c.humidity;
    els.windVal.textContent       = `${c.windSpeed} ${c.windDir}`;
    els.pressureVal.textContent   = c.pressure;
    els.visibilityVal.textContent = c.visibility;
    els.sunriseVal.textContent    = c.sunrise;
    els.sunsetVal.textContent     = c.sunset;

    applyTheme(c.weatherId, c.iconCode);
  }

  // ---------- Render hourly ----------
  function renderHourly(hourly) {
    els.hourlyScroll.innerHTML = hourly.map(h => `
      <div class="hourly-item" tabindex="0">
        <span class="hourly-time">${h.time}</span>
        <span class="hourly-icon"><img src="${h.icon}" alt="Icon" style="width: 40px; height: 40px;"></span>
        <span class="hourly-temp">${h.temp}</span>
        ${h.rain > 10 ? `<span class="hourly-rain">💧${h.rain}%</span>` : ''}
      </div>
    `).join('');
  }

  // ---------- Render 5-day forecast ----------
  function renderForecast(forecast) {
    els.forecastList.innerHTML = forecast.map(f => `
      <div class="forecast-item">
        <span class="forecast-day">${f.date}</span>
        <span class="forecast-icon"><img src="${f.icon}" alt="Icon" style="width: 40px; height: 40px;"></span>
        <span class="forecast-desc">${f.desc}</span>
        ${f.rain > 10 ? `<span class="hourly-rain" style="font-size:0.75rem">💧${f.rain}%</span>` : ''}
        <div class="forecast-temps">
          <span class="hi">${f.hi}</span>
          <span class="lo"> / ${f.lo}</span>
        </div>
      </div>
    `).join('');
  }

  // ---------- Render Favorites ----------
  function renderFavorites(favs, onSelect, onRemove) {
    if (!favs.length) {
      els.favEmpty.style.display = 'block';
      els.favList.innerHTML = '';
      return;
    }
    els.favEmpty.style.display = 'none';
    els.favList.innerHTML = favs.map(f => `
      <div class="fav-item" role="button" tabindex="0" aria-label="Load ${f}">
        <span>⭐ ${f}</span>
        <button class="fav-remove" data-city="${f}" aria-label="Remove ${f} from favorites" title="Remove">✕</button>
      </div>
    `).join('');

    els.favList.querySelectorAll('.fav-item').forEach(item => {
      item.addEventListener('click', e => {
        if (!e.target.classList.contains('fav-remove')) {
          const city = item.querySelector('span').textContent.replace('⭐ ', '').trim();
          onSelect(city);
        }
      });
      item.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.target.classList.contains('fav-remove')) {
          const city = item.querySelector('span').textContent.replace('⭐ ', '').trim();
          onSelect(city);
        }
      });
    });
    els.favList.querySelectorAll('.fav-remove').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        onRemove(btn.dataset.city);
      });
    });
  }

  // ---------- Render Recent ----------
  function renderRecent(recent, onSelect, onRemove) {
    if (!recent.length) {
      els.recentEmpty.style.display = 'block';
      els.recentList.innerHTML = '';
      return;
    }
    els.recentEmpty.style.display = 'none';
    els.recentList.innerHTML = recent.map(r => `
      <div class="recent-item" role="button" tabindex="0" aria-label="Load ${r}">
        <span>🕐 ${r}</span>
        <button class="recent-remove" data-city="${r}" aria-label="Remove ${r}" title="Remove">✕</button>
      </div>
    `).join('');

    els.recentList.querySelectorAll('.recent-item').forEach(item => {
      item.addEventListener('click', e => {
        if (!e.target.classList.contains('recent-remove')) {
          const city = item.querySelector('span').textContent.replace('🕐 ', '').trim();
          onSelect(city);
        }
      });
      item.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.target.classList.contains('recent-remove')) {
          const city = item.querySelector('span').textContent.replace('🕐 ', '').trim();
          onSelect(city);
        }
      });
    });
    els.recentList.querySelectorAll('.recent-remove').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        onRemove(btn.dataset.city);
      });
    });
  }

  // ---------- Autocomplete ----------
  function renderAutocomplete(suggestions, onSelect) {
    els.autocompleteList.innerHTML = '';
    if (!suggestions.length) return;
    suggestions.forEach(s => {
      const li = document.createElement('li');
      li.setAttribute('role', 'option');
      li.innerHTML = `📍 <strong>${s.name}</strong>${s.country ? `, ${s.country}` : ''}${s.state ? ` — ${s.state}` : ''}`;
      li.addEventListener('click', () => onSelect(s.name));
      els.autocompleteList.appendChild(li);
    });
  }
  function clearAutocomplete() { els.autocompleteList.innerHTML = ''; }

  // ---------- Fav button state ----------
  function setFavBtn(isFav) {
    if (isFav) {
      els.favBtn.classList.add('active');
      els.favIcon.textContent = '❤️';
    } else {
      els.favBtn.classList.remove('active');
      els.favIcon.textContent = '🤍';
    }
  }

  // ---------- Unit buttons ----------
  function setUnitBtn(unit) {
    if (unit === 'celsius') {
      els.btnCelsius.classList.add('active');
      els.btnCelsius.setAttribute('aria-pressed','true');
      els.btnFahrenheit.classList.remove('active');
      els.btnFahrenheit.setAttribute('aria-pressed','false');
    } else {
      els.btnFahrenheit.classList.add('active');
      els.btnFahrenheit.setAttribute('aria-pressed','true');
      els.btnCelsius.classList.remove('active');
      els.btnCelsius.setAttribute('aria-pressed','false');
    }
  }

  return {
    els,
    showLoading, hideLoading,
    showError, hideError,
    renderCurrent, renderHourly, renderForecast,
    renderFavorites, renderRecent,
    renderAutocomplete, clearAutocomplete,
    setFavBtn, setUnitBtn,
    updateDatetime,
  };
})();
