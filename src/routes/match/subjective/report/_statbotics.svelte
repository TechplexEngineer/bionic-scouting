<script lang="ts">
    import {onMount} from "svelte";
    import type {RxDocument} from "rxdb";
    import type {Match} from "$lib/schema/match-schema";

    export let currentMatch: RxDocument<Match>;

    export interface StatboticsMatchData {
        key: string;
        year: number;
        event: string;
        comp_level: string;
        set_number: number;
        match_number: number;
        offseason: boolean;
        status: string;
        video: string;
        red_1: number;
        red_2: number;
        red_3: number;
        red_dq: string;
        red_surrogate: string;
        red_epa_sum: number;
        red_auto_epa_sum: number;
        red_teleop_epa_sum: number;
        red_endgame_epa_sum: number;
        red_rp_1_epa_sum: number;
        red_rp_2_epa_sum: number;
        blue_1: number;
        blue_2: number;
        blue_3: number;
        blue_dq: string;
        blue_surrogate: string;
        blue_epa_sum: number;
        blue_auto_epa_sum: number;
        blue_teleop_epa_sum: number;
        blue_endgame_epa_sum: number;
        blue_rp_1_epa_sum: number;
        blue_rp_2_epa_sum: number;
        winner: string;
        epa_winner: string;
        epa_win_prob: number;
        red_rp_1_prob: number;
        red_rp_2_prob: number;
        blue_rp_1_prob: number;
        blue_rp_2_prob: number;
        playoff: boolean;
        time: number;
        predicted_time: number;
        red_score: number;
        blue_score: number;
        red_auto: number;
        red_auto_movement: number;
        red_teleop: number;
        red_endgame: number;
        red_no_fouls: number;
        red_fouls: number;
        red_rp_1: number;
        red_rp_2: number;
        red_tiebreaker: number;
        blue_auto: number;
        blue_auto_movement: number;
        blue_teleop: number;
        blue_endgame: number;
        blue_no_fouls: number;
        blue_fouls: number;
        blue_rp_1: number;
        blue_rp_2: number;
        blue_tiebreaker: number;
    }
    let matchData: StatboticsMatchData;

    interface sbTeam {
        teamNumber: number
        auto: number
        teleop: number,
        endGame: number,
        fouls: number,
        rp1: number,
        rp2: number,
        total: number,
    }

    interface sbDisplay {
        red: sbTeam[],
        blue: sbTeam[]
    }
    let data: sbDisplay;

    export interface StatboticsTeamMatch {
        alliance: string;
        epa: number;
        auto_epa: number;
        teleop_epa: number;
        endgame_epa: number;
        rp_1_epa: number;
        rp_2_epa: number;
    }

    onMount(async () => {
        // data = await getStatboticsMatchData("2023week0", "qm5");
        // console.log(data);

        // console.log("currentMatch", currentMatch)
    });


    const init = async (currentMatch: RxDocument<Match>) => {
        if (!currentMatch) return;

        const mapTeams = async (t):Promise<sbTeam> => {
            const teamNumber = parseInt(t.replace("frc", ""));
            const sb = await getStatboticsTeamMatchData(teamNumber, currentMatch.eventKey, currentMatch.matchKey)
            return {
                teamNumber,
                auto: sb.auto_epa,
                teleop: sb.teleop_epa,
                endGame: sb.endgame_epa,
                fouls: 1,
                rp1: sb.rp_1_epa,
                rp2: sb.rp_2_epa,
                total: sb.epa
            }
        }

        data = {
            red: await Promise.all(currentMatch.alliances.red.teamKeys.map(mapTeams)),
            blue: await Promise.all(currentMatch.alliances.blue.teamKeys.map(mapTeams))
        }
        // console.log(data);

        matchData = await getStatboticsMatchData(currentMatch.eventKey, currentMatch.matchKey)
    }

    $: init(currentMatch)

    async function getStatboticsMatchData(eventKey: string, matchKey: string): Promise<StatboticsMatchData> {
        try {
            const res = await fetch(`https://api.statbotics.io/v2/match/${eventKey}_${matchKey}`);
            if (!res.ok) {
                return
            }
            return await res.json()
        } catch (e) {
            console.log("Error: ", e);
        }
        return {} as any;
    }

    async function getStatboticsTeamMatchData(team: number, eventKey: string, matchKey: string): Promise<StatboticsTeamMatch> {
        try {
            const res = await fetch(`https://api.statbotics.io/v2/team_match/${team}/${eventKey}_${matchKey}`);
            if (!res.ok) {
                return
            }
            return await res.json()
        } catch (e) {
            console.log("Error: ", e);
        }
        return {} as any;
    }

    const round2 = (num) => {
        return Math.round(num * 100) / 100
    }

    const metrics = ["Auto", "Teleop", "EndGame", "Fouls", "RP1", "RP2"];

    const formatPercent = (val:number) => {
        return round2(val * 100) + "%"
    }

    const metricMap = {
        "Auto": "auto",
        "Teleop": "teleop",
        "EndGame": "endGame",
        "Fouls": "fouls",
        "RP1": "rp1",
        "RP2": "rp2"
    };
    function metricNameLookup(metric:string) {
        return metricMap[metric];
    }
