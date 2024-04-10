/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
const sw = self as unknown as ServiceWorkerGlobalScope

// Imports /////////////////////////////////////////////////////////////////////
import { build, files, version } from '$service-worker';

// Constants ///////////////////////////////////////////////////////////////////
const ASSETS = [...build, ...files]

const APP_CACHE_PREFIX = 'app-cache' as const
const APP_CACHE = `${APP_CACHE_PREFIX}-${version}`

const IMG_CACHE = 'img-cache'

const SW_CSS = `
    background: royalblue;
    color: white;
    font-weight: bold;
    padding: 2px 4px;
    border-radius: 2px;
    margin-right: 4px;
`;

const INSTALL_CSS = `
    color: violet;
    font-weight:bold;
    margin-right: 4px;
`;

const ACTIVATE_CSS = `
    color: lightgreen;
    font-weight:bold;
    margin-right: 4px;
`;

const FETCH_CSS = `
    color: orange;
    font-weight:bold;
    margin-right: 4px;
`;

const DIVIDER_CSS = `
    font-weight: bold;
    padding: 2px 4px;
    margin-right: 2px;
`;

const CACHE_CSS = `
    background: grey;
    color: white;
    font-weight: bold;
    padding: 2px 4px;
    border-radius: 2px;
    margin-right: 6px;
`;

const CACHE_HIT_CSS = `
    color: lightgreen;
    font-weight: bold;
`;

const CACHE_MISS_CSS = `
    color: orangered;
    font-weight: bold;
    margin-right: 4px;
`;

const CACHE_WRITE_CSS = `
    color: gold;
    font-weight: bold;
    margin-right: 4px;
`;

////////////////////////////////////////////////////////////////////////////////

// Install service worker
sw.addEventListener('install', (event) => {
    console.log(
        '%cSW' + '%cINSTALL' + `%cVersion: ${version}`,
        SW_CSS, INSTALL_CSS, ''
    )

    async function addFilesToCache() {
        // Pre-cache assets
        const appCache = await caches.open(APP_CACHE);
        await appCache.addAll(ASSETS);
    }

    event.waitUntil(addFilesToCache());
});

// Activeate service worker
sw.addEventListener('activate', (event) => {
    console.log(
        '%cSW' + '%cACTIVATE' + `%cVersion: ${version}`,
        SW_CSS, ACTIVATE_CSS, ''
    )

    async function deleteOldCaches() {
        // App caches
        const oldAppCaches = (await caches.keys())
            .filter(k => k.startsWith(APP_CACHE_PREFIX) && k !== APP_CACHE)

        await Promise.all(oldAppCaches.map(k => caches.delete(k)))
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
            const cachedResponse = await appCache.match(event.request);
            if (cachedResponse) {
                // Log cache hit
                console.log(
                    '%cSW' + '%cFETCH' + '%c▶' + '%cAPP CACHE' + '%cHIT',
                    SW_CSS, FETCH_CSS, DIVIDER_CSS, CACHE_CSS, CACHE_HIT_CSS,
                )

                // Return cache content
                return cachedResponse;

            } else {
                // Log cache miss
                console.log(
                    '%cSW' + '%cFETCH' + '%c▶' + '%cAPP CACHE' + '%cMISS'
                        + event.request.url,
                    SW_CSS, FETCH_CSS, DIVIDER_CSS, CACHE_CSS, CACHE_MISS_CSS,
                )

                const response = await fetch(event.request)

                const trust = url.protocol.startsWith('https')
                    || url.hostname === 'localhost'
                const ok = response.status === 200
                if (trust && ok) {
                    // Log cache write
                    console.log(
                        '%cSW' + '%cFETCH' + '%c▶' + '%cAPP CACHE' + '%cWRITE'
                            + event.request.url,
                        SW_CSS, FETCH_CSS, DIVIDER_CSS, CACHE_CSS,
                        CACHE_WRITE_CSS,
                    )

                    appCache.put(event.request, response.clone())
                }

                return response
            }
        }

        // Image Caching ///////////////////////////////////////////////////////
        // Get image cache
        const imgCache = await caches.open(IMG_CACHE)

        // if (event.request.headers.get('Accept')?.includes('image/')) {
        if (url.hostname === 'icon.horse') {
            const cachedResponse = await imgCache.match(event.request)
            if (cachedResponse) {
                // Log cache hit
                console.log(
                    '%cSW' + '%cFETCH' + '%c▶' + '%cIMG CACHE' + '%cHIT',
                    SW_CSS, FETCH_CSS, DIVIDER_CSS, CACHE_CSS, CACHE_HIT_CSS,
                )

                return cachedResponse

            } else {
                // Log cache miss
                console.log(
                    '%cSW' + '%cFETCH' + '%c▶' + '%cIMG CACHE' + '%cMISS'
                        + event.request.url,
                    SW_CSS, FETCH_CSS, DIVIDER_CSS, CACHE_CSS, CACHE_MISS_CSS,
                )

                // Execute fetch request
                const response = await fetch(event.request)

                // Log cache write
                console.log(
                    '%cSW' + '%cFETCH' + '%c▶' + '%cIMG CACHE' + '%cWRITE'
                        + event.request.url,
                    SW_CSS, FETCH_CSS, DIVIDER_CSS, CACHE_CSS,
                    CACHE_WRITE_CSS,
                )

                await imgCache.put(event.request, response.clone())

                // Return response
                return response
            }
        }

        // Fallback (default): send out the request
        console.log(`Fallback: executing request to "${event.request.url}"`)
        return fetch(event.request)
    }

    event.respondWith(respond());
});

sw.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'skipWaiting') {
        sw.skipWaiting();
    }
});

////////////////////////////////////////////////////////////////////////////////




