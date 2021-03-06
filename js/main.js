// ADDING DRINKS //
function addDrink(el) {
    if (el.textContent.includes('coconut')) {
        window.open(
            'http://goo.gl/forms/t4cn2S4TLi9Yhw3y1',
            '_blank'
        );
    } else if (el.textContent.includes('vitamin')) {
        window.open(
            'http://goo.gl/forms/8gB3O0hlGlo9LrSF2',
            '_blank'
        );
    } else if (el.textContent.includes('almond')) {
        window.open(
            'http://goo.gl/forms/ms4T2wVKsIy0pVI33',
            '_blank'
        );
    } else if (el.textContent.includes('latte')) {
        window.open(
            'http://goo.gl/forms/IeBDNfoimoYBL8T13',
            '_blank'
        );
    } 
}

// DIRECTION SEARCH //

function showDirections(div) {
    //direction service api call to show a route from you to the marker on the map
    if (div) {
        destination_building = $(div).clone().children().remove().end().text();
    }

    if (window.markers) {
        window.markers.forEach(function(marker) {
            if (marker.title === destination_building) {
                var start = new google.maps.LatLng(userLat, userLng);
                var end = marker.getPosition();
                var request = {
                    origin: start,
                    destination: end,
                    travelMode: google.maps.TravelMode.WALKING
                };
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

function showRightArrow(div) {
    $(div).find('.distance').css({'display': 'none'});
    $(div).find('.arrow').css({'display': 'block'});
}

function hideRightArrow(div) {
    $(div).find('.distance').css({'display': 'block'});
    $(div).find('.arrow').css({'display': 'none'});
}

function markerHover(div) {
    if (window.markers) {
        var building_name = $(div).clone().children().remove().end().text();
        window.markers.forEach(function(marker) {
            if (marker.title == building_name) {
                marker.setAnimation(google.maps.Animation.BOUNCE);
            }
        });
    }
}

function markerStop(div) {
    if (window.markers) {
        var building_name = $(div).clone().children().remove().end().text();
        window.markers.forEach(function(marker) {
            if (marker.title == building_name) {
                marker.setAnimation(null);
            }
        });
    }
}

function bobArrowUpAndDown() {
    $('#map-overlay-arrow').animate({
        top: '+=12'
    }, 500);
    $('#map-overlay-arrow').animate({
        top: '-=12'
    }, 500, bobArrowUpAndDown);
    $('#map-overlay-instructions').animate({
        top: '+=12'
    }, 500);
    $('#map-overlay-instructions').animate({
        top: '-=12'
    }, 500, bobArrowUpAndDown);
}

function grayOutMap() {
    // TODO fix the z-index issue and put the overlay back in
    // $('#map > div').append("<div id='map-overlay'></div>");
    $('#map > div').append("<img id='map-overlay-arrow' src='imgs/up-arrow.png'>");
    $('#map > div').append("<div id='map-overlay-instructions'>enter your location</div>");
    bobArrowUpAndDown();
}

function removeGrayOutFromMap() {
    // TODO fix the z-index issue and put the overlay back in
    // $('#map > div > #map-overlay').remove();
    $('#map > div > #map-overlay-arrow').remove();
    $('#map > div > #map-overlay-instructions').remove();
}


// DRINK STUFF //

function setDrinkType(drink_type) {
    window.current_drink_type = drink_type;
    window.drinks = window[drink_type + 's'];

    $('#add-a-drink').text('add a ' + drink_type);
    $('#drink-list-title').text('where my ' + drink_type);

    sortDrinksByDistance();
    populateDrinkList();
    placeDrinkMarkers();
}

function sortDrinksByDistance() {
    // We need to sort the drinks by location.
    // We want the closest ones to show up at the top of the list.
    drinks.sort(function(a, b) {
        a_distance = calculateDistance(userLat, userLng, a.lat, a.lng);
        b_distance = calculateDistance(userLat, userLng, b.lat, b.lng);
        return a_distance - b_distance;
    });
}

function populateDrinkList() {
    var list = $('#drink-list');
    list.empty();
    drinks.forEach(function(drink) {
        list.append('<div class="drink-list-item" onmouseover="markerHover(this);showRightArrow(this)" onmouseout="markerStop(this);hideRightArrow(this)" onClick="showDirections(this)">' + drink.building + '</div>');
        var current_list_item = list.children().last('.drink-list-item');
        
        var current_distance = calculateDistance(userLat, userLng, drink.lat, drink.lng);
        current_distance = Math.round(current_distance / 100) / 10;  // Round to nearest tenth.
        current_list_item.prepend('<div class="distance">' + current_distance + ' km</div>');

        current_list_item.prepend('<img class="arrow" src="imgs/right-arrow.png">');
    });
}

function placeDrinkMarkers() { //also adds marker listeners 
    // Place markers //
    if (window.markers) {
        window.markers.forEach(function(marker) {
            marker.setMap(null);
        });
    }
    window.markers = [];
    drinks.forEach(function(drink) {
        var marker = new google.maps.Marker({
            position: {
                'lat': drink.lat,
                'lng': drink.lng
            },
            map: window.map,
            animation: google.maps.Animation.DROP,
            title: drink.building,
            icon: 'imgs/' + window.current_drink_type + '_marker.png'
        });
        window.markers.push(marker);
        marker.addListener('click', function() {
            //map.setZoom(18);
            //map.setCenter(marker.getPosition());
            var start = new google.maps.LatLng(userLat, userLng);
            var end = marker.getPosition();
            var request = {
                origin: start,
                destination: end,
                travelMode: google.maps.TravelMode.WALKING
            };
            directionsService.route(request, function(response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    directionsDisplay.setDirections(response);
                }
            });
            // var infowindow = new google.maps.InfoWindow({
            //     content: data
            // });
            //infowindow.open(map, marker);
        });
    });
}


// INITIALIZATION & SETUP //

$(function() {
    // Set up auto-resizing for the map and list
    $(window).resize(function() {
        // Only resize the map & list if the user has already finished entering their location.
        if ($('#map-overlay').length == 0) {
            // Size differently on mobile than on desktop
            if (isMobile()) {
                $('#map').css({
                    width: ($(window).width() - 16) + 'px'
                });
                $('#details-panel').css({
                    width: ($(window).width() - 16) + 'px'
                });
            } else {
                $('#map').css({
                    width: ($(window).width() - 316) + 'px'
                });
                $('#details-panel').css({
                    width: '292px'
                });
            }
        }
    });

    // GET THE COCONUTS! NOWNOWNOW!
    $.get('/drink-information.json', function(drinks) {
        coconuts = drinks.filter(function(drink) {
            return drink.type == 'coconut';
        });

        // Vitamin Waters can be found in the same fridges as Coconut Waters
        vitamins = [...coconuts];
        vitamins.forEach(function(vitamin) {
            vitamin.type = 'vitamin';
        });

        // Almond Milks can be found in the same fridges as Coconut Waters
        almonds = [...coconuts];
        almonds.forEach(function(vitamin) {
            almonds.type = 'almond';
        });

        lattes = drinks.filter(function(drink) {
            return drink.type == 'latte';
        });

        window.current_drink_type = 'coconut';
        window.drinks = window['coconuts'];

        initializeApplication();
    });
});


function initializeApplication() {
    getCurrentLocation(function(location) {
        if (location.error) {
            // The center of the Microsoft Campus
            userLat = DEFAULT_CENTER.lat;
            userLng = DEFAULT_CENTER.lng;
        } else {
            userLat = location.coords.latitude;
            userLng = location.coords.longitude;

            if (!isMobile()) {
                $('#map').css({
                    width: ($(window).width() - 316) + 'px'
                });
                $('#details-panel').css({
                    width: '292px'
                });
            }
        }

        // Load the map, then initialize the search box //
        var mapDiv = document.getElementById('map');
        window.map = new google.maps.Map(mapDiv, {
            center: {
                lat: userLat,
                lng: userLng
            },
            zoom: 16,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });

        // When the search box first loads, it looks super dank.
        // So we hide it until the map populates.
        // Once google puts the search box inside the map, the box becomes less dank.
        $('#map').arrive('#pac-input', function() {
            $('#pac-input').css({
                'display': 'block'
            });
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

        directionsDisplay = new google.maps.DirectionsRenderer({
            suppressMarkers: true
        });
        directionsService = new google.maps.DirectionsService();

        directionsDisplay.setMap(window.map);

        // Sort the drinks //
        sortDrinksByDistance();

        // If we were able to automatically find the user's location, we can reposition the map now and populate the list.
        if (!location.error) {
            sortDrinksByDistance();
            populateDrinkList();
            $('#details-panel').css('visibility', 'visible');

            repositionCurrentLocationMarker();
            panToCurrentLocation();

            placeDrinkMarkers();
        }
    });
}