</script>


<h2 class="border-bottom border-4">Statbotics Predictions</h2>

<ul>
    <li>EPA winner: {matchData?.epa_winner} &mdash; {round2(matchData?.epa_win_prob * 100)}%</li>
    <li>red_rp_1_prob: &mdash; {formatPercent(matchData?.red_rp_1_prob)}</li>
    <li>red_rp_2_prob: &mdash; {formatPercent(matchData?.red_rp_2_prob)}</li>
    <li>blue_rp_1_prob: &mdash; {formatPercent(matchData?.blue_rp_1_prob)}</li>
    <li>blue_rp_2_prob: &mdash; {formatPercent(matchData?.blue_rp_2_prob)}</li>
</ul>


<table class="table table-striped text-center ">
    <thead>
    <tr>
        <th class="redbg">Red1 {data?.red[0].teamNumber}</th>
        <th class="redbg">Red2 {data?.red[1].teamNumber}</th>
        <th class="redbg">Red3 {data?.red[2].teamNumber}</th>
        <th class="redbg">Predicted</th>
        <th></th>
        <th class="bluebg">Predicted</th>
        <th class="bluebg">Blue1 {data?.blue[0].teamNumber}</th>
        <th class="bluebg">Blue2 {data?.blue[1].teamNumber}</th>
        <th class="bluebg">Blue3 {data?.blue[2].teamNumber}</th>
    </tr>
    </thead>
    <tbody>
    {#each metrics as metric}
        <tr>
            {#if ["RP1", "RP2"].includes(metric)}
                <td>{formatPercent(data?.red[0][metricNameLookup(metric)])||"n/a"}</td>
                <td>{formatPercent(data?.red[1][metricNameLookup(metric)])||"n/a"}</td>
                <td>{formatPercent(data?.red[2][metricNameLookup(metric)])||"n/a"}</td>
                <td>{formatPercent((data?.red[0][metricNameLookup(metric)] + data?.red[1][metricNameLookup(metric)] + data?.red[2][metricNameLookup(metric)]))||"n/a"}</td>
                <td>{metric}</td>
                <td>{formatPercent((data?.blue[0][metricNameLookup(metric)] + data?.blue[1][metricNameLookup(metric)] + data?.blue[2][metricNameLookup(metric)]))||"n/a"}</td>
                <td>{formatPercent(data?.blue[0][metricNameLookup(metric)])||"n/a"}</td>
                <td>{formatPercent(data?.blue[1][metricNameLookup(metric)])||"n/a"}</td>
                <td>{formatPercent(data?.blue[2][metricNameLookup(metric)])||"n/a"}</td>
            {:else}
                <td>{data?.red[0][metricNameLookup(metric)]||"n/a"}</td>
                <td>{data?.red[1][metricNameLookup(metric)]||"n/a"}</td>
                <td>{data?.red[2][metricNameLookup(metric)]||"n/a"}</td>
                <td>{round2(data?.red[0][metricNameLookup(metric)] + data?.red[1][metricNameLookup(metric)] + data?.red[2][metricNameLookup(metric)])||"n/a"}</td>
                <td>{metric}</td>
                <td>{round2(data?.blue[0][metricNameLookup(metric)] + data?.blue[1][metricNameLookup(metric)] + data?.blue[2][metricNameLookup(metric)])||"n/a"}</td>
                <td>{data?.blue[0][metricNameLookup(metric)]||"n/a"}</td>
                <td>{data?.blue[1][metricNameLookup(metric)]||"n/a"}</td>
                <td>{data?.blue[2][metricNameLookup(metric)]||"n/a"}</td>
            {/if}
        </tr>
    {/each}
    <tr class="bg-gray-300">
        <td>{data?.red[0].total||"n/a"}</td>
        <td>{data?.red[1].total||"n/a"}</td>
        <td>{data?.red[2].total||"n/a"}</td>
        <td>{round2(data?.red[0].total + data?.red[1].total + data?.red[2].total) || "n/a"}</td>
        <td>Total</td>
        <td>{round2(data?.blue[0].total + data?.blue[1].total + data?.blue[2].total) || "n/a"}</td>
        <td>{data?.blue[0].total||"n/a"}</td>
        <td>{data?.blue[1].total||"n/a"}</td>
        <td>{data?.blue[2].total||"n/a"}</td>
    </tr>
    </tbody>
</table>

<!--<div class="w-100 d-flex flex-wrap justify-content-center">-->
<!--    <p class="me-2">Key (Percentile):</p>-->
<!--    <div>-->
<!--        <span class="rounded text-red-700 bg-red-100 p-1">0 - 25</span>-->
<!--        <span class="rounded text-gray-800 p-1">25 - 75</span>-->
<!--        <span class="rounded text-green-800 bg-green-50 p-1">75 - 90</span>-->
<!--        <span class="rounded text-green-800 bg-green-100 p-1">90 - 99</span>-->
<!--        <span class="rounded text-blue-800 bg-blue-200 p-1">99 - 100</span>-->
<!--    </div>-->
<!--</div>-->

<style>
    .redbg {
        background-color: rgb(244, 204, 204);
    }

    .bluebg {
        background-color: rgb(201, 218, 248);
    }

    .text-red-700 {
        --tw-text-opacity: 1;
        color: rgb(185 28 28/var(--tw-text-opacity));
    }

    .bg-red-100 {
        --tw-bg-opacity: 1;
        background-color: rgb(254 226 226/var(--tw-bg-opacity));
    }

    .bg-blue-200 {
        --tw-bg-opacity: 1;
        background-color: rgb(191 219 254/var(--tw-bg-opacity))
    }

    .bg-red-100 {
        --tw-bg-opacity: 1;
        background-color: rgb(254 226 226/var(--tw-bg-opacity))
    }

    .bg-green-50 {
        --tw-bg-opacity: 1;
        background-color: rgb(240 253 244/var(--tw-bg-opacity))
    }

    .bg-green-100 {
        --tw-bg-opacity: 1;
        background-color: rgb(220 252 231/var(--tw-bg-opacity))
    }

    .bg-gray-300 {
        --tw-bg-opacity: 1;
        background-color: rgb(209 213 219/var(--tw-bg-opacity))
    }

    .bg-gray-500 {
        --tw-bg-opacity: 1;
        background-color: rgb(107 114 128/var(--tw-bg-opacity))
    }

</style>