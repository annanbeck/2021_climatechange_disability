//lol does this work
var map
var stateLayer
var stateDataLayer
var shapefileLayer
var punishmentLayer
var psychLayer
var attrArray = ["WFIR_EALT", "WFIR_EALS", "WFIR_EALR", "historical_90", "slow_90", "no_90", "rapid_90", "incarcerated_20"]
var autocompleteArray = []
var attribute
var attributeColor = "historical_90"
var facilityType = "everything"
var facilityColumn = "everything"

function createMap() {

    var darkBasemap = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
        attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
    }),
        OSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }),
        Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        });

    map = L.map('map', {
        center: [40, -100],
        zoom: 4,
        layers: [OSM, Esri_WorldImagery, darkBasemap]
    });
    //repositions the zoom controls so they are visible
    function addControlPlaceholders(map) {
        var corners = map._controlCorners,
            l = 'leaflet-',
            container = map._controlContainer;

        function createCorner(vSide, hSide) {
            var className = l + vSide + ' ' + l + hSide;

            corners[vSide + hSide] = L.DomUtil.create('div', className, container);
        }

        createCorner('verticalcenter', 'left');
        createCorner('verticalcenter', 'right');
    }
    addControlPlaceholders(map);

    // Change the position of the Zoom Control to a newly created placeholder.
    map.zoomControl.setPosition('verticalcenterright');

    // You can also put other controls in the same placeholder.
    L.control.scale({ position: 'verticalcenterright' }).addTo(map);

    /*Legend specific*/

    // legend.addTo(map);
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
            if (!map.hasLayer(psychLayer))
                psychLayer.addTo(map);
        }
        else {
            map.addLayer(stateLayer)
            map.addLayer(shapefileLayer)
            if (map.hasLayer(punishmentLayer))
                map.removeLayer(punishmentLayer);
            if (map.hasLayer(psychLayer))
                map.removeLayer(psychLayer);
        }
    });

    getStateData();
    getShapefileData();
    getPunishmentData();
    getPsychData();

    toggleMainLayers();
    createLegend("Historical");
    collapsible()




    var baseMaps = {
        "Open Street Map": OSM,
        "Esri World Imagery": Esri_WorldImagery,
        "Dark Basemap": darkBasemap
    }

    layerControl = L.control.layers(baseMaps, null);
    map.addControl(layerControl)
}

function collapsible() {
    var coll = document.getElementsByClassName("collapsible");
    var i;

    for (i = 0; i < coll.length; i++) {
        coll[i].addEventListener("click", function () {
            this.classList.toggle("active");
            var content = this.nextElementSibling;
            if (content.style.display === "block") {
                content.style.display = "none";
            } else {
                content.style.display = "block";
            }
        });
    }
}

///////////////////////////LEGEND////////////////////////////////
function createLegend(legendTemp) {
    var legend = document.querySelector("#legend")

    // L.control({ position: "bottomleft" 9});//how get in sidepanel?? 


    if (legendTemp == "WFIR_EALR") {
        legend.innerHTML += '<h4 class="legendTitle">Current Wildfire Risk <span class="legendTemp">' + legendTemp + '</span></h4>';
        legend.innerHTML += '<i style="background: #ffffb2"></i><span>Very Low</span><br>';
        legend.innerHTML += '<i style="background: #fecc5c"></i><span>Relatively Low</span><br>';
        legend.innerHTML += '<i style="background: #fd8d3c"></i><span>Relatively Moderate</span><br>';
        legend.innerHTML += '<i style="background: #f03b20"></i><span>Relatively High</span><br>';
        legend.innerHTML += '<i style="background: #bd0026"></i><span>Very High</span><br>';
        legend.innerHTML += '<i style="background: #ccc"></i><span>No Data</span><br>';
    } else {

        legend.innerHTML += '<h4 class="legendTitle">Days above 90 degrees in 2100 <span class="legendTemp">' + legendTemp + '</span></h4>';
        legend.innerHTML += '<i style="background: #ffffb2"></i><span>Fewer than 40</span><br>';
        legend.innerHTML += '<i style="background: #fecc5c"></i><span>40-79</span><br>';
        legend.innerHTML += '<i style="background: #fd8d3c"></i><span>80-119</span><br>';
        legend.innerHTML += '<i style="background: #f03b20"></i><span>120-159</span><br>';
        legend.innerHTML += '<i style="background: #bd0026"></i><span>More than 159</span><br>';
        legend.innerHTML += '<i style="background: #ccc"></i><span>No Data</span><br>';

    }
}

