(function() {
    // --- COOKIE HELPER FUNCTIONS ---
    // Using cookies for data storage for IE8 compatibility
    function setCookie(name, value, days) {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "")  + expires + "; path=/";
    }

    function getCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
    }

    // --- SHARED INITIALIZATION ---
    var settings = {
        theme: getCookie("theme") || "dark",
        animations: getCookie("animations") !== "off",
        effects: getCookie("effects") !== "off",
        showWeather: getCookie("showWeather") === "on",
        wallpaper: getCookie("wallpaper") || ""
    };

    function applySettings() {
        // Theme
        document.body.className = settings.theme + "-theme";
        if (!settings.effects) {
            document.body.className += " no-effects";
        }
        if (!settings.animations) {
            document.body.className += " reduce-animations";
        }

        // Wallpaper
        if (settings.wallpaper) {
            document.body.style.backgroundImage = "url('" + settings.wallpaper + "')";
            document.body.style.backgroundSize = "cover";
            document.body.style.backgroundPosition = "center center";
        } else {
            document.body.style.backgroundImage = "none";
        }

        // Controls UI
        var themeButton = document.getElementById("themeButton");
        if (themeButton) {
            themeButton.innerHTML = (settings.theme === "dark") ? "Switch to Light Mode" : "Switch to Dark Mode";
        }
        var animToggle = document.getElementById("animationsToggle");
        if (animToggle) animToggle.checked = !settings.animations;
        var effectsToggle = document.getElementById("effectsToggle");
        if (effectsToggle) effectsToggle.checked = !settings.effects;
        var weatherToggle = document.getElementById("weatherToggle");
        if (weatherToggle) weatherToggle.checked = settings.showWeather;
        
        // Weather on home screen
        var weatherContainer = document.getElementById("weather-container");
        if (weatherContainer) {
            weatherContainer.style.display = settings.showWeather ? "block" : "none";
        }
    }

    // --- CLOCK AND DATE ---
    function updateClock() {
        var clockEl = document.getElementById("clock");
        var dateEl = document.getElementById("date");
        if (!clockEl || !dateEl) return;

        var now = new Date();
        var hours = now.getHours();
        var minutes = now.getMinutes();
        var seconds = now.getSeconds();

        // Pad with zeros
        hours = hours < 10 ? "0" + hours : hours;
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        clockEl.innerHTML = hours + ":" + minutes + ":" + seconds;

        var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        dateEl.innerHTML = days[now.getDay()] + ", " + months[now.getMonth()] + " " + now.getDate();
    }

    // --- CONTROLS PANEL ---
    function setupControls() {
        var controlsButton = document.getElementById("controlsButton");
        var closeControlsButton = document.getElementById("closeControlsButton");
        var controlsPanel = document.getElementById("controlsPanel");

        if (!controlsButton || !controlsPanel) return;

        controlsButton.onclick = function() {
            controlsPanel.style.display = "block";
        };
        closeControlsButton.onclick = function() {
            controlsPanel.style.display = "none";
        };

        // Theme Toggle
        document.getElementById("themeButton").onclick = function() {
            settings.theme = (settings.theme === "dark") ? "light" : "dark";
            setCookie("theme", settings.theme, 365);
            applySettings();
        };

        // Wallpaper
        document.getElementById("setWallpaperButton").onclick = function() {
            var url = document.getElementById("wallpaperUrlInput").value;
            settings.wallpaper = url;
            setCookie("wallpaper", url, 365);
            applySettings();
        };
        document.getElementById("resetWallpaperButton").onclick = function() {
            settings.wallpaper = "";
            setCookie("wallpaper", "", -1);
            applySettings();
        };

        // Performance Toggles
        document.getElementById("animationsToggle").onclick = function() {
            settings.animations = !this.checked;
            setCookie("animations", settings.animations ? "on" : "off", 365);
            applySettings();
        };
        document.getElementById("effectsToggle").onclick = function() {
            settings.effects = !this.checked;
            setCookie("effects", settings.effects ? "on" : "off", 365);
            applySettings();
        };
        
        // Feature Toggles
        document.getElementById("weatherToggle").onclick = function() {
            settings.showWeather = this.checked;
            setCookie("showWeather", settings.showWeather ? "on" : "off", 365);
            applySettings();
            // If on home page, update weather immediately
            if (document.getElementById("weather-container")) {
                fetchWeather();
            }
        };
    }

    // --- WEATHER FUNCTIONALITY ---
    function fetchWeather() {
        var weatherContainer = document.getElementById("weather-container");
        var weatherText = document.getElementById("weather-text");
        if (!weatherContainer || !weatherText || !settings.showWeather) return;

        var city = getCookie("weatherCity") || "New York"; // Default city

        // Note: This uses a simple, non-authenticated API endpoint that may be unreliable.
        // It's also using a proxy to bypass CORS issues on old browsers.
        var url = "https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current_weather=true";

        // This requires a modern browser. For legacy, we'll just show placeholder text.
        weatherText.innerHTML = "Weather feature requires a modern browser.";
    }

    // --- INITIALIZE PAGE ---
    function init() {
        applySettings();
        setupControls();

        if (document.getElementById("clock")) {
            updateClock();
            setInterval(updateClock, 1000);
            fetchWeather();
        }
    }

    // Run initialization when the document is ready
    if (window.addEventListener) {
        window.addEventListener('load', init, false);
    } else if (window.attachEvent) {
        window.attachEvent('onload', init);
    }

})();
