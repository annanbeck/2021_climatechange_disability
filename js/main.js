var map
var stateLayer
var shapefileLayer
var punishmentLayer
var attrArray = ["WFIR_EALT", "WFIR_EALS", "WFIR_EALR", "historical_90", "slow_90", "no_90", "rapid_90", "incarcerated_20"]

function createMap() {

    map = L.map('map').setView([40, -100], 4);

    L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
        attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
    }).addTo(map);


    //at a particular zoom level, this will add the point files and remove the state level data
    map.on('zoomend', function () {
        if (map.getZoom() > 6) {
            map.removeLayer(stateLayer)
            map.removeLayer(shapefileLayer)
            if (!map.hasLayer(punishmentLayer))
                punishmentLayer.addTo(map);
        }
        else {
            map.addLayer(stateLayer)
            map.addLayer(shapefileLayer)
            if (map.hasLayer(punishmentLayer)) {
                map.removeLayer(punishmentLayer)
            }
        }
    });

    getStateData();
    getShapefileData();
    getPunishmentData();
    getPsychData();

    var joinedStateData = joinPunishmentShapefile(stateLayer, shapefileLayer);

}

//make color range
/*function getColor(d, min = 1219, max = 248764, startColor = '#fee5d9', endColor = '#a50f15') {
    const scale = chroma.scale([startColor, endColor]).domain([min, max]);
    return scale(d).hex();
};
console.log(getColor)*/

//trying to make color range
function getColor(d) {
    return d > 10000  ? '#d7301f' :
           d > 50000   ? '#fc8d59' :
           d > 100000   ? '#fdcc8a' :
                           '#fef0d9' ;
    };

//make state data into a layer
function statePointToLayer(feature, latlng) {
    //Determine which attribute to visualize with proportional symbols
    var attribute = "incarcerated_20"

    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    geojsonMarkerOptions.radius = calcPropRadius(attValue);

    //Trying to call get color for prop symbols--BROKEN
    // geojsonMarkerOptions.fillColor = getColor(attValue);

    //create circle marker layer
    var stateLayer = L.circleMarker(latlng, geojsonMarkerOptions);

    //build popup content string
    var popupContent = "<p><b>State: </b> " + feature.properties.STATE + "</p><p><b> Incarcerated Population: </b> " + feature.properties[attribute] + "</p>";

    //bind the popup to the circle marker
    stateLayer.bindPopup(popupContent);

    //return the circle marker to the L.geoJson pointToLayer option
    return stateLayer;
};

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //constant factor adjusts symbol sizes evenly
    var minRadius = 5;
    //Flannery Apperance Compensation formula (kinda)
    var radius = 1.0083 * Math.pow(attValue / 5000, 0.5715) * minRadius
    return radius;
};

function createStatePropSymbols(data) {
    //creating the geojson layer for the state data
    stateLayer = L.geoJson(data, {
        pointToLayer: statePointToLayer,
        onEachFeature: onEachStateFeature
    }).addTo(map)
}

function onEachStateFeature(feature, layer) {
    layer.on("click", function () {
        var bounds = joinedStateData.getBounds();
        map.fitBounds(bounds);
    })
}

function getStateData() {
    fetch("data/states-data-heat-wildfire-incarcerated.geojson")
        .then(function (response) {
            return response.json();
        })
        .then(function (json) {

            //create marker options
            createStatePropSymbols(json);
        })
};

var borderStyle = {
    "color": "#F09511",
    "weight": 3,
    "opacity": 0.4
};

function onEachShapefileFeature(feature, layer) {
    layer.on("dblclick", function () {
        var bounds = layer.getBounds();
        map.fitBounds(bounds);
    })
}

function shapefilePointToLayer(feature, layer) {
    //build popup content string
    var popupContent = "<p><b>State: </b> " + feature.properties.STATE + "</p><p><b> Incarcerated Population: </b> " + feature.properties[attribute] + "</p>";

    //bind the popup to the circle marker
    shapefileLayer.bindPopup(popupContent);

    return shapefileLayer;
}

function getShapefileData() {
    fetch("data/shapefile.geojson")
        .then(function (response) {
            return response.json();
        })
        .then(function (json) {
            shapefileLayer = L.geoJSON(json, {
                style: function (feature) {
                    return L.polyline(feature, borderStyle)
                },
                onEachFeature: onEachShapefileFeature,
                pointToLayer: shapefilePointToLayer
            }).addTo(map);
        })
}