function updateLegend(attribute) {
    document.querySelector("#legend").innerHTML = "";
    var legendTemp = attribute;

    createLegend(legendTemp)
    //document.querySelector("span.legendTemp").innerHTML = legendTemp;

}


//make state data into a layer
function statePointToLayer(feature, latlng) {
    //Determine which attribute to visualize with proportional symbols
    var attribute = "incarcerated_20"

    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: heatIndexColorScale(feature, "historical_90"),
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

///////////////////////PROP SYMBOL COLOR FUNCTION///////////////////////////////
function heatIndexColorScale(feature, attributeCurrent) {

    if (attributeCurrent == "historical_90" || attributeCurrent == "slow_90" || attributeCurrent == "no_90" || attributeCurrent == "rapid_90") {
        if (feature.properties[attributeCurrent] <= 39.999999) {
            return "#ffffb2"
        } else if (feature.properties[attributeCurrent] >= 40 && feature.properties[attributeCurrent] <= 79.999999) {
            return "#fecc5c"
        } else if (feature.properties[attributeCurrent] >= 80 && feature.properties[attributeCurrent] <= 120.999999) {
            return "#fd8d3c"
        } else if (feature.properties[attributeCurrent] >= 121 && feature.properties[attributeCurrent] <= 160.999999) {
            return "#f03b20"
        } else if (feature.properties[attributeCurrent] >= 161) {
            return "#bd0026"
        } else return "#ccc"
    } else if (attributeCurrent == "WFIR_EALR") {
        if (feature.properties[attributeCurrent] == "Very Low") {
            return "#ffffb2"
        } else if (feature.properties[attributeCurrent] == "Relatively Low") {
            return "#fecc5c"
        } else if (feature.properties[attributeCurrent] == "Relatively Moderate") {
            return "#fd8d3c"
        } else if (feature.properties[attributeCurrent] == "Relatively High") {
            return "#f03b20"
        } else if (feature.properties[attributeCurrent] == "Very High") {
            return "#bd0026"
        } else return "#ccc"
    }
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
    "color": "rgba(0,0,0,0)",
    "weight": 0,
    "opacity": 0
};

function onEachShapefileFeature(feature, layer) {
    attribute = "incarcerated_20"

    layer.on("click", function () {
        var bounds = layer.getBounds();
        map.fitBounds(bounds);

        punishmentLayer.setStyle(style)
        psychLayer.setStyle(style)

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

        function fillFilter(psychFeature) {
            if (psychFeature.properties.state == feature.properties.STUSPS) {
                return 1;
            }
            else {
                return 0;
            }
        }

        function interactivity(psychFeature) {
            if (psychFeature.properties.state == feature.properties.STUSPS) {
                return true;
            } else {
                return false
            }
        }


        function style(psychFeature) {
            return {
                fillOpacity: fillFilter(psychFeature),
                opacity: fillFilter(psychFeature),
                interactive: interactivity(psychFeature)
            }
        }
    })

    function removeStyle() {
        if (map.getZoom() > 6) {
            psychLayer.setStyle(function () {
                return {
                    fillOpacity: 1,
                    opacity: 1,
                    interative: true
                }

            })
            punishmentLayer.setStyle(function () {
                return {
                    fillOpacity: 1,
                    opacity: 1,
                    interative: true
                }

            })
        }
    }

    //build popup content string
    var popupContent = "<p><b>State: </b> " + feature.properties.NAME + "</p><p><b> Incarcerated Population: </b> " + feature.properties[attribute] + "</p>" + "<p><b>Historical number of days above 90 degrees: </b>" + parseInt(feature.properties.historical_90) + "</p>" + "<p><b>Number of days above 90 degrees with NO climate action: </b>" + parseInt(feature.properties.no_90) + "</p>" + "<p><b>Number of days above 90 degrees with SLOW climate action: </b>" + parseInt(feature.properties.slow_90) + "</p>" + "<p><b>Number of days above 90 degrees with RAPID: </b>" + parseInt(feature.properties.rapid_90) + "</p>";

    //bind the popup to the circle marker
    layer.on({
        click:
            function populate() {

                document.getElementById("retrieve").innerHTML = popupContent
            }
    })
}

function getShapefileData() {
    fetch("data/shapefile.geojson")
        .then(function (response) {
            return response.json();
        })
        .then(function (json) {
            joinPunishmentShapefile(json, stateDataLayer);
            shapefileLayer = L.geoJSON(json, {
                style: borderStyle,
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

///////////////////////////PUNISHMENT LAYER////////////////////////////////////////
function punishmentPointToLayer(feature, latlng) {
    //Determine which attribute to visualize with proportional symbols
    var attribute = "capacity"

    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: heatIndexColorScale(feature, "historical_90"),
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
    var popupContent = "<p><b>Institution Name: </b> " + feature.properties.name + "</p><p><b> Incarcerated Population Capacity: </b> " + feature.properties.capacity + "</p>" + "<p><b>Historical number of days above 90 degrees: </b>" + parseInt(feature.properties.historical_90) + "</p>" + "<p><b>Number of days above 90 degrees with NO climate action: </b>" + parseInt(feature.properties.no_90) + "</p>" + "<p><b>Number of days above 90 degrees with SLOW climate action: </b>" + parseInt(feature.properties.slow_90) + "</p>" + "<p><b>Number of days above 90 degrees with RAPID: </b>" + parseInt(feature.properties.rapid_90) + "</p>";

    layer.on({
        click: function populate() {
            document.getElementById("retrieve").innerHTML = popupContent
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

//lol does this work?

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
//////////////////////////////PSYCH LAYER/////////////////////////////////
function psychPointToLayer(feature, latlng) {
    //Determine which attribute to visualize with proportional symbols
    var attribute = "psych_capacity"

    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: heatIndexColorScale(feature, "historical_90"),
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
    //var popupContent = "<p><b>State: </b> " + feature.properties.state + "</p><p><b> Number of psychiatric inpatients: </b> " + feature.properties[attribute] + "</p>";

    //bind the popup to the circle marker
    //psychLayer.bindPopup(popupContent);

    //return the circle marker to the L.geoJson pointToLayer option
    return psychLayer;
};

function onEachPsychFeature(feature, layer) {

    //build popup content string
    var popupContent = "<p><b>Institution Name: </b> " + feature.properties.name + "</p><p><b> State average number of psychiatric inpatients: </b> " + feature.properties.psych_capacity + "</p>" + "<p><b>Historical number of days above 90 degrees: </b>" + parseInt(feature.properties.historical_90) + "</p>" + "<p><b>Number of days above 90 degrees with NO climate action: </b>" + parseInt(feature.properties.no_90) + "</p>" + "<p><b>Number of days above 90 degrees with SLOW climate action: </b>" + parseInt(feature.properties.slow_90) + "</p>" + "<p><b>Number of days above 90 degrees with RAPID: </b>" + parseInt(feature.properties.rapid_90) + "</p>";

    layer.on({
        click: function populate() {
            document.getElementById("retrieve").innerHTML = popupContent
        }
    })
}

function createPsychPropSymbols(data) {
    //creating the geojson layer for the state data
    psychLayer = L.geoJson(data, {
        pointToLayer: psychPointToLayer,
        onEachFeature: onEachPsychFeature
    });
}

//fetch the psych dataset
function getPsychData() {
    fetch("data/psych-facilities-heat-wildfire.geojson")
        .then(function (response) {
            return response.json();
        })
        .then(function (json) {

            //project the psych dataset
            createPsychPropSymbols(json);
            autocomplete(document.getElementById("search"), autocompleteArray, json)

        })
}


/////////////////JOIN//////////////////
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
//////////////////RADIO BUTTONS AND FILTERS//////////////////
function increaseFont() {
    document.getElementById("sidepanel").style.fontSize = "x-large";
    document.getElementById("retrieve").style.fontSize = "x-large";
}

function decreaseFont() {
    document.getElementById("sidepanel").style.fontSize = "medium";
    document.getElementById("retrieve").style.fontSize = "medium";
}

function normalFont() {
    document.getElementById("sidepanel").style.fontSize = "large";
    document.getElementById("retrieve").style.fontSize = "large";
}
function filterByFacility(feature) {
    if (feature.properties[facilityColumn] != facilityType) {
        return "rgba(0,0,0,0)"
    }
    else {
        return heatIndexColorScale(feature, attributeColor)
    }
}

function filterByFacilityStroke(feature) {
    if (feature.properties[facilityColumn] != facilityType) {
        return "rgba(0,0,0,0)"
    }
    else {
        return "#000"
    }
}


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
            map.removeLayer(stateLayer)
            map.removeLayer(shapefileLayer)
            if (!map.hasLayer(punishmentLayer)) {
                punishmentLayer.addTo(map);
            }
            radioState.checked = false
        }
    });

    facilityFilter = ["COUNTY", "STATE", "FEDERAL", "Y", "psych_facility"]

    var facilityClicked
    //adding event listeners to the buttons facility type
    // document.querySelectorAll(".facility").forEach(function(facilityFilter){
    facilityFilter.forEach(function (item) {
        var facility = document.getElementById(item)
        console.log(facility)
        facility.addEventListener('click', function (e) {
            if (facility.id == "psych_facility") {
                if (!map.hasLayer(psychLayer)) {
                    psychLayer.addTo(map)
                    map.removeLayer(punishmentLayer)
                }
            } else
                if (map.hasLayer(punishmentLayer)) {
                    punishmentLayer.addTo(map)
                    map.removeLayer(psychLayer)
                }
            facilityType = e.target.id
            facilityColumn = e.target.name
            punishmentLayer.setStyle(function (feature) {
                return {
                    fillColor: filterByFacility(feature),
                    color: filterByFacilityStroke(feature)
                }

            })

        })
    })


    //loop that goes through each radio button that has temp as category 
    //loop for temp and wildfire attributes
    document.querySelectorAll(".temp").forEach(function (radio) {
        radio.addEventListener('change', function (e) {
            attributeColor = radio.id;
            document.querySelectorAll(".temp").forEach(function (radio) {
                radio.checked = false
            })
            e.target.checked = true;

            stateLayer.setStyle(function (feature) {
                return {
                    fillColor: heatIndexColorScale(feature, attributeColor),
                }
            })
            punishmentLayer.setStyle(function (feature) {
                if (facilityType != "everything") {
                    return {
                        fillColor: filterByFacility(feature),
                    }
                } else {
                    return {
                        fillColor: heatIndexColorScale(feature, attributeColor)
                    }
                }
            })
            psychLayer.setStyle(function (feature) {
                return {
                    fillColor: heatIndexColorScale(feature, attributeColor),
                }
            })
            updateLegend(radio.id)
        })
    })
}

/////////////////SEARCH BAR///////////////////
//autocomplete search bar

function addToAutocomplete(inp, arr, json) {
    for (i = 0; i < json.features.length; i++) {
        autocompleteArray.push(json.features[i])
    }
}

function autocomplete(inp, arr, json) {
    for (i = 0; i < json.features.length; i++) {
        autocompleteArray.push(json.features[i])
    }

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
            if (arr[i].properties.name.substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                /*create a DIV element for each matching element:*/
                b = document.createElement("DIV");
                /*make the matching letters bold:*/
                b.innerHTML = "<strong>" + arr[i].properties.name.substr(0, val.length) + "</strong>";
                b.innerHTML += arr[i].properties.name.substr(val.length);
                /*insert a input field that will hold the current array item's value:*/
                b.innerHTML += "<input type='hidden' data-geom='" + arr[i].geometry.coordinates + "' value='" + arr[i].properties.name + "'>";
                /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function (e) {
                    var geom = this.getElementsByTagName("input")[0].dataset.geom,
                        lon = geom.split(",")[0],
                        lat = geom.split(",")[1],
                        coords = L.latLng([lat, lon])

                    /*insert the value for the autocomplete text field:*/
                    inp.value = this.getElementsByTagName("input")[0].value;

                    map.flyTo(coords, 15)
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
        if (e.target.type != "text") {
            closeAllLists(e.target)
            //var bounds = map.getBounds(this.value)
            //console.log(e.target)
            ///map.fitBounds(bounds)
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