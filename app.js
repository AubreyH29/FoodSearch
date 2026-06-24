const home = document.querySelector("#home");
const mapPage = document.querySelector("#mapPage");
const startButton = document.querySelector("#startButton");
const backButton = document.querySelector("#backButton");
const refreshButton = document.querySelector("#refreshButton");
const locationSearchForm = document.querySelector("#locationSearchForm");
const locationInput = document.querySelector("#locationInput");
const statusMessage = document.querySelector("#status");
const restaurantMap = document.querySelector("#restaurantMap");
const openMapsLink = document.querySelector("#openMapsLink");
const foodTypeFilter = document.querySelector("#foodTypeFilter");

let currentLocation = "";
let currentFoodType = "";

function showMapPage() {
  home.classList.add("is-hidden");
  mapPage.classList.remove("is-hidden");
  loadNearbyRestaurants();
}

function showHomePage() {
  mapPage.classList.add("is-hidden");
  home.classList.remove("is-hidden");
}

function setStatus(message, type = "neutral") {
  statusMessage.textContent = message;
  statusMessage.dataset.type = type;
}

function updateRestaurantMap(query, message) {
  const embedUrl = `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

  restaurantMap.src = embedUrl;
  openMapsLink.href = mapsUrl;
  setStatus(message, "success");
}

function buildQuery(location, foodType) {
  let query = `${foodType ? foodType + " " : ""}restaurants near ${location}`;
  return query;
}

function updateMap(latitude, longitude) {
  currentLocation = `${latitude},${longitude}`;
  const query = buildQuery(currentLocation, currentFoodType);
  updateRestaurantMap(
    query,
    currentFoodType 
      ? `Showing ${currentFoodType} restaurants near your current location.`
      : "Showing restaurants near your current location."
  );
}

function searchRestaurantsByLocation(location) {
  const trimmedLocation = location.trim();

  if (!trimmedLocation) {
    setStatus("Enter a location to search for restaurants.", "error");
    locationInput.focus();
    return;
  }

  currentLocation = trimmedLocation;
  const query = buildQuery(currentLocation, currentFoodType);
  const statusText = currentFoodType
    ? `Showing ${currentFoodType} restaurants near ${trimmedLocation}.`
    : `Showing restaurants near ${trimmedLocation}.`;
  updateRestaurantMap(query, statusText);
}

function loadNearbyRestaurants() {
  if (!navigator.geolocation) {
    setStatus("Your browser does not support location access. Open Google Maps manually instead.", "error");
    openMapsLink.href = "https://www.google.com/maps/search/restaurants+near+me";
    restaurantMap.src = "https://www.google.com/maps?q=restaurants+near+me&output=embed";
    return;
  }

  setStatus("Requesting your location...");

  navigator.geolocation.getCurrentPosition(
    (position) => {
      updateMap(position.coords.latitude, position.coords.longitude);
    },
    () => {
      setStatus("Location access was blocked. Showing a general nearby restaurant search.", "error");
      openMapsLink.href = "https://www.google.com/maps/search/restaurants+near+me";
      restaurantMap.src = "https://www.google.com/maps?q=restaurants+near+me&output=embed";
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000,
    }
  );
}

function updateMapWithCurrentLocation() {
  if (currentLocation) {
    const query = buildQuery(currentLocation, currentFoodType);
    const statusText = currentFoodType
      ? `Showing ${currentFoodType} restaurants.`
      : "Showing restaurants.";
    updateRestaurantMap(query, statusText);
  }
}

startButton.addEventListener("click", showMapPage);
backButton.addEventListener("click", showHomePage);
refreshButton.addEventListener("click", loadNearbyRestaurants);
locationSearchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  searchRestaurantsByLocation(locationInput.value);
});
foodTypeFilter.addEventListener("change", (event) => {
  currentFoodType = event.target.value;
  updateMapWithCurrentLocation();
});
