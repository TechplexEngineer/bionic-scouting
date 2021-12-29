<script lang="ts">
	import { onMount } from "svelte";
	import * as tba from "$lib/tba";
	import Select from "svelte-select";
	import Swal from "sweetalert2";
	import "sweetalert2/dist/sweetalert2.css";
	import { writable } from "svelte/store";
	import type { MyDatabase } from "$lib/store";
	import { getDb } from "$lib/store";
	import { debounce } from "$lib/debounce";
	import { TBAMatchToMatch } from "$lib/schema/match-schema";

	// List of events to choose from
	type SelectOption = { label: string, value: string };
	let eventsToSelect: SelectOption[] = [];
	let currentYear = 2020; //@todo change to new Date().getFullYear()
	let db: MyDatabase;

	async function getEventList(): Promise<SelectOption[]> {
		return (await tba.getEvents(currentYear)).map(e => ({ value: e.key, label: `${e.key} - (${e.name})` }));
	}

	async function updateEventList() {
		console.log("Blur!");
		try {
			eventsToSelect = await getEventList();
		} catch (e) {
			eventsToSelect = [];
			Swal.fire({
				icon: "error",
				title: "Oops...",
				text: `Unable to find matches for year ${currentYear}`
			});
			console.log("ERROR: ", e);
		}
	}

	let selectedEvent: writable<{ label: string, value: string } | null> = writable(null);

	onMount(async () => {
		eventsToSelect = await getEventList();
		db = await getDb();
		let currentEventSetting = await db.settings.findOne({ selector: { key: "currentEvent" } }).exec();

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
		db.settings.upsert({ key: "currentEvent", value: v.value });
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
		const tbaMatches = await tba.getMatches(selectedEventKey);
		if (tbaMatches.length == 0) {
			Swal.fire({
				icon: "error",
				title: "Oops...",
				text: `TBA Has no matches for ${selectedEventKey}`
			});
			return;
		}
		console.log("matches", tbaMatches);
		for (const match of tbaMatches) {
			const m = TBAMatchToMatch(match);
			console.log(m);
			await db.matches.insert(m);
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


<h2>3. Pull matches from TBA or load csv</h2>

<div class="mb-3 d-flex">
	<div>
		<input bind:value={currentYear} on:blur={updateEventList} type="number" placeholder="Season Year"
					 class="form-control me-2" style="width: 100px">
	</div>
	<div style="max-width: 52.125vw" class="flex-grow-1">
		<Select items={eventsToSelect} bind:value={$selectedEvent} containerClasses="" containerStyles="width:100%" />
	</div>
	<div style="min-width: 250px">
		<button class="btn btn-primary ms-2" type="button" on:click={pullMatches}>Pull Matches</button>
		<button class="btn btn-outline-primary ms-2" type="button" on:click={uploadMatches}>Upload List</button>
	</div>
</div>
