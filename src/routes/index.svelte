<svelte:head>
    <title>Home</title>
</svelte:head>

<script lang="ts">
    import {onMount} from "svelte";
    import {getDb} from "$lib/store";
    import {formatDateTime, getDeviceNameQuery, getOurTeamNumber} from "$lib/util";
    import MySchedule from "./_mySchedule.svelte";
    import type {RxDocument} from "rxdb";
    import type {SuperScout} from "$lib/schema/super-scout-schema";



    let ourTeamNumber;
    let deviceName = "";

    let scouts: RxDocument<SuperScout>[] = [];
    let isStrategist = false;

    onMount(async () => {

        const db = await getDb();

        ourTeamNumber = getOurTeamNumber(db);

        const a = await getDeviceNameQuery(db).exec();

        if (a) {
            deviceName = a.value;
        } else {
            return
        }

        console.log("deviceName", deviceName);
        let [first, number] = deviceName.split("-");
        console.log(first, number);
        if (first.toUpperCase() !== "SS" && first.toUpperCase() !== "STRATEGIST") {
            return; // nothing to do for non-strategists
        }
        isStrategist = true;
        if (number.toLowerCase() == "lead") {
            // show all
            scouts = await db.super_scouts.find().where({active: true}).sort({createdAt: "asc"}).exec();
        } else {
            scouts = await db.super_scouts.find().where({active: true}).sort({createdAt: "asc"}).skip(number - 1).limit(1).exec();
        }

    });


</script>

<div class="container-fluid">
    <a id="top" style="visibility: hidden">Top Anchor</a>


    {#if isStrategist}
        {#if scouts.length > 1}
            <h3>Super Scouts</h3>
            <ul>
                {#each scouts as scout}
                    <li class="mt-2">Jump To <a href="#{scout.name}">{scout.name}</a></li>
                {/each}
            </ul>
        {/if}
        {#each scouts as scout}
            <a id={scout.name} style="visibility: hidden">Scout Anchor</a>
            <MySchedule scout={scout}/>
        {/each}

    {/if}
</div>


