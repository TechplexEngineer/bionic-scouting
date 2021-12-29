<script lang="ts">
    let eventName = "";
    import * as tba from "$lib/tba";
    import Select from "svelte-select";
    import Swal from "sweetalert2";
    import "sweetalert2/dist/sweetalert2.css";
    import {Table} from "sveltestrap";
    import {matchSort} from "$lib/matches";

    let eventsToSelect = [];
    let currentYear = 2020; //@todo change to new Date().getFullYear()
    (async () => {
        eventsToSelect = (await tba.getEvents(currentYear)).map(e => ({value: e.key, label: `${e.key} - (${e.name})`}));
    })();
    let selectedEvent; //@todo load the previously selected event


    async function loadMatches() {
        if (!selectedEvent || (selectedEvent && selectedEvent.length < 2)) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Event must be selected first!"
            });
            return;
        }
        let selectedEventKey = selectedEvent.value;
        const matches = await tba.getMatches(selectedEventKey);
        // matchesTable = matches.sort(matchSort);
    }
</script>


<h2>3. Pull matches from TBA or load csv</h2>

<div class="mb-3 d-flex">
    <input bind:value={currentYear} type="text" placeholder="Season Year" class="form-control mb-2">
    <div class="flex-fill">
        <Select items={eventsToSelect} bind:value={selectedEvent}/>
    </div>

    <button class="btn btn-primary ms-2" type="button" on:click={loadMatches}>Load Matches</button>
</div>