importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.2.0/workbox-sw.js');


if (workbox) {
    console.log(`Yay! Workbox is loaded 🎉`);
} else {
    console.log(`Boo! Workbox didn't load 😬`);
}

// workbox.LOG_LEVEL = 'debug'

workbox.routing.registerRoute(
    new RegExp('^(.*)uosassetstore.blob.core.windows.net/assetstoredev/video/transcoded/dash/(.*).mp4'),
    workbox.strategies.cacheFirst({
        // Use a custom cache name
        cacheName: 'dash-blob-cache',
        plugins: [
            new workbox.expiration.Plugin({
                // Cache for a maximum of a week
                maxAgeSeconds: 7 * 24 * 60 * 60,
            }),
            new workbox.rangeRequests.Plugin({}),
            new workbox.cacheableResponse.Plugin({
                statuses: [0, 200]
            })
        ],
    }),
);

workbox.routing.registerRoute(
    new RegExp('^(.*)uosassetstore.blob.core.windows.net/assetstoredev/video/transcoded/dash/(.*)(?:mpd)'),
    workbox.strategies.staleWhileRevalidate({
        // Use a custom cache name
        cacheName: 'dash-manifests-blob-cache',
        plugins: [
            new workbox.expiration.Plugin({
                // Cache for a maximum of a week
                maxAgeSeconds: 7 * 24 * 60 * 60,
            }),
            new workbox.cacheableResponse.Plugin({
                statuses: [0, 200]
            })
        ],
    }),
);

workbox.routing.registerRoute(
    new RegExp('^(.*)uosassetstore.blob.core.windows.net/assetstoredev/video/raw/(.*)(?:mp4)'),
    workbox.strategies.staleWhileRevalidate({
        // Use a custom cache name
        cacheName: 'raw-vid-blob-cache',
        plugins: [
            new workbox.expiration.Plugin({
                // Cache for a maximum of a week
                maxAgeSeconds: 7 * 24 * 60 * 60,
            }),
            new workbox.cacheableResponse.Plugin({
                statuses: [0, 200]
            })
        ],
    }),
);

workbox.routing.registerRoute(
    new RegExp('^(.*)uosassetstore.blob.core.windows.net/assetstoredev/audio(.*)'),
    workbox.strategies.staleWhileRevalidate({
        // Use a custom cache name
        cacheName: 'audio-blob-cache',
        plugins: [
            new workbox.expiration.Plugin({
                // Cache for a maximum of a week
                maxAgeSeconds: 7 * 24 * 60 * 60,
            }),
            new workbox.cacheableResponse.Plugin({
                statuses: [0, 200]
            })
        ],
    }),
);

workbox.routing.registerRoute(
    new RegExp('^(.*)uosassetstore.blob.core.windows.net/(.*)(?:png|jpg|jpeg|svg|gif)'),
    workbox.strategies.staleWhileRevalidate({
        // Use a custom cache name
        cacheName: 'image-blob-cache',
        plugins: [
            new workbox.expiration.Plugin({
                // Cache for a maximum of a week
                maxAgeSeconds: 7 * 24 * 60 * 60,
            }),
            new workbox.cacheableResponse.Plugin({
                statuses: [0, 200]
            })
        ],
    }),
);
