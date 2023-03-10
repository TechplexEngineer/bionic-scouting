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
    import {matchSort} from "$lib/matches";
    import type {RxDocument} from "rxdb";
    import type {MatchSubjReport} from "$lib/schema/match-subj-schema";
    import type {Match} from "$lib/schema/match-schema";
    import {
        extractBlueTeamsFromMatch,
        extractRedTeamsFromMatch, extractTeamsFromMatch,
        getCurrentEvent,
        getOurTeamNumber
    } from "$lib/util";

    import type {PitReport} from "$lib/schema/pit-scout-schema";
    import {RxAttachment} from "rxdb";
    import TeamReportWithPhoto from "./_teamReportWithPhoto.svelte"
    import MatchNotes from "./_matchNotes.svelte"
    import MatchTable from "./_matchTable.svelte"
    import Statbotics from "./_statbotics.svelte"

    export type PitReportWithAttachments = { doc: RxDocument<PitReport>, attachments: RxAttachment<PitReport, {}> }

    let matches: RxDocument<Match>[] = [];
    let matchSelections: { label: string, value: RxDocument<Match> }[] = [];
    let selectedPrepMatch: { label: string, value: RxDocument<Match> };

    let matchReports: RxDocument<MatchSubjReport>[] = [];
    let teamPitScoutingDataDocs: RxDocument<PitReport>[] = [];
    let teamPitScoutingData: PitReportWithAttachments[] = [];

    const handleSelectMatch = async function (event) {
        let match: RxDocument<Match> = event.detail.value;

        const query = {
            eventKey: eventKey,
        };

        matchReports = await db.match_subjective.find().where(query).exec();

        teamPitScoutingDataDocs = await db.pit_scouting.find().where({
            eventKey: eventKey,
            teamNumber: {$in: extractTeamsFromMatch(match)}
        }).exec();

        teamPitScoutingDataDocs.map((team: RxDocument<PitReport>) => {
            let attachments = team.allAttachments()
            let report: PitReportWithAttachments = {
                doc: team,
                attachments: attachments
            }
            teamPitScoutingData = [...teamPitScoutingData, report];
        })
    }

    let db: MyDatabase;
    let eventKey = "";
    let ourTeamNumber = 0;

    onMount(async () => {
        db = await getDb();

        eventKey = await getCurrentEvent(db);
        ourTeamNumber = await getOurTeamNumber(db);

        matches = await db.matches.find().where({eventKey: eventKey}).exec();
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

    const weAreBlue = (match: RxDocument<Match>): boolean => {
        let blueTeams = extractBlueTeamsFromMatch(match)
        return blueTeams.includes(ourTeamNumber)
    }

    const getOurAllianceMembers = (match: RxDocument<Match>): number[] => {
        if (!match) {
            return []
        }
        if (weAreBlue(match)) {
            return extractBlueTeamsFromMatch(match)
        }
        return extractRedTeamsFromMatch(match)
    }
    const getOpposingAllianceMembers = (match: RxDocument<Match>): number[] => {
        if (!match) {
            return []
        }
        if (!weAreBlue(match)) {
            return extractBlueTeamsFromMatch(match)
        }
        return extractRedTeamsFromMatch(match)
    }

    const getOpposingAllianceColor = (match: RxDocument<Match>) => {
        if (weAreBlue(match)) {
            return "Red"
        } else {
            return "Blue"
        }
    }
    const getOurAllianceColor = (match: RxDocument<Match>) => {
        if (weAreBlue(match)) {
            return "Blue"
        } else {
            return "Red"
        }
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

    <Statbotics currentMatch={selectedPrepMatch?.value}/>

<!--    <MatchTable currentMatch={selectedPrepMatch?.value}/>-->

    <h2 class="border-bottom border-4">Match Notes</h2>
    <MatchNotes currentMatch={selectedPrepMatch?.value}/>



    <h2 class="border-bottom border-4 mt-3">Opposing Alliance &mdash; {getOpposingAllianceColor(selectedPrepMatch?.value)}</h2>
    {#each getOpposingAllianceMembers(selectedPrepMatch?.value) as t}
        <TeamReportWithPhoto {t} {teamPitScoutingData} {matchReports}/>
    {/each}

    <h2 class="border-bottom border-4 mt-3">Our Alliance  &mdash; {getOurAllianceColor(selectedPrepMatch?.value)}</h2>
    {#each getOurAllianceMembers(selectedPrepMatch?.value) as t}
        <TeamReportWithPhoto {t} {teamPitScoutingData} {matchReports}/>
    {/each}


</div>

