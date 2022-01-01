<svelte:head>
    <title>Home</title>
</svelte:head>

<script lang="ts">
    import {BluetoothSerial} from "bionic-bt-serial";
    import {onMount} from "svelte";
    import {getDb} from "$lib/store";
    import {Settings} from "$lib/schema/settings-schema";

    let deviceName = "...";
    let eventName = "...";
    onMount(async () => {
        deviceName = (await BluetoothSerial.getName()).result;
        const db = await getDb();
        db.settings.findOne({selector: {key: Settings.CurrentEvent}}).$.subscribe(v => {
            // console.log(v);
            if (v && v.value) {
                eventName = v.value
            }
        })
    });

</script>

<div class="container-fluid">
    <h1>This device is <b>{deviceName}</b></h1>
    <h1>Current Event <b>{eventName}</b></h1>
</div>

<style>

</style>
