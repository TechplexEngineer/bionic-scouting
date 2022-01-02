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

    import matchObjectiveSchema, {MatchMetricsReport} from '$lib/schema/match-metrics-schema'
    import Select from "svelte-select";
    import Counter from "$lib/compontents/Counter.svelte";
    import BtnGroup from "$lib/compontents/BtnGroup.svelte";
    import Boolean from "$lib/compontents/Boolean.svelte";

    let activeTab = 0; // start on first tab


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
        // remove tab name(eg. 'pre' or 'auto') prefix if it exists
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

    import MatchPicker from '../_matchPicker.svelte';
    import {writable} from "svelte/store";
    import {onMount} from "svelte";
    import {getDb, MyDatabase} from "$lib/store";
    import Swal from "sweetalert2";
    import "sweetalert2/dist/sweetalert2.css";
    import {Settings} from "$lib/schema/settings-schema";
    import {goto} from "$app/navigation";
    import type {RxDocument} from "rxdb";
    import type {Match} from "$lib/schema/match-schema";
    import {matchSort} from "$lib/matches";
    import {adapterName} from "$lib/bluetooth";

    let matchNumber: writable<number | null> = writable(null);

    let eventKey: string; //2020week0
    let matches: RxDocument<Match>[] = [];
    let db: MyDatabase;
    onMount(async () => {
        db = await getDb();

        const settingEvent = await db.settings.findOne({selector: {key: Settings.CurrentEvent}}).exec();
        if (!settingEvent) {
            let res = await Swal.fire({
                icon: "error",
                title: "Oops...",
                html: `Current event not set. Head over to Setup`,
                showCloseButton: true,
                confirmButtonText: 'Go to Setup',
            });
            if (res.isConfirmed) {
                await goto("/tools/setup");
                return;
            }
        }
        eventKey = settingEvent.value;
        matches = await db.matches.find({
            selector: {eventKey: eventKey}
        }).exec();
        matches.sort(matchSort)
        matchNumber.set(1); //trigger update
    })

    let match: RxDocument<Match>;
    let matchMetrics: RxDocument<MatchMetricsReport>;
    let teamNumber;
    matchNumber.subscribe(async (n) => {
        if (n == null) {
            return; //nothing to do
        }
        match = matches[n - 1]

        let [color, number] = $adapterName.split('-')
        color = color.toLowerCase()
        // console.log("color number", color, number);

        teamNumber = match.alliances[color].teamKeys[number - 1].replace('frc', '')

        matchMetrics = await db.match_metrics.findOne({
            selector: {
                eventKey: eventKey,
                matchKey: match.matchKey,
                teamNumber: parseInt(teamNumber),
            }
        }).exec();
        // console.log("matchMetrics", eventKey, match.matchKey, teamNumber, matchMetrics);

    });

    import InputControl from './_inputControl.svelte';

</script>


<div class="content">
    <div class="row">
        <div class="col">
            <h3 class="fs-5 text-muted">S: {matchMetrics && matchMetrics.scoutName || "Unassigned"}</h3>
        </div>
        <div class="col">
            <h3 class="fs-5 text-muted text-center">{$adapterName} &mdash; {teamNumber}</h3>
        </div>
        <div class="col">
            <h3 class="fs-5 text-muted text-end">M: {match && match.matchKey}</h3>
        </div>
    </div>

    <MatchPicker {matchNumber} numberOfMatches={matches.length} matchKey={match && match.matchKey}/>

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
                                <InputControl
                                        {eventKey}
                                        matchKey={match && match.matchKey}
                                        teamNumber={teamNumber}
                                        propertyName={d.key}
                                        def={d}
                                />

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
