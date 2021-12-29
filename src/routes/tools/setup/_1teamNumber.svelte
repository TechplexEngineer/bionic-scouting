<script lang="ts">
    import {writable} from "svelte/store";
    import {onMount} from "svelte";
    import {getDb} from "$lib/store";
    import {debounce} from "$lib/debounce";

    export let ourTeamNumber: writable<number | null> = writable(null);

    import type {MyDatabase} from '$lib/store';

    let db: MyDatabase;

    onMount(async () => {
        db = await getDb();

        const query = db.settings.findOne({selector: {key: 'ourTeamNumber'}})

        console.log(await query.exec());

        let entry = await query.exec()
        if (entry !== null) {
            ourTeamNumber.set(entry.value)
        }

        ourTeamNumber.subscribe(debounce(v => {
            console.log("Value:", v);
            if (!v) {
                return
            }
            db.settings.upsert({
                key: 'ourTeamNumber',
                value: v.toString(),
                updatedAt: new Date().getTime()
            })
        }, 500));
    });


</script>

<h2>1. Enter your team number</h2>
<input type="number" class="form-control mb-3" bind:value={$ourTeamNumber} placeholder="FRC Team Number">