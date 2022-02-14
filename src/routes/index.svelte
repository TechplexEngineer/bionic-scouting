<svelte:head>
    <title>Home</title>
</svelte:head>

<script lang="ts">
    import {BluetoothSerial} from "bionic-bt-serial";
    import {onMount} from "svelte";
    import {getDb} from "$lib/store";
    import {Settings} from "$lib/schema/settings-schema";
    import {formatDateTime} from "$lib/util"

    let deviceName = "...";
    let eventName = "...";

    let ourTeamNumber;
    let scoutName = "...";
    let scoutMatches = [];
    onMount(async () => {
        deviceName = (await BluetoothSerial.getName()).result;
        const db = await getDb();
        db.settings.findOne({selector: {key: Settings.CurrentEvent}}).$.subscribe(v => {
            // console.log(v);
            if (v && v.value) {
                eventName = v.value
            }
        });

        const entry = await db.settings.findOne({selector: {key: Settings.TeamNumber}}).exec();
        if (entry && entry.value) {
            ourTeamNumber = parseInt(entry.value)
        }

        let scout = await db.super_scouts.findOne().where({active: true}).exec();
        scoutName = scout.name;

        db.matches.find().where({matchKey: {$in: scout.assignedMatches}}).$.subscribe(m => {
            scoutMatches = m;
        })
    });

</script>

<div class="container-fluid">
    <h1>This device is <b>{deviceName}</b></h1>
    <h1>Current Event <b>{eventName}</b></h1>


    <h2 class="mt-3">My Schedule: <small class="text-muted">{scoutName} (Super Scout)</small></h2>
    <table class="table table-striped">
        <thead>
        <tr>
            <th>Match</th>
            <th>Date</th>
            <th colspan="3">Red Alliance</th>
            <th colspan="3">Blue Alliance</th>
            <th>Actions</th>
        </tr>
        </thead>
        <tbody>
        {#each scoutMatches as m}
            <tr>
                <td>
                    <a href="/match/{m.matchKey}">{m.matchKey.toUpperCase()}</a>
                </td>
                <td>
                    {formatDateTime(m.scheduledTime)}
                </td>

                {#each m.alliances.red.teamKeys as t}
                    <td class="redbg" class:ourTeam={t.replace('frc','') == ourTeamNumber}>
                        {t.replace('frc', '')}
                    </td>
                {/each}

                {#each m.alliances.blue.teamKeys as t}
                    <td class="bluebg" class:ourTeam={t.replace('frc','') == ourTeamNumber}>
                        {t.replace('frc', '')}
                    </td>
                {/each}
                <td>
                    <button class="btn btn-success">Scout</button>
                </td>
            </tr>
        {/each}
        </tbody>
    </table>
</div>

<style>

</style>
