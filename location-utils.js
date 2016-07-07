function getLocation(callback) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(callback, function() {
            // On failure, do this
            getLocationUsingGoogleMaps(callback)
        });
    } else {
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
