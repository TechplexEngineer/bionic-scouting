<svelte:head>
    <title>Team {teamNumber}</title>
</svelte:head>

<script lang="ts">
    import {page} from '$app/stores';
    import {Teams} from "$lib/teams";
    import {onMount} from "svelte";
    import {getDb} from "$lib/store";
    import {Settings} from "$lib/schema/settings-schema";
    import Swal from "sweetalert2";
    import {goto} from "$app/navigation";

    let team;
    let teamNumber = $page.params.teamNumber;
    console.log("TeamNumber", teamNumber);

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

        console.log("TeamNumber----", teamNumber);
        db.pit_scouting.findOne().where({
            eventKey: settingEvent.value,
            teamNumber: parseInt(teamNumber)
        }).$.subscribe(t => {
            team = t;
        });
    });

</script>

{#if team}
    <div class="container-fluid">
        <h1>Team {teamNumber} - {team.nickname}</h1>
        <div class="row">
            <div class="col"><h2><b>From:</b> {team.city}, {team.stateProv}, {team.country}</h2></div>
            <div class="col text-end"><h2><b>Rookie Year:</b> {team.rookieYear}</h2></div>
        </div>

        <h1>@todo Robot Photo</h1>

        <h1 class="mt-5">@todo metrics</h1>

    </div>
{/if}
