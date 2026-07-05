// weatherService.js — OpenWeatherMap API Integration Layer

const WeatherService = (() => {

  // ---------- Fetch helpers ----------
  async function _fetch(url) {
    const res = await fetch(url);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status}`);
    }
    return res.json();
  }

  // ---------- Unit helpers ----------
  function toApiUnit(unit) { return unit === 'fahrenheit' ? 'imperial' : 'metric'; }
  function tempSymbol(unit) { return unit === 'fahrenheit' ? '°F' : '°C'; }

  // ---------- Live API mode ----------
  async function fetchFromAPI(city, unit) {
    const apiUnit = toApiUnit(unit);
    const sym = tempSymbol(unit);

    // Geocode
    const geoUrl = `${CONFIG.GEO_URL}${CONFIG.ENDPOINTS.GEO_DIRECT}?q=${encodeURIComponent(city)}&limit=1&appid=${CONFIG.API_KEY}`;
    const geoData = await _fetch(geoUrl);
    if (!geoData.length) throw new Error(`City "${city}" not found`);
    const { lat, lon, name, country } = geoData[0];

    // Current weather
    const curUrl = `${CONFIG.BASE_URL}${CONFIG.ENDPOINTS.CURRENT}?lat=${lat}&lon=${lon}&units=${apiUnit}&appid=${CONFIG.API_KEY}`;
    const cur = await _fetch(curUrl);

    // 5-day forecast
    const fUrl = `${CONFIG.BASE_URL}${CONFIG.ENDPOINTS.FORECAST}?lat=${lat}&lon=${lon}&units=${apiUnit}&cnt=40&appid=${CONFIG.API_KEY}`;
    const fData = await _fetch(fUrl);

    const fmtTime = ts => new Date(ts * 1000).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
    const fmtDay  = ts => new Date(ts * 1000).toLocaleDateString([], { weekday: 'short' });

    // Daily forecast: pick noon entry per day
    const days = {};
    fData.list.forEach(item => {
      const d = new Date(item.dt * 1000);
      const key = d.toDateString();
      const hour = d.getHours();
      if (!days[key] || Math.abs(hour - 12) < Math.abs(new Date(days[key].dt*1000).getHours() - 12)) {
        days[key] = item;
      }
    });
    const forecastItems = Object.values(days).slice(0, CONFIG.FORECAST_DAYS);

    // Hourly: next 24 entries (3h each)
    const hourly = fData.list.slice(0, 8).map(item => ({
      time: fmtTime(item.dt),
      icon: getIconPath(item.weather[0].icon),
      temp: `${Math.round(item.main.temp)}${sym}`,
      rain: Math.round((item.pop || 0) * 100),
    }));

    return {
      current: {
        cityName: name || city,
        country,
        lat, lon,
        weatherId: cur.weather[0].id,
        iconCode: cur.weather[0].icon,
        icon: getIconPath(cur.weather[0].icon),
        description: cur.weather[0].description,
        temp:      `${Math.round(cur.main.temp)}${sym}`,
        feelsLike: `${Math.round(cur.main.feels_like)}${sym}`,
        tempMin:   `${Math.round(cur.main.temp_min)}${sym}`,
        tempMax:   `${Math.round(cur.main.temp_max)}${sym}`,
        humidity:  `${cur.main.humidity}%`,
        pressure:  `${cur.main.pressure} hPa`,
        visibility:`${(cur.visibility/1000).toFixed(1)} km`,
        windSpeed: `${cur.wind.speed} m/s`,
        windDeg:   cur.wind.deg,
        windDir:   getWindDirection(cur.wind.deg),
        sunrise:   fmtTime(cur.sys.sunrise),
        sunset:    fmtTime(cur.sys.sunset),
      },
      forecast: forecastItems.map(f => ({
        date: fmtDay(f.dt),
        icon: getIconPath(f.weather[0].icon),
        desc: f.weather[0].description,
        hi:   `${Math.round(f.main.temp_max)}${sym}`,
        lo:   `${Math.round(f.main.temp_min)}${sym}`,
        rain: Math.round((f.pop || 0) * 100),
      })),
      hourly,
    };
  }

  // ---------- Geolocation ----------
  async function fetchByCoords(lat, lon, unit) {
    const apiUnit = toApiUnit(unit);
    const sym = tempSymbol(unit);

    const geoUrl = `${CONFIG.GEO_URL}${CONFIG.ENDPOINTS.GEO_REVERSE}?lat=${lat}&lon=${lon}&limit=1&appid=${CONFIG.API_KEY}`;
    const geoData = await _fetch(geoUrl);
    const city = geoData[0]?.name || 'Your Location';
    return fetchFromAPI(city, unit);
  }

  // ---------- Autocomplete ----------
  async function fetchAutocomplete(query) {
    if (!query || query.length < 2) return [];
    const url = `${CONFIG.GEO_URL}${CONFIG.ENDPOINTS.GEO_DIRECT}?q=${encodeURIComponent(query)}&limit=${CONFIG.AUTOCOMPLETE_LIMIT}&appid=${CONFIG.API_KEY}`;
    const data = await _fetch(url);
    return data.map(d => ({ name: d.name, country: d.country, state: d.state || '' }));
  }

  // ---------- Public: getWeather ----------
  async function getWeather(city, unit) {
    // Check cache
    const cached = Storage.getCached(city, unit);
    if (cached) return cached;

    let data = await fetchFromAPI(city, unit);

    Storage.setCache(city, unit, data);
    return data;
  }

  // ---------- Emoji mapping for live API ----------
  function weatherIdToEmoji(id) {
    if (id >= 200 && id <= 232) return '⛈️';
    if (id >= 300 && id <= 321) return '🌦️';
    if (id >= 500 && id <= 531) return '🌧️';
    if (id >= 600 && id <= 622) return '❄️';
    if (id >= 700 && id <= 781) return '🌫️';
    if (id === 800)              return '☀️';
    if (id === 801 || id === 802) return '⛅';
    if (id >= 803)               return '☁️';
    return '🌡️';
  }

  function getIconPath(iconCode) {
    // If it's a night icon (ends with 'n'), or we want perfect accuracy, 
    // we use OpenWeatherMap's official icons so you get moons at night!
    if (iconCode.endsWith('n')) {
        return `${CONFIG.ICON_URL}/${iconCode}@4x.png`;
    }

    // Otherwise use our pretty SVGs for daytime
    const code = iconCode.slice(0, 2);
    switch (code) {
      case '01': return 'assets/icons/clear.svg';
      case '02': return 'assets/icons/partly-cloudy.svg';
      case '03': 
      case '04': return 'assets/icons/cloudy.svg';
      case '09': 
      case '10': return 'assets/icons/rain.svg';
      case '11': return 'assets/icons/thunderstorm.svg';
      case '13': return 'assets/icons/snow.svg';
      case '50': return 'assets/icons/fog.svg';
      default:   return `${CONFIG.ICON_URL}/${iconCode}@4x.png`;
    }
  }

  return { getWeather, fetchByCoords, fetchAutocomplete };
})();
