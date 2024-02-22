/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
const sw = self as unknown as ServiceWorkerGlobalScope

// Imports /////////////////////////////////////////////////////////////////////
import { build, files, version } from '$service-worker';

// Constants ///////////////////////////////////////////////////////////////////
const APP_CACHE = `app-cache-${version}`
const ASSETS = [...build, ...files]

const IMG_CACHE = 'img-cache'

////////////////////////////////////////////////////////////////////////////////

// Install service worker
sw.addEventListener('install', (event) => {
    async function addFilesToCache() {
        // App cache
        const appCache = await caches.open(APP_CACHE);
        await appCache.addAll(ASSETS);

        // Img cache
        await caches.open(IMG_CACHE)
    }

    event.waitUntil(addFilesToCache());
});

// Activeate service worker
sw.addEventListener('activate', (event) => {
    async function deleteOldCaches() {
        // App cache
        for (const key of await caches.keys()) {
            if (key !== APP_CACHE) {
                await caches.delete(key);
            }
        }

        // Img case must not be deleted because it does not depend on version.
    }

    event.waitUntil(deleteOldCaches());
});

// Listen to fetch events
sw.addEventListener('fetch', (event) => {
    // Skip all non-GET requests.
    if (event.request.method !== 'GET') { return }

    // Parse URL
    const url = new URL(event.request.url);

    // Skip backend requests
    if (url.hostname === 'api.xbrowsersync.org' ||
        url.hostname === 'api.raindrop.io'
    ) { return }

    // Cache function
    async function respond() {
        // App Caching /////////////////////////////////////////////////////////
        /**
         * The app cache stores all assets of the web application to make the
         * load times as fast as possible.
         */

        // Get app cache
        const appCache = await caches.open(APP_CACHE);

        // serve build files from the appCache
        if (ASSETS.includes(url.pathname)) {
            const cachedResponse = await appCache.match(url.pathname);
            if (cachedResponse) {
                return cachedResponse;

            } else {
                const response = await fetch(event.request)

                const tls = url.protocol.startsWith('https')
                const ok = response.status === 200
                if (tls && ok) {
                    appCache.put(event.request, response.clone())
                }

                return response
            }
        }

        // Image Caching ///////////////////////////////////////////////////////
        // Get image cache
        const imgCache = await caches.open(IMG_CACHE)

        if (event.request.headers.get('Accept')?.includes('image/')) {
            const cachedResponse = await imgCache.match(url.pathname)
            if (cachedResponse) {
                return cachedResponse

            } else {
                const response = await fetch(event.request)

                const tls = url.protocol.startsWith('https')
                const ok = response.status === 200
                if (tls && ok) {
                    imgCache.put(event.request, response.clone())
                }

                return response
            }
        }


        // try the network first
        try {
            const response = await fetch(event.request);

            const isNotExtension = url.protocol.startsWith('http');
            const isSuccess = response.status === 200;

            if (isNotExtension && isSuccess) {
                appCache.put(event.request, response.clone());
            }

            return response;
        } catch {
            // fall back to cache
            const cachedResponse = await appCache.match(url.pathname);
            if (cachedResponse) {
                return cachedResponse;
            }
        }

        return new Response(
            JSON.stringify({
                error: 'Nicht gefunden (du bist offline)',
                origin: 'PWA cache'
            }),
            { status: 404 }
        );
    }

    event.respondWith(respond());
});

sw.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'skipWaiting') {
        sw.skipWaiting();
    }
});

////////////////////////////////////////////////////////////////////////////////




