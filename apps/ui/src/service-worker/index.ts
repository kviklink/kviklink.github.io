/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
const sw = self as unknown as ServiceWorkerGlobalScope

// Imports /////////////////////////////////////////////////////////////////////
import { build, files, version } from '$service-worker';

// Constants ///////////////////////////////////////////////////////////////////
const CACHE = `cache-${version}`;
const ASSETS = [...build, ...files];

////////////////////////////////////////////////////////////////////////////////

// Install service worker
sw.addEventListener('install', (event) => {
    async function addFilesToCache() {
        const cache = await caches.open(CACHE);
        await cache.addAll(ASSETS);
    }

    event.waitUntil(addFilesToCache());
});

// Activeate service worker
sw.addEventListener('activate', (event) => {
    async function deleteOldCaches() {
        for (const key of await caches.keys()) {
            if (key !== CACHE) {
                await caches.delete(key);
            }
        }
    }

    event.waitUntil(deleteOldCaches());
});

// Listen to fetch events
sw.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    async function respond() {
        const url = new URL(event.request.url);
        const cache = await caches.open(CACHE);

        // serve build files from the cache
        if (ASSETS.includes(url.pathname)) {

            const cachedResponse = await cache.match(url.pathname);
            if (cachedResponse) {
                return cachedResponse;
            }
        }

        // try the network first
        try {
            const response = await fetch(event.request);

            const isNotExtension = url.protocol.startsWith('http');
            const isSuccess = response.status === 200;

            if (isNotExtension && isSuccess) {
                cache.put(event.request, response.clone());
            }

            return response;
        } catch {
            // fall back to cache
            const cachedResponse = await cache.match(url.pathname);
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




