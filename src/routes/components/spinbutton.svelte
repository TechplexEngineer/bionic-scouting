<script lang="ts">
    import SpinButton from "$lib/compontents/SpinButton.svelte";

    async function onClick() {
        return new Promise<void>((resolve, reject) => {
            setTimeout(resolve, 2000);
        })
    }
</script>

<SpinButton {onClick}>Name</SpinButton>