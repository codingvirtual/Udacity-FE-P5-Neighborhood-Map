var map;    // declares a global map variable

// need a marker object
// return location
// return reviews
// return something else
var MapObject = {

    "id": 0,
    "name": "name",
    "category": "category",
    "lat": 0,
    "long": 0,
    "description": "description",
    "createMapMarker": function () {

        // marker is an object with additional data about the pin for a single location
        return new google.maps.Marker({
            position: this.lat + ',' + this.long,
            title: this.name
        });
    },


    // infoWindows are the little helper windows that open when you click
    // or hover over a pin on a map. They usually contain more information
    // about a location.
    "infoWindow": function () {
        return new google.maps.InfoWindow({
            content: this.description
        });
    }
};

// Array of map markers
var markers = [];

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
     */
    function callback(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            createMapMarker(results[0]);
        }
    }

    /*
     pinPoster(locations) takes in the array of locations created by locationFinder()
     and fires off Google place searches for each location
     */
    function pinPoster(locations) {

        // creates a Google place search service object. PlacesService does the work of
        // actually searching for location data.
        var service = new google.maps.places.PlacesService(map);

        // Iterates through the array of locations, creates a search object for each location
        for (var place in locations) {

            // the search request object
            var request = {
                query: locations[place]
            };

            // Actually searches the Google Maps API for location data and runs the callback
            // function with the search results after each search.
            service.textSearch(request, callback);
        }
    }

// locations is an array of location strings returned from locationFinder()
//    locations = locationFinder();

// pinPoster(locations) creates pins on the map for each location in
// the locations array
//    pinPoster(locations);

}

// Calls the initializeMap() function when the page loads
window.addEventListener('load', initializeMap);