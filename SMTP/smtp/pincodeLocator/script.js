mapboxgl.accessToken = 'pk.eyJ1IjoiYWthc2hqYW1idWxrYXIiLCJhIjoiY2x1amptZHJsMGVwZTJpbXZ1eTU1ZXNveiJ9.cgWJEuHYswFXC15ff1j_Jw';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [78.9629, 20.5937],        
    zoom: 5
});

var circleLayerId = 'searched-circle';

map.on('load', function () {
    map.addSource('searched-pincode', {
        'type': 'geojson',
        'data': {
            'type': 'FeatureCollection',
            'features': []
        }
    });

    map.addLayer({
        'id': circleLayerId,
        'source': 'searched-pincode',
        'type': 'circle',
        'paint': {
            'circle-radius': 10,
            'circle-color': '#007cbf',
            'circle-opacity': 0.5
        }
    });

    document.getElementById('pincodeForm').addEventListener('submit', function(event) {
        event.preventDefault();
        var pincode = document.getElementById('pincode').value;
        fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${pincode}.json?country=IN&access_token=${mapboxgl.accessToken}`)
            .then(response => response.json())
            .then(data => {
                if (data.features.length > 0) {
                    var coordinates = data.features[0].center;
                    map.getSource('searched-pincode').setData({
                        'type': 'FeatureCollection',
                        'features': [{
                            'type': 'Feature',
                            'geometry': {
                                'type': 'Point',
                                'coordinates': coordinates
                            },
                            'properties': {}
                        }]
                    });
                    map.flyTo({ center: coordinates, zoom: 12 });
                    new mapboxgl.Marker().setLngLat(coordinates).addTo(map);
                    document.getElementById('locationName').innerHTML = '<strong>Location:</strong> ' + data.features[0].place_name;
                    showCongestedSquares(coordinates);
                } else {
                    alert('Location not found for this pincode.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error fetching location data.');
            });
    });

    map.on('click', function(e) {
        var features = map.queryRenderedFeatures(e.point, { layers: ['congested-squares'] });
        if (!features.length) {
            return;
        }
    
        var feature = features[0];
        var congestion = feature.properties.congestion;
    
        var congestionText = '';
        if (congestion === 'Low') {
            congestionText = 'Low Congestion';
        } else if (congestion === 'Medium') {
            congestionText = 'Medium Congestion';
        } else {
            congestionText = 'High Congestion';
        }
    
        document.getElementById('congestion').innerHTML = '<strong>Congestion:</strong> ' + congestionText;
    });
    
});

function showCongestedSquares(coordinates) {
    var congestedSquares = [];
    var numSquares = 10;
    var congestionLevels = ['Low', 'Medium', 'High'];
    
    for (var i = 0; i < numSquares; i++) {
        var randomOffset = (Math.random() - 0.5) / 100;  // Random offset for coordinates
        var randomCongestion = congestionLevels[Math.floor(Math.random() * congestionLevels.length)];
        
        congestedSquares.push({
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': [coordinates[0] + randomOffset, coordinates[1] + randomOffset]
            },
            'properties': {
                'name': 'Square ' + (i + 1),
                'congestion': randomCongestion
            }
        });
    }

    if (!map.getSource('congested-squares')) {
        map.addSource('congested-squares', {
            'type': 'geojson',
            'data': {
                'type': 'FeatureCollection',
                'features': congestedSquares
            }
        });

        map.addLayer({
            'id': 'congested-squares',
            'source': 'congested-squares',
            'type': 'circle',
            'paint': {
                'circle-radius': 6,
                'circle-color': [
                    'match',
                    ['get', 'congestion'],
                    'Low', '#51bbd6',
                    'Medium', '#f1f075',
                    'High', '#f28cb1',
                    /* other */ '#ccc'
                ],
                'circle-opacity': 0.8
            }
        });
    } else {
        map.getSource('congested-squares').setData({
            'type': 'FeatureCollection',
            'features': congestedSquares
        });
    }
}
