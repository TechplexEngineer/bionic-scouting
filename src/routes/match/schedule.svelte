<svelte:head>
    <title>Match Schedule</title>
</svelte:head>

<script context="module">
    // Disable server side rendering for this page
    export const ssr = false;
</script>

<script>
    import {Table} from "sveltestrap";
    import {onMount} from "svelte";
    import {getDb} from "$lib/store";
    import {Settings} from "$lib/schema/settings-schema";
    import {matchSort} from "$lib/matches";
    import Swal from "sweetalert2";
    import "sweetalert2/dist/sweetalert2.css";
    import {goto} from "$app/navigation";
    import {getCurrentEvent, getOurTeamNumber} from "$lib/util";

    let ourTeamNumber = -1;
    let matches = [];
    onMount(async () => {
        const db = await getDb();

        const eventKey = await getCurrentEvent(db);
        ourTeamNumber = await getOurTeamNumber(db);

        db.matches.find({selector: {eventKey: eventKey}}).$.subscribe(m => {
            m.sort(matchSort)
            matches = m;
        })
    })
</script>


<div class="container-fluid">
    <h1>Match Schedule</h1>
</div>

<Table striped>
    <thead>
    <tr>
        <th>Match</th>
        <th colspan="3">Red Alliance</th>
        <th colspan="3">Blue Alliance</th>
<!--        <th colspan="4">Scores</th>-->
    </tr>
    </thead>
    <tbody>
    {#each matches as m}
        <tr>
            <td>
                <a href="/match/{m.matchKey}">{m.matchKey.toUpperCase()}</a>
            </td>

            {#each m.alliances.red.teamKeys as t}
                <td class="redbg" class:ourTeam={t.replace('frc','') == ourTeamNumber}>
                    <a href="/match/subjective?match={m.matchKey}&team={t.replace('frc', '')}" class="text-reset text-decoration-none">{t.replace('frc', '')}</a>
                </td>
            {/each}

            {#each m.alliances.blue.teamKeys as t}
                <td class="bluebg" class:ourTeam={t.replace('frc','') == ourTeamNumber}>
                    <a href="/match/subjective?match={m.matchKey}&team={t.replace('frc', '')}" class="text-reset text-decoration-none">{t.replace('frc', '')}</a>
                </td>
            {/each}


        </tr>
    {/each}
    </tbody>
</Table>

<style>
    .bluebg {
        background-color: rgb(201, 218, 248)
    }

    .ourTeam {
        filter: brightness(80%);
    }

    .redbg {
        background-color: rgb(244, 204, 204)
    }
</style>
