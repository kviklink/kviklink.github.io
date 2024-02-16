<!-- Script ---------------------------------------------------------------- -->
<script lang="ts">
    import '../app.pcss';
    import Button from "$lib/components/ui/button/button.svelte";
    import ModeToggle from "$lib/components/custom/mode-toggle/mode-toggle.svelte";
    import { ModeWatcher } from 'mode-watcher';
</script>

<!-- HTML ------------------------------------------------------------------ -->
<!-- Head -->
<svelte:head>
    <title>[kvɪk] link</title>
</svelte:head>

<!-- Light/Dark Mode -->
<ModeWatcher/>

<!-- Content -->
<slot />


<!-- ----------------------------------------------------------------------- -->
