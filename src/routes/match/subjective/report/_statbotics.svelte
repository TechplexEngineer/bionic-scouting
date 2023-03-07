

<script lang="ts">
    import {onMount} from "svelte";

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

    onMount(async () => {
        data = await getStatboticsMatchData("2023week0", "qm5");
        console.log(data);
    })

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

    const round2 = (num) => {
        return Math.round(num * 100) / 100
    }
</script>

<ul>
    <li>EPA winner: {data?.epa_winner} &mdash; {round2(data?.epa_win_prob * 100)}%</li>
</ul>

<table class="table table-striped">
    <thead></thead>
    <tbody></tbody>
</table>