var map = {};       // declares a global map variable
var markers = [];   // Array of map markers

function createMapMarker(marker) {
    // marker is an object with additional data about the pin for a single location
    return new google.maps.Marker({
        position: new google.maps.LatLng(marker.lat, marker.long),
        title: marker.name,
        map: map
    });
}

// infoWindows are the little helper windows that open when you click
// or hover over a pin on a map. They usually contain more information
// about a location.
function createInfoWindow(marker) {
    return new google.maps.InfoWindow({
        content: marker.description
    });
}

function displayMarkers() {
    for (var element in markers) {
        var MapObject = markers[element];
        MapObject.marker = createMapMarker(MapObject);
        MapObject.infoWindow = createInfoWindow(MapObject);
        google.maps.event.addListener(MapObject.marker, 'click', function () {
            MapObject.infoWindow.open(map, MapObject.marker);
        });
    }
}


// Sets up a new map centered on the Las Vegas Strip
function initializeMap() {

    var mapOptions = {
        center: {lat: 36.113, lng: -115.172},
        zoom: 14,
        disableDefaultUI: true
    };

    // This next line makes `map` a new Google Map JavaScript Object and attaches it to
    // <div id="map">, which is appended as part of an exercise late in the course.
    map = new google.maps.Map(document.getElementById('map-canvas'),
        mapOptions);


    /*
     callback(results, status) makes sure the search returned results for a location.
     If so, it creates a new map marker for that location.

     function callback(results, status) {
     if (status == google.maps.places.PlacesServiceStatus.OK) {
     createMapMarker(results[0]);
     }
     }
     */
    /*
     pinPoster(locations) takes in the array of locations created by locationFinder()
     and fires off Google place searches for each location
     */
    //function pinPoster(locations) {
    //
    //    // creates a Google place search service object. PlacesService does the work of
    //    // actually searching for location data.
    //    var service = new google.maps.places.PlacesService(map);
    //
    //    // Iterates through the array of locations, creates a search object for each location
    //    for (var place in locations) {
    //
    //        // the search request object
    //        var request = {
    //            query: locations[place]
    //        };
    //
    //        // Actually searches the Google Maps API for location data and runs the callback
    //        // function with the search results after each search.
    //        service.textSearch(request, callback);
    //    }
    //}

// locations is an array of location strings returned from locationFinder()
//    locations = locationFinder();

// pinPoster(locations) creates pins on the map for each location in
// the locations array
//    pinPoster(locations);


    var xmlhttp = new XMLHttpRequest();
    var url = "js/data/locations.json";

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            responseFunction(xmlhttp.responseText);
        }
    };

    xmlhttp.open("GET", url, true);
    xmlhttp.send();

    function responseFunction(response) {
        var arr = JSON.parse(response);
        for (var element in arr) {
            markers.push(arr[element]);
        }
        displayMarkers();
    }

}

// Calls the initializeMap() function when the page loads
google.maps.event.addDomListener(window, 'load', initializeMap);
