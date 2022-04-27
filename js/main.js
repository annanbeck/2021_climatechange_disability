
var map

function createMap() {

    map = L.map('map').setView([30, -105], 1);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

}

//visualize point data
//1. fetch data
    //1.1  visualize State data
    //1.2  visualize point data
//3. pointToLayer (should be easy?)
    //3.1 set up onEachFeature + Zoom (Zoom to bounding box)
//4. proportionalize circles


//add filters
//1. add filters for each type of jail to remove points

//add overlays
//1. add overlays to visualize each attribute data

document.addEventListener('DOMContentLoaded', createMap);