//calculate the radius of each proportional symbol
function calcLocalPropRadius(attValue) {
    //constant factor adjusts symbol sizes evenly
    var minRadius = 5;
    //Flannery Apperance Compensation formula (kinda)
    var radius = 1.0083 * Math.pow(attValue / 50, 0.5715) * minRadius
    return radius;
};

function punishmentPointToLayer(feature, latlng) {
    //Determine which attribute to visualize with proportional symbols
    var attribute = "capacity"

    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    geojsonMarkerOptions.radius = calcLocalPropRadius(attValue);

    //create circle marker layer
    var punishmentLayer = L.circleMarker(latlng, geojsonMarkerOptions);

    //build popup content string
    var popupContent = "<p><b>Institution Name: </b> " + feature.properties.name + "</p><p><b> Incarcerated Population Capacity: </b> " + feature.properties[attribute] + "</p>";

    //bind the popup to the circle marker
    punishmentLayer.bindPopup(popupContent);

    //return the circle marker to the L.geoJson pointToLayer option
    return punishmentLayer;
};

function createPunishmentPropSymbols(data) {
    //creating the geojson layer for the state data
    punishmentLayer = L.geoJson(data, {
        pointToLayer: punishmentPointToLayer
    });
}

//fetch the punishment dataset
function getPunishmentData() {
    fetch("data/punishment-heat-wildfire-clean.geojson")
        .then(function (response) {
            return response.json();
        })
        .then(function (json) {

            //project the punishment dataset
            createPunishmentPropSymbols(json);
        })
}

function psychPointToLayer(feature, latlng) {
    //Determine which attribute to visualize with proportional symbols
    var attribute = "psych_2014"

    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    geojsonMarkerOptions.radius = calcPropRadius(attValue);

    //create circle marker layer
    var psychLayer = L.circleMarker(latlng, geojsonMarkerOptions);

    //build popup content string
    var popupContent = "<p><b>State: </b> " + feature.properties.STATE + "</p><p><b> Number of psychiatric inpatients: </b> " + feature.properties[attribute] + "</p>";

    //bind the popup to the circle marker
    psychLayer.bindPopup(popupContent);

    //return the circle marker to the L.geoJson pointToLayer option
    return psychLayer;
};

function createPsychPropSymbols(data) {
    //creating the geojson layer for the state data
    psychLayer = L.geoJson(data, {
        pointToLayer: psychPointToLayer
    });
}

//fetch the punishment dataset
function getPsychData() {
    fetch("data/states-data-heat-wildfire-incarcerated-psych.geojson")
        .then(function (response) {
            return response.json();
        })
        .then(function (json) {

            //project the punishment dataset
            createPsychPropSymbols(json);
        })
}



//trying to shapefile and state point data to be able to get data when we click on shapefile
function joinPunishmentShapefile() {
    for (var i = 0; i < stateLayer.feature.length; i++) {
        var state = stateLayer.features[i].properties; //the current county
        var stateKey = state.STATEFIPS; //the CSV primary key for each county (Connector with GEOID)

        //loop through geojson regions to find correct region
        for (var a = 0; a < shapefileLayer.features.length; a++) {

            var geojsonProps = shapefileLayer.features[a].properties; //the current region geojson properties
            var geojsonKey = geojsonProps.STATEFIPS; //the geojson primary key (connector with FIPS)

            //where primary keys match, transfer csv data to geojson properties object
            if (geojsonKey == stateKey) {

                //assign all attributes and values
                attrArray.forEach(function (attr) {
                    var val = parseFloat(csvCounty[attr]); //get csv attribute value
                    geojsonProps[attr] = val; //assign attribute and value to geojson properties
                });
            };
        };
    };
};

//visualize point data
//1. fetch data (DONE)
//1.1  visualize State data (DONE)
//3. pointToLayer (should be easy?) (DONE)
//3.1 set up onEachFeature + Zoom (Zoom to bounding box)
//1.2  visualize point data
//3. pointToLayer (for point data)
//4. proportionalize circles


//add filters
//1. add filters for each type of jail to remove points

//add overlays
//1. add overlays to visualize each attribute data

document.addEventListener('DOMContentLoaded', createMap);