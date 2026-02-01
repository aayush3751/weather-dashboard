const geourl="https://geocoding-api.open-meteo.com/v1/search?";
const url="https://api.open-meteo.com/v1/forecast?";

const city=document.querySelector(".search-box input ");
const searchButton=document.querySelector(".search-box button");

const temp=document.querySelectorAll("#feels-like , #temperature"); // for temperature data
const des=document.querySelector(".description");

const wind=document.querySelector("#wind");
const humidity=document.querySelector("#humidity");
//min and max temperature
const minTemp=document.querySelector("#temp-min");
const maxTemp=document.querySelector("#temp-max");

//pressure
const pressure=document.querySelector("#pressure");
//for visibility
const visibility=document.querySelector("#visibility");
//for cloudiness
const cloudiness=document.querySelector("#cloudiness");
//for coordinates
const coordinate=document.querySelector("#coords");
//local time
const localTime=document.querySelector("#local-time");
//sunrise
const sunrise=document.querySelector("#sunrise");
//sunset
const sunset=document.querySelector("#sunset");
//precipitation
const precipitation=document.querySelector("#precipitation");
// console.log(city.value);
async function coordinates() {
    const Response=await fetch(geourl+ "name="+ city.value + "&count=1");
    console.log(Response);
    const result=await Response.json();
    const latitude=result.results[0].latitude;
    console.log(latitude);

    const longitude=result.results[0].longitude;
    console.log(longitude);
    weather(latitude, longitude);
 }
searchButton.addEventListener("click", coordinates);
async function weather(lat,long){
  const response=await fetch(url+"latitude="+lat+"&longitude="+long+"&current_weather=true&hourly=relative_humidity_2m,precipitation,cloudcover,visibility,surface_pressure&daily=temperature_2m_min,temperature_2m_max,sunrise,sunset&timezone=auto");
  console.log(response);
  const data=await response.json();
  console.log(data);
  let t=data.current_weather.temperature;
  console.log(t);
  temp.forEach(el =>{
    el.innerText=t+"°C";
  });
  temp.innerText=t+"°C";
  const code = data.current_weather.weathercode;
description.innerText = getWeatherDescription(code);
const currentTime=data.current_weather.time;
const hourlyTimes = data.hourly.time;
// round down to hour
const currentHour = currentTime.slice(0, 13) + ":00";

const index = hourlyTimes.indexOf(currentHour);
let precipNow = 0;
if (index !== -1) {
  precipNow = data.hourly.precipitation[index];
}
precipitation.innerText=precipNow +" mm"; //current precipitation
 const windSpeed = data.current_weather.windspeed;
wind.innerText=windSpeed +" km/h";

// for humidity
const humidityValue = data.hourly.relative_humidity_2m[index];
humidity.innerText=humidityValue +" %";

// for min and max temperature
const minTempValue = data.daily.temperature_2m_min[0];
const maxTempValue = data.daily.temperature_2m_max[0];
minTemp.innerText=minTempValue +"°C";
maxTemp.innerText=maxTempValue +"°C";

// for pressure
const pressureValue = data.hourly.surface_pressure[index];
pressure.innerText=pressureValue +" hPa";

//for visibility
visibility.innerText=(data.hourly.visibility[index] / 1000) + " km";

//for coordinates
coordinate.innerText=lat + ", " + long;

//for local time
localTime.innerText=currentTime;

//for sunrise
sunrise.innerText=data.daily.sunrise[0];

//for sunset
sunset.innerText=data.daily.sunset[0];
}
//weather description
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
    56: "Freezing drizzle ❄️🌧️",
    57: "Dense freezing drizzle ❄️🌧️",
    61: "Slight rain 🌧️",
    63: "Moderate rain 🌧️",
    65: "Heavy rain 🌧️🌧️",
    66: "Freezing rain ❄️🌧️",
    67: "Heavy freezing rain ❄️🌧️",
    71: "Light snow ❄️",
    73: "Moderate snow ❄️❄️",
    75: "Heavy snow ❄️❄️❄️",
    77: "Snow grains ❄️",
    80: "Rain showers 🌦️",
    81: "Moderate rain showers 🌧️",
    82: "Heavy rain showers ⛈️",
    85: "Snow showers ❄️",
    86: "Heavy snow showers ❄️❄️",
    95: "Thunderstorm ⛈️",
    96: "Thunderstorm with hail ⛈️🧊",
    99: "Thunderstorm with heavy hail ⛈️🧊🧊"
  };
  return descriptions[code] || "Unknown weather";
}




