<svelte:head>
    <title>Match Subjective</title>
</svelte:head>

<script context="module">
    // Disable server side rendering for this page
    export const ssr = false;
</script>

<script lang="ts">
    import Select from "svelte-select";
    import {onMount} from "svelte";
    import {page} from "$app/stores";
    import type {MyDatabase} from "$lib/store";
    import {getDb} from "$lib/store";
    import {Settings} from "$lib/schema/settings-schema";
    import Swal from "sweetalert2";
    import {goto} from "$app/navigation";
    import {matchSort} from "$lib/matches";
    import type {RxDocument} from "rxdb";
    import type {Match} from "$lib/schema/match-schema";
    import {debounce, extractBlueTeamsFromMatch, extractRedTeamsFromMatch, extractTeamsFromMatch} from "$lib/util";

    let factNames = ["climber", "drivetrain"];
    let facts: { name: string, value: string }[] = [
        {name: "", value: ""} // need to start with at least one to show the form
    ];

    let saveStatusMessage = "...";

    let matches: RxDocument<Match>[] = [];

    let matchSelections: { label: string, value: RxDocument<Match> }[] = [];
    let selectedMatch: { label: string, value: any };

    let teamSelections = [];
    let selectedTeam: { label: string, value: number };

    let matchForSelections: { label: string, value: RxDocument<Match> }[] = [];
    let selectedPrepMatch: { label: string, value: any };

    let db: MyDatabase;
    let eventKey = "";

    let countMatchChange = 0;
    let countMatchForChange = 0;
    onMount(async () => {
        db = await getDb();

        const settingEvent = await db.settings.findOne().where({key: Settings.CurrentEvent}).exec();
        if (!settingEvent) {
            let res = await Swal.fire({
                icon: "error",
                title: "Oops...",
                html: `Current event not set. Head over to Setup`,
                showCloseButton: true,
                confirmButtonText: "Go to Setup"
            });
            if (res.isConfirmed) {
                await goto("/tools/setup");
                return;
            }
        }
        eventKey = settingEvent.value;

        matches = await db.matches.find().where({eventKey: eventKey}).exec();
        matches.sort(matchSort);

        matchSelections = matches.map(m => ({label: m.matchKey, value: m}));

        if ($page.query.get("match")) {
            for (let m of matchSelections) {
                if (m.label == $page.query.get("match")) {
                    selectedMatch = m;
                    break;
                }
            }
        }

    });


    function handleSelectMatch(event) {
        let match: RxDocument<Match> = event.detail.value;
        // console.log("selected match", match);
        teamSelections = extractRedTeamsFromMatch(match).map(t => ({label: t + " (Red)", value: t}));
        teamSelections = teamSelections.concat(extractBlueTeamsFromMatch(match).map(t => ({
            label: t + " (Blue)",
            value: t
        })));

        if ($page.query.get("team") && countMatchChange++ == 0) {
            for (let t of teamSelections) {
                if (t.value == $page.query.get("team")) {
                    selectedTeam = t;
                    break;
                }
            }
        }
    }

    async function handleSelectTeam(event) {
        let teamNumber = event.detail.value
        matchForSelections = matches.filter((m: RxDocument<Match>) => {
            return extractTeamsFromMatch(m).includes(teamNumber)
        }).map(m => ({label: m.matchKey, value: m}));

        if ($page.query.get("for") && countMatchForChange++ == 0) {
            for (let m of matchForSelections) {
                if (m.label == $page.query.get("for")) {
                    selectedPrepMatch = m;
                    break;
                }
            }
        }
    }

    async function handleSelectPrepForMatch(event) {
        // console.log("Prep For:", event.detail.label);

        // look for existing data
        const query = {
            eventKey: eventKey,

            matchKey: selectedMatch.value.matchKey,
            teamNumber: selectedTeam.value,
            matchForKey: event.detail.label
        };
        // console.log("Query", query);
        let doc = await db.match_subjective.findOne().where(query).exec();
        // console.log("Doc:", doc);
        if (!doc) {
            notes = ""; //clear the field
            return; // nothing to do this will be an upsert
        }
        // console.log(doc);
        notes = doc.notes;
    }

    const debouncedSaveNotes = debounce(async (notes) => { // probably should wait for the promise
        if (!(notes && notes.length > 0) || !db) {
            return;
        }
        saveStatusMessage = "Saving...";
        console.log("Saving", "|", eventKey, "|", selectedMatch.value.matchKey, "|", selectedPrepMatch.label, "|", notes);
        await db.match_subjective.atomicUpsert({
            eventKey: eventKey,

            matchKey: selectedMatch.value.matchKey,
            teamNumber: selectedTeam.value,
            matchForKey: selectedPrepMatch.label,

            updatedAt: new Date().getTime(),

            notes: notes
        });
        saveStatusMessage = "Saved.";
    }, 500);

    const notesDirty = (n) => {
        saveStatusMessage = "waiting...";
    };

    const selectChange = (m, t, pm) => {
        // console.log("change", m, t, pm);
        if (!m || !t || !pm) {
            notes = "";
        }
        if (!m) {
            selectedTeam = undefined;
            teamSelections = [];
            selectedPrepMatch = undefined;
            matchForSelections = [];
        }
        if (!t) {
            selectedPrepMatch = undefined;
            matchForSelections = [];
        }
    }

    let notes = "";
    $: debouncedSaveNotes(notes); // any time notes changes save after 500ms
    $: notesDirty(notes);
    $: selectChange(selectedMatch, selectedTeam, selectedPrepMatch)

