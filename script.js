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
  const darkAqiDisplay = document.getElementById("dark-aqi-display");

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

  // Recent searches (placeholders for now)
  let recentSearches = ["Tokyo", "Paris", "New York", "Sydney", "Mumbai"];
  
  // Map Variables
  let weatherMap;
  let mapMarker;
  let tempLayer;

  // Dynamic Tomorrow Graphics
  const tomorrowGraphics = {
    Clear: {
      color: "#fef08a", // warm yellow
      svg: `<svg viewBox="0 0 100 150" class="floating-graphic"><circle cx="50" cy="70" r="30" fill="#f59e0b" filter="drop-shadow(0 8px 16px rgba(245,158,11,0.4))"/><path d="M50 20 v10 M50 110 v10 M20 70 h10 M70 70 h10 M30 50 L35 55 M70 90 L65 85 M30 90 L35 85 M70 50 L65 55" stroke="#f59e0b" stroke-width="4" stroke-linecap="round" class="spin-slow" transform-origin="50 70"/></svg>`
    },
    Clouds: {
      color: "#e2e8f0", // slate light
      svg: `<svg viewBox="0 0 100 150" class="floating-graphic"><path d="M 25 80 A 15 15 0 0 1 50 70 A 20 20 0 0 1 85 80 A 15 15 0 0 1 75 100 L 35 100 A 15 15 0 0 1 25 80 Z" fill="#ffffff" filter="drop-shadow(0 10px 15px rgba(0,0,0,0.1))"/><circle cx="70" cy="65" r="16" fill="#f59e0b" style="mix-blend-mode: multiply;"/></svg>`
    },
    Rain: {
      color: "#bae6fd", // light blue
      svg: `<svg viewBox="0 0 100 150" class="floating-graphic"><path d="M 25 70 A 15 15 0 0 1 50 60 A 20 20 0 0 1 85 70 A 15 15 0 0 1 75 90 L 35 90 A 15 15 0 0 1 25 70 Z" fill="#94a3b8" filter="drop-shadow(0 8px 12px rgba(0,0,0,0.15))"/><line x1="40" y1="95" x2="35" y2="105" stroke="#0ea5e9" stroke-width="3" stroke-linecap="round"/><line x1="55" y1="95" x2="50" y2="105" stroke="#0ea5e9" stroke-width="3" stroke-linecap="round"/><line x1="70" y1="95" x2="65" y2="105" stroke="#0ea5e9" stroke-width="3" stroke-linecap="round"/></svg>`
    },
    Drizzle: {
      color: "#e0f2fe", // lighter blue
      svg: `<svg viewBox="0 0 100 150" class="floating-graphic"><path d="M 25 70 A 15 15 0 0 1 50 60 A 20 20 0 0 1 85 70 A 15 15 0 0 1 75 90 L 35 90 A 15 15 0 0 1 25 70 Z" fill="#cbd5e1" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))"/><line x1="45" y1="95" x2="42" y2="102" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/><line x1="65" y1="95" x2="62" y2="102" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/></svg>`
    },
    Snow: {
      color: "#f1f5f9", // almost white
      svg: `<svg viewBox="0 0 100 150" class="floating-graphic"><path d="M 25 65 A 15 15 0 0 1 50 55 A 20 20 0 0 1 85 65 A 15 15 0 0 1 75 85 L 35 85 A 15 15 0 0 1 25 65 Z" fill="#ffffff" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.05))"/><circle cx="40" cy="95" r="3" fill="#cbd5e1"/><circle cx="55" cy="105" r="4" fill="#cbd5e1"/><circle cx="70" cy="98" r="3" fill="#cbd5e1"/></svg>`
    },
    Thunderstorm: {
      color: "#cbd5e1", // darker slate
      svg: `<svg viewBox="0 0 100 150" class="floating-graphic"><path d="M 25 70 A 15 15 0 0 1 50 60 A 20 20 0 0 1 85 70 A 15 15 0 0 1 75 90 L 35 90 A 15 15 0 0 1 25 70 Z" fill="#64748b" filter="drop-shadow(0 8px 12px rgba(0,0,0,0.2))"/><polygon points="55,85 45,100 52,100 48,115 65,95 55,95" fill="#f59e0b"/></svg>`
    },
    Default: {
      color: "#d3f3bd", // original green
      svg: `<svg viewBox="0 0 100 150" class="floating-graphic"><path d="M 30 70 Q 50 60 70 70 T 90 70" stroke="#4a5568" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="50" cy="70" r="10" fill="#f6e5dc"/></svg>`
    }
  };

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
      if (query.length === 0) {
        renderRecentSearches();
      } else {
        suggestionsList.classList.add("hidden");
      }
      return;
    }
    debounceTimer = setTimeout(() => {
      fetchCitySuggestions(query);
    }, 500);
  });

  // Show recent searches when search bar is focused and empty
  cityInput.addEventListener("focus", () => {
    if (cityInput.value.trim().length < 3) {
      renderRecentSearches();
    }
  });
  
  document.addEventListener("click", (e) => {
    if (!e.target.closest('.search-wrapper')) {
      suggestionsList.classList.add("hidden");
    }
  });

  unitToggleBtn.addEventListener("click", () => {
    isMetric = !isMetric;
    
    // Update the UI of the toggle button itself
    unitToggleBtn.classList.toggle("imperial", !isMetric);
    const labels = unitToggleBtn.querySelectorAll('.ut-label');
    if(labels.length === 2) {
      labels[0].classList.toggle("active", isMetric);
      labels[1].classList.toggle("active", !isMetric);
    }

    if (currentCity) handleSearch(currentCity);
    fetchSecondaryCities();
  });

  // Mini card edit buttons - focus the main search bar
  document.querySelectorAll('.mc-edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      cityInput.focus();
      cityInput.value = '';
      renderRecentSearches();
    });
  });

  function renderRecentSearches() {
    suggestionsList.innerHTML = '';
    if (recentSearches.length === 0) {
      suggestionsList.classList.add("hidden");
      return;
    }
    const header = document.createElement('li');
    header.classList.add('recent-header');
    header.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg> Recent Searches`;
    suggestionsList.appendChild(header);

    recentSearches.forEach(city => {
      const li = document.createElement('li');
      li.innerHTML = `<span>${city}</span>`;
      li.addEventListener('click', () => {
        cityInput.value = city;
        suggestionsList.classList.add("hidden");
        handleSearch(city);
      });
      suggestionsList.appendChild(li);
    });
    suggestionsList.classList.remove("hidden");
  }

  function addToRecentSearches(city) {
    // Remove duplicates, add to front, keep max 5
    recentSearches = recentSearches.filter(c => c.toLowerCase() !== city.toLowerCase());
    recentSearches.unshift(city);
    if (recentSearches.length > 5) recentSearches.pop();
  }

  async function handleSearch(city) {
    if (!city || city.length < 3) return;
    suggestionsList.classList.add("hidden");
    addToRecentSearches(city);
    showLoading();

    try {
      const weatherData = await fetchWeatherData(city);
      const forecastData = await fetchForecastData(city);
      const aqiData = await fetchAqiData(weatherData.coord.lat, weatherData.coord.lon);
      
      currentCity = weatherData.name;
      
      populateCurrentWeather(weatherData);
      populateForecastData(forecastData);
      populateAqiData(aqiData);
      
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

  async function fetchAqiData(lat, lon) {
    try {
      const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
      const response = await fetch(url);
      if (!response.ok) {
        console.warn("AQI fetch failed with status:", response.status);
        return null;
      }
      return await response.json();
    } catch (error) {
      console.warn("AQI fetch error:", error);
      return null;
    }
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
      li.classList.add('suggestion-item');
      const locationString = [city.name, city.state, city.country].filter(Boolean).join(', ');
      
      const textSpan = document.createElement('span');
      textSpan.textContent = locationString;
      textSpan.classList.add('suggestion-text');
      textSpan.addEventListener('click', () => {
        cityInput.value = city.name;
        suggestionsList.classList.add("hidden");
        handleSearch(city.name);
      });
      
      const pinBtn = document.createElement('button');
      pinBtn.classList.add('pin-btn');
      pinBtn.title = 'Pin to card';
      pinBtn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
      pinBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showPinPicker(pinBtn, city.name);
      });
      
      li.appendChild(textSpan);
      li.appendChild(pinBtn);
      suggestionsList.appendChild(li);
    });
    suggestionsList.classList.remove("hidden");
  }

  function showPinPicker(anchorBtn, cityName) {
    // Close the dropdown
    suggestionsList.classList.add('hidden');
    cityInput.value = '';
    
    const card1 = document.getElementById('city-1');
    const card2 = document.getElementById('city-2');
    
    // Add pin-target overlay to both cards
    [card1, card2].forEach(card => {
      card.classList.add('pin-target');
      
      // Create overlay
      const overlay = document.createElement('div');
      overlay.classList.add('pin-overlay');
      overlay.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        <span>Pin ${cityName} here</span>
      `;
      card.appendChild(overlay);
      
      const clickHandler = async () => {
        try {
          const data = await fetchWeatherData(cityName);
          updateMiniCard(card.id, data);
        } catch (err) {
          console.warn('Could not pin city:', cityName);
        }
        cleanupPinMode();
      };
      card._pinHandler = clickHandler;
      overlay.addEventListener('click', clickHandler);
    });
    
    // Click anywhere else to cancel
    setTimeout(() => {
      const cancelHandler = (e) => {
        if (!e.target.closest('.pin-overlay')) {
          cleanupPinMode();
        }
        document.removeEventListener('click', cancelHandler);
      };
      document.addEventListener('click', cancelHandler);
    }, 50);
    
    function cleanupPinMode() {
      [card1, card2].forEach(c => {
        c.classList.remove('pin-target');
        const ov = c.querySelector('.pin-overlay');
        if (ov) ov.remove();
        delete c._pinHandler;
      });
    }
  }

  function populateCurrentWeather(data) {
    const { name, main, weather, visibility } = data;
    
    const unitSymbol = isMetric ? "°C" : "°F";
    cityNameDisplay.textContent = name;
    temperatureDisplay.textContent = `${Math.round(main.temp)}${unitSymbol}`;
    feelsLikeDisplay.textContent = `Feels like ${Math.round(main.feels_like)}${unitSymbol}`;
    
    if (visibility != null) {
      if (isMetric) {
        visibilityDisplay.textContent = `${(visibility / 1000).toFixed(1)} Km`;
      } else {
        visibilityDisplay.textContent = `${(visibility / 1609.34).toFixed(1)} Mi`;
      }
    } else {
      visibilityDisplay.textContent = 'N/A';
    }
    humidityDisplay.textContent = `${main.humidity}%`;
    
    darkHumidityDisplay.textContent = `${main.humidity}%`;
    
    const iconCode = weather[0].icon;
    weatherIconDisplay.src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
    
    // Weather condition text
    const conditionDisplay = document.getElementById('weather-condition-display');
    if (conditionDisplay) {
      // Capitalize each word of the description
      const desc = weather[0].description.replace(/\b\w/g, c => c.toUpperCase());
      conditionDisplay.textContent = desc;
    }
    
    // Map Overlay
    const date = new Date();
    mapDay.textContent = date.toLocaleDateString('en-US', { weekday: 'long' });
    mapCond.textContent = weather[0].main;
    mapTemp.textContent = `${Math.round(main.temp)}${unitSymbol}`;
    
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

  // US EPA AQI breakpoint calculation
  function calcAqi(concentration, breakpoints) {
    for (const bp of breakpoints) {
      if (concentration <= bp.cHigh) {
        return Math.round(
          ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (concentration - bp.cLow) + bp.iLow
        );
      }
    }
    return 500; // beyond scale
  }

  function getAqiFromComponents(components) {
    const pm25Breakpoints = [
      { cLow: 0,     cHigh: 12,    iLow: 0,   iHigh: 50 },
      { cLow: 12.1,  cHigh: 35.4,  iLow: 51,  iHigh: 100 },
      { cLow: 35.5,  cHigh: 55.4,  iLow: 101, iHigh: 150 },
      { cLow: 55.5,  cHigh: 150.4, iLow: 151, iHigh: 200 },
      { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300 },
      { cLow: 250.5, cHigh: 500.4, iLow: 301, iHigh: 500 },
    ];
    const pm10Breakpoints = [
      { cLow: 0,   cHigh: 54,   iLow: 0,   iHigh: 50 },
      { cLow: 55,  cHigh: 154,  iLow: 51,  iHigh: 100 },
      { cLow: 155, cHigh: 254,  iLow: 101, iHigh: 150 },
      { cLow: 255, cHigh: 354,  iLow: 151, iHigh: 200 },
      { cLow: 355, cHigh: 424,  iLow: 201, iHigh: 300 },
      { cLow: 425, cHigh: 604,  iLow: 301, iHigh: 500 },
    ];

    const pm25Aqi = components.pm2_5 != null ? calcAqi(components.pm2_5, pm25Breakpoints) : 0;
    const pm10Aqi = components.pm10 != null ? calcAqi(components.pm10, pm10Breakpoints) : 0;

    return Math.max(pm25Aqi, pm10Aqi); // AQI is the worst sub-index
  }

  function getAqiCategory(aqi) {
    if (aqi <= 50) return "Good";
    if (aqi <= 100) return "Moderate";
    if (aqi <= 150) return "Unhealthy (SG)";
    if (aqi <= 200) return "Unhealthy";
    if (aqi <= 300) return "Very Unhealthy";
    return "Hazardous";
  }

  function getAqiGradient(aqi) {
    if (aqi <= 50)  return "linear-gradient(135deg, #065f46 0%, #10b981 100%)";      // green
    if (aqi <= 100) return "linear-gradient(135deg, #78600d 0%, #d4a017 100%)";      // yellow
    if (aqi <= 150) return "linear-gradient(135deg, #9a3412 0%, #f97316 100%)";      // orange
    if (aqi <= 200) return "linear-gradient(135deg, #991b1b 0%, #ef4444 100%)";      // red
    if (aqi <= 300) return "linear-gradient(135deg, #6b21a8 0%, #a855f7 100%)";      // purple
    return "linear-gradient(135deg, #701a1a 0%, #991b1b 100%)";                       // maroon
  }

  function updateHumidityAnimation(humidity) {
    const dropsContainer = document.getElementById('humidity-drops');
    const barFill = document.getElementById('humidity-bar-fill');
    
    if (!dropsContainer) return;
    
    // Clear existing droplets
    dropsContainer.innerHTML = '';
    
    // Scale: more drops and faster speed at higher humidity
    const dropCount = Math.max(2, Math.round(humidity / 12));
    const baseDuration = Math.max(0.6, 2.2 - (humidity / 60)); // faster when humid
    
    for (let i = 0; i < dropCount; i++) {
      const drop = document.createElement('div');
      drop.classList.add('humidity-drop');
      drop.style.left = `${5 + Math.random() * 50}px`;
      drop.style.animationDuration = `${baseDuration + Math.random() * 0.8}s`;
      drop.style.animationDelay = `${Math.random() * 2}s`;
      drop.style.opacity = '0';
      
      // Vary size slightly
      const scale = 0.7 + Math.random() * 0.6;
      drop.style.width = `${6 * scale}px`;
      drop.style.height = `${9 * scale}px`;
      
      dropsContainer.appendChild(drop);
    }
    
    // Update the bar fill
    if (barFill) barFill.style.width = `${humidity}%`;
  }

  function populateAqiData(data) {
    const aqiCard = document.getElementById('aqi-card');
    if (!data || !data.list || data.list.length === 0) {
      if(darkAqiDisplay) darkAqiDisplay.textContent = "AQI Unavailable";
      return;
    }
    const components = data.list[0].components;
    const aqi = getAqiFromComponents(components);
    const category = getAqiCategory(aqi);
    if(darkAqiDisplay) darkAqiDisplay.textContent = `AQI: ${aqi} (${category})`;
    if(aqiCard) aqiCard.style.background = getAqiGradient(aqi);
  }

  function populateForecastData(data) {
    // We want Morning (~09:00), Afternoon (~15:00), Evening (~18:00), Night (~21:00) for today
    // OpenWeather API returns every 3 hours. 
    // We'll just grab the first 4 available slots and loosely map them for this polished look
    const nextHours = data.list.slice(0, 4);
    
    const iconIds = ['icon-morning', 'icon-afternoon', 'icon-evening', 'icon-night'];
    const tempEls = [tempMorning, tempAfternoon, tempEvening, tempNight];
    
    nextHours.forEach((hour, i) => {
      if (hour) {
        if (tempEls[i]) tempEls[i].textContent = `${Math.round(hour.main.temp)}°`;
        const iconEl = document.getElementById(iconIds[i]);
        if (iconEl) iconEl.src = `https://openweathermap.org/img/wn/${hour.weather[0].icon}@2x.png`;
      }
    });

    // Tomorrow (Find item roughly 24 hours from now)
    const tomorrowData = data.list.find(item => {
      const today = new Date().getDay();
      const itemDay = new Date(item.dt * 1000).getDay();
      return itemDay !== today && item.dt_txt.includes("12:00:00");
    }) || data.list[8]; // fallback to 8th item (24hrs later)

    if (tomorrowData) {
      const unitSymbol = isMetric ? "°C" : "°F";
      tomorrowTemp.textContent = `${Math.round(tomorrowData.main.temp)}${unitSymbol}`;
      
      const condition = tomorrowData.weather[0].main;
      const iconCode = tomorrowData.weather[0].icon;
      tomorrowCond.textContent = condition;
      
      // Update tomorrow icon using the same OWM icon set
      const tomorrowIcon = document.getElementById('tomorrow-icon');
      if (tomorrowIcon) tomorrowIcon.src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
      
      // Update tomorrow card background color based on condition
      const visual = tomorrowGraphics[condition] || tomorrowGraphics["Default"];
      const tCard = document.getElementById("tomorrow-card");
      if (tCard) tCard.style.background = visual.color;
      
      // Populate detail fields
      const tHumidity = document.getElementById('tomorrow-humidity');
      const tWind = document.getElementById('tomorrow-wind');
      const tFeels = document.getElementById('tomorrow-feels');
      
      if (tHumidity) tHumidity.textContent = `${tomorrowData.main.humidity}%`;
      if (tWind) {
        const windSpeed = isMetric 
          ? `${Math.round(tomorrowData.wind.speed * 3.6)} km/h` 
          : `${Math.round(tomorrowData.wind.speed)} mph`;
        tWind.textContent = windSpeed;
      }
      if (tFeels) tFeels.textContent = `Feels ${Math.round(tomorrowData.main.feels_like)}°`;
    }

    // Populate 5-day forecast
    populateFiveDayForecast(data);
  }

  // Tab switching
  const tabToday = document.getElementById('tab-today');
  const tabFiveDay = document.getElementById('tab-5day');
  const todayView = document.getElementById('today-view');
  const fiveDayView = document.getElementById('five-day-view');

  if (tabToday && tabFiveDay) {
    tabToday.addEventListener('click', () => {
      tabToday.classList.add('active');
      tabFiveDay.classList.remove('active');
      todayView.classList.remove('hidden');
      fiveDayView.classList.add('hidden');
    });
    tabFiveDay.addEventListener('click', () => {
      tabFiveDay.classList.add('active');
      tabToday.classList.remove('active');
      fiveDayView.classList.remove('hidden');
      todayView.classList.add('hidden');
    });
  }

  function populateFiveDayForecast(data) {
    const list = data.list;
    const fiveDayList = document.getElementById('five-day-list');
    if (!fiveDayList) return;

    // Group forecast entries by day
    const dailyMap = {};
    const today = new Date().toDateString();

    list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const dateStr = date.toDateString();
      if (dateStr === today) return; // skip today

      if (!dailyMap[dateStr]) {
        dailyMap[dateStr] = { date, temps: [], icons: [], conditions: [] };
      }
      dailyMap[dateStr].temps.push(item.main.temp_max, item.main.temp_min);
      dailyMap[dateStr].icons.push(item.weather[0].icon);
      dailyMap[dateStr].conditions.push(item.weather[0].main);
    });

    const days = Object.values(dailyMap).slice(0, 5);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const unitSymbol = isMetric ? '°' : '°';

    fiveDayList.innerHTML = '';

    days.forEach(day => {
      const high = Math.round(Math.max(...day.temps));
      const low = Math.round(Math.min(...day.temps));
      const dayName = dayNames[day.date.getDay()];
      // Pick midday icon or first available
      const icon = day.icons[Math.floor(day.icons.length / 2)] || day.icons[0];

      const item = document.createElement('div');
      item.classList.add('five-day-item');
      item.innerHTML = `
        <span class="fd-day">${dayName}</span>
        <img class="fd-icon" src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="weather">
        <span class="fd-temps">${high}${unitSymbol} <span class="fd-low">/${low}${unitSymbol}</span></span>
      `;
      fiveDayList.appendChild(item);
    });
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
    
    // Add pop animation class
    el.classList.remove('card-updated');
    // Force a reflow in between removing and adding the class so the animation restarts
    void el.offsetWidth;
    el.classList.add('card-updated');
    
    el.querySelector('.mc-name').textContent = data.name;
    const unitSymbol = isMetric ? "°C" : "°F";
    el.querySelector('.mc-cond').textContent = data.weather[0].main;
    el.querySelector('.mc-high').textContent = `${Math.round(data.main.temp_max)}${unitSymbol}`;
    el.querySelector('.mc-low').textContent = `/${Math.round(data.main.temp_min)}${unitSymbol}`;
    el.querySelector('img').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    
    // Clean up class after animation finishes (0.4s)
    setTimeout(() => {
      el.classList.remove('card-updated');
    }, 400);
  }

  function getUserLocation() {
    if (navigator.geolocation) {
      let locationResolved = false;

      // Timeout fallback: if geolocation takes too long, use default city
      const geoTimeout = setTimeout(() => {
        if (!locationResolved) {
          locationResolved = true;
          console.log("Geolocation timed out, using default city.");
          handleSearch(currentCity);
        }
      }, 3000);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          if (locationResolved) return; // already fell back
          locationResolved = true;
          clearTimeout(geoTimeout);

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
            
            const aqiData = await fetchAqiData(lat, lon);
            
            currentCity = weatherData.name;
            populateCurrentWeather(weatherData);
            populateForecastData(forecastData);
            populateAqiData(aqiData);
            
            loadingIndicator.classList.add("hidden");
          } catch (error) {
            console.error(error);
            showError();
          }
        },
        () => {
          if (locationResolved) return;
          locationResolved = true;
          clearTimeout(geoTimeout);
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
