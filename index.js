document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT REFERENCES ---
    const clockContainer = document.getElementById('clock-container');
    const dateContainer = document.getElementById('date-container');
    const weatherContainer = document.getElementById('weather-container');
    const temperatureEl = document.getElementById('temperature');
    const weatherIconEl = document.getElementById('weather-icon');
    const topBar = document.getElementById('top-bar');
    const controlsTrigger = document.getElementById('controls-trigger');
    const controlShade = document.getElementById('control-shade');
    const shadeOverlay = document.getElementById('shade-overlay');
    const appDrawer = document.getElementById('app-drawer');
    const drawerOverlay = document.getElementById('drawer-overlay');
    const mainUI = document.getElementById('main-ui');
    const bottomPill = document.getElementById('bottom-pill');
    const quickControlsGrid = document.querySelector('.quick-controls-grid');

    let currentLanguage = LANG_EN; // Default

    // --- STATE MANAGEMENT ---
    let settings = {
        theme: 'dark',
        showSeconds: true,
        use12HourFormat: false,
        showWeather: true,
        isSilent: false,
        isFocus: false,
        tone: 0,
        // ... add all other settings with defaults
    };

    // --- INITIALIZATION ---
    function init() {
        loadSettings();
        applySettings();
        setupEventListeners();
        updateClockAndDate();
        setInterval(updateClockAndDate, 1000);
        updateWeather();
        setInterval(updateWeather, 600000); // Every 10 mins
        populateControls();
        populateApps();
    }

    // --- SETTINGS ---
    function loadSettings() {
        const savedSettings = JSON.parse(localStorage.getItem('polygolMiniSettings'));
        if (savedSettings) {
            settings = { ...settings, ...savedSettings };
        }
        // Load language separately
        const savedLang = localStorage.getItem('polygolMiniLang') || 'EN';
        // You would have a function to set the language object based on the code
        // currentLanguage = getLanguageObject(savedLang);
    }

    function saveSettings() {
        localStorage.setItem('polygolMiniSettings', JSON.stringify(settings));
    }

    function applySettings() {
        // Apply theme
        document.body.classList.toggle('light-theme', settings.theme === 'light');
        
        // Apply weather visibility
        weatherContainer.style.display = settings.showWeather ? 'inline-flex' : 'none';

        // ... apply other settings like clock font, etc.
    }

    // --- UI INTERACTIONS ---
    function toggleControlShade(show) {
        controlShade.classList.toggle('visible', show);
        shadeOverlay.classList.toggle('visible', show);
    }

    function toggleAppDrawer(show) {
        appDrawer.classList.toggle('visible', show);
        drawerOverlay.classList.toggle('visible', show);
        mainUI.style.filter = show ? 'blur(10px) brightness(0.7)' : 'none';
        topBar.style.opacity = show ? '0' : '1';
        bottomPill.style.opacity = show ? '0' : '1';
    }
    
    // --- EVENT LISTENERS ---
    function setupEventListeners() {
        controlsTrigger.addEventListener('click', () => toggleControlShade(true));
        shadeOverlay.addEventListener('click', () => toggleControlShade(false));
        drawerOverlay.addEventListener('click', () => toggleAppDrawer(false));

        // Swipe down for control shade
        let touchStartY = 0;
        window.addEventListener('touchstart', (e) => { touchStartY = e.touches[0].clientY; });
        window.addEventListener('touchend', (e) => {
            if (touchStartY < 50 && e.changedTouches[0].clientY > touchStartY + 50) {
                toggleControlShade(true);
            }
        });
        
        // Swipe up for app drawer
        window.addEventListener('touchend', (e) => {
            const pillRect = bottomPill.getBoundingClientRect();
            if (touchStartY > pillRect.top && e.changedTouches[0].clientY < touchStartY - 50) {
                 toggleAppDrawer(true);
            }
        });
    }

    // --- DYNAMIC CONTENT ---
    function populateControls() {
        quickControlsGrid.innerHTML = ''; // Clear existing
        const controls = [
            { id: 'silent', icon: 'notifications_off', label: 'SILENT', value: settings.isSilent },
            { id: 'tone', icon: 'thermostat', label: 'TONE', value: settings.tone },
            { id: 'focus', icon: 'filter_tilt_shift', label: 'MINIMAL', value: settings.isFocus },
            { id: 'daylight', icon: 'brightness_6', label: 'DAYLIGHT', value: settings.theme === 'light' },
            // Add other controls here
        ];

        controls.forEach(control => {
            const tile = document.createElement('div');
            tile.className = 'control-tile';
            tile.classList.toggle('active', control.value);
            tile.innerHTML = `
                <span class="tile-icon material-symbols-rounded">${control.icon}</span>
                <span class="tile-label">${currentLanguage[control.label] || control.label}</span>
                ${control.id === 'tone' ? `<span class="tile-value">${control.value}</span>` : ''}
            `;
            // Add click handlers to toggle settings
            tile.addEventListener('click', () => handleControlClick(control.id, tile));
            quickControlsGrid.appendChild(tile);
        });
    }
    
    function handleControlClick(id, tile) {
        switch(id) {
            case 'silent':
                settings.isSilent = !settings.isSilent;
                break;
            case 'daylight':
                settings.theme = (settings.theme === 'light' ? 'dark' : 'light');
                applySettings();
                break;
            case 'focus':
                settings.isFocus = !settings.isFocus;
                // Add logic to hide/show elements for focus mode
                break;
            // Handle other controls like 'tone'
        }
        tile.classList.toggle('active');
        saveSettings();
    }

    function populateApps() {
        const appGrid = document.getElementById('app-grid');
        appGrid.innerHTML = '';
        // This would use your existing `apps` object from the original JS
        const apps = { "App Store": { icon: "appstore.png" }, "Chronos": { icon: "chronos.png" } /* ... etc */ };
        for (const appName in apps) {
            const icon = document.createElement('div');
            icon.className = 'app-icon';
            icon.innerHTML = `
                <img src="/assets/appicon/${apps[appName].icon}" alt="${appName}">
                <span>${appName}</span>
            `;
            // Add click listener to launch the Gurapp
            appGrid.appendChild(icon);
        }
    }

    // --- CORE FUNCTIONS (Clock, Weather) ---
    function updateClockAndDate() {
        const now = new Date();
        const timeOptions = {
            hour: '2-digit',
            minute: '2-digit',
            second: settings.showSeconds ? '2-digit' : undefined,
            hour12: settings.use12HourFormat
        };
        clockContainer.textContent = now.toLocaleTimeString([], timeOptions);
        dateContainer.textContent = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
        
        // Update shade time/date
        document.getElementById('shade-time').textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'});
        document.getElementById('shade-date').textContent = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric'});
    }

    async function updateWeather() {
        if (!settings.showWeather) return;
        // This function would be a simplified version of your existing
        // weather fetching logic using Geolocation and Open-Meteo.
        try {
            // Placeholder data
            const weatherData = { temp: 12, code: 800 }; 
            temperatureEl.textContent = `${Math.round(weatherData.temp)}°`;
            weatherIconEl.textContent = getWeatherIcon(weatherData.code); // This would be a helper function
        } catch (e) {
            console.error("Failed to fetch weather", e);
        }
    }
    
    function getWeatherIcon(code) {
        // Simplified mapping of weather codes to Material Symbols icons
        if (code >= 200 && code < 600) return 'rainy';
        if (code >= 600 && code < 700) return 'weather_snowy';
        if (code === 800) return 'clear_day';
        return 'cloudy';
    }


    // --- GURAPP HANDLING ---
    // The Gurapp API and logic for creating/managing fullscreen embeds
    // would be ported here from your original index.js file.
    // window.createFullscreenEmbed = function(url) { ... };
    // window.minimizeFullscreenEmbed = function() { ... };
    // window.addEventListener('message', (event) => { /* handle messages from Gurapps */ });


    // --- START THE APP ---
    init();
});
