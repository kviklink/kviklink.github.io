<!-- Script ---------------------------------------------------------------- -->
<script lang="ts">
    import * as Command from '$lib/components/ui/command';
    import { Button } from '$lib/components/ui/button';
    import backend from '$lib/state/backend.svelte';
    import credentials from '$lib/state/credentials.svelte';
    import { XbsBackendBuilder, type IBookmark, RaindropBackendBuilder } from '$lib/backends';
    import { goto } from '$app/navigation';

    let input = $state('')
    let bookmarks: IBookmark[] = $state([])

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
        console.log("[EFFECT RUN] -----------------------------------------")
        check().then(success => {
            if (!success) { gotoLogin(); return }
            backend.data.unwrap().get().then(data => {
                if (data.err) {
                    console.log("error while fetching bookmarks:", data.val)
                    return
                }
                // Update state
                bookmarks = data.val

                // Log
                console.log(`fetched ${data.val.length} bookmarks`)
            })
        })
    })

</script>

<!-- HTML ------------------------------------------------------------------ -->

    <img
        class="w-5 h-5"
        src="https://icon.horse/icon/discord.com"
        alt="icon"
    />


<div class="w-full mt-16 flex justify-center">
<Command.Root class="w-[600px] border rounded-lg" shouldFilter={false}>
    <Command.Input placeholder="Type a command or search..." bind:value={input} />
    <Command.List>

        <Command.Group heading="Bookmarks" alwaysRender>
            {#each bookmarks as b}
                <Command.Item class="flex space-x-2">
                    <img
                        class="w-5 h-5 rounded-sm"
                        src="https://icon.horse/icon/{b.metadata.hostname}"
                        alt="icon"
                    />
                    <span>
                        {b.title.slice(0, 60)}
                    </span>
                </Command.Item>
            {/each}
            <Command.Empty>No results found.</Command.Empty>
        </Command.Group>
        <Command.Separator />
        <Command.Group heading="Web Search" alwaysRender>
            <Command.Item alwaysRender class="flex space-x-2">
                <img
                    class="w-5 h-5"
                    src="https://icon.horse/icon/google.com"
                    alt="icon"
                />

                {#if !input}
                    <span class="text-muted-foreground text-xs">
                        with DuckDuckGo
                    </span>
                {:else}
                    <span>{input}</span>
                {/if}
            </Command.Item>
        </Command.Group>
    </Command.List>
</Command.Root>
</div>

<!-- ----------------------------------------------------------------------- -->
