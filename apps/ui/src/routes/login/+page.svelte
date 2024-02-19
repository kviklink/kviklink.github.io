<!-- Script ---------------------------------------------------------------- -->
<script lang="ts">
    import * as Tabs from '$lib/components/ui/tabs';
    import * as Card from '$lib/components/ui/card';
    import {Input} from '$lib/components/ui/input'
    import {Label} from '$lib/components/ui/label'
    import Button from '$lib/components/ui/button/button.svelte';
    import { Separator } from '$lib/components/ui/separator'
    import { ModeToggle } from '$lib/components/custom/mode-toggle';
    import { GithubLogo } from 'radix-icons-svelte';
    import { RaindropBackendBuilder, XbsBackendBuilder } from '$lib/backends'
    import backend from '$lib/state/backend.svelte'
    import credentials from '$lib/state/credentials.svelte'
    import { goto } from '$app/navigation'
    import { CheckCircled } from 'radix-icons-svelte'

    let xbsSyncId = $state('')
    let xbsPassword = $state('')
    let rdToken = $state('')

    async function xbsSubmit() {
        // Login
        const xbsBackend = await XbsBackendBuilder.login({
            syncId: xbsSyncId,
            password: xbsPassword
        })
        if (xbsBackend.err) { alert('login failed'); return }

        // Write backend to state
        backend.set(xbsBackend.val)

        // Write credentials to state
        credentials.set({
            backend: 'xbs',
            credentials: xbsBackend.val.getCredentials()
        })

        goto('/app')
    }

    async function raindropSubmit() {
        // Login
        const rdBackend = await RaindropBackendBuilder.login({
            token: rdToken
        })

        if (rdBackend.err) { alert('login failed'); return }

        // Write backend to state
        backend.set(rdBackend.val)

        // Write credentials to state
        credentials.set({
            backend: 'raindrop',
            credentials: rdBackend.val.getCredentials()
        })

        goto('/app')
    }

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
        <Button variant="ghost" href="/app">App</Button>
    </div>

    <!-- Right aligned -->
    <div class="flex items-center space-x-4">
        <!-- <Button variant="default" href="/login">Login</Button> -->
        <Button variant='outline' size='icon' href='https://github.com/kviklink/kviklink.github.io' target='_blank'>
            <GithubLogo class="scale-150"/>
        </Button>
        <ModeToggle />
    </div>
</div>

<!-- Spacer -->
<div class="w-full h-16"/>


<div class="
    w-full
    p-16
    flex flex-col items-center justify-center
">
    <!-- Still logged in -->
    {#if credentials.data.some}
    <div class="w-[500px] mb-8">
        <Card.Root class="">
            <Card.Header class="p-3 flex flex-row justify-between">
                <div class="flex flex-row items-center space-x-4">
                    <CheckCircled class="ml-2 w-6 h-6 text-green-600"/>
                    <span class="">You're still logged in.</span>
                </div>
                <Button variant='secondary' href="/app" class="!mt-0">Go to App</Button>
            </Card.Header>
        </Card.Root>
    </div>
    {/if}


    <Tabs.Root value="xbs" class="w-[500px]">
        <Tabs.List class="grid w-full grid-cols-2">
          <Tabs.Trigger value="xbs">xBrowserSync</Tabs.Trigger>
          <Tabs.Trigger value="raindrop">Raindrop.io</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="xbs">
          <Card.Root>
            <Card.Header>
                <Card.Title>Login with xBrowserSync</Card.Title>
                <Card.Description>
                    Use <span class="italic">[kvɪk] link</span> with your
                    bookmarks stored in xBrowserSync.
                </Card.Description>
            </Card.Header>
            <Separator/>
            <Card.Content class="p-6">
                <!-- sync id input -->
                <div class="grid w-full items-center gap-1.5 pb-4">
                    <Label for='xbs-sid' class="">xBrowserSync Sync ID</Label>
                    <Input id='xbs-sid' type='text' class="font-mono" placeholder='xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' bind:value={xbsSyncId} />
                    <p class="text-sm text-muted-foreground">Enter your sync id.</p>
                </div>

                <!-- password input -->
                <div class="grid w-full items-center gap-1.5 pt-4">
                    <Label for='xbs-pw' class="">Password</Label>
                    <Input id='xbs-pw' type='password' class="font-mono" placeholder='••••••••••••••••' bind:value={xbsPassword}/>
                    <p class="text-sm text-muted-foreground">Enter your password.</p>
                </div>
            </Card.Content>
            <Card.Footer class="flex justify-between items-center">
                <Button variant='outline' class="text-muted-foreground" href="https://www.xbrowsersync.org/" target='_blank'>Create xBrowserSync</Button>
                <Button variant='default' onclick={xbsSubmit}>Submit</Button>
            </Card.Footer>
          </Card.Root>
        </Tabs.Content>

        <Tabs.Content value="raindrop">
            <Card.Root>
                <Card.Header>
                    <Card.Title>Login with Raindrop.io</Card.Title>
                    <Card.Description>
                        Use <span class="italic">[kvɪk] link</span> with your
                        bookmarks stored in Raindrop.io.
                    </Card.Description>
                </Card.Header>
                <Separator/>
                <Card.Content class="p-6">
                    <!-- password input -->
                    <div class="grid w-full items-center gap-1.5 pb-4">
                        <Label for='rd-token' class="">Token</Label>
                        <Input id='rd-token' type='password' class="font-mono" placeholder='••••••••••••••••' bind:value={rdToken}/>
                        <p class="text-sm text-muted-foreground">Enter the "Test Token" from your Raindrop.io settings.</p>
                    </div>
                </Card.Content>
                <Card.Footer class="flex justify-between items-center">
                    <Button variant='outline' disabled class="text-muted-foreground">Create Raindrop Account</Button>
                    <Button variant='default' onclick={raindropSubmit}>Submit</Button>
                </Card.Footer>
              </Card.Root>
        </Tabs.Content>
      </Tabs.Root>
</div>



<!-- ----------------------------------------------------------------------- -->
