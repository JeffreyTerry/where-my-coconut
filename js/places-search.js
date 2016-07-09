function initSearchBox() {
    // Create the search box and link it to the UI element.
    var input = document.getElementById('pac-input');
    
    var searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    // Provide some shortcuts for our users
    $(input).keyup(autofillSearchBoxCallback);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function() {
        searchBox.setBounds(map.getBounds());
    });

    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();

        if (places.length == 0) {
            return;
        }

        var place = places[0];

        $('#pac-input').val(place.name);

        // Update the current location globals
        userLat = place.geometry.location.lat();
        userLng = place.geometry.location.lng();

        // We need the current location globals to be set in order for 'sortCoconutsByDistance' to work, so don't move this up.
        sortCoconutsByDistance();
        populateCoconutList();

        // This code only runs if we couldn't automatically find the user's location and if they just finished specifying it themselves.
        if ($('#map-overlay').length > 0) {
            removeGrayOutFromMap();
            placeCoconutMarkers();
        }

        // This code also only runs if we couldn't automatically find the user's location and if they just finished specifying it themselves.
        // If necessary (i.e. if we're in desktop mode), swoosh the coconut list into the window from the right.
        if ($('#list').width() == 0) {
            var animationTime = 350;

            $('#list').animate({width: '292px'}, animationTime);
            $('#map').animate({width: ($(window).width() - 316) + 'px'}, animationTime);

            // We need to wait for the map to resize before we pan to its center.
            setTimeout(function() {
                google.maps.event.trigger(map, 'resize');
                repositionCurrentLocationMarker();
                panToCurrentLocation();
            }, animationTime);
        } else {
            repositionCurrentLocationMarker();
            panToCurrentLocation();
        }
    });
}

function autofillSearchBoxCallback() {
    var original_search_term = toTitleCase($('#pac-input').val());

    var replacement_term = original_search_term;
    if (original_search_term.search(/^\s*building\s*\d+\s*$/i) != -1) {
        replacement_term = "Microsoft " + original_search_term;
    } else if (original_search_term.search(/^\s*redwest\s*[a-z]\s*$/i) != -1) {
        replacement_term = "Microsoft " + original_search_term;
    } else if (original_search_term.search(/^\s*redwoods\s*[a-z]\s*$/i) != -1) {
        replacement_term = "Microsoft " + original_search_term;
    } else if (original_search_term.search(/^\s*studio\s*[a-z]\s*$/i) != -1) {
        replacement_term = "Microsoft " + original_search_term;
    } else if (original_search_term.search(/^\s*the commons\s*$/i) != -1) {
        replacement_term = "Microsoft The Commons Mixer";
    } else if (original_search_term.search(/^\s*commons\s*$/i) != -1) {
        replacement_term = "Microsoft The Commons Mixer";
    } else if (original_search_term.search(/^\s*transit center\s*$/i) != -1) {
        replacement_term = "Overlake " + original_search_term;
    } else if (original_search_term.search(/^\s*otc\s*$/i) != -1) {
        replacement_term = "Overlake Transit Center";
    }

    if (replacement_term != original_search_term) {
        $('#pac-input').val(replacement_term);
    }
}