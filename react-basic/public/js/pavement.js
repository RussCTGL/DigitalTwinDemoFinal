// Load map for pavement sensor page
const paveMap = L.map("pavement-map").setView([43.063, -89.42], 13);
// Load OpenStreetMap
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
  maxZoom: 19,
}).addTo(paveMap);

fetch("../wBeltLineHW.geojson")
  .then((response) => response.json())
  .then((data) => {
    L.geoJSON(data, {}).addTo(paveMap);
  })
  .catch((error) => {
    console.error("Error fetching JSON:", error);
  });
