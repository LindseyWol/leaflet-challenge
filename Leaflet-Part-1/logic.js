// Store API endpoint as queryURL
var queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform get request to query URL
d3.json(queryURL).then(function(data){
    // Send the data.features and data.features object to the createFeatures function
    createFeatures(data.features);
  });
    
function createFeatures(earthquakeData){

    // Give each feature a popup with location, magnitude, and depth of earthquakes
    function onEachFeature(feature, layer){
        layer.bindPopup(`<h3>Location: ${feature.properties.place}</p><hr><p>Magnitude: ${feature.properties.mag}</p><hr><p>Depth: ${feature.geometry.coordinates[2]}`);
    }

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    function createCircleMarker(feature, latlng){
       let options = {
        radius:feature.properties.mag*5,
        fillColor: chooseColor(feature.geometry.coordinates[2]),
        color: "black",
        weight: 1,
        fillOpacity: .7,
       } 
       return L.circleMarker(latlng,options);
    }
    // Create a variable for earthquakes to house latlng, features for popup, and cicrleMarker properties
    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: createCircleMarker
    });

    // Send earthquakes layer to createMap function
    createMap(earthquakes);
}

// Circles color palette based on depth
function chooseColor(depth){
    switch(true){
        case(depth <= 10):
            return "#99FF00"; 
        case (10 <= depth && depth <=30):
            return "#FFFF00";
        case (30 <= depth && depth <=50):
            return "#FFCC00";
        case (50 <= depth && depth <= 70):
            return "#FF9900";
        case (70 <= depth && depth <=90):
            return "#FF6600";
        case (90 <= depth):
            return "#FF0000";
    }
}

// Create map legend for depth colors
let legend = L.control({position: 'bottomright'});

legend.onAdd = function() {
    var div = L.DomUtil.create('div', 'info legend');
    var grades = [-10, 10, 30, 50, 70, 90];
    var labels = [];
    var legendInfo = "<h4>Earthquake Depth</h4>";

    div.innerHTML = legendInfo

    // go through each depth item for legend

    for (var i = 0; i < grades.length; i++) {
          labels.push('<ul style="background-color:' + chooseColor(grades[i] + 1) + '"> <span>' + grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '' : '+') + '</span></ul>');
        }

      // add each label list item to the div under the <ul> tag
      div.innerHTML += "<ul>" + labels.join("") + "</ul>";
    
    return div;
  };

// Create map
function createMap(earthquakes) {
   // Define street layer
   let street =  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  // Define a baseMaps 
  let baseMaps = {
    "Street": street
  };

  // Create overlay object to hold earthquakes
  let overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create map with street and earthquake layers
  let myMap = L.map("map", {
    center: [
      44.9778, -93.2650
    ],
    zoom: 4,
    layers: [street, earthquakes]
  });

  // Add layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
  legend.addTo(myMap);
}