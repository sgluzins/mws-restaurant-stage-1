const URLS = [
    '/',
    'index.html',
    'restaurant.html',
    'css/styles.css',
    'data/restaurants.json',
    'img_sized/1-300_small.jpg',
    'img_sized/1-500_medium.jpg',
    'img_sized/1-1600_large.jpg',
    'img_sized/2-300_small.jpg',
    'img_sized/2-500_medium.jpg',
    'img_sized/2-1600_large.jpg',
    'img_sized/3-300_small.jpg',
    'img_sized/3-500_medium.jpg',
    'img_sized/3-1600_large.jpg',
    'img_sized/4-300_small.jpg',
    'img_sized/4-500_medium.jpg',
    'img_sized/4-1600_large.jpg',
    'img_sized/5-300_small.jpg',
    'img_sized/5-500_medium.jpg',
    'img_sized/5-1600_large.jpg',
    'img_sized/6-300_small.jpg',
    'img_sized/6-500_medium.jpg',
    'img_sized/6-1600_large.jpg',
    'img_sized/7-300_small.jpg',
    'img_sized/7-500_medium.jpg',
    'img_sized/7-1600_large.jpg',
    'img_sized/8-300_small.jpg',
    'img_sized/8-500_medium.jpg',
    'img_sized/8-1600_large.jpg',
    'img_sized/9-300_small.jpg',
    'img_sized/9-500_medium.jpg',
    'img_sized/9-1600_large.jpg',
    'img_sized/10-300_small.jpg',
    'img_sized/10-500_medium.jpg',
    'img_sized/10-1600_large.jpg',
    'js/dbhelper.js',
    'js/main.js',
    'js/restaurant_info.js'
];

self.addEventListener('install', event => {
 event.waitUntil(
   caches.open('mws-restaurant-sg').then(cache => {
     return cache.addAll(URLS);
   })
 );
});

self.addEventListener('fetch', event => {
    event.respondWith(caches.match(event.request).then(response => {
        return response || fetch(event.request);
    }));
});