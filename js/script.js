const API_URL = "https://restcountries.com/v3.1/all?fields=name,flags,capital";
const container = document.getElementById("countries-container");

async function fetchCountries() {
    try{
        const response = await fetch(API_URL);
        if(!response.ok) {
            throw new Error(`Failed to fetch countries: ${response.status} ${response.statusText}`);
        }
        const countries = await response.json();
        console.log("Countries fetch successful", countries);
        console.log("Total countries: ", countries.length);

        displayCountries(countries);
    }
    catch (error) {
        console.log("Error fetching countries:", error.message);
    }
}

function displayCountries(countries) {
    container.innerHTML = "";
    countries.forEach(country => {
        const card = document.createElement("div");
        card.className = "country-card";
        card.innerHTML = 
        `<img src="${country.flags.png}" alt="${country.name.common} flag"></img>
        <div class="country-name">${country.name.common}</div>
        <div class="country-capital">Capital: ${country.capital ? country.capital[0] : "No capital"}</div>`;
        container.appendChild(card);
    });
}

fetchCountries();