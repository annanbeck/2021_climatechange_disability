var map
var stateLayer
var stateDataLayer
var shapefileLayer
var punishmentLayer
var attrArray = ["WFIR_EALT", "WFIR_EALS", "WFIR_EALR", "historical_90", "slow_90", "no_90", "rapid_90", "incarcerated_20"]

function createMap() {

    var darkBasemap = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
        attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
    }),
        OSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        });

    map = L.map('map', {
        center: [40, -100],
        zoom: 4,
        layers: [darkBasemap, OSM]
    });

    // L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
    //     maxZoom: 20,
    //     attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
    // }).addTo(map);


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

    toggleMainLayers();

    // var baseMaps = {
    //     "Dark Basemap": darkBasemap,
    //     "Open Street Map": OSM
    // }

    // var overlayMaps = {
    //     "State Data": stateDataLayer,
    //     "Point Data": punishmentLayer
    // }

    // layerControl = new L.control.layers(baseMaps, overlayMaps);
    // map.addControl(layerControl)
}



//make color range
/*function getColor(d, min = 1219, max = 248764, startColor = '#fee5d9', endColor = '#a50f15') {
    const scale = chroma.scale([startColor, endColor]).domain([min, max]);
    return scale(d).hex();
};
console.log(getColor)*/

//trying to make color range
// function getColor(d) {
//     return d > 10000  ? '#d7301f' :
//            d > 50000   ? '#fc8d59' :
//            d > 100000   ? '#fdcc8a' :
//                            '#fef0d9' ;
//     };

//make state data into a layer
function statePointToLayer(feature, latlng) {
    //Determine which attribute to visualize with proportional symbols
    var attribute = "incarcerated_20"

    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: heatIndexColorScale(feature),
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8,
        interactive: false
    };

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    geojsonMarkerOptions.radius = calcPropRadius(attValue);

    //Trying to call get color for prop symbols--BROKEN
    // geojsonMarkerOptions.fillColor = getColor(attValue);

    //create circle marker layer
    var stateLayer = L.circleMarker(latlng, geojsonMarkerOptions);

    //return the circle marker to the L.geoJson pointToLayer option
    return stateLayer;
};

function heatIndexColorScale(feature) {
    if (feature.properties["historical_90"] < 40) {
        return "#ffffb2"
    } else if (feature.properties["historical_90"] > 40 && feature.properties["historical_90"] < 80) {
        return "#fecc5c"
    } else if (feature.properties["historical_90"] > 80 && feature.properties["historical_90"] < 120) {
        return "#fd8d3c"
    } else if (feature.properties["historical_90"] > 120 && feature.properties["historical_90"] < 160) {
        return "#f03b20"
    } else if (feature.properties["historical_90"] > 160) {
        return "#bd0026"
    } else return "#ccc"
}

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
        pointToLayer: statePointToLayer
        //onEachFeature: onEachStateFeature
    }).addTo(map)
}

// function onEachStateFeature(feature, layer) {
//     layer.on("dblclick", function () {
//         var bounds = layer.getBounds();
//         map.fitBounds(bounds);
//     })
// }

function getStateData() {
    fetch("data/states-data-heat-wildfire-incarcerated.geojson")
        .then(function (response) {
            return response.json();
        })
        .then(function (json) {
            //storing data as a geoJSON to be called alongside the shapefile layer
            stateDataLayer = json
            //create marker options
            //createStatePropSymbols(json);
        })
};

var borderStyle = {
    "color": "#F09511",
    "weight": 3,
    "opacity": 0.4
};

function onEachShapefileFeature(feature, layer) {
    attribute = "incarcerated_20"

    layer.on("click", function () {
        var bounds = layer.getBounds();
        map.fitBounds(bounds);


        punishmentLayer.setStyle(style)

        function fillFilter(punishmentFeature) {
            if (punishmentFeature.properties.state == feature.properties.STUSPS) {
                return 1;
            }
            else {
                return 0;
            }
        }

        function interactivity(punishmentFeature) {
            if (punishmentFeature.properties.state == feature.properties.STUSPS) {
                return true;
            } else {
                return false
            }
        }

        function style(punishmentFeature) {
            return {
                fillOpacity: fillFilter(punishmentFeature),
                opacity: fillFilter(punishmentFeature),
                interactive: interactivity(punishmentFeature)
            }
        }
    })

    //build popup content string
    var popupContent = "<p><b>State: </b> " + feature.properties.NAME + "</p><p><b> Incarcerated Population: </b> " + feature.properties[attribute] + "</p>";

    //bind the popup to the circle marker
    layer.bindPopup(popupContent);
}

function getShapefileData() {
    fetch("data/shapefile.geojson")
        .then(function (response) {
            return response.json();
        })
        .then(function (json) {
            joinPunishmentShapefile(json, stateDataLayer);
            shapefileLayer = L.geoJSON(json, {
                style: function (feature) {
                    return L.polyline(feature, borderStyle)
                },
                onEachFeature: onEachShapefileFeature
            }).addTo(map);
            createStatePropSymbols(stateDataLayer);
        })
}

//calculate the radius of each proportional symbol
function calcLocalPropRadius(attValue) {
    //constant factor adjusts symbol sizes evenly
    var minRadius = 5;
    //Flannery Apperance Compensation formula (kinda)
    var radius = 1.0083 * Math.pow(attValue / 150, 0.5715) * minRadius
    return radius;
};

function punishmentPointToLayer(feature, latlng) {
    //Determine which attribute to visualize with proportional symbols
    var attribute = "capacity"

    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: heatIndexColorScale(feature),
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
function joinPunishmentShapefile(shapefileLayer, stateLayer) {
    console.log(stateLayer)
    for (var i = 0; i < stateLayer.features.length; i++) {
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
                    var val = parseFloat(state[attr]); //get csv attribute value
                    geojsonProps[attr] = val; //assign attribute and value to geojson properties
                });
            };
        };
    };
    console.log(shapefileLayer.features)
};


function toggleMainLayers() {
    // Get the checkbox
    var radioState = document.getElementById("radioState");
    var radioPoints = document.getElementById("radioPoints");

    radioState.addEventListener('click', function () {
        if (this.checked == true) {
            console.log("this is checked")
            map.addLayer(stateLayer)
            map.addLayer(shapefileLayer)
            if (map.hasLayer(punishmentLayer)) {
                map.removeLayer(punishmentLayer)
            }
            radioPoints.checked = false
        }
    })

    radioPoints.addEventListener('click', function () {
        if (this.checked == true) {
            console.log("this is checked")
            map.removeLayer(stateLayer)
            map.removeLayer(shapefileLayer)
            if (!map.hasLayer(punishmentLayer)) {
                punishmentLayer.addTo(map);
            }
            radioState.checked = false
        }
    });
}

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