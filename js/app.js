var map = {       // declares a global map variable
    "googleMap": {},
    "markers": [],
    "currentYelpData": {},
    "infoWindow": new google.maps.InfoWindow({content: "placeholder"}),

    // Sets up a new map centered on the Las Vegas Strip
    "initializeMap": function () {
        //console.log("Enter initializeMap");
        resizePanels();
        console.log(map);
        var mapOptions = {
            center: {lat: 36.113, lng: -115.172},
            zoom: 14,
            disableDefaultUI: true
        };

        // This next line makes `map` a new Google Map JavaScript Object and attaches it to
        // <div id="map">, which is appended as part of an exercise late in the course.
        map.googleMap = new google.maps.Map(document.getElementById('map-canvas'),
            mapOptions);
        //map.infoWindow = new google.maps.InfoWindow({content: "placeholder"});
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
        //console.log("Enter populateMarkerObjects");
        for (var element in map.markers) {
            var MapObject = map.markers[element];
            MapObject.marker = map.createMapMarker(MapObject);
            MapObject.marker.isVisible = false;
            // MapObject.infoWindow = map.createInfoWindow(MapObject);
            google.maps.event.addListener(MapObject.marker, 'click', function () {
                map.infoWindow.open(map.googleMap);
                // MapObject.infoWindow.open(map.googleMap, MapObject.marker);
            });
        }
    },
    "createMapMarker": function (marker) {
        //console.log("Enter createMapMarker");
        // marker is an object with additional data about the pin for a single location
        return new google.maps.Marker({
            position: new google.maps.LatLng(marker.lat, marker.long),
            title: marker.name,
        });
    },
    // infoWindows are the little helper windows that open when you click
    // or hover over a pin on a map. They usually contain more information
    // about a location.
    "createInfoWindow": function (mapPoi) {
        //console.log("Enter createInfoWindow");
        //return new google.maps.InfoWindow({
        //    content: map.buildInfoContent(mapPoi)
        //});

        //map.infoWindow.setContent(mapPoi.name);
        renderPartial('partials/info-window.html', mapPoi);
    }
};



function ViewModel(markers) {
    var self = this;
    self.markers = ko.observableArray(markers);
    //self.markerName = ko.observable(map.currentYelpData.name);
    self.markerName = ko.observable("test");
    self.filter = ko.observable("");
    self.toggleMarker = function (marker) {
        switch (this.isVisible) {
            case true:
                this.marker.setMap(null);
                map.infoWindow.close();
                break;
            case false:
                this.marker.setMap(map.googleMap);
                map.createInfoWindow(this);
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
    console.log(marker);

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
            console.log("yelp data received");
            console.log(map.currentYelpData);
            //var updatedContent = map.infoWindow.getContent();
            //updatedContent = '<img src="' +
            //    data.businesses[0].rating_img_url +
            //    '" alt="Rating image"><br />' + updatedContent;
            //updatedContent += "<h3>Latest from Yelp</h3>";
            //updatedContent += '<p class="yelp-quote">' + data.businesses[0].snippet_text + "</p>";
            //map.infoWindow.setContent(updatedContent);
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
            console.log("in render partials");
            console.log(map.currentYelpData);
            while (!map.currentYelpData) {}
            console.log("POI is ");
            console.log(poi);
            console.log("Yelp is: ");
            console.log(map.currentYelpData);
            var content = data.replace('--markerDescription--', poi.description);
            content = content.replace('rating_image_url', map.currentYelpData.rating_img_url);
            content = content.replace('poiName', map.currentYelpData.name);
            content = content.replace('image_url', map.currentYelpData.image_url);
            content = content.replace('yelp_quote', map.currentYelpData.snippet_text);
            map.infoWindow.setContent(content);
        }
    });
}

// Calls the initializeMap() function when the page loads
window.addEventListener('load', map.initializeMap);
window.addEventListener('resize', resizePanels);