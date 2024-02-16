<!-- Script ---------------------------------------------------------------- -->
<script lang="ts">
    import * as Tabs from '$lib/components/ui/tabs';
    import * as Card from '$lib/components/ui/card';
    import {Input} from '$lib/components/ui/input'
    import {Label} from '$lib/components/ui/label'
    import Button from '$lib/components/ui/button/button.svelte';
    import { Separator } from '$lib/components/ui/separator'
    import { ModeToggle } from '$lib/components/custom/mode-toggle';
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
        <Button variant="default" href="/login">Login</Button>
        <ModeToggle />
    </div>
</div>

<!-- Spacer -->
<div class="w-full h-16"/>

<div class="
    w-full
    p-16
    flex justify-center
">

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
                    <Input id='xbs-sid' type='text' class="font-mono" placeholder='xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' />
                    <p class="text-sm text-muted-foreground">Enter your sync id.</p>
                </div>

                <!-- password input -->
                <div class="grid w-full items-center gap-1.5 pt-4">
                    <Label for='xbs-pw' class="">Password</Label>
                    <Input id='xbs-pw' type='password' class="font-mono" placeholder='••••••••••••••••' />
                    <p class="text-sm text-muted-foreground">Enter your password.</p>
                </div>
            </Card.Content>
            <Card.Footer class="flex justify-between items-center">
                <Button variant='outline' class="text-muted-foreground" href="https://www.xbrowsersync.org/" target='_blank'>Create xBrowserSync</Button>
                <Button variant='default'>Submit</Button>
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
                    <p class="text-muted-foreground">Raindrop.io integration <span class="italic">coming soon!</span></p>
                </Card.Content>
                <Card.Footer class="flex justify-between items-center">
                    <Button variant='outline' disabled class="text-muted-foreground">Create Raindrop Account</Button>
                    <Button variant='default' disabled >Submit</Button>
                </Card.Footer>
              </Card.Root>
        </Tabs.Content>
      </Tabs.Root>
</div>



<!-- ----------------------------------------------------------------------- -->
