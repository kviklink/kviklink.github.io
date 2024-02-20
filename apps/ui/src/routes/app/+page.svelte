<!-- Script ---------------------------------------------------------------- -->
<script lang="ts">
    import * as Command from '$lib/components/ui/command';
    import { createState } from 'cmdk-sv'
    import { Button } from '$lib/components/ui/button';
    import backend from '$lib/state/backend.svelte';
    import credentials from '$lib/state/credentials.svelte';
    import { XbsBackendBuilder, type IBookmark, RaindropBackendBuilder } from '$lib/backends';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import Fuse from 'fuse.js';

    let input = $state('')
    let bookmarks: IBookmark[] = $state([])

    let fuse = $derived(new Fuse(bookmarks, {
        keys: ['title', 'description', 'metadata.hostname']
    }))

    $effect(() => {
        fuse;
        console.log("fuse created")
    })

    let searchResults: IBookmark[] = $derived(
        fuse.search(input).slice(0, 6).map(x => x.item)
    )

    $effect(() => {
        searchResults;
        console.log("search results updated")
    })

    // TODO: vllt nicht im backen alle pages batchen sondern das hier
    // alles page für page machen, pro page den state updaten und durch den
    // effect/derive werden dann die Suchergebnisse kontinuierlich geupdated?

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

    onMount(() => {
        console.log("[ON MOUNT] -----------------------------------------")
        check().then(success => {
            if (!success) { gotoLogin(); return }

            // Fetch data
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

<div class="w-full mt-16 flex justify-center">
<Command.Root class="w-[600px] border rounded-lg" loop shouldFilter={false} onkeydown={(e: KeyboardEvent) => {
    // if (e.shiftKey === true && e.key === 'J') {
    //     e.preventDefault()
    //     console.log('move down')
    // }

    // if (e.shiftKey === true && e.key === 'K') {
    //     e.preventDefault()
    //     console.log('move up')
    // }
}}>
    <Command.Input placeholder="Type a command or search..." bind:value={input} />
    <Command.List>

        <Command.Group heading="Bookmarks" alwaysRender>
            {#each searchResults as b}
                <Command.Item class="flex space-x-2" onSelect={() => {
                    window.open(b.url, '_blank')
                }}>
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
            <Command.Item alwaysRender class="flex space-x-2" onSelect={() => {
                window.open(`https://duckduckgo.com/?q=${input}`)
            }}>
                <img
                    class="w-5 h-5 rounded-sm"
                    src="https://icon.horse/icon/duckduckgo.org"
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
