<script lang="ts">

    /**
     * ClickHandler expects a function which returns a promise.
     * While waiting for the promise to resolve a loader is shown on the button.
     * @param evt
     */
    export let onClick = async function (evt): Promise<void> {
        return;
    }


    // internal component state
    let isLoading = false;

    async function onClickWrap(evt) {
        if (typeof onClick !== 'function') {
            console.warn("clickHandler should be a function")
        }
        isLoading = true;
        await onClick(evt);
        isLoading = false;
    }
</script>


<button class="btn btn-primary align-middle" class:disabled={isLoading} on:click={onClickWrap}>
    <slot>Button Name Slot</slot>
    {#if isLoading}
        <div class="spinner-border spinner-border-sm" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    {/if}
</button>