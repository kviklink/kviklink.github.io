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

<!-- Top Bar -->
<div class="
    w-full h-16 fixed
    pl-4 pr-4
    bg-white dark:bg-black
    bg-opacity-70 dark:bg-opacity-70
    hover:bg-opacity-100 hover:dark:bg-opacity-100
    transition duration-200
    shadow-sm
    backdrop-filter backdrop-blur-sm
    flex justify-between items-center
">
    <!-- Left aligned -->
    <div class="flex items-center space-x-2">
        <Button variant="ghost" href="/">Home</Button>
        <Button variant="ghost" href="/app">App</Button>
    </div>

    <!-- Right aligned -->
    <div class="flex items-center space-x-4">
        <Button variant="default" href="/login">Login</Button>
        <ModeToggle />
    </div>
</div>

<!-- Spacer -->
<div class="w-full h-16"/>

<!-- Content -->
<slot />


<!-- ----------------------------------------------------------------------- -->
