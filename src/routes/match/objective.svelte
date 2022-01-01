<svelte:head>
    <title>Match Objective</title>
</svelte:head>

<script context="module">
    // Disable server side rendering for this page
    export const ssr = false;
</script>

<script lang="ts">
    import {
        Nav,
        NavItem,
        NavLink
    } from "sveltestrap";

    import matchObjectiveSchema from '$lib/schema/match-metrics-schema'
    import Select from "svelte-select";
    import Counter from "$lib/compontents/Counter.svelte";
    import BtnGroup from "$lib/compontents/BtnGroup.svelte";
    import Boolean from "$lib/compontents/Boolean.svelte";

    let activeTab = 0; // start on first tab
    let currentScout = "John Q.";// @todo
    let currentMatch = "QM0";
    let currentPos = "Red1";

    const tabs: Record<string, { key: string }[]> = {};
    const props = matchObjectiveSchema.properties;
    for (const propKey in props) {
        const prop = props[propKey];

        // ignore properties that do not have an assigned tab
        if (!(prop.metadata && prop.metadata.tab)) {
            // console.log('Ignoring', propKey, prop);
            continue;
        }

        if (tabs[prop.metadata.tab] == undefined) {
            tabs[prop.metadata.tab] = [];
        }
        tabs[prop.metadata.tab].push({
            key: propKey,
            ...prop
        })
    }


    function makeNiceName(tabName: string, propKey: string) {
        let name = propKey;
        // remove tab name prefix if it exists
        if (name.toLowerCase().startsWith(tabName.toLowerCase())) {
            name = name.substring(tabName.length)
        }
        // split on capital letters, join with spaces
        name = name.match(/[A-Z][a-z]+/g).join(' ')
        return name
    }

    function notHidden(d) {
        return !d.metadata.hidden
    }

</script>


<div class="content">
    <div class="row">
        <div class="col">
            <h3 class="fs-5 text-muted">S: {currentScout}</h3>
        </div>
        <div class="col">
            <h3 class="fs-5 text-muted text-center">{currentPos}</h3>
        </div>
        <div class="col">
            <h3 class="fs-5 text-muted text-end">M: {currentMatch}</h3>
        </div>
    </div>


    <Nav tabs class="mb-2">
        {#each Object.keys(tabs) as tabName, index}
            <NavItem class="flex-grow-1 px-1">
                <NavLink class="text-center" active={activeTab===index}
                         on:click={()=>{activeTab=index}}>{tabName}</NavLink>
            </NavItem>
        {/each}
    </Nav>

    {#each Object.keys(tabs) as tabName, index}
        <div class:d-none={activeTab!==index}>

            <div class="row">
                {#each tabs[tabName].filter(notHidden) as d}
                    <div class="col col-6 mb-2">
                        <div class="card {d.metadata.cardClasses}">
                            <div class="card-body">
                                <!--{JSON.stringify(d)}-->
                                <h5 class="card-title">{d.metadata.label || makeNiceName(tabName, d.key)}</h5>
                                {#if d.enum && d.type === 'string'}
                                    {#if d.metadata.control === 'buttons'}
                                        <BtnGroup name="first" options={d.enum.map(i=>({label:i}))}/>
                                    {:else}
                                        <Select items={d.enum.map((i)=>({label:i, value:i}))}/>
                                    {/if}
                                {:else if d.type === 'boolean'}
                                    {#if d.metadata.control === 'checkbox'}
                                        <input type="checkbox" class="form-check-input form-control"
                                               placeholder="{d.metadata.placeholder}">
                                    {:else}
                                        <Boolean label={d.metadata.labelNotSelected || 'False'}
                                                 labelSelected={d.metadata.labelSelected || 'True'}/>
                                    {/if}
                                {:else if d.type === 'number'}
                                    <Counter min={d.minimum} max={d.maximum}/>
                                {:else}
                                    <input type={(d.type === 'number')?'number':'text'} class="form-control"
                                           placeholder="{d.metadata.placeholder}">
                                {/if}

                            </div>
                        </div>
                    </div>
                {/each}
            </div>

            <div class="d-flex mt-2">
                {#if activeTab > 0}
                    <button class="btn btn-primary" on:click={()=>{activeTab -= 1}}>&lt;
                        Prev
                    </button>
                {/if}
                {#if activeTab < Object.keys(tabs).length - 1}
                    <button class="btn btn-primary ms-auto" on:click={()=>{activeTab += 1}}>Next &gt;</button>
                {/if}
            </div>

        </div>
    {/each}

</div>

<style>
    :global(.nav-tabs) {
        filter: brightness(90%);
    }

    :global(.nav-tabs a.nav-link) {
        color: #0b4833;
        background-color: #ccc;
        border-color: #dee2e6 #dee2e6 #fff;
    }
</style>
