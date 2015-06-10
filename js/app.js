// Declare two globals but don't initialize yet. Need to run startup() to
// verify all required libraries are loaded. This allows the app to handle
// missing libraries more gracefully (in this case, if the libraries are missing,
// it's likely because the user's Internet connection is down since these
// libs are loaded from CDN's.
var htmlTemplates = [];         // will hold any partial HTML template files
var map = {};                   // holds all map-related objects and functions
var startup = function () {
    var librariesLoaded = function () {
        // This function checks to make sure that all required libraries
        // have been loaded successfully. If any of the following calls
        // do indeed yield 'undefined' it means that the respective library
        // failed to load. If it returns 'true', then at least one library
        // was missing.
        return !(typeof(google) == 'undefined' ||  // google maps API
        typeof($) == 'undefined' ||                 // jQuery
        typeof(ko) == 'undefined' ||                // Knockout
        typeof(OAuth) == 'undefined' ||             // OAuth (required for Yelp)
        typeof(sha1_vm_test) == 'undefined');       // SHA1 (required for Yelp)
        // sha1_vm_test is a function that gets loaded when the SHA1 library
        // loads. If the function is present, then SHA1 loaded successfully.
    };
    // Call the above function to see if all libraries are loaded.
    switch (librariesLoaded()) {
        case true:
            // initialize global variables and start the rest of the app setup
            map = {
                "googleMap": {},
                "locations": [],
                "infoWindow": new google.maps.InfoWindow({content: "placeholder"}),
                // Sets up a new map centered on the Las Vegas Strip
                "initializeMap": function () {
                    resizePanels();
                    var mapOptions = {
                        center: {lat: 36.113, lng: -115.172},
                        zoom: 14,
                        disableDefaultUI: true
                    };
                    // This next line makes `map` a new Google Map JavaScript Object and attaches it to
                    // <div id="map">, which is appended as part of an exercise late in the course.
                    map.googleMap = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
                    map.readLocations();
                },
                "readLocations": function () {
                    $.ajax({
                        'url': 'js/data/locations.json',
                        'success': function (data) {
                            for (var element in data) {
                                var location = data[element];
                                location.marker = map.createMapMarker(location);
                                location.isVisible = false;
                                yelp(location);
                                map.locations.push(location);
                            }
                            ko.applyBindings(new ViewModel(map.locations));
                        },
                        'complete': function (request, status) {
                            // check for errors
                        }
                    });
                },
                "createMapMarker": function (location) {
                    // marker is an object with additional data about a single location
                    var marker = new google.maps.Marker({
                        position: new google.maps.LatLng(location.lat, location.long),
                        title: location.name
                    });
                    google.maps.event.addListener(marker, 'click', function () {
                        renderPartial('partials/info-window.html', location);
                    });
                    return marker;
                }
            };
            map.initializeMap();
            break;
        default:
            console.log("A required module is missing");
            window.alert("One or more required software modules are missing." +
                "Please ensure you have functioning Internet access and " +
                "try to reload this page");
            break;
    }
};
function yelp(location) {
    var auth = {
        consumerKey: "vD-WJpgPbOpyvhEDMpt7PA",
        consumerSecret: "qbgNN0ibK48h7XhixYpce9YKVbA",
        accessToken: "81N4jR3e5lxR3lM0C7DzGcU08xdDk2pd",
        // This example is a proof of concept, for how to use the
        // Yelp v2 API with javascript. You wouldn't actually want to expose
        // your access token secret like this in a real application.
        accessTokenSecret: "tMUB7DAXmwJQoJ97GPur7R3setY",
        serviceProvider: {
            signatureMethod: "HMAC-SHA1"
        }
    };
    var accessor = {
        consumerSecret: auth.consumerSecret,
        tokenSecret: auth.accessTokenSecret
    };
    parameters = [];
    parameters.push(['term', location.name]);
    parameters.push(['limit', 1]);
    parameters.push(['location', 'Las+Vegas']);
    parameters.push(['callback', 'cb']);
    parameters.push(['oauth_consumer_key', auth.consumerKey]);
    parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
    parameters.push(['oauth_token', auth.accessToken]);
    parameters.push(['oauth_signature_method', 'HMAC-SHA1']);
    var message = {
        'action': 'http://api.yelp.com/v2/search',
        'method': 'GET',
        'parameters': parameters
    };
    OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, accessor);
    var parameterMap = OAuth.getParameterMap(message.parameters);
    $.ajax({
        'url': message.action,
        'data': parameterMap,
        'dataType': 'jsonp',
        'success': function (data) {
            location.yelpData = data.businesses[0];
        },
        'complete': function (request, status) {
            // check for errors
        }
    });
}
function resizePanels() {
    // sets the size of the main content window so that it completely fills
    // the available viewport/window. 315 is the fixed height of the header
    // and footer combined, so subtracting that from the window innerHeight
    // leaves the size of the main content.
    var contentHeight = window.innerHeight - 315;
    if (contentHeight >= 425) {
        // set both the content div and the map div to this new height
        $('.content').height(contentHeight);
        $('#map-canvas').height(contentHeight);
    }
}
function renderPartial(htmlFragment, location) {
    // this function takes 2 parameters:
    //      htmlFragment: the url to a partial HTML file that will be used
    //          to render the GoogleMaps InfoWindow for a given location
    //      location: the specific location to use to populate the template with
    var found = false;
    for (var i in htmlTemplates) {
        // loop through the templates to see if the file has already been
        // read in. This avoids unnecessary network calls to reload the same
        // template.
        if (htmlTemplates[i].name === htmlFragment) {
            // if the above if evaluates to true, it means that the requested
            // fragment has already been loaded. The next lines copy the template
            // to a new temporary variable (content) and then replace the
            // placeholder content with the actual location data that was
            // retrieved from Yelp earlier.
            var content = htmlTemplates[i].templateText.replace('--markerDescription--', location.description);
            content = content.replace('rating_image_url', location.yelpData.rating_img_url);
            content = content.replace('poiName', location.name);
            content = content.replace('image_url', location.yelpData.image_url);
            content = content.replace('yelpQuote', location.yelpData.snippet_text);
            content = map.infoWindow.setContent(content);
            map.infoWindow.open(map.googleMap);
            found = true;   // stops further iteration through templates
            break;
        }
    }
    if (!found) {
        // after emerging from the above for/if blocks, the template will
        // either have been found as already loaded and populated with data
        // or if not found, it needs to be loaded and then populated. The
        // code below will go load the fragment if it wasn't found above and
        // then populate the data to render it.
        $.ajax({
            'url': htmlFragment,
            'success': function (data) {
                // the AJAX call returned successfully. Push the retrieved
                // template into the array using the pathname as the name
                // and the file info as the templateText
                htmlTemplates.push({
                    'name': htmlFragment,
                    'templateText': data
                });
                // do the replacement as above.
                var content = data.replace('--markerDescription--', location.description);
                content = content.replace('rating_image_url', location.yelpData.rating_img_url);
                content = content.replace('poiName', location.name);
                content = content.replace('image_url', location.yelpData.image_url);
                content = content.replace('yelpQuote', location.yelpData.snippet_text);
                map.infoWindow.setContent(content);
                map.infoWindow.open(map.googleMap);
            },
            'complete': function (request, status) {
                // check for errors
            }
        });
    }
}
function ViewModel(markers) {   // Knockout ViewModel binding
    var self = this;
    self.markers = markers;  // list of locations for the application
    self.filters = ko.observableArray();    // Holds the list of categories
                                            // for the Filter drop-down
    self.currentFilter = ko.observable();   // Holds the current filter choice
    for (var i in markers) {
        // this loop sets up the list of choices for the Filter drop down
        // it checks to see if the category is already in the self.filters
        // array and if not, adds it. What will result is an array with
        // each category appearing only once.
        if (self.filters.indexOf(markers[i].category) < 0) {
            self.filters.push(markers[i].category);
        }
        self.filters.sort();  // sort the categories alphabetically
    }
    self.toggleMarker = function (marker) {
        // this function is called when the user clicks on a location from
        // the list on the left side of the interface. By default, all
        // locations are loaded and listed, but no map markers are drawn
        // initially just to keep the display neat. To make a marker appear,
        // the user clicks on the location in the list. The clicking functions
        // as a toggle: if the marker isn't on the map, clicking the location
        // name makes it show up. If it IS on the map, clicking the location
        // name makes it go away.
        switch (this.isVisible) {
            // if the location's marker is already showing, so remove it
            case true:
                this.marker.setMap(null);
                map.infoWindow.close();
                break;
            case false:
                // marker isn't showing, so show it.
                this.marker.setMap(map.googleMap);
                break;
        }
        this.isVisible = !(this.isVisible);  // toggle the visibility state
    };
    self.updateMarkers = function () {
        // this function is called when the Filter drop-down is used and a
        // new filter is chosen. It removes any open infoWindow first.
        map.infoWindow.close();
        for (var i in self.markers) {
            // now iterate through the entire list of locations and hide
            // any locations that don't match the newly selected category filter
            if (self.markers[i].category != self.currentFilter()) {
                // this location's category doesn't match, so remove the marker
                // from the map and set the visibility state to false.
                self.markers[i].marker.setMap(null);
                self.markers[i].isVisible = false;
            }
        }
        return true;    // Knockout requires true to be returned in order
                        // for the event to continue propagating.
    }
}
// Calls the startup() function when the page loads
window.addEventListener('load', startup);
// Calls resizePanels() any time the user resizes the window. Also gets called
// during the initial startup sequence to size the panels initially.
window.addEventListener('resize', resizePanels);
