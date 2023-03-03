<svelte:head>
    <title>Match</title>
</svelte:head>

<script context="module">
    // Disable server side rendering for this page
    export const ssr = false;
</script>


<script lang="ts">
    import {page} from "$app/stores";
    import "sweetalert2/dist/sweetalert2.css";
    import Swal from "sweetalert2";
    import MatchTable from "$lib/compontents/_matchTable.svelte";
    import {onMount} from "svelte";
    import {getDb} from "$lib/store";
    import {Settings} from "$lib/schema/settings-schema";
    import {goto} from "$app/navigation";
    import type {RxDocument} from "rxdb";
    import type {Match} from "$lib/schema/match-schema";
    import {getCurrentEvent} from "$lib/util";

    let match: RxDocument<Match>;

    onMount(async () => {
        const db = await getDb();

        const eventKey = await getCurrentEvent(db);

        match = await db.matches.findOne().where({eventKey, matchKey: $page.params.match}).exec();
        console.log("match: ",JSON.stringify(match, null, "    "));
    });

    let ourTeamNumber = 4909;


</script>

<div class="container-fluid">
    <a class="btn btn-info float-start" href="/match/schedule">&lt; Schedule</a>
    <a class="btn btn-warning float-end" href="/match/subjective?match={match && match.matchKey}">Scout Match</a>
    <h1>Match {$page.params.match.toUpperCase()}</h1>
</div>


