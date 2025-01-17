var map
var stateLayer
var stateDataLayer
var shapefileLayer
var punishmentLayer
var attrArray = ["WFIR_EALT", "WFIR_EALS", "WFIR_EALR", "historical_90", "slow_90", "no_90", "rapid_90", "incarcerated_20"]
var autocompleteArray = []

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

    /*Legend specific*/
    var legend = L.control({ position: "bottomleft" });//how get in sidepanel??

    legend.onAdd = function (map) {
        var div = L.DomUtil.create("div", "legend");
        div.innerHTML += "<h4>Days above 90 degrees in 2070</h4>";
        div.innerHTML += '<i style="background: #ffffb2"></i><span>Fewer than 40</span><br>';
        div.innerHTML += '<i style="background: #fecc5c"></i><span>40-79</span><br>';
        div.innerHTML += '<i style="background: #fd8d3c"></i><span>80-119</span><br>';
        div.innerHTML += '<i style="background: #f03b20"></i><span>120-159</span><br>';
        div.innerHTML += '<i style="background: #bd0026"></i><span>More than 159</span><br>';
        div.innerHTML += '<i style="background: #ccc"></i><span>No Data</span><br>';

        return div;
    };

    legend.addTo(map);
    //add legend
    /*.addControl(new L.Legend({
        'position': 'topleft',
        'content': PunishmentData  
    })).on('click', function (e) {
    
        // use reference on mapinstance
        this.legend.setContent(new data);
    
    });*/

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
    autocomplete(document.getElementById("search"), autocompleteArray, punishmentLayer)


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
        fillColor: heatIndexColorScale(feature, "slow_90"),
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
//add if attribute =no_90, etc.
function heatIndexColorScale(feature, attribute) {
    if (feature.properties[attribute] <= 39) {
        return "#ffffb2"
    } else if (feature.properties[attribute] >= 40 && feature.properties[attribute] <= 80) {
        return "#fecc5c"
    } else if (feature.properties[attribute] >= 81 && feature.properties[attribute] <= 120) {
        return "#fd8d3c"
    } else if (feature.properties[attribute] >= 121 && feature.properties[attribute] <= 160) {
        return "#f03b20"
    } else if (feature.properties[attribute] >= 161) {
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
    "opacity": 0
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
        fillColor: heatIndexColorScale(feature, "slow_90"),
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
    var popupContent = "<p><b>Institution Name: </b> " + feature.properties.name + "</p><p><b> Incarcerated Population Capacity: </b> " + feature.properties[attribute] + "</p>" + "<p><b>Historical number of days above 90 degrees: </b>" + parseInt(feature.properties.historical_90) + "</p>" + "<p><b>Number of days above 90 degrees with NO climate action: </b>" + parseInt(feature.properties.no_90) + "</p>" + "<p><b>Number of days above 90 degrees with SLOW climate action: </b>" + parseInt(feature.properties.slow_90) + "</p>" + "<p><b>Number of days above 90 degrees with RAPID: </b>" + parseInt(feature.properties.rapid_90) + "</p>";

    //bind the popup to the circle marker
    // punishmentLayer.bindPopup(popupContent);

    //return the circle marker to the L.geoJson pointToLayer option
    return punishmentLayer;
};

function onEachPunishmentFeature(feature, layer) {

    //build popup content string
    var popupContent = "<p><b>Institution Name: </b> " + feature.properties.name + "</p><p><b> Incarcerated Population Capacity: </b> " + feature.properties[attribute] + "</p>" + "<p><b>Historical number of days above 90 degrees: </b>" + parseInt(feature.properties.historical_90) + "</p>" + "<p><b>Number of days above 90 degrees with NO climate action: </b>" + parseInt(feature.properties.no_90) + "</p>" + "<p><b>Number of days above 90 degrees with SLOW climate action: </b>" + parseInt(feature.properties.slow_90) + "</p>" + "<p><b>Number of days above 90 degrees with RAPID: </b>" + parseInt(feature.properties.rapid_90) + "</p>";

    layer.on({
        click: function populate() {
            document.getElementById("sidepanelRetrieve").innerHTML = popupContent
        }
    })
}

function createPunishmentPropSymbols(data) {
    //creating the geojson layer for the state data

    punishmentLayer = L.geoJson(data, {
        pointToLayer: punishmentPointToLayer,
        onEachFeature: onEachPunishmentFeature

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
            autocomplete(document.getElementById("search"), autocompleteArray, json)



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

            //project the psych dataset
            createPsychPropSymbols(json);
        })
}



//trying to shapefile and state point data to be able to get data when we click on shapefile
function joinPunishmentShapefile(shapefileLayer, stateLayer) {
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
};


function toggleMainLayers() {
    // Get the checkbox
    var radioState = document.getElementById("radioState");
    var radioPoints = document.getElementById("radioPoints");

    radioState.addEventListener('change', function () {
        if (this.checked == true) {
            map.addLayer(stateLayer)
            map.addLayer(shapefileLayer)
            if (map.hasLayer(punishmentLayer)) {
                map.removeLayer(punishmentLayer)
            }
            radioPoints.checked = false
        }
    })

    radioPoints.addEventListener('change', function () {
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
    //loop that goes through each radio button that has temp as category
    document.querySelectorAll(".temp").forEach(function (radio) {
        radio.addEventListener('change', function () {
            stateLayer.setStyle(function (feature) {
                return {
                    fillColor: heatIndexColorScale(feature, radio.id),
                }
            })
            punishmentLayer.setStyle(function (feature) {
                return {
                    fillColor: heatIndexColorScale(feature, radio.id),
                }
            })
        })
    })
}
//build another one for wildfire



//autocomplete search bar

function autocomplete(inp, arr, punishmentLayer) {

    for (i = 0; i < punishmentLayer.features.length; i++) {
        autocompleteArray.push(punishmentLayer.features[i].properties.name)
    }

    console.log(autocompleteArray)


    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function (e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false; }
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
            /*check if the item starts with the same letters as the text field value:*/
            if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                /*create a DIV element for each matching element:*/
                b = document.createElement("DIV");
                /*make the matching letters bold:*/
                b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
                b.innerHTML += arr[i].substr(val.length);
                /*insert a input field that will hold the current array item's value:*/
                b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function (e) {
                    /*insert the value for the autocomplete text field:*/
                    inp.value = this.getElementsByTagName("input")[0].value;
                    /*close the list of autocompleted values,
                    (or any other open lists of autocompleted values:*/
                    closeAllLists();
                });
                a.appendChild(b);
            }
        }
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function (e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
            /*If the arrow DOWN key is pressed,
            increase the currentFocus variable:*/
            currentFocus++;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 38) { //up
            /*If the arrow UP key is pressed,
            decrease the currentFocus variable:*/
            currentFocus--;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 13) {
            /*If the ENTER key is pressed, prevent the form from being submitted,*/
            e.preventDefault();
            if (currentFocus > -1) {
                /*and simulate a click on the "active" item:*/
                if (x) x[currentFocus].click();
            }
        }
    });
    function addActive(x) {
        /*a function to classify an item as "active":*/
        if (!x) return false;
        /*start by removing the "active" class on all items:*/
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        /*add class "autocomplete-active":*/
        x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
        /*a function to remove the "active" class from all autocomplete items:*/
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }
    function closeAllLists(elmnt) {
        /*close all autocomplete lists in the document,
        except the one passed as an argument:*/
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
        closeAllLists(e.target)
        var bounds = map.getBounds(this.value)
        map.fitBounds(bounds)
        console.log(bounds)
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