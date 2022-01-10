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

    let match: RxDocument<Match>;

    onMount(async () => {
        const db = await getDb();

        const settingEvent = await db.settings.findOne({selector: {key: Settings.CurrentEvent}}).exec();
        if (!settingEvent) {
            let res = await Swal.fire({
                icon: "error",
                title: "Oops...",
                html: `Current event not set. Head over to Setup`,
                showCloseButton: true,
                confirmButtonText: 'Go to Setup',
            });
            if (res.isConfirmed) {
                goto("/tools/setup");
                return;
            }
        }
        let eventKey = settingEvent.value;

        match = await db.matches.findOne().where({eventKey, matchKey: $page.params.match}).exec();
    });

    let ourTeamNumber = 4909;


</script>

<div class="container-fluid">
    <a class="btn btn-info float-start" href="/match/myschedule">&lt; Schedule</a>
    <a class="btn btn-warning float-end" href="/match/objective?match={match && match.matchKey}">Re-Scout Match</a>
    <h1>Match {$page.params.match.toUpperCase()}</h1>

</div>


{#if match}
    <MatchTable match={match} ourTeamNumber={ourTeamNumber}/>

    <pre>
	BLUE
        {JSON.stringify(match.scoreBreakdown.blue, null, "    ")}
    </pre>
    <pre>
      RED
        {JSON.stringify(match.scoreBreakdown.red, null, "    ")}
    </pre>
{/if}

<style>


</style>
