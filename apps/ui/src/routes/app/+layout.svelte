<!-- Script ---------------------------------------------------------------- -->
<script lang="ts">
    import ModeToggle from '$lib/components/custom/mode-toggle/mode-toggle.svelte';
    import { Button } from '$lib/components/ui/button'
    import * as Command from '$lib/components/ui/command';
    import { Pencil1, Gear } from 'radix-icons-svelte';
    import { goto } from "$app/navigation";
    import backend from '$lib/state/backend.svelte'
    import credentials from '$lib/state/credentials.svelte'
    import { RaindropBackendBuilder, XbsBackendBuilder } from '$lib/backends';

    async function check(): Promise<boolean> {
        // If backend set -> continue with it
        if (backend.data.some) { return true }

        // If backend not set, but credentials are loaded -> try to authenticate
        if (credentials.data.some) {
            if (credentials.data.val.backend === 'xbs') {
                // Re-authenticate
                const xbsBackend = await XbsBackendBuilder
                    .auth(credentials.data.val.credentials)

                if (xbsBackend.err) { return false }

                // Write backend to state
                backend.set(xbsBackend.val)

                return true
            } else if (credentials.data.val.backend === 'raindrop') {
                // Re-authenticate
                const rdBackend = await RaindropBackendBuilder
                    .auth(credentials.data.val.credentials)

                if (rdBackend.err) { return false }

                // Write backend to state
                backend.set(rdBackend.val)

                return true
            }
        }

        return false
    }

    function gotoLogin() {
        goto('/login', { replaceState: true })
    }

    // On mount
    $effect(() => {
        check().then(success => {
            if (!success) { gotoLogin(); return }

            // backend.data.unwrap().get().then(data => console.log(data.unwrap()))
        })
    })
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
    <div class="w-auth h-16 absolute left-1/2 -translate-x-1/2 flex space-x-4">
        <div class="w-full flex justify-center py-3">
            <Command.Root class="rounded-lg border w-[500px] h-10 focus-within:h-auto focus-within:absolute" loop>
                <Command.Input placeholder="Type a command or search..." />
                <Command.List>
                    <Command.Empty>No results found.</Command.Empty>
                    <Command.Group heading="Suggestions">
                        <Command.Item>
                            <div class="w-full flex justify-between items-center">
                                <span>Calendar</span>
                            </div>
                        </Command.Item>
                        <Command.Item>Calculator</Command.Item>
                    </Command.Group>
                    <Command.Separator />
                    <Command.Group heading="Settings">
                        <Command.Item>Profile</Command.Item>
                        <Command.Item>Billing</Command.Item>
                        <Command.Item>Settings</Command.Item>
                    </Command.Group>
                </Command.List>
            </Command.Root>
        </div>
    </div>

    <!-- Right aligned -->
    <div class="flex items-center space-x-4">
        <!-- <Button variant="default" href="/login">Login</Button> -->
        <Button variant='outline' size='icon'>
            <Pencil1 class="h-[1.2rem] w-[1.2rem]" />
        </Button>
        <Button variant='outline' size='icon'>
            <Gear class="h-[1.2rem] w-[1.2rem]"/>
        </Button>
        <ModeToggle />
    </div>
</div>

<!-- Spacer -->
<div class="w-full h-16"/>
<slot />

<!-- ----------------------------------------------------------------------- -->
