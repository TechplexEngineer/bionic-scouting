<script lang="ts">
	import { writable } from "svelte/store";
	import { onMount } from "svelte";
	import { getDb } from "$lib/store";
	import { debounce } from "$lib/debounce";

	export let ourTeamNumber: writable<number | null> = writable(null);

	let db;

	onMount(async () => {
		db = await getDb();
	});


	ourTeamNumber.subscribe(debounce(v => {
		console.log("Value:", v);
	}, 500));
</script>

<h2>1. Enter your team number</h2>
<input type="number" class="form-control mb-3" bind:value={$ourTeamNumber} placeholder="FRC Team Number">