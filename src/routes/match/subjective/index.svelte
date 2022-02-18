<svelte:head>
	<title>Match Subjective</title>
</svelte:head>

<script context="module">
	// Disable server side rendering for this page
	export const ssr = false;
</script>

<script lang="ts">
	import Select from "svelte-select";
	import { TeamSort } from "$lib/teams";
	import { onMount } from "svelte";
	import { page } from "$app/stores";
	import type { MyDatabase } from "$lib/store";
	import { getDb } from "$lib/store";
	import { Settings } from "$lib/schema/settings-schema";
	import Swal from "sweetalert2";
	import { goto } from "$app/navigation";
	import { matchSort } from "$lib/matches";
	import type { RxDocument } from "rxdb";
	import type { Match } from "$lib/schema/match-schema";
	import { debounce, extractBlueTeamsFromMatch, extractRedTeamsFromMatch, extractTeamsFromMatch } from "$lib/util";

	let factNames = ["climber", "drivetrain"];
	let facts: { name: string, value: string }[] = [
		{ name: "", value: "" } // need to start with at least one to show the form
	];


	let teams = [];
	// sortedTeams.map(t => {
	// 	return {
	// 		value: t.team_number,
	// 		label: `${t.team_number}  ${"&nbsp; ".repeat(6 - t.team_number.toString().length)} ${t.nickname}`
	// 	};
	// });

	let saveStatusMessage = "...";

	let teamSelections = [];
	let selectedTeam: { label: string, value: number };

	let matches: RxDocument<Match>[] = [];
	let selectedMatch: { label: string, value: any };
	let selectedPrepMatch: { label: string, value: any };

	let db: MyDatabase;
	let eventKey = "";
	let matchSelections: { label: string, value: RxDocument<Match> }[] = [];
	let matchKey = "";
	let teamNumber: number;

	let countMatchChange = 0;
	onMount(async () => {
		db = await getDb();

		const settingEvent = await db.settings.findOne().where({ key: Settings.CurrentEvent }).exec();
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
		matches = await db.matches.find().where({ eventKey: eventKey }).exec();
		matches.sort(matchSort);
		console.log("Match:", $page.query.get("match"), " Team:", $page.query.get("team"));
		matchSelections = matches.map(m => ({ label: m.matchKey, value: m }));

		if ($page.query.get("match")) {
			for (let m of matchSelections) {
				if (m.label == $page.query.get("match")) {
					selectedMatch = m;
					break;
				}
			}
		}
		if ($page.query.get("for")) {
			for (let m of matchSelections) {
				if (m.label == $page.query.get("for")) {
					selectedPrepMatch = m;
					break;
				}
			}
		}

	});


	function handleSelectMatch(event) {
		let match: RxDocument<Match> = event.detail.value;
		console.log("selected match", match);
		teamSelections = extractRedTeamsFromMatch(match).map(t => ({ label: t + " (Red)", value: t }));
		teamSelections = teamSelections.concat(extractBlueTeamsFromMatch(match).map(t => ({
			label: t + " (Blue)",
			value: t
		})));
		matchKey = match.matchKey;
		if (countMatchChange++ == 0) {
			if ($page.query.get("team")) {
				for (let t of teamSelections) {
					if (t.value == $page.query.get("team")) {
						selectedTeam = t;
						break;
					}
				}
			}
		}
	}

	async function handleSelectTeam(event) {
		// look for existing data
		const query = {
			eventKey: eventKey,
			matchKey: matchKey
		};
		console.log("Query", query);
		let doc = await db.match_subjective.findOne().where(query).exec();

		if (!doc) {
			return; // nothing to do this will be an upsert
		}
		console.log(doc);
		notes = doc.notes;
	}

	const debouncedSaveNotes = debounce(async (notes) => { // probably should wait for the promise
		if (!(notes && notes.length > 0) || !db) {
			return;
		}
		saveStatusMessage = "Saving...";
		// console.log("v", notes);
		await db.match_subjective.atomicUpsert({
			eventKey: eventKey,
			matchKey: matchKey,
			updatedAt: new Date().getTime(),
			teamNumber: teamNumber,
			notes: notes
		});
		saveStatusMessage = "Saved.";
	}, 500);

	const notesDirty = (n) => {
		saveStatusMessage = "waiting...";
	};

	let notes = "";
	$: debouncedSaveNotes(notes); // any time notes changes save after 500ms
	$: notesDirty(notes);

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
			<Select id="match" items={matchSelections} bind:value={selectedMatch} on:select={handleSelectMatch} />
		</div>
		<div class="col">
			<label for="team">Team Number:</label>
			<Select id="team" items={teamSelections} bind:value={selectedTeam} on:select={handleSelectTeam} />
		</div>
		<div class="col">
			<label for="match">Prep For Match:</label>
			<Select id="match" items={matchSelections} bind:value={selectedPrepMatch} on:select={handleSelectMatch} />
		</div>
	</div>


	<!-- Notes -->
	<div class="form-floating mt-4">
		<textarea id="notes" class="form-control" disabled={!(selectedMatch && selectedTeam)} placeholder=" "
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
