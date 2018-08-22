self.importScripts('/node_modules/idb/lib/idb.js');

const URLS = [
    '/',
    'index.html',
    'restaurant.html',
    'css/styles.css',
    'manifest.json',
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
    'js/restaurant_info.js',
];

const dbPromise = idb.open('mws-restaurants', 1, function(upgradeDb){ 
    var keyValStore = upgradeDb.createObjectStore('restaurants', {keyPath: 'id'});
});

self.addEventListener('install', event => {
 event.waitUntil(
   caches.open('mws-restaurant-sg').then(cache => {
        return cache.addAll(URLS);
    })
 )
});

self.addEventListener('fetch', event => {
    const endpoint = new URL(event.request.url);

    if(endpoint.port === '1337') {
        if(navigator.onLine){
            fetch(endpoint).then((response) => {
                response.json().then(restaurants => {
                    dbPromise.then(function(db) {
                        var store = db.transaction('restaurants', 'readwrite').objectStore('restaurants');
                        store.put({
                            id: 0,
                            data: restaurants
                        });
                        restaurants.forEach(
                            restaurant => {
                            store.put({
                                id: restaurant.id,
                                data: restaurant
                            });
                        });
                        return store.complete;
                    });
                })
            });
        } else {
            const splitURL = endpoint.pathname.split('/');
            const urlLength = splitURL.length - 1;
            const id = splitURL[urlLength] === 'restaurants' ? 0 : splitURL[urlLength];
            event.respondWith(
                dbPromise.then(db => {
                    var tx = db.transaction('restaurants').objectStore('restaurants');
                    return tx.get(id);
                }).then(val => {
                    return new Response(JSON.stringify(val.data));
                })
            );
        }
    } else {
        event.respondWith(caches.match(event.request).then(response => {
            return response || fetch(event.request);
        }))
    }

});