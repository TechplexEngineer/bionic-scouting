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
        formatDateTime,
        getCurrentEvent,
        getOurTeamNumber
    } from "$lib/util";
    import * as GSheetReader from "g-sheets-api";
    import Swal from "sweetalert2";
    import Line from "svelte-chartjs/src/Line.svelte"
    import {checkPouchAdapter} from "rxdb";
    import type {PitReport} from "$lib/schema/pit-scout-schema";

    let matches: RxDocument<Match>[] = [];
    let matchSelections: { label: string, value: RxDocument<Match> }[] = [];
    let selectedPrepMatch: { label: string, value: RxDocument<Match> };

    let matchReports: RxDocument<MatchSubjReport>[] = [];
    let teamPitScoutingData: RxDocument<PitReport>[] = [];

    const handleSelectMatch = async function (event) {
        let match: RxDocument<Match> = event.detail.value;
        console.log("selected match", match);

        const query = {
            eventKey: eventKey,
            matchForKey: match.matchKey
        };

        matchReports = await db.match_subjective.find().where(query).exec();
        // console.log("reports", matchReports);

        // console.log(extractTeamsFromMatch(match));

        teamPitScoutingData = await db.pit_scouting.find().where({
            eventKey: eventKey,
            teamNumber: {$in: extractTeamsFromMatch(match)}
        }).exec();

        // console.log(teamPitScoutingData);
    }

    let db: MyDatabase;
    let eventKey = "";
    let ourTeamNumber = 0;


    // data from google sheet
    let scoutingDataAverages = [];
    let handlerScoutingData = [];
    let statboticsData = [];

    onMount(async () => {
        db = await getDb();

        eventKey = await getCurrentEvent(db);
        ourTeamNumber = await getOurTeamNumber(db);

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


        // const DCMP_2022 = '1Q6Llv-qqZ5uo3ufbzTvExyut1etuelWR-eoPXmnbs9o'; //@todo make this configurable
        const NEWTON_2022 = '1_m1-8Oj4uOOR2BYn7oqRHNNAyVFA-UTfaRABNQ0aUrY';

        const apiKey = import.meta.env.VITE_SHEETS_API_KEY;

        const sheetName = "Team Info";

        const readerOptions = {
            apiKey: apiKey,
            sheetId: NEWTON_2022,
            returnAllResults: false,
            sheetName: sheetName
        };
        GSheetReader(readerOptions, (data) => {
            scoutingDataAverages = data;
            // console.log(data);
        }, async (err) => {
            console.log(err);
            await Swal.fire({
                icon: "error",
                title: "Oops...",
                html: `Unable to pull data from google sheets<br>${err}`,
                showCloseButton: true
            });
        });

        const readerOptions2 = {
            apiKey: apiKey,
            sheetId: NEWTON_2022,
            returnAllResults: false,
            sheetName: "Handler"
        };
        GSheetReader(readerOptions2, (data) => {
            handlerScoutingData = data;
            // console.log("Handler", data);
            // console.log(getRawScoutingData(handlerScoutingData, "4909", "Name"));
        }, async (err) => {
            console.log(err);
        });

        await populateStatboticMatchData(eventKey)

    });

    async function populateStatboticMatchData(eventKey) {
        const res = await fetch(`https://api.statbotics.io/v1/matches/event/${eventKey}`);
        if (!res.ok) {
            return
        }
        statboticsData = await res.json()
        // console.log(data);
    }

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

    const onlyTeam = (teamNumber: number) => {
        return (item: RxDocument<MatchSubjReport>, index, self) => {
            return item.teamNumber == teamNumber
        }
    }
    const byMatchNumber = (a: RxDocument<MatchSubjReport>, b: RxDocument<MatchSubjReport>) => {
        //@todo make this work for matches above QM
        let aMatchNumber = parseInt(a.matchKey.slice(2));
        let bMatchNumber = parseInt(b.matchKey.slice(2));
        return aMatchNumber - bMatchNumber;
    }
    const byMatchNumberReverse = (a: RxDocument<MatchSubjReport>, b: RxDocument<MatchSubjReport>) => {
        //@todo make this work for matches above QM
        let aMatchNumber = parseInt(a.matchKey.slice(2));
        let bMatchNumber = parseInt(b.matchKey.slice(2));
        return bMatchNumber - aMatchNumber;
    }

    const getFrom = (scoutingData, team, field) => {
        let rows = scoutingData.filter(r => r.Team == team)
        if (rows.length < 1) {
            return "???";
        }
        const row = rows[0];
        if (!row) {
            return "?";
        }
        return row[field]
    }

    const getSBData = (sb, matchKey) => {
        // console.log("SB Data", statboticsData);
        return sb.filter(m => {
            // console.log(m.key == `${eventKey}_${selectedPrepMatch?.value.matchKey}`, m.key, `${eventKey}_${matchKey}`);
            return m.key == `${eventKey}_${matchKey}`
        })[0]
    }

    const getRawScoutingData = (handlerScoutingData, team, field) => {
        const teamData = handlerScoutingData.filter(r => r.Team == team)
        return teamData.map(r => parseFloat(r[field]))
    }

    const red1Color = "#F4BBBB";
    const red2Color = "#F49090";
    const red3Color = "#F46D6D";
    const redColors = [red1Color, red2Color, red3Color]

    const blue1Color = "#B7CFF8";
    const blue2Color = "#82AEF8";
    const blue3Color = "#4E8DF8";
    const blueColors = [blue1Color, blue2Color, blue3Color]

    // teleop
    // auto 6
    // climb 4

    const teleOptions = {
        scales: {
            y: {
                suggestedMin: 0,
                suggestedMax: 14
            }
        },
        responsive: true
    }

    function calcDataForTeleGraph(handlerScoutingData, redTeams, blueTeams) {
        if (!handlerScoutingData) {
            return {};
        }

        let dataLine = {
            labels: [], // "","",...
            datasets: []
        };

        let iterate = [
            {
                teams: redTeams,
                colors: redColors
            },
            {
                teams: blueTeams,
                colors: blueColors
            }
        ];

        for (let item of iterate) {
            for (let i = 0; i < item.teams.length; i++) {
                let team = item.teams[i];
                let color = item.colors[i];
                let scoresHi = getRawScoutingData(handlerScoutingData, team, "Tele Hi Score");
                let scoresLo = getRawScoutingData(handlerScoutingData, team, "Tele Lo Score");

                let scores = scoresHi.map((el, idx) => el + scoresLo[idx])

                let lenDiff = scores.length - dataLine.labels.length
                if (lenDiff > 0) {
                    for (let j = 0; j < lenDiff; j++) {
                        dataLine.labels.push("")
                    }
                }

                dataLine.datasets.push({
                    label: team,
                    fill: false,
                    lineTension: 0.3,
                    backgroundColor: "rgba(184, 185, 210, .3)",
                    borderColor: color,
                    borderCapStyle: "butt",
                    borderDash: [],
                    borderDashOffset: 0.0,
                    borderJoinStyle: "miter",
                    pointBorderColor: color,
                    pointBackgroundColor: "rgb(255, 255, 255)",
                    pointBorderWidth: 10,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: "rgb(0, 0, 0)",
                    pointHoverBorderColor: "rgba(220, 220, 220, 1)",
                    pointHoverBorderWidth: 2,
                    pointRadius: 1,
                    pointHitRadius: 10,
                    data: scores
                })
            }
        }
        return dataLine
    }

    const autoOptions = {
        scales: {
            y: {
                suggestedMin: 0,
                suggestedMax: 6
            }
        },
        responsive: true
    }

    function calcDataForAutoGraph(handlerScoutingData, redTeams, blueTeams) {
        if (!handlerScoutingData) {
            return {};
        }

        let dataLine = {
            labels: [], // "","",...
            datasets: []
        };

        let iterate = [
            {
                teams: redTeams,
                colors: redColors
            },
            {
                teams: blueTeams,
                colors: blueColors
            }
        ];

        for (let item of iterate) {
            for (let i = 0; i < item.teams.length; i++) {
                let team = item.teams[i];
                let color = item.colors[i];
                let scoresHi = getRawScoutingData(handlerScoutingData, team, "Auto Hi Score");
                let scoresLo = getRawScoutingData(handlerScoutingData, team, "Auto Lo Score");

                let scores = scoresHi.map((el, idx) => el + scoresLo[idx])

                let lenDiff = scores.length - dataLine.labels.length
                if (lenDiff > 0) {
                    for (let j = 0; j < lenDiff; j++) {
                        dataLine.labels.push("")
                    }
                }

                dataLine.datasets.push({
                    label: team,
                    fill: false,
                    lineTension: 0.3,
                    backgroundColor: "rgba(184, 185, 210, .3)",
                    borderColor: color,
                    borderCapStyle: "butt",
                    borderDash: [],
                    borderDashOffset: 0.0,
                    borderJoinStyle: "miter",
                    pointBorderColor: color,
                    pointBackgroundColor: "rgb(255, 255, 255)",
                    pointBorderWidth: 10,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: "rgb(0, 0, 0)",
                    pointHoverBorderColor: "rgba(220, 220, 220, 1)",
                    pointHoverBorderWidth: 2,
                    pointRadius: 1,
                    pointHitRadius: 10,
                    data: scores
                })
            }
        }
        return dataLine
    }

    const climbOptions = {
        scales: {
            y: {
                suggestedMin: 0,
                suggestedMax: 4
            }
        },
        responsive: true
    }

    function calcDataForClimbGraph(handlerScoutingData, redTeams, blueTeams) {
        if (!handlerScoutingData) {
            return {};
        }

        let dataLine = {
            labels: [], // "","",...
            datasets: []
        };

        let iterate = [
            {
                teams: redTeams,
                colors: redColors
            },
            {
                teams: blueTeams,
                colors: blueColors
            }
        ];

        for (let item of iterate) {
            for (let i = 0; i < item.teams.length; i++) {
                let team = item.teams[i];
                let color = item.colors[i];
                let scores = getRawScoutingData(handlerScoutingData, team, "Highest Succ.");
                // let scoresLo = getRawScoutingData(handlerScoutingData, team, "Auto Lo Score");

                // let scores = scoresHi.map((el, idx) => el + scoresLo[idx])

                let lenDiff = scores.length - dataLine.labels.length
                if (lenDiff > 0) {
                    for (let j = 0; j < lenDiff; j++) {
                        dataLine.labels.push("")
                    }
                }

                dataLine.datasets.push({
                    label: team,
                    fill: false,
                    lineTension: 0.3,
                    backgroundColor: "rgba(184, 185, 210, .3)",
                    borderColor: color,
                    borderCapStyle: "butt",
                    borderDash: [],
                    borderDashOffset: 0.0,
                    borderJoinStyle: "miter",
                    pointBorderColor: color,
                    pointBackgroundColor: "rgb(255, 255, 255)",
                    pointBorderWidth: 10,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: "rgb(0, 0, 0)",
                    pointHoverBorderColor: "rgba(220, 220, 220, 1)",
                    pointHoverBorderWidth: 2,
                    pointRadius: 1,
                    pointHitRadius: 10,
                    data: scores
                })
            }
        }
        return dataLine
    }

    function getNotesForTeam(team: number, teams: RxDocument<PitReport>[]) {
        const teamPitReport = teams.filter((t: RxDocument<PitReport>) => t.teamNumber == team);
        console.log(teamPitReport);
        if (teamPitReport.length == 0) {
            return `no notes for ${team}`
        }
        return teamPitReport[0].notes || ""

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
                        <!--                        <td></td>-->
                    {/each}

                </tr>
            {/each}
            <!--            <tr>-->
            <!--                <td>Auto</td>-->
            <!--                {#each ['red', 'blue'] as color}-->
            <!--                    {#each selectedPrepMatch?.value.alliances[color].teamKeys as t}-->
            <!--                        <td>-->
            <!--                            {getFrom(scoutingData, t.replace('frc', ''), "Average Auto Balls")}-->
            <!--                        </td>-->
            <!--                    {/each}-->
            <!--                {/each}-->
            <!--            </tr>-->
            <!--            <tr>-->
            <!--                <td>Auto Lo</td>-->
            <!--                {#each ['red', 'blue'] as color}-->
            <!--                    {#each selectedPrepMatch?.value.alliances[color].teamKeys as t}-->
            <!--                        <td>-->
            <!--                            &lt;!&ndash;{getFrom(scoutingData, t.replace('frc', ''), "Min Auto Lo")} |&ndash;&gt;-->
            <!--                            {getFrom(scoutingData, t.replace('frc', ''), "Avg Auto Lo")}-->
            <!--                            | {getFrom(scoutingData, t.replace('frc', ''), "Max Auto Lo")}-->
            <!--                        </td>-->
            <!--                    {/each}-->
            <!--                {/each}-->
            <!--            </tr>-->
            <!--            <tr>-->
            <!--                <td>Auto Hi</td>-->
            <!--                {#each ['red', 'blue'] as color}-->
            <!--                    {#each selectedPrepMatch?.value.alliances[color].teamKeys as t}-->
            <!--                        <td>-->
            <!--                            &lt;!&ndash;{getFrom(scoutingData, t.replace('frc', ''), "Min Auto Hi")} |&ndash;&gt;-->
            <!--                            {getFrom(scoutingData, t.replace('frc', ''), "Avg Auto Hi")}-->
            <!--                            | {getFrom(scoutingData, t.replace('frc', ''), "Max Auto Hi")}-->
            <!--                        </td>-->
            <!--                    {/each}-->
            <!--                {/each}-->
            <!--            </tr>-->

            <tr>
                <td>Auto (a|m)</td>
                {#each ['red', 'blue'] as color}
                    {#each selectedPrepMatch?.value.alliances[color].teamKeys as t}
                        <td>
                            <!--{getFrom(scoutingData, t.replace('frc', ''), "Min Auto Hi")} |-->
                            {Math.round(parseFloat(getFrom(scoutingDataAverages, t.replace('frc', ''), "Avg Auto Hi")) + parseFloat(getFrom(scoutingDataAverages, t.replace('frc', ''), "Avg Auto Lo")), 2)}
                            | {Math.round(parseFloat(getFrom(scoutingDataAverages, t.replace('frc', ''), "Max Auto Hi")) + parseFloat(getFrom(scoutingDataAverages, t.replace('frc', ''), "Max Auto Lo")), 2)}
                        </td>
                    {/each}
                    <!--                    <td></td>-->
                {/each}
            </tr>
            <tr>
                <td>Taxi</td>
                {#each ['red', 'blue'] as color}
                    {#each selectedPrepMatch?.value.alliances[color].teamKeys as t}
                        <td>
                            {getFrom(scoutingDataAverages, t.replace('frc', ''), "Taxi %")}
                        </td>
                    {/each}
                    <!--                    <td></td>-->
                {/each}
            </tr>
            <tr>
                <td>Tele H (a|m)</td>
                {#each ['red', 'blue'] as color}
                    {#each selectedPrepMatch?.value.alliances[color].teamKeys as t}
                        <td>
                            {getFrom(scoutingDataAverages, t.replace('frc', ''), "Avg Tele Hi")} |
                            {getFrom(scoutingDataAverages, t.replace('frc', ''), "Max Tele Hi")}
                        </td>
                    {/each}
                    <!--                    <td></td>-->
                {/each}
            </tr>
            <tr>
                <td>Tele L (a|m)</td>
                {#each ['red', 'blue'] as color}
                    {#each selectedPrepMatch?.value.alliances[color].teamKeys as t}
                        <td>
                            {getFrom(scoutingDataAverages, t.replace('frc', ''), "Avg Tele Lo")} |
                            {getFrom(scoutingDataAverages, t.replace('frc', ''), "Max Tele Lo")}
                        </td>
                    {/each}
                    <!--                    <td></td>-->
                {/each}
            </tr>
            <tr>
                <td>Avg Climb</td>
                {#each ['red', 'blue'] as color}
                    {#each selectedPrepMatch?.value.alliances[color].teamKeys as t}
                        <td>
                            {getFrom(scoutingDataAverages, t.replace('frc', ''), "Avg Rung Succ.")}
                        </td>
                    {/each}
                    <!--                    <td></td>-->
                {/each}
            </tr>
            <!--            <tr>-->
            <!--                <td>Prediction</td>-->
            <!--                <td colspan="3">-->
            <!--                    <pre>{JSON.stringify(getSBData(statboticsData, selectedPrepMatch?.value.matchKey), null, 4)}</pre>-->
            <!--                </td>-->
            <!--                <td colspan="3"></td>-->
            <!--            </tr>-->
            <tr>
                <td>W: {getSBData(statboticsData, selectedPrepMatch?.value.matchKey)?.winner}</td>
                <td colspan="3">
                    <!--elo:{getSBData(statboticsData, selectedPrepMatch?.value.matchKey)?.elo_win_prob} &mdash;-->
                    opr: {Math.round(getSBData(statboticsData, selectedPrepMatch?.value.matchKey)?.opr_win_prob * 100, 2)}
                    % &mdash;
                    mix: {Math.round(getSBData(statboticsData, selectedPrepMatch?.value.matchKey)?.mix_win_prob * 100, 2)}
                    %
                </td>
                <!--                <td></td>-->
                <td colspan="3">
                    <!--elo:{getSBData(statboticsData, selectedPrepMatch?.value.matchKey)?.elo_win_prob} &mdash;-->
                    opr: {Math.round((1 - getSBData(statboticsData, selectedPrepMatch?.value.matchKey)?.opr_win_prob) * 100, 2)}
                    %
                    &mdash;
                    mix: {Math.round((1 - getSBData(statboticsData, selectedPrepMatch?.value.matchKey)?.mix_win_prob) * 100, 2)}
                    %
                </td>
                <!--                <td></td>-->
            </tr>

            <tr>
                <td>RP</td>
                <td colspan="3">
                    Cargo
                    {getSBData(statboticsData, selectedPrepMatch?.value.matchKey)?.red_rp_1}:
                    {Math.round(getSBData(statboticsData, selectedPrepMatch?.value.matchKey)?.red_rp_1_prob * 100, 2)}%
                    &mdash;
                    Rung
                    {getSBData(statboticsData, selectedPrepMatch?.value.matchKey)?.red_rp_2}:
                    {Math.round(getSBData(statboticsData, selectedPrepMatch?.value.matchKey)?.red_rp_2_prob * 100, 2)}%
                </td>
                <td colspan="3">
                    Cargo
                    {getSBData(statboticsData, selectedPrepMatch?.value.matchKey)?.blue_rp_1}:
                    {Math.round(getSBData(statboticsData, selectedPrepMatch?.value.matchKey)?.blue_rp_1_prob * 100, 2)}%
                    &mdash;
                    Rung
                    {getSBData(statboticsData, selectedPrepMatch?.value.matchKey)?.blue_rp_2}:
                    {Math.round(getSBData(statboticsData, selectedPrepMatch?.value.matchKey)?.blue_rp_2_prob * 100, 2)}%
                </td>
            </tr>

            </tbody>
        </table>
    {/if}

    <h2 class="border-bottom border-4">Teleop Goals</h2>
    <Line data={calcDataForTeleGraph(handlerScoutingData, extractRedTeamsFromMatch(selectedPrepMatch?.value), extractBlueTeamsFromMatch(selectedPrepMatch?.value))}
          options={teleOptions}/>

    <h2 class="border-bottom border-4">Auto Goals</h2>
    <Line data={calcDataForAutoGraph(handlerScoutingData, extractRedTeamsFromMatch(selectedPrepMatch?.value), extractBlueTeamsFromMatch(selectedPrepMatch?.value))}
          options={autoOptions}/>

    <h2 class="border-bottom border-4">Climb (Highest Reached)</h2>
    <Line data={calcDataForClimbGraph(handlerScoutingData, extractRedTeamsFromMatch(selectedPrepMatch?.value), extractBlueTeamsFromMatch(selectedPrepMatch?.value))}
          options={climbOptions}/>
    <!--{#each getOpposingAllianceMembers(selectedPrepMatch?.value) as t}-->
    <!--    <h3>{t}</h3>-->
    <!--    -->
    <!--{/each}-->


    <h2 class="border-bottom border-4">Super Scout Notes</h2>

    <h2 class="border-bottom border-4 text-end">Opposing Alliance</h2>
    {#each getOpposingAllianceMembers(selectedPrepMatch?.value) as t}
        <h3>{t}</h3>
        <ul>
            {#each matchReports.filter(onlyTeam(t)).sort(byMatchNumberReverse) as mr}
                <li>{mr.matchKey}
                    <pre>{mr.notes}</pre>
                </li>
            {/each}
        </ul>
    {/each}

    <h2 class="border-bottom border-4 text-end">Our Alliance</h2>
    {#each getOurAllianceMembers(selectedPrepMatch?.value) as t}
        <h3>{t}</h3>
        <pre>{getNotesForTeam(t, teamPitScoutingData)}</pre>

        <ul>
            {#each matchReports.filter(onlyTeam(t)).sort(byMatchNumberReverse) as mr}
                <li>{mr.matchKey}
                    <pre>{mr.notes}</pre>
                </li>
            {/each}
        </ul>
    {/each}
    <!--{#each }-->
    <!--{#each matchReports.filter(OnlyOurAlliance) as r}-->
    <!--    <div class="row">-->
    <!--        <div class="col">-->
    <!--            <h3>In {r.matchKey} team {r.teamNumber} had these notes:</h3>-->
    <!--            {r.notes}-->
    <!--        </div>-->
    <!--    </div>-->
    <!--{/each}-->


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