</script>

<div class="content">

    <div class="d-flex">
        <div class="flex-1">
            <a class="btn btn-info float-start" href="/">&lt; My Schedule</a>
        </div>
        <div class="flex-1 text-center">
            <h1>Match Subjective</h1>
        </div>
        <div class="flex-1 text-end">
            <!--			Nothing here yet-->
        </div>
    </div>


    <div class="row">
        <div class="col">
            <label for="match">Current Match:</label>
            <Select id="match" items={matchSelections} bind:value={selectedMatch} on:select={handleSelectMatch}/>
        </div>
        <div class="col">
            <label for="team">Team Number:</label>
            <Select id="team" items={teamSelections} bind:value={selectedTeam} on:select={handleSelectTeam}/>
        </div>
        <div class="col">
            <label for="match">Prep For Match:</label>
            <Select id="match" items={matchForSelections} bind:value={selectedPrepMatch}
                    on:select={handleSelectPrepForMatch}/>
        </div>
    </div>


    <!-- Notes -->
    <div class="form-floating mt-4">
		<textarea id="notes" class="form-control" disabled={!(selectedMatch && selectedTeam && selectedPrepMatch)}
                  placeholder=" "
                  style="height: 450px"
                  bind:value={notes}></textarea>
        <label for="notes">Notes</label>
    </div>
    <div class="float-end">
        {saveStatusMessage}
    </div>

    <!--	Facts-->
    <!--	<div class="d-flex mb-2 mt-4">-->
    <!--		<h3 class="flex-fill">Facts</h3>-->
    <!--		<button on:click={()=>{facts = [{name:"", value:""}, ...facts]}} class="btn btn-success align-self-end">+ Add-->
    <!--			Fact-->
    <!--		</button>-->
    <!--	</div>-->

    <!--	{#each facts as fact, idx}-->
    <!--		<div class="d-flex">-->
    <!--			<div class="flex-grow-1 pe-1">-->
    <!--				<Select items={factNames} bind:value={fact.value} isCreatable="true" on:select={handleSelect} />-->
    <!--			</div>-->
    <!--			<button class="btn btn-warning" on:click={()=>{-->
    <!--				if (confirm("Are you sure?")) {-->
    <!--					facts = facts.filter((f, idx) => f !== fact)-->
    <!--				}-->
    <!--			}}>Remove-->
    <!--			</button>-->
    <!--		</div>-->

    <!--		<div class="form-floating mt-1 mb-2">-->
    <!--            <textarea id="notes" class="form-control" placeholder="Leave a comment here"-->
    <!--					  style="height: 75px"></textarea>-->
    <!--			<label for="notes">Notes</label>-->
    <!--		</div>-->
    <!--	{/each}-->


    <!--	<div class="d-flex justify-content-end mt-2">-->
    <!--		<button class="btn btn-success">Save</button>-->
    <!--	</div>-->
</div>

<style>
</style>
