<script lang="ts">
    import BtnGroup from "$lib/compontents/BtnGroup.svelte";
    import Select from "svelte-select";
    import Boolean from "$lib/compontents/Boolean.svelte";
    import Counter from "$lib/compontents/Counter.svelte";
    import {onMount} from "svelte";
    import type {MyDatabase} from "$lib/store";
    import {getDb} from "$lib/store";


    export let def; //json schema property def
    export let eventKey;
    export let matchKey;
    export let teamNumber: number;
    export let propertyName: string;

    let db: MyDatabase;
    onMount(async () => {
        db = await getDb();

    })


</script>

{#if def.enum && def.type === 'string'}
    {#if def.metadata.control === 'buttons'}
        <BtnGroup name="first" options={def.enum.map(i=>({label:i}))}/>
    {:else}
        <Select items={def.enum.map((i)=>({label:i, value:i}))}/>
    {/if}
{:else if def.type === 'boolean'}
    {#if def.metadata.control === 'checkbox'}
        <input
                type="checkbox"
                class="form-check-input form-control"
                placeholder="{def.metadata.placeholder}">
    {:else}
        <Boolean label={def.metadata.labelNotSelected || 'False'}
                 labelSelected={def.metadata.labelSelected || 'True'}/>
    {/if}
{:else if def.type === 'number'}
    <Counter
            min={def.minimum}
            max={def.maximum}/>
{:else}
    <input
            type={(def.type === 'number')?'number':'text'}
            class="form-control"
            placeholder="{def.metadata.placeholder}">
{/if}