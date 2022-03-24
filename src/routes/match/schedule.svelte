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
    import {getCurrentEvent, getOurTeamNumber} from "$lib/util.js";

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
        <th colspan="4">Scores</th>
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
                    {t.replace('frc', '')}
                </td>
            {/each}

            {#each m.alliances.blue.teamKeys as t}
                <td class="bluebg" class:ourTeam={t.replace('frc','') == ourTeamNumber}>
                    {t.replace('frc', '')}
                </td>
            {/each}

            {#if m?.alliances?.red?.score && m?.alliances?.blue?.score}
                <td class="redbg"
                    class:fw-bold={m.alliances.red.score > m.alliances.blue.score}>{m.alliances.red.score}</td>
            {:else}
                <td class="redbg">-</td>
            {/if}
            {#if m?.alliances?.red?.rp && m?.alliances?.blue?.rp}
                <td class="redbg"
                    class:fw-bold={m.scoreBreakdown.red.rp > m.scoreBreakdown.blue.rp}>{m.scoreBreakdown.red.rp}
                    RP
                </td>
            {:else}
                <td class="redbg">-</td>
            {/if}

            {#if m?.alliances?.red?.score && m?.alliances?.blue?.score}
                <td class="bluebg"
                    class:fw-bold={m.alliances.blue.score > m.alliances.red.score}>{m.alliances.blue.score}</td>
            {:else}
                <td class="bluebg">-</td>
            {/if}
            {#if m?.alliances?.red?.rp && m?.alliances?.blue?.rp}
                <td class="bluebg"
                    class:fw-bold={m.scoreBreakdown.blue.rp > m.scoreBreakdown.red.rp}>{m.scoreBreakdown.blue.rp} RP
                </td>
            {:else}
                <td class="bluebg">-</td>
            {/if}
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
