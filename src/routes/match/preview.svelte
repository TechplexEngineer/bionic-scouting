<svelte:head>
    <title>Match Preview</title>
</svelte:head>

<script context="module">
    // Disable server side rendering for this page
    export const ssr = false;
</script>


<script lang="ts">
    import {Column, Table} from "sveltestrap";

    import MatchPicker from './_matchPicker.svelte';
    import {writable} from "svelte/store";
    import {onMount} from "svelte";
    import type {MyDatabase} from "$lib/store";
    import {getDb} from "$lib/store";
    import {Settings} from "$lib/schema/settings-schema";
    import type {RxDocument} from "rxdb";
    import type {Match} from "$lib/schema/match-schema";
    import Swal from "sweetalert2";
    import "sweetalert2/dist/sweetalert2.css";
    import {goto} from '$app/navigation';
    import {matchSort} from "$lib/matches";
    import {capitalizeFirst, getCurrentEvent, getOurTeamNumber} from "$lib/util";

    let matchNumber: writable<null | number> = writable(null); // starts at null so the set(1) triggers update
    let match: RxDocument<Match>;
    let db: MyDatabase;
    let eventKey: string; //2020week0
    let matches: RxDocument<Match>[] = [];
    let ourTeamNumber: number; //eg 4909
    onMount(async () => {
        db = await getDb();

        eventKey = await getCurrentEvent(db);
        ourTeamNumber = await getOurTeamNumber(db);

        matches = await db.matches.find({
            selector: {eventKey: eventKey}
        }).exec();


        matches.sort(matchSort)
        // feels like we should be able to query for just the matches we are in but it isn't working
        // await db.matches.find().where({
        //     "alliances.red.teamKeys": "frc4909"
        // }).exec()

        // filter to our matches
        matches = matches.filter(m => {
            return m.alliances.red.teamKeys.includes(`frc${ourTeamNumber}`) || m.alliances.blue.teamKeys.includes(`frc${ourTeamNumber}`)
        })

        if (matches.length == 0) {
            Swal.fire({
                icon: "error",
                title: `Team ${ourTeamNumber} Not Found`,
                html: `FRC ${ourTeamNumber} was not found in any matches.`,
                showConfirmButton: false
            });
        }

        let num = localStorage.getItem("matchPreview_curNum");
        num = parseInt(num)
        if (typeof num !== "number" || isNaN(num)) {
            num = 1;
        }
        console.log("Here?", num);
        matchNumber.set(num); //trigger update
    });

    matchNumber.subscribe(n => {
        if (!n) {
            return
        }
        match = matches[n - 1]
        if (n && n != 1) {
            localStorage.setItem("matchPreview_curNum", n)
        }
    });

</script>


<div class="container-fluid">
    <h1>Match Preview</h1>

    <MatchPicker {matchNumber} numberOfMatches={matches.length} matchKey={match && match.matchKey || ""}/>
</div>

{#if match}
    {#each ['red', 'blue'] as color}
        <Table striped>
            <thead>
            <tr class="{color}bg">
                <th class="text-{color}">{capitalizeFirst(color)}</th>
                <th>Drivebase</th>
                <th>Play Def?</th>
                <th>Score Loc?</th>
                <th>Handle Def?</th>
            </tr>
            </thead>
            <tbody>
            {#each match.alliances[color].teamKeys as team}
                <tr class="{color}bg">

                    <th scope="row" class:our-team={ourTeamNumber==team.replace('frc', '')}>
                        <a href="/team/{team.replace('frc','')}">{team.replace('frc', '')}</a>
                    </th>
                    <td>a</td>
                    <td>b</td>
                    <td>c</td>
                    <td>d</td>
                </tr>
            {/each}
            </tbody>
        </Table>
    {/each}
{/if}

<style>
    a {
        text-decoration: none;
        border-bottom: 2px solid;
    }

    a:hover {
        border-bottom: 5px solid;
    }

    .redbg a {
        color: var(--bs-danger);
    }

    .redbg .our-team a {
        color: var(--bs-dark);
    }

    .text-red {
        color: var(--bs-danger);
    }

    .text-blue {
        color: var(--bs-primary);
    }

    .bluebg {
        background-color: rgb(201, 218, 248)
    }

    .bluebg .our-team {
        background-color: rgb(109, 158, 235) !important;
    }

    .redbg {
        background-color: rgb(244, 204, 204)
    }

    .redbg .our-team {
        background-color: rgb(224, 102, 102) !important;
    }
</style>
