const API_URL = "https://restcountries.com/v3.1/all?fields=name,flags,capital,currencies,latlng,borders,region";
// const ACCU_API_KEY = Your ApI_KEY;

const container = document.getElementById("countries-container");
const pagination = document.getElementById("pagination");

const modal = document.getElementById("countryModal");
const closeModalBtn = document.getElementById("closeModal");

const modalTitle = document.getElementById("modalTitle");
const modalCurrency = document.getElementById("modalCurrency");
const modalLatitude = document.getElementById("modalLatitude");
const modalBorders = document.getElementById("modalBorders");
const modalRegion = document.getElementById("modalRegion");
const modalTemp = document.getElementById("modalTemp");
const modalCondition = document.getElementById("modalCondition");
const modalHumidity = document.getElementById("modalHumidity");
const modalWind = document.getElementById("modalWind");
const modalRealFeel = document.getElementById("modalRealFeel");
let filteredData = [];
let isSearching = false;

const searchInput = document.getElementById("searchInput");

let countriesData = [];
let currentPage = 1;
const itemsPerPage = 16;

async function fetchCountries() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok)
      throw new Error(`Failed to fetch countries: ${response.status} ${response.statusText}`);
    countriesData = await response.json();
    filteredData = countriesData;
    renderPage();
  }
  catch (error) {
    console.error("Error fetching countries:", error.message);
  }
}

function renderPage() {
  container.innerHTML = "";
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const dataSource = isSearching ? filteredData : countriesData;
  const currentCountries = dataSource.slice(startIndex, endIndex);
  currentCountries.forEach(country => {
    const card = document.createElement("div");
    card.className = "country-card";
    const img = document.createElement("img");
    img.src = country.flags.png;
    img.alt = `${country.name.common} flag`;
    img.addEventListener("click", () => openModal(country));
    const nameDiv = document.createElement("div");
    nameDiv.className = "country-name";
    nameDiv.textContent = country.name.common;
    const capitalDiv = document.createElement("div");
    capitalDiv.className = "country-capital";
    capitalDiv.textContent = `Capital: ${country.capital ? country.capital[0] : "No capital"}`;
    card.appendChild(img);
    card.appendChild(nameDiv);
    card.appendChild(capitalDiv);
    container.appendChild(card);
  });

  renderPagination();
}

function openModal(country) {
  modalTitle.textContent = country.name.official;
  const currencyObj = country.currencies ? Object.values(country.currencies)[0] : null;
  modalCurrency.textContent = currencyObj?.symbol || "N/A";
  modalLatitude.textContent = country.latlng?.[0] ?? "N/A";
  modalBorders.textContent = country.borders?.join(", ") || "None";
  modalRegion.textContent = country.region || "N/A";
  modalTemp.textContent = "Loading...";
  modalCondition.textContent = "Loading...";
  modalHumidity.textContent = "Loading...";
  modalWind.textContent = "Loading...";
  modalRealFeel.textContent = "Loading...";
  modal.classList.remove("hidden");
  if (country.latlng && country.latlng.length >= 2) {
    getWeather(country.latlng[0], country.latlng[1]).then(weather => {
      modalTemp.textContent = weather.temp;
      modalCondition.textContent = weather.condition;
      modalHumidity.textContent = weather.humidity;
      modalWind.textContent = weather.wind;
      modalRealFeel.textContent = weather.realFeel;
    });
  }
  else {
    modalTemp.textContent = "N/A";
    modalCondition.textContent = "N/A";
    modalHumidity.textContent = "N/A";
    modalWind.textContent = "N/A";
    modalRealFeel.textContent = "N/A";
  }
}

closeModalBtn.addEventListener("click", () => { modal.classList.add("hidden"); });
modal.addEventListener("click", e => {
  if (e.target === modal)
    modal.classList.add("hidden");
});

function renderPagination() {
  pagination.innerHTML = "";
  const dataSource = isSearching ? filteredData : countriesData;
  const totalPages = Math.ceil(dataSource.length / itemsPerPage);
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === currentPage)
      btn.classList.add("active");
    btn.addEventListener("click", () => {
      currentPage = i;
      renderPage();
    });
    pagination.appendChild(btn);
  }
}

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLowerCase();
  if (query === "") {
    isSearching = false;
    filteredData = countriesData;
  } else {
    isSearching = true;
    filteredData = countriesData.filter(country =>
      country.name.common.toLowerCase().startsWith(query)
    );
  }
  currentPage = 1;
  renderPage();
});

const weatherCache = new Map();
async function getWeather(lat, lon) {
  const cacheKey = `${lat},${lon}`;
  if (weatherCache.has(cacheKey))
    return weatherCache.get(cacheKey);
  try {
    const locationUrl = `https://dataservice.accuweather.com/locations/v1/cities/geoposition/search` + `?apikey=${ACCU_API_KEY}&q=${lat},${lon}`;
    const locationResponse = await fetch(locationUrl);
    console.log("Location response:", locationResponse);
    if (!locationResponse.ok)
      throw new Error("Location fetch failed");
    const locationData = await locationResponse.json();
    const locationKey = locationData.Key;
    const weatherUrl = `https://dataservice.accuweather.com/currentconditions/v1/${locationKey}` + `?apikey=${ACCU_API_KEY}&details=true`;
    const weatherResponse = await fetch(weatherUrl);
    if (!weatherResponse)
      throw new Error("Weather fetch failed");
    const weatherData = await weatherResponse.json();
    const weatherInfo = {
      temp: weatherData[0].Temperature.Metric.Value + "°C", condition: weatherData[0].WeatherText, humidity: weatherData[0].RelativeHumidity + "%",
      wind: weatherData[0].Wind.Speed.Metric.Value + " km/h", realFeel: weatherData[0].RealFeelTemperature.Metric.Value + "°C"
    };
    weatherCache.set(cacheKey, weatherInfo);
    return weatherInfo;
  }
  catch (error) {
    return { temp: "N/A", condition: "Unavailable", humidity: "N/A", wind: "N/A", realFeel: "N/A" };
  }
}

fetchCountries();