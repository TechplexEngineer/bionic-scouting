<script lang="ts">
	import { writable } from "svelte/store";
	import { onMount } from "svelte";
	import { getDb } from "$lib/store";
    import {debounce, getOurTeamNumberQuery} from "$lib/util";

	export let ourTeamNumber: writable<number | null> = writable(null);

	import type { MyDatabase } from "$lib/store";
    import {Settings} from "$lib/schema/settings-schema";

	let db: MyDatabase;

	onMount(async () => {
		db = await getDb();

		let entry = await getOurTeamNumberQuery(db).exec();
		if (entry !== null) {
			ourTeamNumber.set(entry.value);
		}

		ourTeamNumber.subscribe(debounce(v => {
			if (!v) {
				return;
			}
			db.settings.atomicUpsert({
				key: Settings.TeamNumber,
				value: v.toString(),
				updatedAt: new Date().getTime()
			});
		}, 500));
	});


</script>

<h2>1. Enter your team number</h2>
<input type="number" class="form-control mb-3" bind:value={$ourTeamNumber} placeholder="FRC Team Number">