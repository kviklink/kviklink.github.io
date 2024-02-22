<!-- Script ---------------------------------------------------------------- -->
<script lang="ts">
    import '../app.pcss';
    import Button from "$lib/components/ui/button/button.svelte";
    import ModeToggle from "$lib/components/custom/mode-toggle/mode-toggle.svelte";
    import { ModeWatcher } from 'mode-watcher';

    async function detectServiceWorkerUpdate() {
        const registration = await navigator.serviceWorker.ready;
        registration.addEventListener('updatefound', () => {
            const newSw = registration.installing;
            newSw?.addEventListener('statechange', async () => {
                if (newSw.state === 'installed') {
                    // console.log('[sw] update available')
                    // if (confirm('Update verfügbar. Bitte neu laden!')) {
                    //     newSw.postMessage({ type: 'skipWaiting' });
                    //     window.location.reload();
                    // }

                }
            });
        });
    }

    detectServiceWorkerUpdate();

</script>

<!-- HTML ------------------------------------------------------------------ -->
<!-- Head -->
<svelte:head>
    <title>[kvɪk] link</title>
</svelte:head>

<!-- Light/Dark Mode -->
<ModeWatcher/>

<!-- Content -->
<slot/>


<!-- ----------------------------------------------------------------------- -->
