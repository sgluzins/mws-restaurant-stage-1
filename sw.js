const URLS = [
    '/',
    'index.html',
    'restaurant.html',
    'css/styles.css',
    'data/restaurant.json',
    'img/1.jpg',
    'img/2.jpg',
    'img/3.jpg',
    'img/4.jpg',
    'img/5.jpg',
    'img/6.jpg',
    'img/7.jpg',
    'img/8.jpg',
    'img/9.jpg',
    'img/10.jpg',
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
    console.log(event.request.url);
    event.respondWith(caches.match(event.request).then(response => {
        return response || fetch(event.request);
    }));
});