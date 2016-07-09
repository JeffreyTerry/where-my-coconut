function initSearchBox() {
  // When the search box first loads, it looks super dank.
  // So we hide it until the map populates and the search box moves inside it.
  $('#map').arrive('#pac-input', function() {
    $('#pac-input').css({'display': 'block'});
    $(document).unbindArrive('#map');
  });

  // Create the search box and link it to the UI element.
  var input = document.getElementById('pac-input');
  var searchBox = new google.maps.places.SearchBox(input);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

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

    updateCurrentLocation(place.geometry.location.lat(), place.geometry.location.lng());
  });
}