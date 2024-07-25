mapboxgl.accessToken = 'pk.eyJ1IjoiYWthc2hqYW1idWxrYXIiLCJhIjoiY2xybHpwajNpMHR2dDJtcGVrcGJkanl1NCJ9.MpkuaLfJQ_ubYY1ufoOxwg';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [78.9629, 20.5937], // Default center of India
    zoom: 5 // Default zoom level
});

// Add traffic layer to the map
map.on('load', function () {
    map.addLayer(
        {
            'id': 'traffic',
            'type': 'line',
            'source': {
                'type': 'vector',
                'url': 'mapbox://mapbox.mapbox-traffic-v1'
            },
            'source-layer': 'traffic',
            'paint': {
                'line-width': 2,
                'line-color': [
                    'step',
                    ['get', 'congestion'],
                    '#51bbd6',
                    1,
                    '#f1f075',
                    2,
                    '#f28cb1'
                ]
            }
        },
        'waterway-label'
    );
});

// Add navigation control to the map
map.addControl(new mapboxgl.NavigationControl());

// Add geocoder control to search for locations
var geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl
});
map.addControl(geocoder);

// Add scale control to the map
map.addControl(new mapboxgl.ScaleControl({
    maxWidth: 80,
    unit: 'metric'
}));
