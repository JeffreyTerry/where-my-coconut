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
                    travelMode: google.maps.TravelMode.WALKING
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

function bobArrowUpAndDown() {
   $('#map-overlay-arrow').animate({top:'+=12'}, 500);
   $('#map-overlay-arrow').animate({top:'-=12'}, 500, bobArrowUpAndDown);
   $('#map-overlay-instructions').animate({top:'+=12'}, 500);
   $('#map-overlay-instructions').animate({top:'-=12'}, 500, bobArrowUpAndDown);
}

function grayOutMap() {
    $('#map > div').append("<div id='map-overlay'></div>");
    $('#map > div').append("<img id='map-overlay-arrow' src='imgs/up-arrow.png'>");
    $('#map > div').append("<div id='map-overlay-instructions'>enter your location</div>");
    bobArrowUpAndDown();
}

function removeGrayOutFromMap() {
    $('#map > div > #map-overlay').remove();
    $('#map > div > #map-overlay-arrow').remove();
    $('#map > div > #map-overlay-instructions').remove();
}


// COCONUT STUFF //

function initCoconuts() {
    getCurrentLocation(function(location) {
        if (location.error) {
            // The center of the Microsoft Campus
            userLat = DEFAULT_CENTER.lat;
            userLng = DEFAULT_CENTER.lng;
        } else {
            userLat = location.coords.latitude;
            userLng = location.coords.longitude;

            if ($(window).width() >= 1000) {
                $('#map').css({width: ($(window).width() - 316) + 'px'});
                $('#list').css({width: '292px'});
            }
        }

        // Load the map, then initialize the search box //
        var mapDiv = document.getElementById('map');
        map = new google.maps.Map(mapDiv, {
            center: {lat: userLat, lng: userLng},
            zoom: 16,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });

        // When the search box first loads, it looks super dank.
        // So we hide it until the map populates.
        // Once google puts the search box inside the map, the box becomes less dank.
        $('#map').arrive('#pac-input', function() {
            $('#pac-input').css({'display': 'block'});
            $(document).unbindArrive('#map');

            // If we couldn't automatically find the user's location, we ask them for it.
            if (location.error) {
                grayOutMap();
                $('#pac-input').ready(function() {
                    $('#pac-input').focus();
                });
            }
        });

        initSearchBox();

        // Set up google maps directions api //

        directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: true});
        directionsService = new google.maps.DirectionsService();
        
        directionsDisplay.setMap(map);

        // Sort the coconuts //
        sortCoconutsByDistance();
        
        // If we were able to automatically find the user's location, we can reposition the map now and populate the list.
        if (!location.error) {
            sortCoconutsByDistance();
            populateCoconutList();

            repositionCurrentLocationMarker();
            panToCurrentLocation();
            
            placeCoconutMarkers();
        }
    });
}

function placeCoconutMarkers() {
    // Place markers //
    markers = [];
    coconuts.forEach(function(coconut) {
        var marker = new google.maps.Marker({
            position: {'lat': coconut.lat, 'lng': coconut.lng},
            map: map,
            animation: google.maps.Animation.DROP,
            title: coconut.building,
            icon: 'imgs/coconut_water.png'
        });
        markers.push(marker);
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
    $('#list').css('visibility', 'visible');
    var list = $('#list > div.coconut-list');
    list.empty();
    coconuts.forEach(function(coconut) {
        list.append('<div class="coconut" onmouseover="markerHover(this)" onmouseout="markerStop(this)" onClick="showDirections(this)">' + coconut.building + '</div>');
    });
}


// INITIALIZATION & SETUP //

$(function(){
    // Set up auto-resizing for the map and list
    $(window).resize(function() {
        // Only resize the map & list if the user has already finished entering their location.
        if ($('#map-overlay').length == 0) {
            // Size differently on mobile than on desktop
            if ($(window).width() < 1000) {
                // Mobile
                $('#map').css({width: ($(window).width() - 16) + 'px'});
                $('#list').css({width: ($(window).width() - 16) + 'px'});
            } else {
                // Desktop
                $('#map').css({width: ($(window).width() - 316) + 'px'});
                $('#list').css({width: '292px'});
            }
        }
    });

    // GET THE COCONUTS! NOWNOWNOW!
    $.get('https://s3-us-west-2.amazonaws.com/wheremycoconut/drink-information.json', function(data) {
        drinks = JSON.parse(data);
        coconuts = drinks.filter(function(drink) {
            return drink.type == 'coconut';
        });
        lattes = drinks.filter(function(drink) {
            return drink.type == 'latte';
        });
        initCoconuts();
    });
});
