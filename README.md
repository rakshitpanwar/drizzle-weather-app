# Premium Weather Dashboard

![Dashboard Preview](https://img.shields.io/badge/Status-Complete-success) ![License](https://img.shields.io/badge/License-MIT-blue)

A visually stunning, desktop-first weather dashboard built with Vanilla HTML, CSS Grid, and JavaScript. This application fetches live, global weather data and maps it onto a complex, modern grid layout to provide deeply visualized insights. Built as a portfolio cornerstone.

## Features

- **Full-Screen CSS Grid Architecture**: A responsive, 12-column layout that elegantly handles multiple complex data visualization cards simultaneously.
- **Interactive Leaflet Map**: A live, draggable map container integrated with `Leaflet.js` that `flyTo()` animates to searched coordinates, featuring a custom OpenWeatherMap Temperature tile overlay visualizing global thermal hotspots.
- **Dynamic Premium Graphics**: Handcrafted, context-aware SVG artwork for the "Tomorrow" forecast. The card's background color and CSS `@keyframes` (spinning suns, floating clouds) adapt smoothly via `0.8s` transitions based on the exact weather condition (Clear, Rain, Snow, Thunderstorm).
- **Live Air Quality Index**: Integrates the OpenWeather Air Pollution API to deliver dynamic, real-time air quality ratings alongside atmospheric humidity.
- **Intelligent Autocomplete Search**: Seamless integration with the OpenWeather Geocoding API, offering debounced, live city/country suggestions as you type.
- **Advanced Forecast Parsing**: Custom JavaScript algorithms map the 3-hour forecast chunks specifically into "Morning", "Afternoon", "Evening", and "Night" visualization periods for intuitive reading.
- **Live Secondary Feeds**: Automatically fetches parallel data streams for major global cities (New York, London) to populate background cards dynamically.
- **Geolocation Support**: Instantly loads weather based on the user's browser coordinates upon launch.
- **Premium Aesthetics**: Features custom SVG icons, soft mesh gradients, glassmorphic dropdowns, and deep dark-mode contrast cards.

## Tech Stack

- **Frontend Core**: HTML5, Vanilla JavaScript (ES6+), CSS3
- **Mapping Engine**: [Leaflet.js](https://leafletjs.com/)
- **Layout Systems**: Advanced CSS Grid & Flexbox
- **APIs**: [OpenWeatherMap API](https://openweathermap.org/api) (Current Weather, 5-Day Forecast, Geocoding)
- **Typography**: [Nunito Font](https://fonts.google.com/specimen/Nunito)
- **Deployment**: Configured for instant deployment via GitHub Pages or Vercel.

## Getting Started

To run this locally, you do not need a complex Node.js setup!

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/weather-app.git
   ```
2. Navigate to the project folder:
   ```bash
   cd weather-app
   ```
3. Run a local server. If you have Node installed, you can use `serve`:
   ```bash
   npx serve .
   ```
4. Open your browser to `http://localhost:3000`.

## Next Steps (Deployment)

This app is vanilla frontend and ready to go live instantly!

**Deploy to Vercel (Fastest):**

```bash
npx vercel
```

**Deploy to GitHub Pages:**

1. Push to a repository.
2. Go to repository Settings > Pages.
3. Select `master` (or `main`) branch as the source and save.

---

_If this project helps you or if you use it in your portfolio, consider giving it a star!_
