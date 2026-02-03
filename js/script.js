const API_URL = "https://restcountries.com/v3.1/all?fields=name,flags,capital";
const container = document.getElementById("countries-container");
const pagination = document.getElementById("pagination");

let countriesData = [];
let currentPage = 1;
const itemsPerPage = 16;

async function fetchCountries() {
    try{
        const response = await fetch(API_URL);
        if(!response.ok) {
            throw new Error(`Failed to fetch countries: ${response.status} ${response.statusText}`);
        }
        countriesData = await response.json();
        renderPage();
        // console.log("Countries fetch successful", countries);
        // console.log("Total countries: ", countries.length);
    }
    catch (error) {
        console.log("Error fetching countries:", error.message);
    }
}

function renderPage(){
    container.innerHTML = "";
    const stIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = stIndex + itemsPerPage;
    const curCountries = countriesData.slice(stIndex, endIndex);
    curCountries.forEach(country => {
        const card = document.createElement("div");
        card.className = "country-card";
        card.innerHTML = 
        `<img src="${country.flags.png}" alt="${country.name.common} flag"></img>
        <div class="country-name">${country.name.common}</div>
        <div class="country-capital">Capital: ${country.capital ? country.capital[0] : "No capital"}</div>`;
        container.appendChild(card);
    });
    renderPagination();
}

function renderPagination(){
    pagination.innerHTML = "";
    const totalPages = Math.ceil(countriesData.length / itemsPerPage);
    for(let i = 1; i <= totalPages; i++){
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

fetchCountries();