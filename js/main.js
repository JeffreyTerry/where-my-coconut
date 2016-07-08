// LOCATION SEARCH //

function searchOnEnterKey(element) {
    // Check that this event was triggered by the "enter" key.
    // Also check that the map has loaded.
    if (event.keyCode == 13 && $('.map-loader').length == 0) {
        var search_term = toTitleCase(element.value);
        if (search_term.search(/^\s*building\s*\d+\s*$/i) != -1) {
            search_term = "Microsoft " + search_term;
        } else if (search_term.search(/^\s*\d+\s*$/) != -1) {
            search_term = "Microsoft Building " + search_term;
        } else if (search_term.search(/^\s*redwest\s*[a-z]\s*$/i) != -1) {
            search_term = "Microsoft " + search_term;
        } else if (search_term.search(/^\s*redwoods\s*[a-z]\s*$/i) != -1) {
            search_term = "Microsoft " + search_term;
        } else if (search_term.search(/^\s*studio\s*[a-z]\s*$/i) != -1) {
            search_term = "Microsoft " + search_term;
        } else if (search_term.search(/^\s*[a-z]\s*$/i) != -1) {
            search_term = "Microsoft Studio " + search_term;
        } else if (search_term.search(/^\s*the commons\s*$/i) != -1) {
            search_term = "Microsoft " + search_term;
        } else if (search_term.search(/^\s*commons\s*$/i) != -1) {
            search_term = "Microsoft " + search_term;
        } else if (search_term.search(/^\s*transit center\s*$/i) != -1) {
            search_term = "Overlake " + search_term;
        } else if (search_term.search(/^\s*otc\s*$/i) != -1) {
            search_term = "Overlake Transit Center";
        }
        element.value = search_term;
        searchForLocationAndSetToCurrent(search_term);
    }
}

function searchForLocationAndSetToCurrent(place_name) {
    getLocationByName(place_name, function(location) {
        // On success
        userLat = location.lat;
        userLng = location.lng;

        repositionUserMarker(userLat, userLng);

        // Check to see if we're showing directions to a coconut right now
        if (window.destination_coconut) {
            showDirections();
        } else {
            map.panTo(new google.maps.LatLng(userLat, userLng));
        }

        sortCoconutsByDistance();
        populateCoconutList();
    }, function() {
        // On failure
        alert('Could not find "' + place_name + '"');
    });
}


// DIRECTION SEARCH //

function showDirections(div) {
    //direction service api call to show a route from you to the marker on the map
    if (div) {
        destination_coconut = div.textContent;
    }

    if (markers) {
        markers.forEach(function(marker) {
            if (marker.title === destination_coconut) {
                var start = new google.maps.LatLng(userLat, userLng);
                var end = marker.getPosition();
                var request = {
                    origin:start,
                    destination:end,
                    travelMode: google.maps.TravelMode.DRIVING
                };
                //console.log(request);
                directionsService.route(request, function(response, status) {
                    if (status == google.maps.DirectionsStatus.OK) {
                        directionsDisplay.setDirections(response);
                    }
                });
            }
        });
    }
}


// UI EFFECTS //

function markerHover(div) {
    if (markers) {
        markers.forEach(function(marker) {
            if (marker.title === div.textContent) {
                marker.setAnimation(google.maps.Animation.BOUNCE);
            }
        });
    }
}

function markerStop(div) {
    if (markers) {
        markers.forEach(function(marker) {
            if (marker.title === div.textContent) {
                marker.setAnimation(null);
            }
        });
    }
}


// COCONUT STUFF //

function initCoconuts() {
    console.log('here 3');
    getCurrentLocation(function(location) {
        console.log('here 4');
        if (location.error) {
            // The center of the Microsoft Campus
            userLat = DEFAULT_CENTER.lat;
            userLng = DEFAULT_CENTER.lng;
            console.log('here 5');
        } else {
            userLat = location.coords.latitude;
            userLng = location.coords.longitude;
            console.log('here 6');
        }

        // Load the map //
        var mapDiv = document.getElementById('map');
        map = new google.maps.Map(mapDiv, {
            center: {lat: userLat, lng: userLng},
            zoom: 16
        }, function() {
            console.log('here');
        });


        // DIRECTIONS //

        directionsDisplay = new google.maps.DirectionsRenderer();
        directionsService = new google.maps.DirectionsService();
        

        mapDiv = document.getElementById('map');
        map = new google.maps.Map(mapDiv, {
            center: {lat: userLat, lng: userLng},
            zoom: 16
        });
        
        directionsDisplay.setMap(map);
        directionsDisplay.setPanel(document.getElementById("directionsPanel"));


        sortCoconutsByDistance();

        // MARKERS //
        markers = [];
        coconuts.forEach(function(coconut) {
            var marker = new google.maps.Marker({
                position: {'lat': coconut.lat, 'lng': coconut.lng},
                map: map,
                animation: google.maps.Animation.DROP,
                title: coconut.name,
                icon: 'imgs/coconut_water.png'
            });
            markers.push(marker);
        });

        repositionUserMarker(userLat, userLng);
        populateCoconutList();
        $('#list').css('visibility', 'visible');
    });
}

function sortCoconutsByDistance() {
    // We need to sort the coconuts by location.
    // We want the closest ones to show up at the top of the list.
    coconuts.sort(function(a, b) {
        a_distance = calculateDistance(userLat, userLng, a.lat, a.lng);
        b_distance = calculateDistance(userLat, userLng, b.lat, b.lng);
        return a_distance - b_distance;
    });
}

function populateCoconutList() {
    var list = $('#list > div.coconut-list');
    list.empty();
    coconuts.forEach(function(coconut) {
        list.append('<div class="coconut" onmouseover="markerHover(this)" onmouseout="markerStop(this)" onClick="showDirections(this)">' + coconut.name + '</div>');
    });
}


// INITIALIZATION & SETUP //

$(function(){
    $.get('https://s3-us-west-2.amazonaws.com/wheremycoconut/coconuts.json', function(data) {
        coconuts = JSON.parse(data);
        initCoconuts();
    });

    [].slice.call( document.querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {    
        new SelectFx(el);
    });

    $("#coconut-selector").prop("selectedIndex", -1);
});
