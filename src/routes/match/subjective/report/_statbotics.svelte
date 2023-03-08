

<script lang="ts">
    import {onMount} from "svelte";
    import type {RxDocument} from "rxdb";
    import type {Match} from "$lib/schema/match-schema";
    export let currentMatch: RxDocument<Match>;

    export interface StatboticsMatchData {
    key:                  string;
    year:                 number;
    event:                string;
    comp_level:           string;
    set_number:           number;
    match_number:         number;
    offseason:            boolean;
    status:               string;
    video:                string;
    red_1:                number;
    red_2:                number;
    red_3:                number;
    red_dq:               string;
    red_surrogate:        string;
    red_epa_sum:          number;
    red_auto_epa_sum:     number;
    red_teleop_epa_sum:   number;
    red_endgame_epa_sum:  number;
    red_rp_1_epa_sum:     number;
    red_rp_2_epa_sum:     number;
    blue_1:               number;
    blue_2:               number;
    blue_3:               number;
    blue_dq:              string;
    blue_surrogate:       string;
    blue_epa_sum:         number;
    blue_auto_epa_sum:    number;
    blue_teleop_epa_sum:  number;
    blue_endgame_epa_sum: number;
    blue_rp_1_epa_sum:    number;
    blue_rp_2_epa_sum:    number;
    winner:               string;
    epa_winner:           string;
    epa_win_prob:         number;
    red_rp_1_prob:        number;
    red_rp_2_prob:        number;
    blue_rp_1_prob:       number;
    blue_rp_2_prob:       number;
    playoff:              boolean;
    time:                 number;
    predicted_time:       number;
    red_score:            number;
    blue_score:           number;
    red_auto:             number;
    red_auto_movement:    number;
    red_teleop:           number;
    red_endgame:          number;
    red_no_fouls:         number;
    red_fouls:            number;
    red_rp_1:             number;
    red_rp_2:             number;
    red_tiebreaker:       number;
    blue_auto:            number;
    blue_auto_movement:   number;
    blue_teleop:          number;
    blue_endgame:         number;
    blue_no_fouls:        number;
    blue_fouls:           number;
    blue_rp_1:            number;
    blue_rp_2:            number;
    blue_tiebreaker:      number;
}

    let data: StatboticsMatchData;

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
    });

    const init = (currentMatch: RxDocument<Match>) => {
        if (!currentMatch) return;
        console.log("matchKey", currentMatch.matchKey);
        console.log("eventKey", currentMatch.eventKey);
        console.log("alliances", currentMatch.alliances);


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

    const metrics = ["Auto", "Teleop", "EndGame", "Fouls", "RP1", "RP2"]
</script>

<ul>
    <li>EPA winner: {data?.epa_winner} &mdash; {round2(data?.epa_win_prob * 100)}%</li>
</ul>



<table class="table table-striped text-center ">
    <thead>
        <tr>
            <th class="redbg">Red1 {currentMatch?.alliances.red.teamKeys[0]}</th>
            <th class="redbg">Red2 {currentMatch?.alliances.red.teamKeys[1]}</th>
            <th class="redbg">Red3 {currentMatch?.alliances.red.teamKeys[2]}</th>
            <th class="redbg">Predicted</th>
            <th></th>
            <th class="bluebg">Predicted</th>
            <th class="bluebg">Blue1 {currentMatch?.alliances.blue.teamKeys[0]}</th>
            <th class="bluebg">Blue2 {currentMatch?.alliances.blue.teamKeys[1]}</th>
            <th class="bluebg">Blue3 {currentMatch?.alliances.blue.teamKeys[2]}</th>
        </tr>
    </thead>
    <tbody>
    {#each metrics as metric}
        <tr>
            <td>Red1</td>
            <td>Red2</td>
            <td>Red3</td>
            <td>Predicted</td>
            <td>{metric}</td>
            <td>Predicted</td>
            <td>Blue1</td>
            <td>Blue2</td>
            <td>Blue3</td>
        </tr>
    {/each}
    <tr class="bg-gray-300">
        <td>Red1</td>
        <td>Red2</td>
        <td>Red3</td>
        <td>Predicted</td>
        <td>Total</td>
        <td>Predicted</td>
        <td>Blue1</td>
        <td>Blue2</td>
        <td>Blue3</td>
    </tr>
    </tbody>
</table>

<div class="w-100 d-flex flex-wrap justify-content-center">
    <p class="me-2">Key (Percentile):</p>
    <div>
        <span class="rounded text-red-700 bg-red-100 p-1">0 - 25</span>
        <span class="rounded text-gray-800 p-1">25 - 75</span>
        <span class="rounded text-green-800 bg-green-50 p-1">75 - 90</span>
        <span class="rounded text-green-800 bg-green-100 p-1">90 - 99</span>
        <span class="rounded text-blue-800 bg-blue-200 p-1">99 - 100</span>
    </div>
</div>

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