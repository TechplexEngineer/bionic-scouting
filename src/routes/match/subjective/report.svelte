<svelte:head>
    <title>Match Subjective Report</title>
</svelte:head>

<script context="module">
    // Disable server side rendering for this page
    export const ssr = false;
</script>

<script lang="ts">
    import Select from "svelte-select";
    import {page} from "$app/stores";
    import {onMount} from "svelte";
    import {getDb, MyDatabase} from "$lib/store";
    import {Settings} from "$lib/schema/settings-schema";
    import Swal from "sweetalert2";
    import {goto} from "$app/navigation";
    import {matchSort} from "$lib/matches";
    import type {RxDocument} from "rxdb";
    import type {MatchSubjReport} from "$lib/schema/match-subj-schema";
    import type {Match} from "$lib/schema/match-schema";
    import {extractBlueTeamsFromMatch, extractRedTeamsFromMatch, formatDateTime} from "$lib/util";

    let matches: RxDocument<Match>[] = [];
    let matchSelections: { label: string, value: RxDocument<Match> }[] = [];
    let selectedPrepMatch: { label: string, value: RxDocument<Match> };

    let matchReports: RxDocument<MatchSubjReport>[] = [];

    const handleSelectMatch = async function (event) {
        let match: RxDocument<MatchSubjReport> = event.detail.value;
        // console.log("selected match", match);

        const query = {
            eventKey: eventKey,
            matchForKey: match.matchKey
        };

        matchReports = await db.match_subjective.find().where(query).exec();
        // console.log("reports", matchReports);
    }

    let db: MyDatabase;
    let eventKey = "";
    let ourTeamNumber = 0;

    onMount(async () => {
        db = await getDb();

        const settingEvent = await db.settings.findOne().where({key: Settings.CurrentEvent}).exec();
        if (!settingEvent) {
            let res = await Swal.fire({
                icon: "error",
                title: "Oops...",
                html: `Current event not set. Head over to Setup`,
                showCloseButton: true,
                confirmButtonText: "Go to Setup"
            });
            if (res.isConfirmed) {
                await goto("/tools/setup");
                return;
            }
        }
        eventKey = settingEvent.value;

        const entry = await db.settings.findOne({selector: {key: Settings.TeamNumber}}).exec();
        if (entry && entry.value) {
            ourTeamNumber = parseInt(entry.value);
        }

        matches = await db.matches.find().where({eventKey: eventKey}).exec();
        // console.log("Matches", matches);
        matches.sort(matchSort);

        matchSelections = matches.map(m => ({label: m.matchKey, value: m}));

        if ($page.query.get("for")) {
            for (let m of matchSelections) {
                if (m.label == $page.query.get("for")) {
                    selectedPrepMatch = m;
                    break;
                }
            }
        }
    });

    const OnlyOurAlliance = (value: RxDocument<MatchSubjReport>, index, self) => {
        if (!selectedPrepMatch) {
            return true
        } // can't filter if we don't have a selected match
        let match = selectedPrepMatch.value;
        let blueTeams = extractBlueTeamsFromMatch(match)
        let weAreBlue = blueTeams.includes(ourTeamNumber)
        return (weAreBlue && blueTeams.includes(value.teamNumber)) || (!weAreBlue && !blueTeams.includes(value.teamNumber))
    }
    const OnlyOpposingAlliance = (value: RxDocument<MatchSubjReport>, index, self) => {
        if (!selectedPrepMatch) {
            return true
        } // can't filter if we don't have a selected match
        let match = selectedPrepMatch.value;
        let blueTeams = extractBlueTeamsFromMatch(match)
        let weAreBlue = blueTeams.includes(ourTeamNumber)
        return (weAreBlue && !blueTeams.includes(value.teamNumber)) || (!weAreBlue && blueTeams.includes(value.teamNumber))
    }

    const weAreBlue = (match: RxDocument<Match>): boolean => {
        let blueTeams = extractBlueTeamsFromMatch(match)
        return blueTeams.includes(ourTeamNumber)
    }

    const getOurAllianceMembers = (match: RxDocument<Match>): number[] => {
        if (weAreBlue(match)) {
            return extractBlueTeamsFromMatch(match)
        }
        return extractRedTeamsFromMatch(match)
    }
    const getOpposingAllianceMembers = (match: RxDocument<Match>): number[] => {
        if (!weAreBlue(match)) {
            return extractBlueTeamsFromMatch(match)
        }
        return extractRedTeamsFromMatch(match)
    }

</script>

<div class="content">
    <div class="d-flex">
        <div class="flex-1">
            <a class="btn btn-info float-start" href="/">&lt; My Schedule</a>
        </div>
        <div class="flex-1 text-center text-nowrap">
            <h1>Report</h1>
        </div>
        <div class="flex-1 text-end">
            <label for="match">For Match:</label>
            <Select id="match" items={matchSelections} bind:value={selectedPrepMatch} on:select={handleSelectMatch}/>
        </div>
    </div>

    {#if selectedPrepMatch}
        <table class="table table-striped">
            <thead>
            <tr>
                <th>Match</th>
                <!--                <th>Date</th>-->
                <th colspan="3">Red Alliance</th>
                <th colspan="3">Blue Alliance</th>
            </tr>
            </thead>
            <tbody>
            {#each [selectedPrepMatch?.value] as m}
                <tr>
                    <td>
                        <a href="/match/{m.matchKey}">{m.matchKey.toUpperCase()}</a>
                    </td>

                    {#each ['red', 'blue'] as color}
                        {#each m.alliances[color].teamKeys as t}
                            <td class="{color}bg"
                                class:ourTeam={t.replace('frc','') == ourTeamNumber}>
                                {t.replace('frc', '')}

                            </td>
                        {/each}
                    {/each}


                </tr>
            {/each}
            </tbody>
        </table>
    {/if}

    <h2 class="border-bottom border-4">Opposing Alliance</h2>
    {#each matchReports.filter(OnlyOpposingAlliance) as r}
        <div class="row">
            <div class="col">
                <h3>In {r.matchKey} team {r.teamNumber} had these notes:</h3>
                <pre>{r.notes}</pre>
            </div>
        </div>
    {/each}

    <h2 class="border-bottom border-4">Our Alliance</h2>
    <!--{#each }-->
    {#each matchReports.filter(OnlyOurAlliance) as r}
        <div class="row">
            <div class="col">
                <h3>In {r.matchKey} team {r.teamNumber} had these notes:</h3>
                {r.notes}
            </div>
        </div>
    {/each}


</div>

<style>
    .bluebg {
        background-color: rgb(201, 218, 248)
    }

    .redbg {
        background-color: rgb(244, 204, 204)
    }

    .ourTeam {
        filter: brightness(80%);
    }
</style>