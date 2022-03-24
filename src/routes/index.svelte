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

    let deviceName = "...";
    let eventName = "...";

    let ourTeamNumber;

    let scouts: RxDocument<SuperScout>[] = [];

    onMount(async () => {
        deviceName = (await BluetoothSerial.getName()).result;
        const db = await getDb();
        db.settings.findOne({selector: {key: Settings.CurrentEvent}}).$.subscribe(v => {
            // console.log(v);
            if (v && v.value) {
                eventName = v.value;
            }
        });


        ourTeamNumber = getOurTeamNumber(db);


        let [first, number] = $adapterName.split("-");
        if (first.toUpperCase() !== "SS") {
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
    <div class="d-flex justify-content-around">
        <h3>This device is <b>{deviceName}</b></h3>
        <h3>Current Event <b>{eventName}</b></h3>
    </div>


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
            <a id={scout.name}></a>
            <MySchedule scout={scout}></MySchedule>
        {/each}

    {/if}
</div>


