const API_URL = "https://restcountries.com/v3.1/all?fields=name,flags,capital,currencies,latlng,borders,region";

const container = document.getElementById("countries-container");
const pagination = document.getElementById("pagination");

const modal = document.getElementById("countryModal");
const closeModalBtn = document.getElementById("closeModal");

const modalTitle = document.getElementById("modalTitle");
const modalCurrency = document.getElementById("modalCurrency");
const modalLatitude = document.getElementById("modalLatitude");
const modalBorders = document.getElementById("modalBorders");
const modalRegion = document.getElementById("modalRegion");
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
    img.addEventListener("click", () => { openModal(country);});
    const nameDiv = document.createElement("div");
    nameDiv.className = "country-name";
    nameDiv.textContent = country.name.common;
    const capitalDiv = document.createElement("div");
    capitalDiv.className = "country-capital";
    capitalDiv.textContent = `Capital: ${ country.capital ? country.capital[0] : "No capital" }`;
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
  modal.classList.remove("hidden");
}

closeModalBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
});

modal.addEventListener("click", e => {
  if (e.target === modal) {
    modal.classList.add("hidden");
  }
});

function renderPagination() {
  pagination.innerHTML = "";
  const dataSource = isSearching ? filteredData : countriesData;
  const totalPages = Math.ceil(dataSource.length / itemsPerPage);
  for(let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if(i === currentPage)
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

fetchCountries();