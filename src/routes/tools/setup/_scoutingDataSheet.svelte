
<script lang="ts">

    import {writable} from "svelte/store";
    import {onMount} from "svelte";
    import type {MyDatabase} from "$lib/store";
    import {getDb} from "$lib/store";
    import {debounce, getSettingQuery} from "$lib/util";
    import {Settings} from "$lib/schema/settings-schema";
    import Swal from "sweetalert2";

    let sheetsLink: writable<string | null> = writable(null);
    let db: MyDatabase;
    onMount(async () => {
        db = await getDb();

        let entry = await getSettingQuery(db, Settings.SheetsLink).exec();
		if (entry !== null) {
			sheetsLink.set(entry.value);
		}

        sheetsLink.subscribe(debounce(v => {
            if (!v) return;

            db.settings.atomicUpsert({
                key: Settings.SheetsLink,
                value: v.toString(),
				updatedAt: new Date().getTime()
            })
        }))
    })

    const helpGoogleSheets = () => {
        Swal.fire({
            icon: "info",
            title: "Sheets Scouting Link",
            html: `Sheet must be published for public viewing. <a href="https://support.google.com/a/users/answer/9308870" target="_blank">Help Article</a>`,
            showConfirmButton: false
        });
    }

</script>

<div class="d-flex my-2">
    <h2 class="flex-fill">1/2. Link to google sheet with scouting data</h2>
    <button class="ms-2 btn btn-outline-primary" on:click={helpGoogleSheets}><i class="bi bi-question-circle-fill"></i></button>
</div>


<input type="text" class="form-control mb-3" bind:value={$sheetsLink} placeholder="https://docs.google.com/spreadsheets/d/...">