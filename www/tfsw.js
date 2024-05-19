// Cache the domains that 

const CACHE_NAME = 'aggressive-cache-v1';
const domainsToCache = [
    'tfhub.dev',
    'kaggle.com',
    'storage.googleapis.com'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
    const requestUrl = new URL(event.request.url);
    if (domainsToCache.some(domain => requestUrl.hostname.includes(domain))) {
        event.respondWith(
            caches.match(event.request)
                .then((response) => {
                    if (response) {
                        return response;
                    }
                    return fetch(event.request).then(
                        (response) => {
                            if (!response || response.status !== 200 || response.type !== 'basic') {
                                return response;
                            }
                            const responseToCache = response.clone();
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request, responseToCache);
                                });
                            return response;
                        }
                    );
                })
        );
    } else {
        event.respondWith(fetch(event.request));
    }
});
