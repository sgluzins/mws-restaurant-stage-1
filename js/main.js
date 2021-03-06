let restaurants,
  neighborhoods,
  cuisines
var newMap
var markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  initMap();
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  select.setAttribute('aria-label', 'All Neighborhoods');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.setAttribute('aria-label', neighborhood);
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');
  select.setAttribute('aria-label', 'All Cuisines');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.setAttribute('aria-label', cuisine);
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize leaflet map, called from HTML.
 */
initMap = () => {
  self.newMap = L.map('map', {
    center: [40.722216, -73.987501],
    zoom: 12,
    scrollWheelZoom: false
  });
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
    mapboxToken: 'pk.eyJ1Ijoic2dsdXppbnMiLCJhIjoiY2l4bDZmNWJzMDA2MDJ3bGVrZHE4dDR2dyJ9.DVy40dBmhaCpM3xOSIjQhg',
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' + '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' + 'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox.streets'
  }).addTo(newMap);
    updateRestaurants();
  }

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');
  const id = restaurant.id;

  const image = document.createElement('img');
  image.setAttribute('alt', `view of ${restaurant.name}`);
  image.setAttribute('sizes', `(max-width: 400px) 100vw, (min-width: 401px) 50vw`);
  image.srcset = DBHelper.imageUrlForRestaurantSrc(restaurant);
  image.className = 'restaurant-img';
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  li.append(image);

  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const bottomDiv = document.createElement('div');
  bottomDiv.className = 'bottomDiv';

  const more = document.createElement('a');
  more.setAttribute('aria-label', `View ${restaurant.name} details`);
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  bottomDiv.append(more);

  const faveButton = document.createElement('button');
  const fave = document.createElement('i');
  faveButton.className = 'faveButton';
  faveButton.id = 'fave';
  faveButton.setAttribute('role', 'button');
  faveButton.setAttribute('aria-label', 'restaurant is favorite');
  restaurant.is_favorite === 'true' ? fave.className = 'fas fa-heart' : fave.className = 'far fa-heart';

  faveButton.onclick = function(){
    fave.className === 'fas fa-heart' ? DBHelper.unfavoriteRestaurant(id) : DBHelper.favoriteRestaurant(id);
    fave.className === 'fas fa-heart' ? fave.className = 'far fa-heart' : fave.className = 'fas fa-heart';
  };
  faveButton.append(fave);
  bottomDiv.append(faveButton);
  li.append(bottomDiv);

  return li
}

handleClick = (id, state) => {
  const restaurant = self.restaurants.filter(restaurant => restaurant.id === id)[0];
  restaurant['fave'] = state;
}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
    restaurants.forEach(restaurant => {
    // Add marker to the map
      const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
      marker.on("click", onClick);
      function onClick() {
        window.location.href = marker.options.url;
      }
    });
  } 
