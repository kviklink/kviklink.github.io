<!-- Script ---------------------------------------------------------------- -->
<script lang="ts">
    import ModeToggle from '$lib/components/custom/mode-toggle/mode-toggle.svelte';
    import { Button } from '$lib/components/ui/button'

    import { goto } from "$app/navigation";

    // let loggedIn = false
    // if (!loggedIn) { goto('/login', { replaceState: true }) }
</script>

<!-- HTML ------------------------------------------------------------------ -->
<!-- Top Bar -->
<div class="
    w-full h-16 fixed
    pl-4 pr-4
    bg-white dark:bg-zinc-950
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
        <!-- <Button variant="ghost" href="/app">App</Button> -->
    </div>

    <!-- Middle -->
    <div class="w-auth h-16 absolute left-1/2 -translate-x-1/2 flex space-x-4 items-center">
        <span>Hallo</span>
        <span>Welt</span>
    </div>

    <!-- Right aligned -->
    <div class="flex items-center space-x-4">
        <!-- <Button variant="default" href="/login">Login</Button> -->
        <ModeToggle />
    </div>
</div>

<!-- Spacer -->
<div class="w-full h-16"/>
<slot />

<!-- ----------------------------------------------------------------------- -->
