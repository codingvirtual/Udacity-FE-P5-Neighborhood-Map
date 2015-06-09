var htmlTemplates = [];
var map = {       // declares a global map object
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
        //console.log("Enter readLocations");
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
            //console.log("response received");
            var arr = JSON.parse(response);
            for (var element in arr) {
                var location = arr[element];
                location.marker = map.createMapMarker(location);
                location.isVisible = false;
                yelp(location);
                map.markers.push(location);
            }
            ko.applyBindings(new ViewModel(map.markers));
        }
    },
    "createMapMarker": function (location) {
        // marker is an object with additional data about the pin for a single location
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
    self.updateMarkers = function() {
        map.infoWindow.close();
        for (var i in self.markers) {
            if (self.markers[i].category != self.currentFilter()) {
                self.markers[i].marker.setMap(null);
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
        // This example is a proof of concept, for how to use the Yelp v2 API with javascript.
        // You wouldn't actually want to expose your access token secret like this in a real application.
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
        'jsonpCallback': '',
        'success': function (data, textStats, XMLHttpRequest) {
            location.yelpData = data.businesses[0];
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
            var content = htmlTemplates[i].templateText.replace('--markerDescription--', location.description);
            content = content.replace('rating_image_url', location.yelpData.rating_img_url);
            content = content.replace('poiName', location.yelpData.name);
            content = content.replace('image_url', location.yelpData.image_url);
            content = content.replace('yelpQuote', location.yelpData.snippet_text);
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
                content = content.replace('rating_image_url', location.yelpData.rating_img_url);
                content = content.replace('poiName', location.yelpData.name);
                content = content.replace('image_url', location.yelpData.image_url);
                content = content.replace('yelpQuote', location.yelpData.snippet_text);
                map.infoWindow.setContent(content);
                map.infoWindow.open(map.googleMap);
            }
        });
    }
}
// Calls the initializeMap() function when the page loads
window.addEventListener('load', map.initializeMap);
window.addEventListener('resize', resizePanels);
