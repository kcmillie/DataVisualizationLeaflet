// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var plateUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";



// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  d3.json(plateUrl, function(data2) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features, data2);
  });
});

function getColor(d) {
    return d > 5  ? '#cc0000' :
           d > 4  ? '#ff8000' :
           d > 3   ? '#ffbf00' :
           d > 2   ? '#ffff00' :
           d > 1   ? '#bfff00' :
                      '#009900';
};

function style(feature) {
    return {
        fillColor: getColor(feature.properties.mag),
        fillOpacity: 0.5,
        radius: feature.properties.mag
    };
}


function createFeatures(earthquakeData, plateData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    // console.log(feature.properties.mag);  
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }

  // This will be run when L.geoJSON creates the point layer from the GeoJSON data.
  function createCircleMarker( feature, latlng ){
    // Change the values of these options to change the symbol's appearance
    let options = {
      radius: (feature.properties.mag * 3),
      fillColor: getColor(feature.properties.mag),
      color: "black",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    }
    return L.circleMarker( latlng, options );
  }
  

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: createCircleMarker,
    onEachFeature: onEachFeature
  });
  var tectonic = L.geoJson(plateData, {style: {weight: 2, opacity:1, color:'gray', dashArray: '3'}})

  // Sending our earthquakes layer to the createMap function
  buildmap(earthquakes, tectonic);
}


function buildmap(earthquakes, otherstuff){
	var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/streets-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
    id: "mapbox.streets",
    maxzoom: 5,
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
    id: "mapbox.dark",
    maxzoom: 5,
    accessToken: API_KEY
  });

  var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
    id: "mapbox.dark",
    maxzoom: 5,
    accessToken: API_KEY
  });

  var baseMaps = {
    "Streets": streetmap,
    "Dark": darkmap,
    "Satellite": satellitemap
  };

  // Create the map object with options
  var map = L.map("map", {
    center: [39.8283, -98.5795],
    zoom: 5,
    layers:[ streetmap, earthquakes]
  });

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    TectonicPlates: otherstuff
  };

  L.control.layers(baseMaps, overlayMaps).addTo(map);

  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {
      var div = L.DomUtil.create('g', 'info legend'),
          grades = [0, 1, 2, 3, 4, 5],
          labels = [];
      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
              '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
              grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }
      return div;
  };

  legend.addTo(map);
  
}
