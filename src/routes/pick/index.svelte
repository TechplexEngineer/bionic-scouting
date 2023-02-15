<svelte:head>
    <title>Pick List</title>
</svelte:head>

<script lang="ts">
    import Select from "svelte-select";
    import {onMount} from "svelte";
    import {getDb, MyDatabase} from "$lib/store";
    import "sweetalert2/dist/sweetalert2.css";
    import type {RxDocument} from "rxdb";
    import type {PitReport} from "$lib/schema/pit-scout-schema";
    import {getCurrentEvent} from "$lib/util";
    import {range} from "$lib/range.js";


    let db: MyDatabase;
    let eventKey: string; //eg. 2020week0 (current event)

    let teamData: RxDocument<PitReport>;
    let teamsToChoose: { label: string, value: string }[] = [];

    onMount(async () => {
        db = await getDb();

        eventKey = await getCurrentEvent(db);

        const teams = await db.pit_scouting.find().where({eventKey}).sort({teamNumber: "asc"}).exec();
        teamsToChoose = teams.map(t => {
            return {
                value: `${t.teamNumber}`,
                label: `${t.teamNumber}  ${"&nbsp; ".repeat(6 - t.teamNumber.toString().length)} ${t.nickname}`
            };
        });

    });



    async function handleSelectTeam(event) {
        const teamNumber = event.detail.value;
        console.log(event.detail);
        // teamsToChoose = teamsToChoose.filter()
    }




</script>

<div class="content">

    <div class="d-flex">
        <div class="flex-1">
            <!--            First-->
        </div>
        <div class="flex-1 text-center">
            <h1>Pick List</h1>
        </div>
        <div class="flex-1 text-end">
            <a href="/team" class="btn btn-info">Team List</a>
        </div>
    </div>

    {#each range(1,teamsToChoose.length) as i}
        <div class="d-flex mb-2">
            <div style="width: 50px">
                {i}
            </div>
            <div class="flex-grow-1">
                <Select id={`team-${i}`} items={teamsToChoose}  on:select={handleSelectTeam} class="mb-2"/>
            </div>
        </div>

    {/each}






</div>

<style>
</style>
