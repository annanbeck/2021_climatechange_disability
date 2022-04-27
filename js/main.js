
var map
var minValue

function createMap() {

    map = L.map('map').setView([40, -100], 4);

    L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
        attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
    }).addTo(map);

    getStateData();

}


//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {

    //constant factor adjusts symbol sizes evenly
    var minRadius = 5;

    //Flannery Apperance Compensation formula (kinda)
    var radius = 1.0083 * Math.pow(attValue / 5000, 0.5715) * minRadius

    return radius;
};

function createPropSymbols(data) {

    //since the only data that we are working working with is incarceration by state, this is the only attribute (no need to iterate)
    var attribute = "incarcerated_20"


    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //creating the geojson layer for the state data
    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            var attValue = Number(feature.properties[attribute]);
            console.log(feature.properties, attValue);
            geojsonMarkerOptions.radius = calcPropRadius(attValue)
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }
    }).addTo(map)
}


function getStateData() {
    fetch("data/states-data-heat-wildfire-incarcerated.geojson")
        .then(function (response) {
            return response.json();
        })
        .then(function (json) {
            //create marker options

            createPropSymbols(json);

            // L.geoJson(json, {
            //     pointToLayer: function (feature, latlng) {
            //         return L.circleMarker(latlng);
            //     }
            // }).addTo(map)

        })
};



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