{#if match}
    <MatchTable match={match} ourTeamNumber={ourTeamNumber}/>

    <h2>Detailed Results</h2>
    <table class="match-table">
        <tbody>
        <!-- Autonomous -->

        <tr class="key">
            <td class="redScore" colspan="2">


                <i class="bi bi-check fw-bold" title=""></i>
                <span class="glyphicon glyphicon-ok" rel="tooltip" title="246"></span>


                <span class="glyphicon glyphicon-ok" rel="tooltip" title="4905"></span>


                <span class="glyphicon glyphicon-remove" rel="tooltip" title="2342"></span>


                (+6)
            </td>
            <td>Mobility</td>
            <td class="blueScore" colspan="2">


                <span class="glyphicon glyphicon-ok" rel="tooltip" title="157"></span>


                <span class="glyphicon glyphicon-remove" rel="tooltip" title="4041"></span>


                <span class="glyphicon glyphicon-remove" rel="tooltip" title="509"></span>


                (+3)
            </td>
        </tr>


        <!-- Auto Game Piece Count -->

        <tr>
            <td class="red" colspan="2">
                1
            </td>
            <td>Auto Game Piece Count</td>
            <td class="blue" colspan="2">
                0
            </td>
        </tr>


        <!-- Auto Game Piece Points -->

        <tr class="key">
            <td class="redScore" colspan="2">
                4
            </td>
            <td>Auto Game Piece Points</td>
            <td class="blueScore" colspan="2">
                0
            </td>
        </tr>


        <!-- Robot 1 Auto Charge Station -->

        <tr>
            <td class="red" colspan="2">


                <span rel="tooltip" title="246" class="glyphicon glyphicon-remove"></span>


            </td>
            <td>Robot 1 Auto Charge Station</td>
            <td class="blue" colspan="2">


                <span rel="tooltip" title="157" class="glyphicon glyphicon-remove"></span>


            </td>
        </tr>

        <!-- Robot 2 Auto Charge Station -->

        <tr>
            <td class="red" colspan="2">


                <span rel="tooltip" title="4905" class="glyphicon glyphicon-remove"></span>


            </td>
            <td>Robot 2 Auto Charge Station</td>
            <td class="blue" colspan="2">


                <span rel="tooltip" title="4041">Docked (+8)</span>


            </td>
        </tr>

        <!-- Robot 3 Auto Charge Station -->

        <tr>
            <td class="red" colspan="2">


                <span rel="tooltip" title="2342" class="glyphicon glyphicon-remove"></span>


            </td>
            <td>Robot 3 Auto Charge Station</td>
            <td class="blue" colspan="2">


                <span rel="tooltip" title="509" class="glyphicon glyphicon-remove"></span>


            </td>
        </tr>


        <!-- Auto Points -->

        <tr class="key">
            <td class="redScore" colspan="2">
                <b>10</b>
            </td>
            <th>Total Auto</th>
            <td class="blueScore" colspan="2">
                <b>11</b>
            </td>
        </tr>


        <!-- Teleop -->
        <!-- Game Piece Count -->

        <tr>
            <td class="red" colspan="2">
                10
            </td>
            <td>Game Piece Count</td>
            <td class="blue" colspan="2">
                5
            </td>
        </tr>

        <!-- Game Piece Points -->

        <tr class="key">
            <td class="redScore" colspan="2">
                22
            </td>
            <td>Game Piece Points</td>
            <td class="blueScore" colspan="2">
                14
            </td>
        </tr>


        <!-- Robot 1 Endgame -->

        <tr>
            <td class="red" colspan="2">


                <span rel="tooltip" title="246">Engaged (+10)</span>


            </td>
            <td>Robot 1 Endgame</td>
            <td class="blue" colspan="2">


                <span rel="tooltip" title="157">Docked (+6)</span>


            </td>
        </tr>

        <!-- Robot 2 Endgame -->

        <tr>
            <td class="red" colspan="2">


                <span rel="tooltip" title="4905" class="glyphicon glyphicon-remove"></span>


            </td>
            <td>Robot 2 Endgame</td>
            <td class="blue" colspan="2">


                <span rel="tooltip" title="4041">Park (+2)</span>


            </td>
        </tr>

        <!-- Robot 3 Endgame -->

        <tr>
            <td class="red" colspan="2">


                <span rel="tooltip" title="" class="glyphicon glyphicon-remove" data-original-title="2342"></span>


            </td>
            <td>Robot 3 Endgame</td>
            <td class="blue" colspan="2">


                <span rel="tooltip" title="509">Docked (+6)</span>


            </td>
        </tr>


        <!-- Teleop Score -->

        <tr class="key">
            <td class="redScore" colspan="2">
                <b>32</b>
            </td>
            <th>Total Teleop</th>
            <td class="blueScore" colspan="2">
                <b>28</b>
            </td>
        </tr>


        <!-- Links -->

        <tr>
            <td class="red" colspan="2">
                1 (+5)
            </td>
            <td>Links</td>
            <td class="blue" colspan="2">
                0 (+0)
            </td>
        </tr>


        <!-- Coopoertition Bonus -->

        <tr>
            <td class="red" colspan="2">


                <span class="glyphicon glyphicon-ok"></span>


            </td>
            <td>Coopertition Criteria Met</td>
            <td class="blue" colspan="2">


                <span class="glyphicon glyphicon-remove"></span>


            </td>
        </tr>


        <!-- Bonus RP -->

        <tr>
            <td class="red" colspan="2">


                <span class="glyphicon glyphicon-remove"></span>


            </td>
            <td>Sustainability Bonus</td>
            <td class="blue" colspan="2">


                <span class="glyphicon glyphicon-remove"></span>


            </td>
        </tr>


        <tr>
            <td class="red" colspan="2">


                <span class="glyphicon glyphicon-remove"></span>


            </td>
            <td>Activation Bonus</td>
            <td class="blue" colspan="2">


                <span class="glyphicon glyphicon-remove"></span>


            </td>
        </tr>


        <!-- Fouls & Adjustments -->

        <tr>
            <td class="red" colspan="2">

                0 /
                0

            </td>
            <td>Fouls / Tech Fouls</td>
            <td class="blue" colspan="2">

                3 (+15) /
                0

            </td>
        </tr>


        <tr>
            <td class="red" colspan="2">0</td>
            <td>Adjustments</td>
            <td class="blue" colspan="2">0</td>
        </tr>


        <tr class="key">
            <td class="redScore" colspan="2"><b>47</b></td>
            <th>Total Score</th>
            <td class="blueScore" colspan="2"><b>54</b></td>
        </tr>

        <tr>
            <td class="red" colspan="2">


                +0 RP
            </td>
            <td>Ranking Points</td>
            <td class="blue" colspan="2">


                +2 RP
            </td>
        </tr>
        </tbody>
    </table>

    <h3>Scoring Location Breakdown</h3>

    <table class="match-table">
        <tbody>
        <tr class="key">
            <td>Top</td>
            <td>Mid</td>
            <td>Bot</td>
            <td></td>
            <td>Bot</td>
            <td>Mid</td>
            <td>Top</td>
        </tr>
        <tr>
            <td class="red">


                <svg width="24px" height="216px" style="display: block; margin: auto;">

                    <g transform="translate(0, 0)">

                        <rect x="1" y="1" width="22" height="22" rx="4" style="fill:rgb(0,0,0,0); stroke:rgb(0,0,0,0.2)"></rect>


                    </g>

                    <g transform="translate(0, 24)">

                        <rect x="1" y="1" width="22" height="22" rx="4" style="fill:rgb(0,0,0,0); stroke:rgb(0,0,0,0.2)"></rect>


                    </g>

                    <g transform="translate(0, 48)">

                        <rect x="1" y="1" width="22" height="22" rx="4" style="fill:rgb(0,0,0,0); stroke:rgb(0,0,0,0.2)"></rect>


                    </g>

                    <g transform="translate(0, 72)">

                        <rect x="1" y="1" width="22" height="22" rx="4" style="fill:rgb(0,0,0,0); stroke:rgb(0,0,0,0.2)"></rect>


                    </g>

                    <g transform="translate(0, 96)">

                        <rect x="1" y="1" width="22" height="22" rx="4" style="fill:rgb(0,0,0,0); stroke:rgb(0,0,0,0.2)"></rect>


                    </g>

                    <g transform="translate(0, 120)">

                        <rect x="1" y="1" width="22" height="22" rx="4" style="fill:rgb(0,0,0,0); stroke:rgb(0,0,0,0.2)"></rect>


                    </g>

                    <g transform="translate(0, 144)">

                        <rect x="1" y="1" width="22" height="22" rx="4" style="fill:rgb(0,0,0,0); stroke:rgb(0,0,0,0.2)"></rect>


                    </g>

                    <g transform="translate(0, 168)">

                        <rect x="1" y="1" width="22" height="22" rx="4" style="fill:rgb(0,0,0,0); stroke:rgb(0,0,0,0.2)"></rect>


                    </g>

                    <g transform="translate(0, 192)">

                        <rect x="1" y="1" width="22" height="22" rx="4" style="fill:rgb(0,0,0,0); stroke:rgb(0,0,0,0.2)"></rect>


                    </g>


                </svg>

            </td>
            <td class="red">


                <svg width="24px" height="216px" style="display: block; margin: auto;">

                    <g transform="translate(0, 0)">

                        <rect x="1" y="1" width="22" height="22" rx="4" style="fill:rgb(0,0,0,0); stroke:rgb(0,0,0,0.2)"></rect>


                        <polygon points="12,5 8,20 5,20 19,20 16,20" style="fill:rgb(255,200,0);stroke-width:1;stroke:rgb(0,0,0)"></polygon>


                    </g>

                    <g transform="translate(0, 24)">

                        <rect x="1" y="1" width="22" height="22" rx="4" style="fill:rgb(0,0,0,0); stroke:rgb(0,0,0,0.2)"></rect>


                    </g>

                    <g transform="translate(0, 48)">

                        <rect x="1" y="1" width="22" height="22" rx="4" style="fill:rgb(0,0,0,0); stroke:rgb(0,0,0,0.2)"></rect>


                    </g>

                    <g transform="translate(0, 72)">

                        <rect x="1" y="1" width="22" height="22" rx="4" style="fill:rgb(0,0,0,0); stroke:rgb(0,0,0,0.2)"></rect>


                    </g>

                    <g transform="translate(0, 96)">

                        <rect x="1" y="1" width="22" height="22" rx="4" style="fill:rgb(0,255,0,0.3); stroke:rgb(0,0,0,0.2)"></rect>


                        <polygon points="6,6 6,18 18,18, 18,6" style="fill:rgb(150,0,255);stroke-width:1;stroke:rgb(0,0,0)"></polygon>


                    </g>

                    <g transform="translate(0, 120)">

                        <rect x="1" y="1" width="22" height="22" rx="4" style="fill:rgb(0,0,0,0); stroke:rgb(0,0,0,0.2)"></rect>


                    </g>

                    <g transform="translate(0, 144)">

                        <rect x="1" y="1" width="22" height="22" rx="4" style="fill:rgb(0,0,0,0); stroke:rgb(0,0,0,0.2)"></rect>


                        <polygon points="12,5 8,20 5,20 19,20 16,20" style="fill:rgb(255,200,0);stroke-width:1;stroke:rgb(0,0,0)"></polygon>


                    </g>

                    <g transform="translate(0, 168)">

                        <rect x="1" y="1" width="22" height="22" rx="4" style="fill:rgb(0,0,0,0); stroke:rgb(0,0,0,0.2)"></rect>


                        <polygon points="6,6 6,18 18,18, 18,6" style="fill:rgb(150,0,255);stroke-width:1;stroke:rgb(0,0,0)"></polygon>


                    </g>

                    <g transform="translate(0, 192)">

                        <rect x="1" y="1" width="22" height="22" rx="4" style="fill:rgb(0,0,0,0); stroke:rgb(0,0,0,0.2)"></rect>


                        <polygon points="12,5 8,20 5,20 19,20 16,20" style="fill:rgb(255,200,0);stroke-width:1;stroke:rgb(0,0,0)"></polygon>


                    </g>


                    [0, 1, 2]


                    <rect x="2" y="146" width="20" height="69" rx="4" style="fill:rgb(0,0,0,0.0); stroke-width:2; stroke:rgb(0,0,0,1.0)"></rect>


                </svg>

            </td>
            <td class="red">


                <svg width="24px" height="216px" style="display: block; margin: auto;">

                    <g transform="translate(0, 0)">

                        <rect x="1" y="1" width="22" height="22" rx="4" style="fill:rgb(0,0,0,0); stroke:rgb(0,0,0,0.2)"></rect>


                        <polygon points="6,6 6,18 18,18, 18,6" style="fill:rgb(150,0,255);stroke-width:1;stroke:rgb(0,0,0)"></polygon>


                    </g>

                    <g transform="translate(0, 24)">

                        <rect x="1" y="1" width="22" height="22" rx="4" style="fill:rgb(0,0,0,0); stroke:rgb(0,0,0,0.2)"></rect>


                    </g>

                    <g transform="translate(0, 48)">

                        <rect x="1" y="1" width="22" height="22" rx="4" style="fill:rgb(0,0,0,0); stroke:rgb(0,0,0,0.2)"></rect>


                    </g>

                    <g transform="translate(0, 72)">

                        <rect x="1" y="1" width="22" height="22" rx="4" style="fill:rgb(0,0,0,0); stroke:rgb(0,0,0,0.2)"></rect>


                    </g>

                    <g transform="translate(0, 96)">

                        <rect x="1" y="1" width="22" height="22" rx="4" style="fill:rgb(0,0,0,0); stroke:rgb(0,0,0,0.2)"></rect>


                        <polygon points="6,6 6,18 18,18, 18,6" style="fill:rgb(150,0,255);stroke-width:1;stroke:rgb(0,0,0)"></polygon>


                    </g>

                    <g transform="translate(0, 120)">

                        <rect x="1" y="1" width="22" height="22" rx="4" style="fill:rgb(0,0,0,0); stroke:rgb(0,0,0,0.2)"></rect>


                        <polygon points="12,5 8,20 5,20 19,20 16,20" style="fill:rgb(255,200,0);stroke-width:1;stroke:rgb(0,0,0)"></polygon>


                    </g>

                    <g transform="translate(0, 144)">

                        <rect x="1" y="1" width="22" height="22" rx="4" style="fill:rgb(0,0,0,0); stroke:rgb(0,0,0,0.2)"></rect>


                    </g>

                    <g transform="translate(0, 168)">

                        <rect x="1" y="1" width="22" height="22" rx="4" style="fill:rgb(0,0,0,0); stroke:rgb(0,0,0,0.2)"></rect>


                        <polygon points="6,6 6,18 18,18, 18,6" style="fill:rgb(150,0,255);stroke-width:1;stroke:rgb(0,0,0)"></polygon>


                    </g>

                    <g transform="translate(0, 192)">

                        <rect x="1" y="1" width="22" height="22" rx="4" style="fill:rgb(0,0,0,0); stroke:rgb(0,0,0,0.2)"></rect>


                        <polygon points="12,5 8,20 5,20 19,20 16,20" style="fill:rgb(255,200,0);stroke-width:1;stroke:rgb(0,0,0)"></polygon>


                    </g>


                </svg>

            </td>
            <td></td>
            <td class="blue">


                <svg width="24px" height="216px" style="display: block; margin: auto;">

                    <g transform="translate(0, 0)">

                        <rect x="1" y="1" width="22" height="22" rx="4" style="fill:rgb(0,0,0,0); stroke:rgb(0,0,0,0.2)"></rect>


                    </g>

                    <g transform="translate(0, 24)">

                        <rect x="1" y="1" width="22" height="22" rx="4" style="fill:rgb(0,0,0,0); stroke:rgb(0,0,0,0.2)"></rect>


                    </g>

                    <g transform="translate(0, 48)">

                        <rect x="1" y="1" width="22" height="22" rx="4" style="fill:rgb(0,0,0,0); stroke:rgb(0,0,0,0.2)"></rect>


                    </g>

                    <g transform="translate(0, 72)">

                        <rect x="1" y="1" width="22" height="22" rx="4" style="fill:rgb(0,0,0,0); stroke:rgb(0,0,0,0.2)"></rect>


                        <polygon points="6,6 6,18 18,18, 18,6" style="fill:rgb(150,0,255);stroke-width:1;stroke:rgb(0,0,0)"></polygon>


                    </g>

                    <g transform="translate(0, 96)">

                        <rect x="1" y="1" width="22" height="22" rx="4" style="fill:rgb(0,0,0,0); stroke:rgb(0,0,0,0.2)"></rect>


                    </g>

                    <g transform="translate(0, 120)">

                        <rect x="1" y="1" width="22" height="22" rx="4" style="fill:rgb(0,0,0,0); stroke:rgb(0,0,0,0.2)"></rect>


                    </g>

                    <g transform="translate(0, 144)">

                        <rect x="1" y="1" width="22" height="22" rx="4" style="fill:rgb(0,0,0,0); stroke:rgb(0,0,0,0.2)"></rect>


                        <polygon points="6,6 6,18 18,18, 18,6" style="fill:rgb(150,0,255);stroke-width:1;stroke:rgb(0,0,0)"></polygon>


                    </g>

                    <g transform="translate(0, 168)">

                        <rect x="1" y="1" width="22" height="22" rx="4" style="fill:rgb(0,0,0,0); stroke:rgb(0,0,0,0.2)"></rect>


                    </g>

                    <g transform="translate(0, 192)">

                        <rect x="1" y="1" width="22" height="22" rx="4" style="fill:rgb(0,0,0,0); stroke:rgb(0,0,0,0.2)"></rect>


                        <polygon points="6,6 6,18 18,18, 18,6" style="fill:rgb(150,0,255);stroke-width:1;stroke:rgb(0,0,0)"></polygon>


                    </g>


                </svg>

            </td>
            <td class="blue">


                <svg width="24px" height="216px" style="display: block; margin: auto;">

                    <g transform="translate(0, 0)">
                        <rect x="1" y="1" width="22" height="22" rx="4" style="fill:rgb(0,0,0,0); stroke:rgb(0,0,0,0.2)"></rect>
                    </g>

                    <g transform="translate(0, 24)">
                        <rect x="1" y="1" width="22" height="22" rx="4" style="fill:rgb(0,0,0,0); stroke:rgb(0,0,0,0.2)"></rect>
                    </g>

                    <g transform="translate(0, 48)">
                        <rect x="1" y="1" width="22" height="22" rx="4" style="fill:rgb(0,0,0,0); stroke:rgb(0,0,0,0.2)"></rect>
                    </g>

                    <g transform="translate(0, 72)">
                        <rect x="1" y="1" width="22" height="22" rx="4" style="fill:rgb(0,0,0,0); stroke:rgb(0,0,0,0.2)"></rect>
                    </g>

                    <g transform="translate(0, 96)">
                        <rect x="1" y="1" width="22" height="22" rx="4" style="fill:rgb(0,0,0,0); stroke:rgb(0,0,0,0.2)"></rect>

                        <polygon points="6,6 6,18 18,18, 18,6" style="fill:rgb(150,0,255);stroke-width:1;stroke:rgb(0,0,0)"></polygon>


                    </g>

                    <g transform="translate(0, 120)">

                        <rect x="1" y="1" width="22" height="22" rx="4" style="fill:rgb(0,0,0,0); stroke:rgb(0,0,0,0.2)"></rect>


                    </g>

                    <g transform="translate(0, 144)">

                        <rect x="1" y="1" width="22" height="22" rx="4" style="fill:rgb(0,0,0,0); stroke:rgb(0,0,0,0.2)"></rect>


                    </g>

                    <g transform="translate(0, 168)">

                        <rect x="1" y="1" width="22" height="22" rx="4" style="fill:rgb(0,0,0,0); stroke:rgb(0,0,0,0.2)"></rect>


                    </g>

                    <g transform="translate(0, 192)">

                        <rect x="1" y="1" width="22" height="22" rx="4" style="fill:rgb(0,0,0,0); stroke:rgb(0,0,0,0.2)"></rect>


                    </g>


                </svg>

            </td>
            <td class="blue">


                <svg width="24px" height="216px" style="display: block; margin: auto;">

                    <g transform="translate(0, 0)">
                        <rect x="1" y="1" width="22" height="22" rx="4" style="fill:rgb(0,0,0,0); stroke:rgb(0,0,0,0.2)"></rect>
                    </g>

                    <g transform="translate(0, 24)">
                        <rect x="1" y="1" width="22" height="22" rx="4" style="fill:rgb(0,0,0,0); stroke:rgb(0,0,0,0.2)"></rect>
                    </g>

                    <g transform="translate(0, 48)">
                        <rect x="1" y="1" width="22" height="22" rx="4" style="fill:rgb(0,0,0,0); stroke:rgb(0,0,0,0.2)"></rect>
                    </g>

                    <g transform="translate(0, 72)">
                        <rect x="1" y="1" width="22" height="22" rx="4" style="fill:rgb(0,0,0,0); stroke:rgb(0,0,0,0.2)"></rect>
                    </g>

                    <g transform="translate(0, 96)">
                        <rect x="1" y="1" width="22" height="22" rx="4" style="fill:rgb(0,0,0,0); stroke:rgb(0,0,0,0.2)"></rect>
                    </g>

                    <g transform="translate(0, 120)">
                        <rect x="1" y="1" width="22" height="22" rx="4" style="fill:rgb(0,0,0,0); stroke:rgb(0,0,0,0.2)"></rect>
                    </g>

                    <g transform="translate(0, 144)">
                        <rect x="1" y="1" width="22" height="22" rx="4" style="fill:rgb(0,0,0,0); stroke:rgb(0,0,0,0.2)"></rect>
                    </g>

                    <g transform="translate(0, 168)">
                        <rect x="1" y="1" width="22" height="22" rx="4" style="fill:rgb(0,0,0,0); stroke:rgb(0,0,0,0.2)"></rect>
                    </g>

                    <g transform="translate(0, 192)">
                        <rect x="1" y="1" width="22" height="22" rx="4" style="fill:rgb(0,0,0,0); stroke:rgb(0,0,0,0.2)"></rect>
                        <polygon points="12,5 8,20 5,20 19,20 16,20" style="fill:rgb(255,200,0);stroke-width:1;stroke:rgb(0,0,0)"></polygon>
                    </g>


                </svg>

            </td>
        </tr>
        </tbody>
    </table>

    <div style="display: flex; flex-direction: row; align-items: center;">
        <svg width="24px" height="24px" style="margin-right: 8px;">
            <polygon points="12,5 8,20 5,20 19,20 16,20" style="fill:rgb(255,200,0);stroke-width:1;stroke:rgb(0,0,0)"></polygon>
        </svg>
        Cone
    </div>
    <div style="display: flex; flex-direction: row; align-items: center;">
        <svg width="24px" height="24px" style="margin-right: 8px;">
            <polygon points="6,6 6,18 18,18, 18,6" style="fill:rgb(150,0,255);stroke-width:1;stroke:rgb(0,0,0)"></polygon>
        </svg>
        Cube
    </div>
    <div style="display: flex; flex-direction: row; align-items: center;">
        <svg width="24px" height="24px" style="margin-right: 8px;">
            <rect width="24" height="24" style="fill:rgb(0,255,0,0.3); stroke-width:1; stroke:rgb(0,0,0,0.2)"></rect>
        </svg>
        Scored in auto
    </div>
    <div style="display: flex; flex-direction: row; align-items: center;">
        <svg width="24px" height="24px" style="margin-right: 8px;">
            <rect x="2" y="2" width="20" height="20" rx="4" style="fill:rgb(0,0,0,0); stroke-width:2; stroke:rgb(0,0,0,1.0)"></rect>
        </svg>
        Link
    </div>

    <pre>
	BLUE
        {JSON.stringify(match?.scoreBreakdown?.blue, null, "    ")}
    </pre>
    <pre>
      RED
        {JSON.stringify(match?.scoreBreakdown?.red, null, "    ")}
    </pre>
{/if}

<style>
    tr.key {
        background-color: #f0f0f0;
    }

    td.red {
        background-color: #fee;
    }

    td.blue {
        background-color: #eef;
    }

    table.match-table {
        margin: 0 0 1em auto;
        padding: 3px 0;
        width: 100%;
    }

    table.match-table > tbody > tr > td {
        border: 1px solid #ddd;
        padding: 5px;
    }

    table.match-table td {
        text-align: center;
    }
</style>
