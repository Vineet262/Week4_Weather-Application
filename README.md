# SkyWatch — Real-Time Weather Dashboard
### Week 4 Assignment | Weather Application with API Integration

![Weather App](https://img.shields.io/badge/Weather-App-blue?style=for-the-badge&logo=cloud)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

---

## 🌤️ Overview

**SkyWatch** is a premium weather dashboard built with vanilla HTML, CSS, and JavaScript. It features real-time weather data from the [OpenWeatherMap API](https://openweathermap.org/api), a glassmorphism UI, animated weather themes, and comprehensive forecast data — all with zero external dependencies.

---

## ✨ Features

| Feature | Status |
|---|---|
| Current weather display | ✅ |
| 5-day weather forecast | ✅ |
| Hourly forecast (24h) | ✅ |
| City search with autocomplete | ✅ |
| Temperature unit conversion (°C / °F) | ✅ |
| Geolocation (auto-detect city) | ✅ |
| Favorite cities | ✅ |
| Recent search history | ✅ |
| LocalStorage caching (10min) | ✅ |
| Animated weather-themed backgrounds | ✅ |
| Error handling & retry | ✅ |
| Loading states | ✅ |
| Share weather | ✅ |
| Responsive (mobile/tablet/desktop) | ✅ |
| Keyboard navigation | ✅ |
| Accessibility (ARIA) | ✅ |
| Detailed JSDoc code comments | ✅ |

---

## 🗂️ Project Structure

```
week4-weather-app/
├── index.html                 # Main application entry point
├── css/
│   ├── style.css              # Core styles (glassmorphism, layout, components)
│   ├── weather-icons.css      # Weather animations (rain, snow, lightning, etc.)
│   └── responsive.css         # Responsive breakpoints (mobile → desktop)
├── js/
│   ├── config.js              # API key, endpoints, constants, theme mapping
│   ├── storage.js             # LocalStorage service (cache, favorites, recent)
│   ├── weatherService.js      # OpenWeatherMap API integration layer
│   ├── ui.js                  # DOM rendering & display logic
│   └── app.js                 # Main controller (wires everything together)
├── assets/
│   ├── icons/                 # Custom SVG weather icons
│   │   ├── clear.svg
│   │   ├── cloudy.svg
│   │   ├── fog.svg
│   │   ├── partly-cloudy.svg
│   │   ├── rain.svg
│   │   ├── snow.svg
│   │   └── thunderstorm.svg
│   └── images/                # Background themes
│       ├── bg_clear.png
│       ├── bg_cloudy.png
│       ├── bg_fog.png
│       ├── bg_rain.png
│       ├── bg_snow.png
│       └── bg_thunderstorm.png
├── .env.example               # API key configuration template
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start

1. **Get your free API key** from [openweathermap.org/api](https://openweathermap.org/api)
   - Sign up → Go to **API Keys** tab → Copy your key

2. **Configure the key** by creating a `.env` file in the root directory:
   ```env
   OPENWEATHER_API_KEY=your_actual_api_key_here
   ```
   *(Note: The `.env` file is in your `.gitignore` to keep your key out of GitHub!)*

3. **Run a local web server**. 
   Because the application securely reads the `.env` file using JavaScript `fetch`, it **must** be run on a local web server (browsers block reading local files directly).
   - **VS Code**: Right-click `index.html` and select **Open with Live Server**.
   - **Node.js**: Run `npx http-server` in the project directory.

> **Note:** Free tier supports 60 API calls/minute. Caching reduces actual calls significantly.

---

## 🔑 API Endpoints Used

| Endpoint | Purpose |
|---|---|
| `/data/2.5/weather` | Current weather by city name |
| `/data/2.5/weather?lat&lon` | Current weather by coordinates |
| `/data/2.5/forecast` | 5-day / 3-hour forecast |
| `/geo/1.0/direct` | City name → coordinates (autocomplete) |
| `/geo/1.0/reverse` | Coordinates → city name (geolocation) |

---

## 🎨 Design System

- **Typography:** Inter (body) + Outfit (display/headings) — Google Fonts
- **Effect:** Glassmorphism (`backdrop-filter: blur`) with dynamic gradient backgrounds
- **Theme:** Changes automatically based on weather condition (sunny, rainy, stormy, snowy, etc.)
- **Animations:** CSS keyframes — floating orbs, pulse, fadeInUp, weather-specific effects
- **Colors:** Dynamic per-weather-condition; uses HSL-tuned, curated palettes

---

## ⚙️ Configuration (`js/config.js`)

| Option | Default | Description |
|---|---|---|
| `API_KEY` | `''` | Loaded dynamically from `.env` file |
| `DEMO_MODE` | `false` | Use mock data when true (currently inactive) |
| `CACHE_DURATION` | `600000` (10 min) | LocalStorage cache TTL in ms |
| `FORECAST_DAYS` | `5` | Days in forecast |
| `AUTOCOMPLETE_LIMIT` | `5` | Max autocomplete suggestions |
| `AUTOCOMPLETE_DELAY` | `300` | Debounce delay (ms) |
| `DEFAULT_CITY` | `'London'` | Startup city |

---

## 📦 Caching Strategy

```
API Request
    ↓
Check In-memory Map (fastest)
    ↓ miss
Check LocalStorage (10-min TTL)
    ↓ miss
Fetch from OpenWeatherMap API
    ↓
Store in both caches
    ↓
Return data
```

---

## 🧩 Architecture

```
app.js (Controller)
  ├── storage.js     (LocalStorage CRUD)
  ├── weatherService.js (API fetching)
  └── ui.js          (DOM rendering)
        └── config.js (Constants & themes)
```

---

## 📱 Responsive Breakpoints

| Breakpoint | Layout |
|---|---|
| `< 400px` | 2-column details, 3-day forecast |
| `< 640px` | Single column, stacked search |
| `640px – 768px` | 3-column forecast grid |
| `768px – 1023px` | 2-column sidebar grid |
| `≥ 1024px` | 2-column layout (main + sidebar) |

---

## 🔒 Security Notes

- The API key is securely loaded from a `.env` file that is ignored by Git, ensuring your key is **never** committed to a public repository (perfect for code reviews!).
- Because the `.env` file is fetched by the browser, it is still visible in the Network tab. For true production environments, you should use a backend proxy to completely hide your API key.

---

## 📋 Assignment Checklist

- [x] Fetch data from OpenWeatherMap API (or similar)
- [x] Display current weather and 5-day forecast
- [x] Implement city search with autocomplete
- [x] Temperature unit conversion (°C / °F)
- [x] Responsive design for all devices
- [x] Error handling for API failures
- [x] Data caching with localStorage
- [x] User-friendly loading states
- [x] Favorite cities functionality
- [x] Location detection (geolocation API)
- [x] Share functionality
- [x] Comprehensive code comments (JSDoc) for readability

---

## 🙏 Credits

- Weather data: [OpenWeatherMap](https://openweathermap.org)
- Fonts: [Google Fonts](https://fonts.google.com) (Inter, Outfit)
- Design inspiration: Modern glassmorphism UI patterns
