document.addEventListener("DOMContentLoaded", () => {
  const cityInput = document.getElementById("city-input");
  const getWeatherBtn = document.getElementById("get-weather-btn");
  const errorMessage = document.getElementById("error-message");
  const loadingIndicator = document.getElementById("loading");
  const unitToggleBtn = document.getElementById("unit-toggle");
  const suggestionsList = document.getElementById("suggestions-list");

  // DOM Elements - Weather Primary
  const cityNameDisplay = document.getElementById("city-name-display");
  const temperatureDisplay = document.getElementById("temperature-display");
  const feelsLikeDisplay = document.getElementById("feels-like-display");
  const visibilityDisplay = document.getElementById("visibility-display");
  const humidityDisplay = document.getElementById("humidity-display");
  const weatherIconDisplay = document.getElementById("weather-icon-display");

  // DOM Elements - Map Card
  const mapDay = document.getElementById("map-day");
  const mapCond = document.getElementById("map-cond");
  const mapTemp = document.querySelector(".mo-temp");

  // DOM Elements - Dark Humidity Card
  const darkHumidityDisplay = document.getElementById("dark-humidity-display");

  // DOM Elements - Hourly Chart
  const tempMorning = document.getElementById("temp-morning");
  const tempAfternoon = document.getElementById("temp-afternoon");
  const tempEvening = document.getElementById("temp-evening");
  const tempNight = document.getElementById("temp-night");

  // DOM Elements - Tomorrow Card
  const tomorrowCity = document.getElementById("tomorrow-city");
  const tomorrowTemp = document.getElementById("tomorrow-temp");
  const tomorrowCond = document.getElementById("tomorrow-cond");

  const API_KEY = "f7c66987f52ac66f5e18bb83b2d1e8ba";
  let isMetric = true;
  let currentCity = "Dhaka"; // Default
  
  // Map Variables
  let weatherMap;
  let mapMarker;
  let tempLayer;

  // Initialize
  getUserLocation();
  fetchSecondaryCities();

  let debounceTimer;

  getWeatherBtn.addEventListener("click", () => {
    suggestionsList.classList.add("hidden");
    handleSearch(cityInput.value.trim());
  });

  cityInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!suggestionsList.classList.contains("hidden") && suggestionsList.children.length > 0) {
        suggestionsList.children[0].click();
      } else {
        suggestionsList.classList.add("hidden");
        handleSearch(cityInput.value.trim());
      }
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
    }, 500);
  });
  
  document.addEventListener("click", (e) => {
    if (!e.target.closest('.search-wrapper')) {
      suggestionsList.classList.add("hidden");
    }
  });

  unitToggleBtn.addEventListener("click", () => {
    isMetric = !isMetric;
    if (currentCity) handleSearch(currentCity);
    fetchSecondaryCities();
  });

  async function handleSearch(city) {
    if (!city || city.length < 3) return;
    suggestionsList.classList.add("hidden");
    showLoading();

    try {
      const weatherData = await fetchWeatherData(city);
      const forecastData = await fetchForecastData(city);
      
      currentCity = weatherData.name;
      
      populateCurrentWeather(weatherData);
      populateForecastData(forecastData);
      
      loadingIndicator.classList.add("hidden");
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
      const locationString = [city.name, city.state, city.country].filter(Boolean).join(', ');
      li.innerHTML = `<span>${locationString}</span>`;
      li.addEventListener('click', () => {
        cityInput.value = city.name;
        suggestionsList.classList.add("hidden");
        handleSearch(city.name);
      });
      suggestionsList.appendChild(li);
    });
    suggestionsList.classList.remove("hidden");
  }

  function populateCurrentWeather(data) {
    const { name, main, weather, visibility } = data;
    
    cityNameDisplay.textContent = name;
    temperatureDisplay.textContent = `${Math.round(main.temp)}°C`;
    feelsLikeDisplay.textContent = `Feels like ${Math.round(main.feels_like)}°C`;
    
    const visKm = visibility ? (visibility / 1000).toFixed(1) : 10;
    visibilityDisplay.textContent = `${visKm} Km`;
    humidityDisplay.textContent = `${main.humidity}%`;
    
    darkHumidityDisplay.textContent = `${main.humidity}%`;
    
    const iconCode = weather[0].icon;
    weatherIconDisplay.src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
    
    // Map Overlay
    const date = new Date();
    mapDay.textContent = date.toLocaleDateString('en-US', { weekday: 'long' });
    mapCond.textContent = weather[0].main;
    mapTemp.textContent = `${Math.round(main.temp)}°C`;
    
    // Map Location Update
    if (data.coord) {
      updateMapLocation(data.coord.lat, data.coord.lon, name);
    }
    
    // Tomorrow Card City
    tomorrowCity.textContent = name;
  }

  function initMap(lat, lon, cityName) {
    weatherMap = L.map('weather-map', { zoomControl: false }).setView([lat, lon], 10);
    L.control.zoom({ position: 'bottomright' }).addTo(weatherMap);

    // Standard OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(weatherMap);

    // OpenWeatherMap Temperature Layer
    tempLayer = L.tileLayer(`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${API_KEY}`, {
      maxZoom: 19,
      opacity: 0.6
    }).addTo(weatherMap);

    mapMarker = L.marker([lat, lon]).addTo(weatherMap)
      .bindPopup(`<b>${cityName}</b>`)
      .openPopup();
  }

  function updateMapLocation(lat, lon, cityName) {
    if (!weatherMap) {
      initMap(lat, lon, cityName);
    } else {
      weatherMap.flyTo([lat, lon], 10, { duration: 1.5 });
      mapMarker.setLatLng([lat, lon]).setPopupContent(`<b>${cityName}</b>`).openPopup();
    }
  }

  function populateForecastData(data) {
    // We want Morning (~09:00), Afternoon (~15:00), Evening (~18:00), Night (~21:00) for today
    // OpenWeather API returns every 3 hours. 
    // We'll just grab the first 4 available slots and loosely map them for this polished look
    const nextHours = data.list.slice(0, 4);
    
    if (nextHours[0]) tempMorning.textContent = `${Math.round(nextHours[0].main.temp)}°`;
    if (nextHours[1]) tempAfternoon.textContent = `${Math.round(nextHours[1].main.temp)}°`;
    if (nextHours[2]) tempEvening.textContent = `${Math.round(nextHours[2].main.temp)}°`;
    if (nextHours[3]) tempNight.textContent = `${Math.round(nextHours[3].main.temp)}°`;

    // Tomorrow (Find item roughly 24 hours from now)
    const tomorrowData = data.list.find(item => {
      const today = new Date().getDay();
      const itemDay = new Date(item.dt * 1000).getDay();
      return itemDay !== today && item.dt_txt.includes("12:00:00");
    }) || data.list[8]; // fallback to 8th item (24hrs later)

    if (tomorrowData) {
      tomorrowTemp.textContent = `${Math.round(tomorrowData.main.temp)}°C`;
      tomorrowCond.textContent = tomorrowData.weather[0].main;
    }
  }

  async function fetchSecondaryCities() {
    try {
      const [nyData, lonData] = await Promise.all([
        fetchWeatherData("New York"),
        fetchWeatherData("London")
      ]);
      
      updateMiniCard("city-1", nyData);
      updateMiniCard("city-2", lonData);
    } catch (e) {
      console.log("Failed secondary cities", e);
    }
  }

  function updateMiniCard(elementId, data) {
    const el = document.getElementById(elementId);
    if (!el) return;
    
    el.querySelector('.mc-name').textContent = data.name;
    el.querySelector('.mc-cond').textContent = data.weather[0].main;
    el.querySelector('.mc-high').textContent = `${Math.round(data.main.temp_max)}°C`;
    el.querySelector('.mc-low').textContent = `/${Math.round(data.main.temp_min)}°C`;
    el.querySelector('img').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
  }

  function getUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          try {
            showLoading();
            const units = isMetric ? 'metric' : 'imperial';
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`;
            const weatherRes = await fetch(url);
            const weatherData = await weatherRes.json();
            
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`;
            const forecastRes = await fetch(forecastUrl);
            const forecastData = await forecastRes.json();
            
            currentCity = weatherData.name;
            populateCurrentWeather(weatherData);
            populateForecastData(forecastData);
            
            loadingIndicator.classList.add("hidden");
          } catch (error) {
            console.error(error);
            showError();
          }
        },
        () => {
          // If denied, fallback to default city
          handleSearch(currentCity);
        }
      );
    } else {
      handleSearch(currentCity);
    }
  }

  function showLoading() {
    loadingIndicator.classList.remove("hidden");
  }

  function showError() {
    loadingIndicator.classList.add("hidden");
    errorMessage.classList.remove("hidden");
  }

});
