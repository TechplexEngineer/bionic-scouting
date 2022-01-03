<script lang="ts">


    import {onMount} from "svelte";
    import {getDb} from "$lib/store";
    import {Settings} from "$lib/schema/settings-schema";
    import Swal from "sweetalert2";
    import "sweetalert2/dist/sweetalert2.css";
    import {goto} from "$app/navigation";
    import type {RxDocument} from "rxdb";
    import type {PitReport} from "$lib/schema/pit-scout-schema";

    let teams: RxDocument<PitReport>[] = [];

    onMount(async () => {
        const db = await getDb();

        const settingEvent = await db.settings.findOne({selector: {key: Settings.CurrentEvent}}).exec();
        if (!settingEvent) {
            let res = await Swal.fire({
                icon: "error",
                title: "Oops...",
                html: `Current event not set. Head over to Setup`,
                showCloseButton: true,
                confirmButtonText: 'Go to Setup',
            });
            if (res.isConfirmed) {
                await goto("/tools/setup");
                return;
            }
        }

        db.pit_scouting.find().where({eventKey: settingEvent.value}).sort('teamNumber').$.subscribe(t => {
            console.log("teams", t);
            teams = t;
        });
    });
</script>

<div class="container-fluid">
    <h1>Teams</h1>
    <table class="table table-striped">
        <thead>
        <tr>
            <th>Number</th>
            <th>Name</th>
            <th></th>
        </tr>
        </thead>
        <tbody>
        {#each teams as t}
            <tr>
                <td>
                    <a href="/team/{t.teamNumber}">{t.teamNumber}</a>
                </td>
                <td>{t.nickname}</td>
                <td>
                    <a class="btn btn-sm btn-primary" href="/pit?team={t.teamNumber}">Scout</a>
                </td>
            </tr>
        {/each}

        </tbody>
    </table>
</div>