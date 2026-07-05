// config.js - API Configuration and Constants

const CONFIG = {
    API_KEY: '', // This will be loaded dynamically from the .env file

    BASE_URL: 'https://api.openweathermap.org/data/2.5',
    GEO_URL: 'https://api.openweathermap.org/geo/1.0',
    ICON_URL: 'https://openweathermap.org/img/wn',

    ENDPOINTS: {
        CURRENT: '/weather',
        FORECAST: '/forecast',
        GEO_DIRECT: '/direct',
        GEO_REVERSE: '/reverse',
    },

    CACHE_DURATION: 10 * 60 * 1000, // 10 minutes in ms
    FORECAST_DAYS: 5,

    DEFAULT_CITY: 'London',
    DEFAULT_UNIT: 'celsius', // 'celsius' | 'fahrenheit'

    AUTOCOMPLETE_LIMIT: 5,
    AUTOCOMPLETE_DELAY: 300, // ms debounce delay

    DEMO_MODE: false,

    async loadEnv() {
        try {
            // Fetch the .env file directly
            const response = await fetch('.env');
            if (!response.ok) throw new Error('Cannot find .env file');
            
            const text = await response.text();
            
            // Extract the API key using a regular expression
            const match = text.match(/OPENWEATHER_API_KEY=(.*)/);
            if (match) {
                this.API_KEY = match[1].trim();
            } else {
                console.warn('OPENWEATHER_API_KEY not found in .env');
            }
        } catch (error) {
            console.error('Failed to load .env file. Note: This will only work if you are running a local web server (like Live Server) because browsers cannot read local files directly.', error);
        }
    }
};

// Weather condition code ranges for background theming
const WEATHER_THEMES = {
    thunderstorm: { range: [200, 232], gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)', icon: '⛈️' },
    drizzle:      { range: [300, 321], gradient: 'linear-gradient(135deg, #4a6fa5 0%, #6b8dd6 50%, #8eb8e5 100%)', icon: '🌦️' },
    rain:         { range: [500, 531], gradient: 'linear-gradient(135deg, #2c3e50 0%, #3d5a80 50%, #4a7c95 100%)', icon: '🌧️' },
    snow:         { range: [600, 622], gradient: 'linear-gradient(135deg, #a8c6fa 0%, #c9d8fb 50%, #e8f0fe 100%)', icon: '❄️' },
    atmosphere:   { range: [701, 781], gradient: 'linear-gradient(135deg, #8c9ea6 0%, #a8b8c2 50%, #c4d0d8 100%)', icon: '🌫️' },
    clear:        { range: [800, 800], gradient: 'linear-gradient(135deg, #1e90ff 0%, #00bcd4 50%, #87ceeb 100%)', icon: '☀️' },
    fewClouds:    { range: [801, 802], gradient: 'linear-gradient(135deg, #1565c0 0%, #1976d2 50%, #42a5f5 100%)', icon: '⛅' },
    clouds:       { range: [803, 804], gradient: 'linear-gradient(135deg, #546e7a 0%, #78909c 50%, #90a4ae 100%)', icon: '☁️' },
};

// Wind direction mapping
const WIND_DIRECTIONS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

function getWindDirection(degrees) {
    const index = Math.round(degrees / 22.5) % 16;
    return WIND_DIRECTIONS[index];
}

function getWeatherTheme(weatherId) {
    for (const [key, theme] of Object.entries(WEATHER_THEMES)) {
        if (weatherId >= theme.range[0] && weatherId <= theme.range[1]) {
            return theme;
        }
    }
    return WEATHER_THEMES.clear;
}
