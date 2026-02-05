// ===============================
// API URLs
// ===============================
const geourl = "https://geocoding-api.open-meteo.com/v1/search?";
const url = "https://api.open-meteo.com/v1/forecast?";

// ===============================
// DOM Elements
// ===============================
const city = document.querySelector(".search-box input");
const searchButton = document.querySelector(".search-box button");

const temp = document.querySelectorAll("#feels-like, #temperature");
const description = document.querySelector(".description");

const wind = document.querySelector("#wind");
const humidity = document.querySelector("#humidity");
const minTemp = document.querySelector("#temp-min");
const maxTemp = document.querySelector("#temp-max");
const pressure = document.querySelector("#pressure");
const visibility = document.querySelector("#visibility");
const cloudiness = document.querySelector("#cloudiness");
const coordinate = document.querySelector("#coords");
const localTime = document.querySelector("#local-time");
const sunrise = document.querySelector("#sunrise");
const sunset = document.querySelector("#sunset");
const precipitation = document.querySelector("#precipitation");

// ===============================
// Chart Initialization
// ===============================
const ctx = document.getElementById("hourlyChart");
let hourlyChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [{
      label: "Temperature (°C)",
      data: [],
      borderColor: "#ff7a18",
      backgroundColor: "rgba(255, 122, 24, 0.2)",
      tension: 0.4,
      fill: true,

      // 👇 IMPORTANT FOR HOVER
      pointRadius: 0,
      pointHoverRadius: 6,
      pointHitRadius: 20
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,

    // 👇 REQUIRED FOR TOOLTIP
    interaction: {
      mode: "index",
      intersect: false
    },

    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true
      }
    },

    scales: {
      x: {
        grid: { display: false }
      },
      y: {
        grid: { color: "rgba(255,255,255,0.08)" }
      }
    }
  }
});

const defaultlocation={
latitude:25.625,
longitude:85.125
};

weather(defaultlocation.latitude, defaultlocation.longitude);

// ===============================
// Fetch Coordinates
// ===============================
async function coordinates() {
  if (!city.value.trim()) return;

  const response = await fetch(
    geourl + "name=" + city.value + "&count=1"
  );
  const result = await response.json();

  if (!result.results) return;

  const { latitude, longitude } = result.results[0];
  weather(latitude, longitude);
}

searchButton.addEventListener("click", coordinates);

// ===============================
// Fetch Weather Data
// ===============================
async function weather(lat, long) {
  const response = await fetch(
    url +
      "latitude=" + lat +
      "&longitude=" + long +
      "&current_weather=true" +
      "&hourly=temperature_2m,relative_humidity_2m,precipitation,cloudcover,visibility,surface_pressure,windspeed_10m" +
      "&daily=temperature_2m_min,temperature_2m_max,sunrise,sunset" +
      "&timezone=auto"
  );

  const data = await response.json();

  // ===============================
  // Current Weather
  // ===============================
  const t = data.current_weather.temperature;
  temp.forEach(el => (el.innerText = t + "°C"));

  description.innerText = getWeatherDescription(
    data.current_weather.weathercode
  );

  wind.innerText = data.current_weather.windspeed + " km/h";

  const currentTime = data.current_weather.time;
  localTime.innerText = currentTime;

  const hourlyTimes = data.hourly.time;
  const currentHour = currentTime.slice(0, 13) + ":00";
  const index = hourlyTimes.indexOf(currentHour);

  precipitation.innerText =
    (data.hourly.precipitation[index] || 0) + " mm";

  humidity.innerText =
    data.hourly.relative_humidity_2m[index] + " %";

  pressure.innerText =
    data.hourly.surface_pressure[index] + " hPa";

  visibility.innerText =
    data.hourly.visibility[index] / 1000 + " km";

  minTemp.innerText =
    data.daily.temperature_2m_min[0] + "°C";

  maxTemp.innerText =
    data.daily.temperature_2m_max[0] + "°C";
    console.log(data);
 cloudCover=data.hourly.cloudcover[index];
 if(cloudCover==0){
  cloudiness.innerText="Clear/Sunny";
 }
 else if(cloudCover>=1 && cloudCover<=25){ 
  cloudiness.innerText="Few clouds";
 }
  else if(cloudCover>=26 && cloudCover<=50){ 
  cloudiness.innerText="scattered clouds";
 }
  else if(cloudCover>=51 && cloudCover<=87){ 
  cloudiness.innerText="broken clouds";
 }
   else { 
  cloudiness.innerText="overcast";
 }


  sunrise.innerText = data.daily.sunrise[0];
  sunset.innerText = data.daily.sunset[0];
  coordinate.innerText = lat + ", " + long;

  // ===============================
  // Hourly Chart Data
  // ===============================
  const labels = data.hourly.time
    .slice(0, 24)
    .map(t => t.slice(11, 16));

  const chartSeries = {
    temperature: {
      label: "Temperature (°C)",
      data: data.hourly.temperature_2m.slice(0, 24),
      color: "#ff7a18",
      bg: "rgba(255, 122, 24, 0.2)"
    },
    humidity: {
      label: "Humidity (%)",
      data: data.hourly.relative_humidity_2m.slice(0, 24),
      color: "#4dabf7",
      bg: "rgba(77, 171, 247, 0.2)"
    },
    wind: {
      label: "Wind Speed (km/h)",
      data: data.hourly.windspeed_10m.slice(0, 24),
      color: "#51cf66",
      bg: "rgba(81, 207, 102, 0.2)"
    }
  };

  // Default chart = Temperature
  hourlyChart.data.labels = labels;
  updateChart(chartSeries.temperature);

  // ===============================
  // Chart Toggle Buttons
  // ===============================
  document.querySelectorAll(".chart-btn").forEach(btn => {
    btn.onclick = () => {
      document
        .querySelectorAll(".chart-btn")
        .forEach(b => b.classList.remove("active"));

      btn.classList.add("active");
      updateChart(chartSeries[btn.dataset.series]);
    };
  });
}

// ===============================
// Update Chart Helper
// ===============================
function updateChart(series) {
  hourlyChart.data.datasets[0].label = series.label;
  hourlyChart.data.datasets[0].data = series.data;
  hourlyChart.data.datasets[0].borderColor = series.color;
  hourlyChart.data.datasets[0].backgroundColor = series.bg;
  hourlyChart.update();
}

// ===============================
// Weather Code Descriptions
// ===============================
function getWeatherDescription(code) {
  const descriptions = {
    0: "Clear sky ☀️",
    1: "Mainly clear 🌤️",
    2: "Partly cloudy ⛅",
    3: "Overcast ☁️",
    45: "Fog 🌫️",
    48: "Rime fog 🌫️❄️",
    51: "Light drizzle 🌦️",
    53: "Moderate drizzle 🌦️",
    55: "Dense drizzle 🌧️",
    61: "Slight rain 🌧️",
    63: "Moderate rain 🌧️",
    65: "Heavy rain 🌧️🌧️",
    71: "Light snow ❄️",
    73: "Moderate snow ❄️❄️",
    75: "Heavy snow ❄️❄️❄️",
    95: "Thunderstorm ⛈️"
  };
  return descriptions[code] || "Unknown weather";
}
