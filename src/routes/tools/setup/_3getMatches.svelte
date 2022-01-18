<script lang="ts">
    import {onMount} from "svelte";
    import * as tba from "$lib/tba";
    import Select from "svelte-select";
    import Swal from "sweetalert2";
    import "sweetalert2/dist/sweetalert2.css";
    import {writable} from "svelte/store";
    import type {MyDatabase} from "$lib/store";
    import {getDb} from "$lib/store";
    import {debounce} from "$lib/debounce";
    import {TBAMatchToMatch} from "$lib/schema/match-schema";
    import {Settings} from "$lib/schema/settings-schema";
    import {TBATeamToPitReport} from "$lib/schema/pit-scout-schema";
    import SpinButton from "$lib/compontents/SpinButton.svelte";
    import {matchSort, tbaMatchSort} from "$lib/matches";
    import {Match as TBAMatch} from 'tba-api-v3client-ts';
    import comp_level = TBAMatch.comp_level;

    // List of events to choose from
    type SelectOption = { label: string, value: string };
    let eventsToSelect: SelectOption[] = [];
    let currentYear = 2020; //@todo change to new Date().getFullYear()
    let db: MyDatabase;

    async function getEventList(): Promise<SelectOption[]> {
        return (await tba.getEvents(currentYear)).map(e => ({value: e.key, label: `${e.key} - (${e.name})`}));
    }

    async function updateEventList() {
        try {
            eventsToSelect = await getEventList();
        } catch (e) {
            eventsToSelect = [];
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: `Unable to find matches for year ${currentYear}`
            });
            console.log("ERROR: ", e); //keep me
        }
    }

    let selectedEvent: writable<{ label: string, value: string } | null> = writable(null);

    onMount(async () => {
        try {
            eventsToSelect = await getEventList();
        } catch (e) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                html: `Unable to get events from TBA. <br>Error: ${e.message}`
            });
        }

        db = await getDb();
        let currentEventSetting = await db.settings.findOne({selector: {key: Settings.CurrentEvent}}).exec();

        // get the event name so the selector looks nice
        if (currentEventSetting != null) {
            for (const e of eventsToSelect) {
                if (e.value == currentEventSetting.value) {
                    selectedEvent.set(e);
                    return;
                }
            }
        }
    });


    selectedEvent.subscribe(debounce((v: { label: string, value: string }) => {
        if (v == null) {
            return;
        }
        db.settings.atomicUpsert({key: Settings.CurrentEvent, value: v.value});
    }));

    async function pullMatches() {
        if (!$selectedEvent) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Event must be selected first!"
            });
            return;
        }
        let selectedEventKey = $selectedEvent.value;
        try {
            const tbaMatches = await tba.getMatches(selectedEventKey);
            if (tbaMatches.length == 0) {
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: `TBA has no matches for ${selectedEventKey}`
                });
                return;
            }
            const sortedTbaMatches = tbaMatches.sort(tbaMatchSort);
            for (let i = 0; i < sortedTbaMatches.length; i++) {
                const m = TBAMatchToMatch(sortedTbaMatches[i]);
                m.order = i;
                if (m.compLevel == comp_level.QM) {
                    await db.matches.insert(m);
                }
            }

            const tbaTeams = await tba.getTeams(selectedEventKey);
            if (tbaTeams.length == 0) {
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: `TBA has no teams for ${selectedEventKey}`
                });
                return;
            }
            for (const team of tbaTeams) {
                const t = TBATeamToPitReport(team, selectedEventKey);
                await db.pit_scouting.insert(t);
            }

        } catch (e) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: `Unable to get data from TBA. Error: ${e.message}`
            });
        }
    }

    function uploadMatches() {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Sorry not yet implemented"
        });
    }

</script>

<div class="d-flex my-2">
    <h2 class="flex-fill">3. Pull matches from TBA or load csv</h2>
    <button class="btn btn-outline-primary ms-2 btn-sm" type="button" on:click={uploadMatches}>Upload List</button>
</div>

<div class="mb-3 d-flex">
    <div>
        <input bind:value={currentYear} on:blur={updateEventList} type="number" placeholder="Season Year"
               class="form-control me-2" style="width: 100px">
    </div>
    <div style="max-width: 52.125vw" class="flex-grow-1">
        <Select
                items={eventsToSelect}
                bind:value={$selectedEvent}
                isCreatable={true}
                containerStyles="width:100%"/>
    </div>
    <div style="min-width: 250px">
        <SpinButton class="btn-primary ms-2" onClick={pullMatches}>Pull Matches</SpinButton>
    </div>
</div>
