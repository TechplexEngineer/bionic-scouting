<script lang="ts">
    import {onMount} from "svelte";
    import * as tba from "$lib/tba";
    import Select from "svelte-select";
    import Swal from "sweetalert2";
    import "sweetalert2/dist/sweetalert2.css";
    import {writable} from "svelte/store";
    import type {MyDatabase} from "$lib/store";
    import {getDb} from "$lib/store";
    import {debounce} from "$lib/util";
    import {Match, TBAMatchToMatch} from "$lib/schema/match-schema";
    import {Settings} from "$lib/schema/settings-schema";
    import {PitReport, TBATeamToPitReport} from "$lib/schema/pit-scout-schema";
    import SpinButton from "$lib/compontents/SpinButton.svelte";
    import {matchSort, tbaMatchSort} from "$lib/matches";
    import {Match as TBAMatch} from "tba-api-v3client-ts";
    import comp_level = TBAMatch.comp_level;
    import {goto} from "$app/navigation";

    // List of events to choose from
    type SelectOption = { label: string, value: string };
    let eventsToSelect: SelectOption[] = [];
    let currentYear = 2022; //@todo change to new Date().getFullYear() if unset or use localstorage setting
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
        let matches = await db.matches.find().exec()
        if (matches.length > 0) {
            let res = await Swal.fire({
                icon: "danger",
                title: "Matches Already Loaded",
                html: `Do you want to remove existing matches?<br> <h3>THIS REMOVES MATCH SCOUTING DATA!!!!</h3>`,
                showCloseButton: true,
                confirmButtonText: "Clear Existing Matches & Data",
                showCancelButton: true,
                cancelButtonText: "Cancel. Make no changes."
            });
            if (!res.isConfirmed) {
                return;
            }
            await db.matches.find().remove()
        }
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

        } catch (e) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: `Unable to get data from TBA. Error: ${e.message}`
            });
        }
    }

    async function pullTeams() {
        if (!$selectedEvent) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Event must be selected first!"
            });
            return;
        }
        let selectedEventKey = $selectedEvent.value;


        let teams = await db.pit_scouting.find().exec()
        if (teams.length > 0) {
            let res = await Swal.fire({
                icon: "danger",
                title: "Teams Already Loaded",
                html: `Do you want to remove existing teams?<br> <h3>THIS REMOVES PIT SCOUTING DATA!!!!</h3>`,
                showCloseButton: true,
                confirmButtonText: "Clear Existing Teams & Data",
                showCancelButton: true,
                cancelButtonText: "Cancel. Make no changes."
            });
            if (!res.isConfirmed) {
                return;
            }
            await db.pit_scouting.find().remove()
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
    }

    let fileInput;

    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }

    async function uploadMatches(e) {
        const papa = await import("papaparse");
        let file = e.target.files[0];

        if (!confirm("This will remove Match Data. Proceed?")) {
            return;
        }

        let matches = await db.matches.find().exec()
        if (matches.length > 0) {
            let res = await Swal.fire({
                icon: "warning",
                title: "Matches Already Loaded",
                html: `Do you want to remove existing matches?`,
                showCloseButton: true,
                confirmButtonText: "Clear Existing Matches",
                showCancelButton: true,
                cancelButtonText: "Cancel. Make no changes."
            });
            if (!res.isConfirmed) {
                return;
            }
            await db.matches.find().remove()
        }


        papa.parse(file, {
            header: false,
            complete: async function (results) {

                // console.log("parse", );

                let eventKey = $selectedEvent.value;


                // await db.pit_scouting.find().remove()
                // for (let team of results.data.flat().filter(onlyUnique).filter(i => i.length > 0)) {
                //     let r: PitReport = {
                //         eventKey: eventKey,
                //         createdAt: new Date().getTime(),
                //         updatedAt: new Date().getTime(),
                //         teamNumber: parseInt(team),
                //         imageUrl: "",
                //         notes: "",
                //         facts: [],
                //     };
                //     await db.pit_scouting.insert(r);
                // }

                let counter = 1;
                for (let teams of results.data) {
                    if (teams.length != 6) {
                        return
                    }
                    let blue = teams.slice(0, 3)
                    let red = teams.slice(3, 6)
                    let matchKey = `qm${counter}`;

                    let m: Match = {
                        order: counter,
                        eventMatchKey: `${eventKey}_${matchKey}`,
                        matchKey: matchKey,
                        compLevel: 'qm', //TBAMatch.comp_level.QM,
                        alliances: {
                            red: {
                                teamKeys: red.map(t => `frc${t}`),
                                dqTeamKeys: [],
                                score: 0,
                                surrogateTeamKeys: [],
                            },
                            blue: {
                                teamKeys: blue.map(t => `frc${t}`),
                                dqTeamKeys: [],
                                score: 0,
                                surrogateTeamKeys: [],
                            }
                        },
                        eventKey: eventKey,
                        matchNumber: counter
                    }
                    counter++
                    await db.matches.insert(m);
                }


                /*
                if (scouts.length > 0) {
                    // ask if we should merge or replace
                    let response = await Swal.fire({
                        title: "Should we merge the list with the existing scouts?",
                        showDenyButton: true,
                        showCancelButton: true,
                        confirmButtonText: "Merge",
                        denyButtonText: `Replace`
                    });
                    // console.log(response, results.data);
                    if (response.isDismissed) {
                        return; // nothing to do
                    }
                    if (response.isDenied) {
                        scouts = []; //remove all scouts
                    }
                    //fallthrough, default behavior is merge
                }
                // console.log(results.data.map(i => i.name));

                // scouts = scouts.concat(results.data.flat().filter(Boolean));
                results.data.flat().filter(Boolean).map(s => {
                    if (scouts.map(a => (a.name)).includes(s)) {
                        console.log("skipping", s);
                        return;
                    }
                    scoutName = s;
                    addScout();
                });*/

            }
        });
    }

</script>

<div class="d-flex my-2">
    <h2 class="flex-fill">3. Pull matches from TBA or load csv</h2>
    <button class="btn btn-outline-primary ms-2 btn-sm" type="button" on:click={()=>{fileInput.click();}}>Upload List
    </button>
    <input type="file" class="form-control d-none" bind:this={fileInput} on:change={uploadMatches}>
</div>

<div class="d-flex mb-2">
    <div>
        <input bind:value={currentYear} on:blur={updateEventList} type="number" placeholder="Season Year"
               class="form-control me-2" style="width: 100px">
    </div>
    <div class="flex-grow-1">
        <Select
                items={eventsToSelect}
                bind:value={$selectedEvent}
                isCreatable={true}
                containerStyles="width:100%"
        />
    </div>

</div>
<div class="d-flex mb-3 justify-content-end">
    <SpinButton class="btn-primary ms-2" onClick={pullMatches}>Pull Matches</SpinButton>
    <SpinButton class="btn-info ms-2" onClick={pullTeams}>Pull Teams</SpinButton>
</div>
