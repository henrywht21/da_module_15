
// create map
function createMap(data, geoData) {
    // step 1: init the base layers
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    
    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    //step 2: create the overlay layers
    let markers = L.markerClusterGroup();
    let circleArray = [];

    for (let i = 0; i < data.length; i++){
        let row = data[i];
        let loc = row.geometry;

        // create marker
        if (loc) {
            let point = [loc.coordinates[1], loc.coordinates[0]];
            let marker = L.marker(point);
            let popup = `<h2>Magnitude: ${row.properties.mag}</h2><br><h3>${row.properties.place}</h3><br><h3>Depth: ${row.geometry.coordinates[2]}`;
            marker.bindPopup(popup);
            markers.addLayer(marker);

            // circle markers
            let circleMarker = L.circle(point, {
                fillOpacity: 0.9,
                color: colorSelect(loc.coordinates[2]),
                fillColor: colorSelect(loc.coordinates[2]),
                radius: circleSize(row.properties.mag)
            }).bindPopup(popup);

            circleArray.push(circleMarker);
        }
    }
    
    let circleLayer = L.layerGroup(circleArray);
    
    // tectonic plate layer
    let geo_layer = L.geoJSON(geoData, {
    style: {
      "color": "firebrick",
      "weight": 5
     }
    });
    

    // step 3: layer controls
    let baseLayers = {
        Street: street,
        Topography: topo
    };

    let overlayLayers = {
        Circles: circleLayer,
        Markers: markers,
        "Tectonic Plates": geo_layer
    };

    // step 4: map initializiation
    let myMap = L.map("map", {
        center: [40, -94],
        zoom: 4,
        layers: [street, circleLayer, geo_layer]
    });

    // step 5: layer control filters and legend
    L.control.layers(baseLayers, overlayLayers).addTo(myMap);

    let legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
        let div = L.DomUtil.create("div", "info legend");
        let legendInfo = "<h4>Depth</h4>"
        legendInfo += "<i style='background: #F5E960'></i>-10-10<br/>";
        legendInfo += "<i style='background: #9AD1D4'></i>10-40<br/>";
        legendInfo += "<i style='background: #DB504A'></i>40-70<br/>";
        legendInfo += "<i style='background: #379634'></i>70-100<br/>";
        legendInfo += "<i style='background: #0A3200'></i>100+";

        div.innerHTML = legendInfo;
        return div;
    };

    legend.addTo(myMap);
}

// Color Selection
function colorSelect(depth) {
    let color = "black";

    if (depth <= 10) {
        color = "#F5E960";
    } else if (depth <= 40) {
        color = "#9AD1D4";
    } else if (depth <= 70) {
        color = "#DB504A";
    } else if (depth <= 100) {
        color = "#379634";
    } else {
        color = "#0A3200";
    }
    
      // return color
      return (color);
    }
    
// marker size
function circleSize(mag) {
    let radius = 1;

     if (mag > 0) {
        radius = mag ** 7.5;
  }

  return radius
}

function doWork() {

    // Assemble the API query URL.
    let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
    let url2 = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
  
    d3.json(url).then(function (data) {
      
      d3.json(url2).then(function (geoData) {
        let data_rows = data.features;
  
        // make map with both datasets
        createMap(data_rows, geoData);
      });
    });
  }
  
  doWork();
  
