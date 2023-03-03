<script lang="ts">


    import {onMount} from "svelte";
    import {getDb} from "$lib/store";
    import {Settings} from "$lib/schema/settings-schema";
    import Swal from "sweetalert2";
    import "sweetalert2/dist/sweetalert2.css";
    import {goto} from "$app/navigation";
    import type {RxDocument} from "rxdb";
    import type {PitReport} from "$lib/schema/pit-scout-schema";
    import {getCurrentEvent} from "$lib/util";

    let teams: RxDocument<PitReport>[] = [];

    onMount(async () => {
        const db = await getDb();

        const eventKey = await getCurrentEvent(db);

        db.pit_scouting.find().where({eventKey: eventKey}).sort('teamNumber').$.subscribe(t => {
            // console.log("teams", t);
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
            <th>Photos</th>
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
                    <span style="min-width: 10px" class="d-inline-block">{t.numAttachments || 0}</span>
                    {#if (t.numAttachments || 0) > 0}
                        <i class="bi bi-check-square text-success fw-bold"></i>
                    {:else}
                        <i class="bi bi-x-square text-danger"></i>
                    {/if}
                </td>
                <td>
                    {#if t.notes && t.notes.length > 1}
                        <a class="btn btn-sm btn-success" href="/pit?team={t.teamNumber}">ReScout</a>
                    {:else}
                        <a class="btn btn-sm btn-primary" href="/pit?team={t.teamNumber}">Pit Scout</a>
                    {/if}
                </td>
            </tr>
        {/each}

        </tbody>
    </table>
</div>