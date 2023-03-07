
<script lang="ts">
    import {onMount} from "svelte";
    import GSheetReader from 'g-sheets-api';
    import Line from "svelte-chartjs/src/Line.svelte"
    import type {MyDatabase} from "$lib/store";
    import {getDb} from "$lib/store";
    import {getCurrentEvent} from "$lib/util";

    const defaultStatusMessage = "loading..."
    let statusMessage = defaultStatusMessage;

    // data from google sheet
    let scoutingDataAverages = [];
    let handlerScoutingData = [];
    let statboticsData = [];

    let db: MyDatabase;
    let eventKey = "";

    onMount(async () => {
        db = await getDb();

        eventKey = await getCurrentEvent(db);

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
            // console.log(err);
            if (statusMessage == defaultStatusMessage) {
                statusMessage = "";
            }
            statusMessage += `Unable to pull data from google sheets<br>${err}`
            // await Swal.fire({
            //     icon: "error",
            //     title: "Oops...",
            //     html: `Unable to pull data from google sheets<br>${err}`,
            //     showCloseButton: true
            // });
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

    async function populateStatboticMatchData(eventKey) {
        try {
            const res = await fetch(`https://api.statbotics.io/v2/matches/event/${eventKey}`);
            if (!res.ok) {
                return
            }
            statboticsData = await res.json()
        } catch (e) {
        }

        // console.log(data);
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
</script>

<!--{#if selectedPrepMatch}-->
    <!--    <table class="table table-striped">-->
    <!--        <thead>-->
    <!--        <tr>-->
    <!--            <th>Match</th>-->
    <!--            <th colspan="3">Red Alliance</th>-->
    <!--            <th colspan="3">Blue Alliance</th>-->
    <!--        </tr>-->
    <!--        </thead>-->
    <!--        <tbody>-->
    <!--        {#each [selectedPrepMatch?.value] as m}-->
    <!--            <tr>-->
    <!--                <td>-->
    <!--                    <a href="/match/{m.matchKey}">{m.matchKey.toUpperCase()}</a>-->
    <!--                </td>-->

    <!--                {#each ['red', 'blue'] as color}-->
    <!--                    {#each m.alliances[color].teamKeys as t}-->
    <!--                        <td class="{color}bg"-->
    <!--                            class:ourTeam={t.replace('frc','') == ourTeamNumber}>-->
    <!--                            {t.replace('frc', '')}-->

    <!--                        </td>-->
    <!--                    {/each}-->
    <!--                    &lt;!&ndash;                        <td></td>&ndash;&gt;-->
    <!--                {/each}-->

    <!--            </tr>-->
    <!--        {/each}-->


    <!--        <tr>-->
    <!--            <td>Auto (a|m)</td>-->
    <!--            {#each ['red', 'blue'] as color}-->
    <!--                {#each selectedPrepMatch?.value.alliances[color].teamKeys as t}-->
    <!--                    <td>-->
    <!--                        &lt;!&ndash;{getFrom(scoutingData, t.replace('frc', ''), "Min Auto Hi")} |&ndash;&gt;-->
    <!--                        {Math.round(parseFloat(getFrom(scoutingDataAverages, t.replace('frc', ''), "Avg Auto Hi")) + parseFloat(getFrom(scoutingDataAverages, t.replace('frc', ''), "Avg Auto Lo")), 2)}-->
    <!--                        | {Math.round(parseFloat(getFrom(scoutingDataAverages, t.replace('frc', ''), "Max Auto Hi")) + parseFloat(getFrom(scoutingDataAverages, t.replace('frc', ''), "Max Auto Lo")), 2)}-->
    <!--                    </td>-->
    <!--                {/each}-->
    <!--                &lt;!&ndash;                    <td></td>&ndash;&gt;-->
    <!--            {/each}-->
    <!--        </tr>-->
    <!--        <tr>-->
    <!--            <td>Taxi</td>-->
    <!--            {#each ['red', 'blue'] as color}-->
    <!--                {#each selectedPrepMatch?.value.alliances[color].teamKeys as t}-->
    <!--                    <td>-->
    <!--                        {getFrom(scoutingDataAverages, t.replace('frc', ''), "Taxi %")}-->
    <!--                    </td>-->
    <!--                {/each}-->
    <!--                &lt;!&ndash;                    <td></td>&ndash;&gt;-->
    <!--            {/each}-->
    <!--        </tr>-->
    <!--        <tr>-->
    <!--            <td>Tele H (a|m)</td>-->
    <!--            {#each ['red', 'blue'] as color}-->
    <!--                {#each selectedPrepMatch?.value.alliances[color].teamKeys as t}-->
    <!--                    <td>-->
    <!--                        {getFrom(scoutingDataAverages, t.replace('frc', ''), "Avg Tele Hi")} |-->
    <!--                        {getFrom(scoutingDataAverages, t.replace('frc', ''), "Max Tele Hi")}-->
    <!--                    </td>-->
    <!--                {/each}-->
    <!--                &lt;!&ndash;                    <td></td>&ndash;&gt;-->
    <!--            {/each}-->
    <!--        </tr>-->
    <!--        <tr>-->
    <!--            <td>Tele L (a|m)</td>-->
    <!--            {#each ['red', 'blue'] as color}-->
    <!--                {#each selectedPrepMatch?.value.alliances[color].teamKeys as t}-->
    <!--                    <td>-->
    <!--                        {getFrom(scoutingDataAverages, t.replace('frc', ''), "Avg Tele Lo")} |-->
    <!--                        {getFrom(scoutingDataAverages, t.replace('frc', ''), "Max Tele Lo")}-->
    <!--                    </td>-->
    <!--                {/each}-->
    <!--                &lt;!&ndash;                    <td></td>&ndash;&gt;-->
    <!--            {/each}-->
    <!--        </tr>-->
    <!--        <tr>-->
    <!--            <td>Avg Climb</td>-->
    <!--            {#each ['red', 'blue'] as color}-->
    <!--                {#each selectedPrepMatch?.value.alliances[color].teamKeys as t}-->
    <!--                    <td>-->
    <!--                        {getFrom(scoutingDataAverages, t.replace('frc', ''), "Avg Rung Succ.")}-->
    <!--                    </td>-->
    <!--                {/each}-->
    <!--                &lt;!&ndash;                    <td></td>&ndash;&gt;-->
    <!--            {/each}-->
    <!--        </tr>-->
    <!--        &lt;!&ndash;            <tr>&ndash;&gt;-->
    <!--        &lt;!&ndash;                <td>Prediction</td>&ndash;&gt;-->
    <!--        &lt;!&ndash;                <td colspan="3">&ndash;&gt;-->
    <!--        &lt;!&ndash;                    <pre>{JSON.stringify(getSBData(statboticsData, selectedPrepMatch?.value.matchKey), null, 4)}</pre>&ndash;&gt;-->
    <!--        &lt;!&ndash;                </td>&ndash;&gt;-->
    <!--        &lt;!&ndash;                <td colspan="3"></td>&ndash;&gt;-->
    <!--        &lt;!&ndash;            </tr>&ndash;&gt;-->
    <!--        <tr>-->
    <!--            <td>W: {getSBData(statboticsData, selectedPrepMatch?.value.matchKey)?.winner}</td>-->
    <!--            <td colspan="3">-->
    <!--                &lt;!&ndash;elo:{getSBData(statboticsData, selectedPrepMatch?.value.matchKey)?.elo_win_prob} &mdash;&ndash;&gt;-->
    <!--                opr: {Math.round(getSBData(statboticsData, selectedPrepMatch?.value.matchKey)?.opr_win_prob * 100, 2)}-->
    <!--                % &mdash;-->
    <!--                mix: {Math.round(getSBData(statboticsData, selectedPrepMatch?.value.matchKey)?.mix_win_prob * 100, 2)}-->
    <!--                %-->
    <!--            </td>-->
    <!--            &lt;!&ndash;                <td></td>&ndash;&gt;-->
    <!--            <td colspan="3">-->
    <!--                &lt;!&ndash;elo:{getSBData(statboticsData, selectedPrepMatch?.value.matchKey)?.elo_win_prob} &mdash;&ndash;&gt;-->
    <!--                opr: {Math.round((1 - getSBData(statboticsData, selectedPrepMatch?.value.matchKey)?.opr_win_prob) * 100, 2)}-->
    <!--                %-->
    <!--                &mdash;-->
    <!--                mix: {Math.round((1 - getSBData(statboticsData, selectedPrepMatch?.value.matchKey)?.mix_win_prob) * 100, 2)}-->
    <!--                %-->
    <!--            </td>-->
    <!--            &lt;!&ndash;                <td></td>&ndash;&gt;-->
    <!--        </tr>-->

    <!--        <tr>-->
    <!--            <td>RP</td>-->
    <!--            <td colspan="3">-->
    <!--                Cargo-->
    <!--                {getSBData(statboticsData, selectedPrepMatch?.value.matchKey)?.red_rp_1}:-->
    <!--                {Math.round(getSBData(statboticsData, selectedPrepMatch?.value.matchKey)?.red_rp_1_prob * 100, 2)}%-->
    <!--                &mdash;-->
    <!--                Rung-->
    <!--                {getSBData(statboticsData, selectedPrepMatch?.value.matchKey)?.red_rp_2}:-->
    <!--                {Math.round(getSBData(statboticsData, selectedPrepMatch?.value.matchKey)?.red_rp_2_prob * 100, 2)}%-->
    <!--            </td>-->
    <!--            <td colspan="3">-->
    <!--                Cargo-->
    <!--                {getSBData(statboticsData, selectedPrepMatch?.value.matchKey)?.blue_rp_1}:-->
    <!--                {Math.round(getSBData(statboticsData, selectedPrepMatch?.value.matchKey)?.blue_rp_1_prob * 100, 2)}%-->
    <!--                &mdash;-->
    <!--                Rung-->
    <!--                {getSBData(statboticsData, selectedPrepMatch?.value.matchKey)?.blue_rp_2}:-->
    <!--                {Math.round(getSBData(statboticsData, selectedPrepMatch?.value.matchKey)?.blue_rp_2_prob * 100, 2)}%-->
    <!--            </td>-->
    <!--        </tr>-->

    <!--        </tbody>-->
    <!--    </table>-->
    <!--{/if}-->
    <!--{#if statusMessage}-->
    <!--    <div class="alert alert-danger" role="alert">-->
    <!--        {@html statusMessage}-->
    <!--    </div>-->
    <!--{/if}-->


    <!--    <h2 class="border-bottom border-4">Teleop Goals</h2>-->
    <!--    <Line data={calcDataForTeleGraph(handlerScoutingData, extractRedTeamsFromMatch(selectedPrepMatch?.value), extractBlueTeamsFromMatch(selectedPrepMatch?.value))}-->
    <!--          options={teleOptions}/>-->

    <!--    <h2 class="border-bottom border-4">Auto Goals</h2>-->
    <!--    <Line data={calcDataForAutoGraph(handlerScoutingData, extractRedTeamsFromMatch(selectedPrepMatch?.value), extractBlueTeamsFromMatch(selectedPrepMatch?.value))}-->
    <!--          options={autoOptions}/>-->

    <!--    <h2 class="border-bottom border-4">Climb (Highest Reached)</h2>-->
    <!--    <Line data={calcDataForClimbGraph(handlerScoutingData, extractRedTeamsFromMatch(selectedPrepMatch?.value), extractBlueTeamsFromMatch(selectedPrepMatch?.value))}-->
    <!--          options={climbOptions}/>-->

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