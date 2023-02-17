<svelte:head>
    <title>Home</title>
</svelte:head>

<script lang="ts">
    import {BluetoothSerial} from "bionic-bt-serial";
    import {onMount} from "svelte";
    import {getDb} from "$lib/store";
    import {Settings} from "$lib/schema/settings-schema";
    import {formatDateTime, getOurTeamNumber} from "$lib/util";
    import {adapterName} from "$lib/bluetooth";
    import MySchedule from "./_mySchedule.svelte";
    import type {RxDocument} from "rxdb";
    import type {SuperScout} from "$lib/schema/super-scout-schema";



    let ourTeamNumber;

    let scouts: RxDocument<SuperScout>[] = [];

    onMount(async () => {

        const db = await getDb();

        ourTeamNumber = getOurTeamNumber(db);


        let [first, number] = $adapterName.split("-");
        if (first.toUpperCase() !== "SS" && first.toUpperCase() !== "STRATEGIST") {
            return; // nothing to do for non super scouts
        }
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


    {#if $adapterName.toLowerCase().startsWith("ss")}
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


