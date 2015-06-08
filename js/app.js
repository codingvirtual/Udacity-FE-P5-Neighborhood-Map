var map = {       // declares a global map object
    "googleMap": {},
    "markers": [],
    "currentYelpData": {},
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
                map.markers.push(arr[element]);
            }
            map.populateMarkerObjects();
            ko.applyBindings(new ViewModel(map.markers));
        }
    },

   "populateMarkerObjects": function () {
        for (var element in map.markers) {
            var MapObject = map.markers[element];
            MapObject.marker = map.createMapMarker(MapObject);
            MapObject.marker.isVisible = false;
            google.maps.event.addListener(MapObject.marker, 'click', function () {
                map.infoWindow.open(map.googleMap);
            });
        }
    },
    "createMapMarker": function (marker) {
        // marker is an object with additional data about the pin for a single location
        return new google.maps.Marker({
            position: new google.maps.LatLng(marker.lat, marker.long),
            title: marker.name,
        });
    }
};



function ViewModel(markers) {
    var self = this;
    self.markers = ko.observableArray(markers);
    self.filter = ko.observable("");
    self.toggleMarker = function (marker) {
        switch (this.isVisible) {
            case true:
                this.marker.setMap(null);
                map.infoWindow.close();
                break;
            case false:
                this.marker.setMap(map.googleMap);
                yelp(this);
                break;
        }
        this.isVisible = !(this.isVisible);
    }

}


function yelp(marker) {
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
    parameters.push(['term', marker.name]);
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
        'jsonpCallback': 'cb',
        'success': function (data, textStats, XMLHttpRequest) {
            map.currentYelpData = data.businesses[0];
            renderPartial('partials/info-window.html', marker);
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

function renderPartial(htmlFragment, poi) {
    $.ajax({
        'url': htmlFragment,
        'success': function(data) {
            while (!map.currentYelpData) {}
            var content = data.replace('--markerDescription--', poi.description);
            content = content.replace('rating_image_url', map.currentYelpData.rating_img_url);
            content = content.replace('poiName', map.currentYelpData.name);
            content = content.replace('image_url', map.currentYelpData.image_url);
            content = content.replace('yelpQuote', map.currentYelpData.snippet_text);
            map.infoWindow.setContent(content);
        }
    });
}

// Calls the initializeMap() function when the page loads
window.addEventListener('load', map.initializeMap);
window.addEventListener('resize', resizePanels);
