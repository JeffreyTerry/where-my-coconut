// CONSTANTS //
var DEFAULT_CENTER = {lat: 47.644459, lng: -122.130185};

// GEOLOCATION //

function getCurrentLocation(callback) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(callback, function() {
            // On failure, do this
            console.log('here 1');
            getLocationUsingGoogleMaps(callback)
        });
    } else {
        console.log('here 2');
        getLocationUsingGoogleMaps(callback)
    }
}

function getLocationUsingGoogleMaps(callback) {
    jQuery.post("https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyBwxzwTENmcAmiLA3B85GVuTE2oJbGkh-4", function(data) {
        callback({coords: {latitude: data.location.lat, longitude: data.location.lng}});
    })
    .fail(function(err) {
        alert("Could not find your location");
        callback({error: 'Could not find user\'s location'});
    });
};

function repositionUserMarker(lat, lng) {
    // Check to see if we need to remove the old user marker.
    if (window.user_marker) {
        user_marker.setMap(null);
    }

    user_marker = new google.maps.Marker({
        position: {'lat': lat, 'lng': lng},
        map: map,
        title: 'My Location',
        icon: 'imgs/blue_dot.png'
    });
}


// PLACE SEARCH //

function getLocationByName(place_name, success, failure) {
    var service = new google.maps.places.PlacesService(map);
    // service.nearbySearch({
    //   location: DEFAULT_CENTER,
    //   radius: 2000  // in meters
    // }, function(results, status) {
    service.textSearch({query: place_name}, function(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            var location = {
                lat: results[0].geometry.location.lat(),
                lng: results[0].geometry.location.lng()
            };
            success(location);
        } else if (failure) {
            failure();
        }
    });
}

// UTILITY FUNCTIONS //

function calculateDistance(lat1, lng1, lat2, lng2) {
    var R = 6371e3; // metres
    var psi1 = degrees_to_radians(lat1);
    var psi2 = degrees_to_radians(lat2);
    var delta_psi = degrees_to_radians(lat2-lat1);
    var delta_lambda = degrees_to_radians(lng2-lng1);

    var a = Math.sin(delta_psi/2) * Math.sin(delta_psi/2) +
            Math.cos(psi1) * Math.cos(psi2) *
            Math.sin(delta_lambda/2) * Math.sin(delta_lambda/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
}

function degrees_to_radians(degrees)  
{  
    var pi = Math.PI;  
    return degrees * (pi/180);  
}
