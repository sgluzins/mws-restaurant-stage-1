let restaurant;
var newMap;

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {  
  initMap();
});

/**
 * Initialize leaflet map
 */
initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {      
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      });
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: 'pk.eyJ1Ijoic2dsdXppbnMiLCJhIjoiY2l4bDZmNWJzMDA2MDJ3bGVrZHE4dDR2dyJ9.DVy40dBmhaCpM3xOSIjQhg',
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'    
      }).addTo(newMap);
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
}  
 
/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const faveButton = document.getElementById('fave-button');
  const fave = document.getElementById('heart-icon');
  faveButton.onclick = function(){
    fave.className === 'far fa-heart' ? fave.className = 'fas fa-heart' : fave.className = 'far fa-heart';
  };
  fave.className = 'far fa-heart';

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.setAttribute('alt', `view of ${restaurant.name}`);
  image.setAttribute('sizes', `(max-width: 400px) 100vw, (min-width: 401px) 50vw`);
  image.srcset = DBHelper.imageUrlForRestaurantSrc(restaurant);
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  DBHelper.fetchReviewById(restaurant.id, fillReviewsHTML);

  // add review form
  addReviewHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (error, reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = new Date(review.updatedAt).toDateString();
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

addReviewHTML = () => {
  const container = document.getElementById('reviews-form');
  const title = document.createElement('h2');
  title.innerHTML = 'Add Review';
  container.appendChild(title);

  const reviewForm = document.createElement('form');
  reviewForm.className = 'restaurant-reviews-form';

  const ratingLabel = document.createElement('label');
  ratingLabel.innerHTML = 'RATING';
  const selectRating = document.createElement('select');
  selectRating.setAttribute('aria-label', 'restaurant rating');
  const ratingOne = document.createElement('option');
  ratingOne.setAttribute = ('value', 'one');
  ratingOne.innerHTML = 'one';
  const ratingTwo = document.createElement('option');
  ratingTwo.setAttribute = ('value', 'two');
  ratingTwo.innerHTML = 'two';
  const ratingThree = document.createElement('option');
  ratingThree.setAttribute = ('value', 'three');
  ratingThree.innerHTML = 'three';
  const ratingFour = document.createElement('option');
  ratingFour.setAttribute = ('value', 'four');
  ratingFour.innerHTML = 'four';
  const ratingFive = document.createElement('option');
  ratingFive.setAttribute = ('value', 'five');
  ratingFive.innerHTML = 'five';
  selectRating.appendChild(ratingOne);
  selectRating.appendChild(ratingTwo);
  selectRating.appendChild(ratingThree);
  selectRating.appendChild(ratingFour);
  selectRating.appendChild(ratingFive);
  reviewForm.appendChild(ratingLabel);
  reviewForm.appendChild(selectRating);

  const nameLabel = document.createElement('label');
  nameLabel.innerHTML = 'NAME';
  const name = document.createElement('input');
  name.setAttribute('aria-label', 'name');
  reviewForm.appendChild(nameLabel);
  reviewForm.appendChild(name);

  const commentsLabel = document.createElement('label');
  commentsLabel.innerHTML = 'COMMENTS';
  const comments = document.createElement('textarea');
  comments.className = 'review-comments';
  comments.setAttribute('aria-label', 'comments');
  reviewForm.appendChild(commentsLabel);
  reviewForm.appendChild(comments);


  const submitButton = document.createElement('button');
  submitButton.innerHTML = 'SUBMIT';
  reviewForm.appendChild(submitButton);

  container.appendChild(reviewForm);
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
