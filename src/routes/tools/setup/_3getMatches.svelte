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
    import "bootstrap-icons/font/bootstrap-icons.css"

    // List of events to choose from
    type SelectOption = { label: string, value: string };
    let eventsToSelect: SelectOption[] = [];
    let currentYear = 2024; //@todo change to new Date().getFullYear() if unset or use localstorage setting
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
        let matches = await db.matches.find().where({eventKey: selectedEventKey}).exec()
        if (matches.length > 0) {
            let res = await Swal.fire({
                icon: "error",
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
                let m = TBAMatchToMatch(sortedTbaMatches[i]);
                // for testing... Don't commit this

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
            throw e
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

        let teams = await db.pit_scouting.find().where({eventKey: selectedEventKey}).exec()
        if (teams.length > 0) {
            let res = await Swal.fire({
                icon: "error",
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
            await db.pit_scouting.find().where({eventKey: selectedEventKey}).remove()
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
    let teamFileInput;

    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }

    async function uploadMatches(e) {
        const papa = await import("papaparse");
        let file = e.target.files[0];

        if (!confirm("This will remove Match Data. Proceed?")) {
            return;
        }

        let matches = await db.matches.find().where({eventKey: $selectedEvent.value}).exec()
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


                let eventKey = $selectedEvent.value;

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

            }
        });
    }

    async function uploadTeams(e) {
        const papa = await import("papaparse");
        let file = e.target.files[0];

        if (!confirm("This will remove Pit Scouting Data. Proceed?")) {
            return;
        }

        let pitData = await db.pit_scouting.find().exec()
        if (pitData.length > 0) {
            let res = await Swal.fire({
                icon: "warning",
                title: "Teams Already Loaded",
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
                let eventKey = $selectedEvent.value;

                console.log(results.data);

                for (let teamArr of results.data) {
                    console.log(teamArr)
                    let teamNumber = teamArr[0];
                    let teamName = teamArr[1];


                    let m: PitReport = {
                        eventKey: eventKey,
                        teamNumber: parseInt(teamNumber),
                        nickname: teamName
                    }

                    await db.pit_scouting.insert(m);
                }
                console.log("done inserting")

            }
        });
    }

    const helpMatchList = () => {
        Swal.fire({
            icon: "info",
            title: "Match List format",
            text: "Comma Separated Values (CSV) with no headers. Columns are: Bue 1, Blue 2, Blue 3, Red 1, Red 2, Red 3",
            showConfirmButton: false
        });
    }
    const helpTeamList = () => {
        Swal.fire({
            icon: "info",
            title: "Team List format",
            text: "Comma Separated Values (CSV) with no headers, Columns are: Team Number, Team Name",
            showConfirmButton: false
        });
    }

</script>

<div class="d-flex my-2">
    <h2 class="flex-fill">2. Pull matches from TBA or load csv</h2>
    <button class="btn btn-outline-primary ms-2 btn-sm" type="button" on:click={()=>{fileInput.click();}}>Upload Match List
    </button>
    <button class="ms-2 btn btn-outline-primary" on:click={helpMatchList}><i class="bi bi-question-circle-fill"></i></button>
    <input type="file" class="form-control d-none" bind:this={fileInput} on:change={uploadMatches}>
    <input type="file" class="form-control d-none" bind:this={teamFileInput} on:change={uploadTeams}>
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
    <button class="btn btn-outline-primary ms-2 btn-sm" type="button" on:click={()=>{teamFileInput.click();}}>Upload Team List
    </button>
    <button class="ms-2 btn btn-outline-primary" on:click={helpTeamList}><i class="bi bi-question-circle-fill"></i></button>
    <a href="/sync" class="btn btn-warning ms-2">Go to Sync</a>
</div>
