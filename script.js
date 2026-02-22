document.addEventListener("DOMContentLoaded", () => {
  const cityInput = document.getElementById("city-input");
  const getWeatherBtn = document.getElementById("get-weather-btn");
  const weatherInfo = document.getElementById("weather-info");
  const cityNameDisplay = document.getElementById("city-name");
  const weatherIconDisplay = document.getElementById("weather-icon");
  const temperatureDisplay = document.getElementById("temperature");
  const descriptionDisplay = document.getElementById("description");
  const feelsLikeDisplay = document.getElementById("feels-like");
  const humidityDisplay = document.getElementById("humidity");
  const windSpeedDisplay = document.getElementById("wind-speed");
  const errorMessage = document.getElementById("error-message");
  const loadingIndicator = document.getElementById("loading");
  const unitToggleBtn = document.getElementById("unit-toggle");
  const recentSearchesContainer = document.getElementById("recent-searches");
  const suggestionsList = document.getElementById("suggestions-list");
  const topPanel = document.querySelector(".top-panel");
  const forecastPanel = document.getElementById("forecast-panel");
  const hourlyList = document.getElementById("hourly-list");
  const dailyList = document.getElementById("daily-list");
  const dateDisplay = document.getElementById("date-display");
  const chanceOfRainDisplay = document.getElementById("chance-of-rain");

  const API_KEY = "f7c66987f52ac66f5e18bb83b2d1e8ba"; //not a safe way to store, but for now its fine
  let isMetric = true;
  let recentSearches = JSON.parse(localStorage.getItem('weatherRecentSearches')) || [];

  // Initialize
  renderRecentSearches();
  getUserLocation();

  let debounceTimer;

  getWeatherBtn.addEventListener("click", () => handleSearch(cityInput.value.trim()));

  cityInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      suggestionsList.classList.add("hidden");
      handleSearch(cityInput.value.trim());
    }
  });

  cityInput.addEventListener("input", (e) => {
    clearTimeout(debounceTimer);
    const query = e.target.value.trim();
    
    if (query.length < 3) {
      suggestionsList.classList.add("hidden");
      return;
    }
    
    debounceTimer = setTimeout(() => {
      fetchCitySuggestions(query);
    }, 500); // 500ms debounce
  });
  
  // Hide suggestions when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest('.search-wrapper')) {
      suggestionsList.classList.add("hidden");
    }
  });

  unitToggleBtn.addEventListener("click", () => {
    isMetric = !isMetric;
    unitToggleBtn.textContent = isMetric ? "°C" : "°F";
    const currentCity = cityNameDisplay.textContent;
    if (currentCity) handleSearch(currentCity); // Refetch with new unit
  });

  async function handleSearch(city) {
    if (!city) return;

    showLoading();

    try {
      const weatherData = await fetchWeatherData(city);
      const forecastData = await fetchForecastData(city);
      displayWeatherData(weatherData, forecastData);
      displayHourlyForecast(forecastData);
      displayDailyForecast(forecastData);
      saveRecentSearch(weatherData.name);
      
      // Success, hide loading and show info
      loadingIndicator.classList.add("hidden");
      weatherInfo.classList.remove("hidden");
      forecastPanel.classList.remove("hidden");
      errorMessage.classList.add("hidden");
      
    } catch (error) {
      console.error(error);
      showError();
    }
  }

  async function fetchWeatherData(city) {
    const units = isMetric ? 'metric' : 'imperial';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${units}&appid=${API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("City not found!");
    return await response.json();
  }

  async function fetchForecastData(city) {
    const units = isMetric ? 'metric' : 'imperial';
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${units}&appid=${API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Forecast not found!");
    return await response.json();
  }

  async function fetchCitySuggestions(query) {
    try {
      const url = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Could not fetch suggestions");
      const data = await response.json();
      renderSuggestions(data);
    } catch (error) {
      console.error("Geocoding error:", error);
    }
  }

  function renderSuggestions(cities) {
    suggestionsList.innerHTML = '';
    
    if (cities.length === 0) {
      suggestionsList.classList.add("hidden");
      return;
    }

    cities.forEach(city => {
      const li = document.createElement('li');
      // Format: "City Name, State (if exists) Country Code"
      const locationString = [city.name, city.state].filter(Boolean).join(', ');
      
      li.innerHTML = `<span>${locationString}</span> <span class="country">${city.country}</span>`;
      
      li.addEventListener('click', () => {
        cityInput.value = city.name;
        suggestionsList.classList.add("hidden");
        handleSearch(city.name);
      });
      
      suggestionsList.appendChild(li);
    });
    
    suggestionsList.classList.remove("hidden");
  }

  function displayWeatherData(weatherData, forecastData) {
    const { name, main, weather, wind } = weatherData;
    cityNameDisplay.textContent = name;
    
    // Set Date
    const date = new Date();
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    dateDisplay.textContent = date.toLocaleDateString('en-GB', options);
    
    // Icon - Map to 3D like icons or high-res
    const iconCode = weather[0].icon;
    weatherIconDisplay.src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
    
    const unitSymbol = isMetric ? '' : ''; // Symbol is hardcoded in HTML for premium look
    const speedUnit = isMetric ? 'km/h' : 'mph';
    const speedMultiplier = isMetric ? 3.6 : 1; // convert m/s to km/h for metric
    
    temperatureDisplay.textContent = `${Math.round(main.temp)}`;
    descriptionDisplay.textContent = `${weather[0].description}`;
    
    // Details
    humidityDisplay.textContent = `${main.humidity}%`;
    windSpeedDisplay.textContent = `${Math.round(wind.speed * speedMultiplier)} ${speedUnit}`;
    
    // Chance of Rain (from first forecast item)
    const pop = forecastData && forecastData.list[0] ? Math.round(forecastData.list[0].pop * 100) : 0;
    chanceOfRainDisplay.textContent = `${pop}%`;
    
    // Update Dynamic Background
    updateBackground(weather[0].main);
  }

  function displayHourlyForecast(data) {
    hourlyList.innerHTML = '';
    // Take first 8 items (24 hours)
    const hourlyData = data.list.slice(0, 8);
    
    hourlyData.forEach((hour, index) => {
      const date = new Date(hour.dt * 1000);
      const timeString = index === 0 ? 'Now' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const iconCode = hour.weather[0].icon;
      const temp = Math.round(hour.main.temp);

      const el = document.createElement('div');
      el.classList.add('hourly-item');
      if (index === 0) el.classList.add('active');
      
      el.innerHTML = `
        <span class="time">${timeString}</span>
        <img src="https://openweathermap.org/img/wn/${iconCode}.png" alt="icon">
        <span class="temp">${temp}°</span>
      `;
      hourlyList.appendChild(el);
    });
  }

  function displayDailyForecast(data) {
    dailyList.innerHTML = '';
    
    // Group by day to get min/max
    const dailyMap = new Map();
    
    data.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const day = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      if (!dailyMap.has(day)) {
        dailyMap.set(day, {
          min: item.main.temp_min,
          max: item.main.temp_max,
          iconCode: item.weather[0].icon,
          desc: item.weather[0].main
        });
      } else {
        const current = dailyMap.get(day);
        current.min = Math.min(current.min, item.main.temp_min);
        current.max = Math.max(current.max, item.main.temp_max);
      }
    });

    const dailyArray = Array.from(dailyMap).slice(1, 6); // Skip today if it's there
    
    // We add a class then quickly remove it to trigger CSS animations again
    document.body.classList.add('anim-reset');
    
    dailyArray.forEach(([day, info]) => {
      const el = document.createElement('div');
      el.classList.add('daily-item');
      el.innerHTML = `
        <span class="day">${day}</span>
        <div class="cond-box">
           <img src="https://openweathermap.org/img/wn/${info.iconCode}.png" alt="icon">
           <span class="desc">${info.desc}</span>
        </div>
        <div class="temps">
           <span class="temp-max">+${Math.round(info.max)}°</span>
           <span class="temp-min">+${Math.round(info.min)}°</span>
        </div>
      `;
      dailyList.appendChild(el);
    });
    
    // Remove reset class to allow animations to run
    setTimeout(() => {
      document.body.classList.remove('anim-reset');
    }, 50);
  }

  function updateBackground(weatherMain) {
    topPanel.className = 'weather-panel top-panel'; // reset
    const validBackgrounds = ['Clear', 'Clouds', 'Rain', 'Drizzle', 'Thunderstorm', 'Snow'];
    if (validBackgrounds.includes(weatherMain)) {
      topPanel.classList.add(`bg-${weatherMain}`);
    }
  }

  function showLoading() {
    weatherInfo.classList.add("hidden");
    forecastPanel.classList.add("hidden");
    errorMessage.classList.add("hidden");
    loadingIndicator.classList.remove("hidden");
  }

  function showError() {
    loadingIndicator.classList.add("hidden");
    weatherInfo.classList.add("hidden");
    forecastPanel.classList.add("hidden");
    errorMessage.classList.remove("hidden");
  }

  // 👇 Added Level 2 functions
  function saveRecentSearch(city) {
    if (!recentSearches.includes(city)) {
      recentSearches.unshift(city);
      if (recentSearches.length > 5) recentSearches.pop(); // Keep only last 5
      localStorage.setItem('weatherRecentSearches', JSON.stringify(recentSearches));
      renderRecentSearches();
    }
  }

  function renderRecentSearches() {
    recentSearchesContainer.innerHTML = '';
    recentSearches.forEach(city => {
      const chip = document.createElement('span');
      chip.classList.add('recent-search-chip');
      chip.textContent = city;
      chip.addEventListener('click', () => handleSearch(city));
      recentSearchesContainer.appendChild(chip);
    });
  }

  function getUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          showLoading();
          const { latitude, longitude } = position.coords;
          const units = isMetric ? 'metric' : 'imperial';
          const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=${units}&appid=${API_KEY}`;
          const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=${units}&appid=${API_KEY}`;
          
          try {
            const [weatherRes, forecastRes] = await Promise.all([
              fetch(weatherUrl),
              fetch(forecastUrl)
            ]);
            
            if (!weatherRes.ok || !forecastRes.ok) throw new Error("Location fetch failed");
            
            const weatherData = await weatherRes.json();
            const forecastData = await forecastRes.json();
            
            displayWeatherData(weatherData, forecastData);
            displayHourlyForecast(forecastData);
            displayDailyForecast(forecastData);
            
            loadingIndicator.classList.add("hidden");
            weatherInfo.classList.remove("hidden");
            forecastPanel.classList.remove("hidden");
          } catch (error) {
            console.error(error);
            showError();
          }
        },
        (error) => {
          console.log("Geolocation denied or failed.", error);
          // Just let the user type a city manually if they deny
        }
      );
    }
  }
  
});
