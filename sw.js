// Set a name for the current cache
const cacheName = 'v1';
// Default files to always cache
const cacheFiles = [
    './',
    './index.html',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Pinarello_Dogma_XC_Shimano_XTR_Custom_Bike_%2816165258647%29.jpg/482px-Pinarello_Dogma_XC_Shimano_XTR_Custom_Bike_%2816165258647%29.jpg',
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Wiemu24.jpg/1280px-Wiemu24.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/3/3d/Bike_refelector_safety_flash.JPG",
    "https://use.fontawesome.com/releases/v5.8.2/css/all.css",
    "https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/css/bootstrap.min.css",
    "https://cdnjs.cloudflare.com/ajax/libs/mdbootstrap/4.14.1/css/mdb.min.css",
    "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/js/bootstrap.min.js",
    './favicon.ico',
    './icons/icon-72x72.png',
    './icons/icon-96x96.png',
    './icons/icon-128x128.png',
    './icons/icon-144x144.png',
    './icons/icon-152x152.png',
    './icons/icon-192x192.png',
    './icons/icon-384x384.png',
    './icons/icon-512x512.png',
];

self.addEventListener('install', function(e) {
    console.log('[ServiceWorker] Installed');
    // e.waitUntil Delays the event until the Promise is resolved
    e.waitUntil(
        // Open the cache
        caches.open(cacheName).then(function(cache) {
            // Add all the default files to the cache
            console.log('[ServiceWorker] Caching cacheFiles');
            return cache.addAll(cacheFiles);
        })
    ); // end e.waitUntil
});
self.addEventListener('activate', function(e) {
    console.log('[ServiceWorker] Activated');
    e.waitUntil(
        // Get all the cache keys (cacheName)
        caches.keys().then(function(cacheNames) {
            return Promise.all(cacheNames.map(function(thisCacheName) {
                // If a cached item is saved under a previous cacheName
                if (thisCacheName !== cacheName) {
                    // Delete that cached file
                    console.log('[ServiceWorker] Removing Cached Files from Cache - ', thisCacheName);
                    return caches.delete(thisCacheName);
                }
            }));
        })
    ); // end e.waitUntil
});

self.addEventListener('fetch', function(e) {
    console.log('[ServiceWorker] Fetch', e.request.url);
    // e.respondWidth Responds to the fetch event
    e.respondWith(
        // Check in cache for the request being made
        caches.match(e.request)
            .then(function(response) {
                // If the request is in the cache
                if (response) {
                    console.log("[ServiceWorker] Found in Cache", e.request.url, response);
                    // Return the cached version
                    return response;
                }
                // If the request is NOT in the cache, fetch and cache
                const requestClone = e.request.clone();
                return fetch(requestClone)
                    .then(function(response) {
                        if (!response) {
                            console.log("[ServiceWorker] No response from fetch ")
                            return response;
                        }
                        const responseClone = response.clone();
                        //  Open the cache
                        caches.open(cacheName).then(function(cache) {
                            // Put the fetched response in the cache
                            cache.put(e.request, responseClone);
                            console.log('[ServiceWorker] New Data Cached', e.request.url);
                            // Return the response
                            return response;
                        }); // end caches.open
                    })
                    .catch(function(err) {
                        console.log('[ServiceWorker] Error Fetching & Caching New Data', err);
                    });
            }) // end caches.match(e.request)
    ); // end e.respondWith
});