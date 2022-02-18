<svelte:head>
	<title>Home</title>
</svelte:head>

<script lang="ts">
	import { BluetoothSerial } from "bionic-bt-serial";
	import { onMount } from "svelte";
	import { getDb } from "$lib/store";
	import { Settings } from "$lib/schema/settings-schema";
	import { formatDateTime } from "$lib/util";
	import { matchSort } from "$lib/matches";
	import type { RxDocument } from "rxdb";
	import type { Match } from "$lib/schema/match-schema";
	import type { SuperScout } from "$lib/schema/super-scout-schema";
	import { adapterName } from "$lib/bluetooth";

	let deviceName = "...";
	let eventName = "...";

	let ourTeamNumber;
	let scout: RxDocument<SuperScout>;
	let scoutMatches: RxDocument<Match>[] = [];

	function onlyUnique(value, index, self) {
		return self.indexOf(value) === index;
	}

	let myTeamMatchesToScout: { team: number, match: string }[] = [];

	onMount(async () => {
		deviceName = (await BluetoothSerial.getName()).result;
		const db = await getDb();
		db.settings.findOne({ selector: { key: Settings.CurrentEvent } }).$.subscribe(v => {
			// console.log(v);
			if (v && v.value) {
				eventName = v.value;
			}
		});

		const entry = await db.settings.findOne({ selector: { key: Settings.TeamNumber } }).exec();
		if (entry && entry.value) {
			ourTeamNumber = parseInt(entry.value);
		}

		let [first, number] = $adapterName.split("-");
		if (first.toUpperCase() !== "SS") {
			return; // nothing to do for non super scouts
		}

		//@todo get the correct SS given tablet name
		scout = await db.super_scouts.findOne().where({ active: true }).skip(number - 1).exec();
		if (!scout) {
			return;
		}


		myTeamMatchesToScout = scout.assignedMatches.map(am => am.teamMatches).flat();

		let myMatches = myTeamMatchesToScout.map(tm => tm.match).flat();
		myMatches = myMatches.filter(onlyUnique);
		// console.log("myMatches", myMatches);
		db.matches.find().where({ matchKey: { $in: myMatches } }).$.subscribe(m => {
			scoutMatches = m.sort(matchSort);
		});
	});

	const toWatch = function(matchKey: string, teamNumber: number) {
		return myTeamMatchesToScout.filter(m => m.team == teamNumber && m.match == matchKey).length > 0;
	};
	const getPrepFor = (matchKey: string, teamNumber: number) => {
		for (let m of scout.assignedMatches) {
			// console.log(m.teamMatches);
			let filter = m.teamMatches.filter(tm => tm.team == teamNumber && tm.match == matchKey);
			if (filter.length > 0) {
				return m.assignedMatch;
			}
		}
		return "???";
	};

</script>

<div class="container-fluid">
	<h1>This device is <b>{deviceName}</b></h1>
	<h1>Current Event <b>{eventName}</b></h1>


	{#if $adapterName.startsWith("SS")}
		<h2 class="mt-3">My Schedule: <small class="text-muted">{scout && scout.name} (Super Scout)</small></h2>
		<table class="table table-striped">
			<thead>
			<tr>
				<th>Match</th>
				<th>Date</th>
				<th colspan="3">Red Alliance</th>
				<th colspan="3">Blue Alliance</th>
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

					{#each ['red', 'blue'] as color}
						{#each m.alliances[color].teamKeys as t}
							<td class="{color}bg"
								class:ourTeam={t.replace('frc','') == ourTeamNumber}
								class:toWatch={toWatch(m.matchKey, parseInt(t.replace('frc','')))}>
								{t.replace('frc', '')}
								{#if toWatch(m.matchKey, parseInt(t.replace('frc', '')))}
									<a class="btn btn-success"
									   href={`/match/subjective?match=${m.matchKey}&team=${t.replace('frc','')}&for=${getPrepFor(m.matchKey, parseInt(t.replace('frc', '')))}`}>Scout</a>
									<br>
									For: {getPrepFor(m.matchKey, parseInt(t.replace('frc', '')))}
								{/if}
							</td>
						{/each}
					{/each}


				</tr>
			{/each}
			</tbody>
		</table>
	{/if}
</div>

<style>
	.bluebg {
		background-color: rgb(201, 218, 248)
	}

	.ourTeam {
		filter: brightness(80%);
	}

	.redbg {
		background-color: rgb(244, 204, 204)
	}

	.toWatch.redbg {
		background-color: #F49090;
	}

	.toWatch.bluebg {
		background-color: #7AA8F8;
	}
</style>
