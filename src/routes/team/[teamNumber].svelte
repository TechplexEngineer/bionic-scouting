<svelte:head>
	<title>Team {teamNumber}</title>
</svelte:head>

<script lang="ts">
	import { page } from "$app/stores";
	import { Teams } from "$lib/teams";
	import { onMount } from "svelte";
	import { getDb } from "$lib/store";
	import { Settings } from "$lib/schema/settings-schema";
	import Swal from "sweetalert2";
	import { goto } from "$app/navigation";
	import type { RxDocument } from "rxdb";
	import type { PitReport } from "$lib/schema/pit-scout-schema";
	import type { MatchMetricsReport } from "$lib/schema/match-metrics-schema";

	let team: RxDocument<PitReport>;
	let teamNumber = $page.params.teamNumber;
	// console.log("TeamNumber", teamNumber);

	let scoutedMatches: RxDocument<MatchMetricsReport>[];

	onMount(async () => {
		const db = await getDb();

		const settingEvent = await db.settings.findOne({ selector: { key: Settings.CurrentEvent } }).exec();
		if (!settingEvent) {
			let res = await Swal.fire({
				icon: "error",
				title: "Oops...",
				html: `Current event not set. Head over to Setup`,
				showCloseButton: true,
				confirmButtonText: "Go to Setup"
			});
			if (res.isConfirmed) {
				await goto("/tools/setup");
				return;
			}
		}

		db.pit_scouting.findOne().where({
			eventKey: settingEvent.value,
			teamNumber: parseInt(teamNumber)
		}).$.subscribe(t => {
			team = t;
		});

		db.match_metrics.find().where({
			eventKey: settingEvent.value,
			teamNumber: parseInt(teamNumber),
			submitted: true
		}).$.subscribe(mm => {
			scoutedMatches = mm;
		});
	});

</script>

{#if team}
	<div class="container-fluid">
		<div class="d-flex">
			<div class="flex-1">
				<!--				nothing to see here-->
			</div>
			<div class="text-center flex-1">
				<h1 class="text-nowrap">Team {teamNumber} - {team.nickname}</h1>

			</div>
			<div class="flex-1 text-end">
				<a href="/pit/?team={teamNumber}" class="btn btn-primary">Scout</a>
			</div>
		</div>

		<div class="d-flex">
			<span class="flex-1 fs-5"><b>From:</b> {team.city}, {team.stateProv}, {team.country}</span>
			<span class="flex-1 fs-5 text-end"><b>Rookie Year:</b> {team.rookieYear}</span>
		</div>

		<div class="robotPhoto text-center">
			{#if team.imageUrl}
				<img src={team.imageUrl} alt="Team Robot Photo" class="mx-auto" />
			{:else}
				No photo yet
			{/if}
		</div>

		<h1 class="mt-5">@todo metrics</h1>

		<h2>Pit Scouting</h2>
		<pre>
        {JSON.stringify(team.toJSON(), null, 4)}
        </pre>

		<h2>Scouted Matches</h2>
		<pre>
            {JSON.stringify(scoutedMatches, null, 4)}
        </pre>
	</div>
{/if}
