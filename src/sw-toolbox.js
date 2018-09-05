importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.4.1/workbox-sw.js');

if (workbox) {
    console.log(`Workbox dependency is supported by the browser`);
} else {
    console.log(`Workbox depdency has failed - it is not support by the browser`);
}

// APEP look to convert to environment specific?
workbox.setConfig({
    debug: false
});

var cdn = "process.env.AZURE_CDN_URL";

workbox.routing.registerRoute(
    new RegExp(`^(.*)${cdn}(.*)/video/transcoded/dash/(.*).mp4`),
    workbox.strategies.cacheFirst({
        // Use a custom cache name
        cacheName: 'dash-blob-cache',
        plugins: [
            new workbox.expiration.Plugin({
                // Cache for a maximum of 180 days
                maxAgeSeconds: 180 * 24 * 60 * 60,
            }),
            new workbox.rangeRequests.Plugin({}),
            new workbox.cacheableResponse.Plugin({
                statuses: [0, 200]
            })
        ],
    }),
);

workbox.routing.registerRoute(
    new RegExp(`^(.*)${cdn}(.*)/video/transcoded/dash/(.*)(?:mpd)`),
    workbox.strategies.staleWhileRevalidate({
        // Use a custom cache name
        cacheName: 'dash-manifests-blob-cache',
        plugins: [
            new workbox.expiration.Plugin({
                // Cache for a maximum of 180 days
                maxAgeSeconds: 180 * 24 * 60 * 60,
            }),
            new workbox.cacheableResponse.Plugin({
                statuses: [0, 200]
            })
        ],
    }),
);

workbox.routing.registerRoute(
    new RegExp(`^(.*)${cdn}(.*)/video/raw/(.*)(?:mp4)`),
    workbox.strategies.staleWhileRevalidate({
        // Use a custom cache name
        cacheName: 'raw-vid-blob-cache',
        plugins: [
            new workbox.expiration.Plugin({
                // Cache for a maximum of 180 days
                maxAgeSeconds: 180 * 24 * 60 * 60,
            }),
            new workbox.cacheableResponse.Plugin({
                statuses: [0, 200]
            })
        ],
    }),
);

workbox.routing.registerRoute(
    new RegExp(`^(.*)${cdn}(.*)/audio/(.*)/(.*)`),
    workbox.strategies.staleWhileRevalidate({
        // Use a custom cache name
        cacheName: 'audio-blob-cache',
        plugins: [
            new workbox.expiration.Plugin({
                // Cache for a maximum of 180 days
                maxAgeSeconds: 180 * 24 * 60 * 60,
            }),
            new workbox.cacheableResponse.Plugin({
                statuses: [0, 200]
            })
        ],
    }),
);

workbox.routing.registerRoute(
    new RegExp(`^(.*)${cdn}(.*)(?:png|jpg|jpeg|svg|gif)`),
    workbox.strategies.staleWhileRevalidate({
        // Use a custom cache name
        cacheName: 'image-blob-cache',
        plugins: [
            new workbox.expiration.Plugin({
                // Cache for a maximum of 180 days
                maxAgeSeconds: 180 * 24 * 60 * 60,
            }),
            new workbox.cacheableResponse.Plugin({
                statuses: [0, 200]
            })
        ],
    }),
);
