<!-- Script ---------------------------------------------------------------- -->
<script lang="ts">
    import { goto } from "$app/navigation";

    let loggedIn = false
    if (!loggedIn) {
        goto('/app/login', { replaceState: true })
    }
</script>

<!-- HTML ------------------------------------------------------------------ -->
<h1>App</h1>
<a href="/">Home</a>

<!-- ----------------------------------------------------------------------- -->