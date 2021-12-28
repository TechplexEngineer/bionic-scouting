<script lang="ts">
    import {writable} from 'svelte/store';

    /**
     * The name of the input group
     */
    export let name: string;

    /**
     * Button options
     */
    export let options: { label: string }[] = [];

    /**
     * The currently active button
     */
    export let activeIdx = writable(-1);

</script>

<div class="btn-group" role="group">
    {#each options as option, idx}
        <input type="radio" class="btn-check" name={name} id="{name}{idx}" autocomplete="off"
               checked={$activeIdx === idx} on:click={()=>{activeIdx.set(idx)}}>
        <label class="btn btn-outline-primary p-3" for="{name}{idx}">{option.label}</label>
    {/each}
</div>