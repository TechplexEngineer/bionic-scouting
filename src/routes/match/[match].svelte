<svelte:head>
    <title>Match</title>
</svelte:head>

<script context="module">
    // Disable server side rendering for this page
    export const ssr = false;
</script>


<script lang="ts">
    import {page} from "$app/stores";
    import {Matches} from "$lib/matches";

    import Swal from "sweetalert2";
    import MatchTable from "$lib/_matchTable.svelte"

    function getMatch(key: string) {
        for (const m of Matches) {
            if (m.key.split("_")[1] == key) {
                return m;
            }
        }
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Invalid match" + key
        });
    }

    let match = {};
    $: match = getMatch($page.params.match);

    let ourTeamNumber = 4909;

</script>

<div class="container-fluid">
    <a class="btn btn-info float-start" href="schedule">&lt; Schedule</a>
    <h1>Match {$page.params.match.toUpperCase()}</h1>
</div>


{#if match}
    <MatchTable match={match} ourTeamNumber={ourTeamNumber}/>

    <pre>
	BLUE
        {JSON.stringify(match.score_breakdown.blue, null, "    ")}
    </pre>
    <pre>
      RED
        {JSON.stringify(match.score_breakdown.red, null, "    ")}
    </pre>
{/if}

<style>


</style>
