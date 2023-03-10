<script lang="ts">
    import {onMount} from "svelte";
    import GSheetReader from 'g-sheets-api';
    import Line from "svelte-chartjs/src/Line.svelte"
    import type {MyDatabase} from "$lib/store";
    import {getDb} from "$lib/store";
    import {getCurrentEvent, getOurTeamNumber} from "$lib/util";
    import type {RxDocument} from "rxdb";
    import type {Match} from "$lib/schema/match-schema";

    export let currentMatch: RxDocument<Match>;

    const defaultStatusMessage = "loading..."
    let statusMessage = defaultStatusMessage;

    // data from google sheet
    let scoutingDataAverages = [];
    let handlerScoutingData = [];

    let db: MyDatabase;
    let eventKey = "";
    let ourTeamNumber: number;

    onMount(async () => {
        db = await getDb();

        eventKey = await getCurrentEvent(db);
        ourTeamNumber = await getOurTeamNumber(db);

        // const DCMP_2022 = '1Q6Llv-qqZ5uo3ufbzTvExyut1etuelWR-eoPXmnbs9o'; //@todo make this configurable
        // const NEWTON_2022 = '1_m1-8Oj4uOOR2BYn7oqRHNNAyVFA-UTfaRABNQ0aUrY';
        const RIDE_2023 = "184IZ3-XMGCozR2um38Nd6fsaXkox12WNyBjtQMlz61o";

        const apiKey = import.meta.env.VITE_SHEETS_API_KEY;

        const readerOptions2 = {
            apiKey: apiKey,
            sheetId: RIDE_2023,
            returnAllResults: false,
            sheetName: "HandlerForStrategistApp"
        };
        // GSheetReader(readerOptions2, (data) => {
        //     handlerScoutingData = data;
        //     // console.log("Raw Data", data);
        //     console.log(getRawScoutingData(handlerScoutingData, "4909", "teleopScoreGrid").map(JSON.parse).flat());
        //     // console.log(getFrom(handlerScoutingData, "4909", "teleopScoreGrid"));
        // }, async (err) => {
        //     console.log(err);
        // });

    });

    const getRawScoutingData = (handlerScoutingData, team, field) => {
        const teamData = handlerScoutingData.filter(r => r.teamNumber == team)
        // console.log(teamData);
        return teamData.map(r => r[field])
    }

    const getFrom = (scoutingData, team, field) => {
        let rows = scoutingData.filter(r => r.teamNumber == team)
        if (rows.length < 1) {
            return "???";
        }
        const row = rows[0];
        if (!row) {
            return "?";
        }
        return row[field]
    }

</script>

<h2 class="border-bottom border-4">Scout Data</h2>
{#if currentMatch}

    <table class="table table-striped">
        <thead>
        <tr>
            <th>Match</th>
            <th colspan="3">Red Alliance</th>
            <th colspan="3">Blue Alliance</th>
        </tr>
        </thead>
        <tbody>

        <tr>
            <td>
                <a href="/match/{currentMatch.matchKey}">{currentMatch.matchKey.toUpperCase()}</a>
            </td>

            {#each ['red', 'blue'] as color}
                {#each currentMatch.alliances[color].teamKeys as t}
                    <td class="{color}bg"
                        class:ourTeam={t.replace('frc','') == ourTeamNumber}>
                        {t.replace('frc', '')}

                    </td>
                {/each}
                <!--                        <td></td>-->
            {/each}

        </tr>


        <tr>
            <td>Auto (a|m)</td>
            {#each ['red', 'blue'] as color}
                {#each currentMatch?.alliances[color].teamKeys as t}
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
                {#each currentMatch.alliances[color].teamKeys as t}
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
                {#each currentMatch.alliances[color].teamKeys as t}
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
                {#each currentMatch.alliances[color].teamKeys as t}
                    <td>
                        {getFrom(scoutingDataAverages, t.replace('frc', ''), "Avg Tele Lo")} |
                        {getFrom(scoutingDataAverages, t.replace('frc', ''), "Max Tele Lo")}
                    </td>
                {/each}
            {/each}
        </tr>

        </tbody>
    </table>
{/if}

{#if statusMessage}
    <div class="alert alert-danger" role="alert">
        {@html statusMessage}
    </div>
{/if}


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