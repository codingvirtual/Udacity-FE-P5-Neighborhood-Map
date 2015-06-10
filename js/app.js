// Declare two globals but don't initialize yet. Need to run startup() to
// verify all required libraries are loaded. This allows the app to handle
// missing libraries more gracefully (in this case, if the libraries are missing,
// it's likely because the user's Internet connection is down since these
// libs are loaded from CDN's.
var htmlTemplates = [];
var map;

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
                "markers": [],
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
                                map.markers.push(location);
                            }
                            ko.applyBindings(new ViewModel(map.markers));
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


function ViewModel(markers) {
    var self = this;
    self.markers = markers;
    self.filters = ko.observableArray();
    self.currentFilter = ko.observable();
    for (var i in markers) {
        if (self.filters.indexOf(markers[i].category) < 0) {
            self.filters.push(markers[i].category);
        }
    }
    self.toggleMarker = function (marker) {
        switch (this.isVisible) {
            case true:
                this.marker.setMap(null);
                map.infoWindow.close();
                break;
            case false:
                this.marker.setMap(map.googleMap);
                break;
        }
        this.isVisible = !(this.isVisible);
    };
    self.updateMarkers = function () {
        map.infoWindow.close();
        for (var i in self.markers) {
            if (self.markers[i].category != self.currentFilter()) {
                self.markers[i].marker.setMap(null);
                self.markers[i].isVisible = false;
            }
        }
        return true;
    }
}
function yelp(location) {
    if (typeof(location.yelpData) != 'undefined') return;
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
    var contentHeight = window.innerHeight - 315;
    if (contentHeight >= 425) {
        $('.content').height(contentHeight);
        $('#map-canvas').height(contentHeight);
    }
}
function renderPartial(htmlFragment, location) {
    var found = false;
    for (var i in htmlTemplates) {
        if (htmlTemplates[i].name === htmlFragment) {
            var content = htmlTemplates[i].templateText;
            content.replace('--markerDescription--', location.description);
            content.replace('rating_image_url', location.yelpData.rating_img_url);
            content.replace('poiName', location.yelpData.name);
            content.replace('image_url', location.yelpData.image_url);
            content.replace('yelpQuote', location.yelpData.snippet_text);
            map.infoWindow.setContent(content);
            map.infoWindow.open(map.googleMap);
            found = true;
            break;
        }
    }
    if (!found) {
        $.ajax({
            'url': htmlFragment,
            'success': function (data) {
                htmlTemplates.push({
                    'name': htmlFragment,
                    'templateText': data
                });
                var content = data.replace('--markerDescription--', location.description);
                content.replace('rating_image_url', location.yelpData.rating_img_url);
                content.replace('poiName', location.yelpData.name);
                content.replace('image_url', location.yelpData.image_url);
                content.replace('yelpQuote', location.yelpData.snippet_text);
                map.infoWindow.setContent(content);
                map.infoWindow.open(map.googleMap);
            },
            'complete': function (request, status) {
                // check for errors
            }
        });
    }
}
// Calls the initializeMap() function when the page loads
window.addEventListener('load', startup);
window.addEventListener('resize', resizePanels);
