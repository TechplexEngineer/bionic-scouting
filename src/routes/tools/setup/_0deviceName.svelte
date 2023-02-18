<script lang="ts">
	import { writable } from "svelte/store";
	import { onMount } from "svelte";
	import { getDb } from "$lib/store";
	import { debounce } from "$lib/util";

	export let deviceName: writable<number | null> = writable(null);

	import type { MyDatabase } from "$lib/store";
    import {Settings} from "$lib/schema/settings-schema";

	let db: MyDatabase;

	onMount(async () => {
		db = await getDb();

		const query = db.settings.findOne({ selector: { key: Settings.DeviceName } });

		let entry = await query.exec();
		if (entry !== null) {
			deviceName.set(entry.value);
		}

		deviceName.subscribe(debounce(v => {
			if (!v) {
				return;
			}
			db.settings.atomicUpsert({
				key: Settings.DeviceName,
				value: v.toString(),
				updatedAt: new Date().getTime()
			});
		}, 500));
	});


</script>

<h2>0. Device Name</h2>
<input type="text" class="form-control mb-3" bind:value={$deviceName} placeholder="Strategist-1">