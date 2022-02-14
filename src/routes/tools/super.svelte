<svelte:head>
	<title>Subjective Setup</title>
</svelte:head>

<script lang="ts">
	import { Modal, ModalBody, ModalHeader, Table } from "sveltestrap";
	import "sweetalert2/dist/sweetalert2.css";
	import { onMount } from "svelte";
	import { getDb, MyDatabase } from "$lib/store";
	import { Settings } from "$lib/schema/settings-schema";
	import { goto } from "$app/navigation";
	import Swal from "sweetalert2";
	import "sweetalert2/dist/sweetalert2.css";
	import type { RxDocument } from "rxdb";
	import type { SuperScout } from "$lib/schema/super-scout-schema";
	import type { Match } from "$lib/schema/match-schema";
	import Scouts from "./setup/_2scouts.svelte";
	import Select from "svelte-select";


	let db: MyDatabase;
	let eventKey: string; //eg. 2020week0 (current event)
	let matches: RxDocument<Match>[] = [];
	let ourTeamNumber; //eg. 4909
	let ourMatches: RxDocument<Match>[] = [];
	let scoutsSelectOptions: { label: string, value: RxDocument<SuperScout> }[] = [];
	let superScouts: RxDocument<SuperScout>[] = [];

	onMount(async () => {
		db = await getDb();

		const eventSetting = await db.settings.findOne().where({ key: Settings.CurrentEvent }).exec();
		if (!eventSetting) {
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
			return;
		}
		eventKey = eventSetting.value;

		const entry = await db.settings.findOne({ selector: { key: Settings.TeamNumber } }).exec();
		if (entry && entry.value) {
			ourTeamNumber = parseInt(entry.value);
		} else {
			let res = await Swal.fire({
				icon: "error",
				title: "Oops...",
				html: `Team number not set. Head over to Setup`,
				showCloseButton: true,
				confirmButtonText: "Go to Setup"
			});
			if (res.isConfirmed) {
				await goto("/tools/setup");
				return;
			}
			return;
		}

		matches = await db.matches.find().where({ eventKey }).sort({ order: "asc" }).exec();

		// Find our matches
		for (let match of matches) {
			const teamKeys = match.alliances.red.teamKeys.concat(match.alliances.blue.teamKeys);
			const matchTeams = teamKeys.map(t => parseInt(t.replace("frc", "")));
			if (matchTeams.includes(ourTeamNumber)) {
				ourMatches.push(match);
			}
		}

		db.super_scouts.find().where({ active: true }).$.subscribe((d: RxDocument<SuperScout>[]) => {
			scoutsSelectOptions = d.map(s => ({ label: s.name, value: s }));
			superScouts = d;
		});
	});

	let modalOpen = false;
	let currentMatch: RxDocument<Match> | null; // match that was selected when button selected

	function toggleModal() {
		modalOpen = !modalOpen;
	}

	function openModal(match: RxDocument<Match>) {
		return () => {
			currentMatch = match;
			modalOpen = true;
		};
	}

	function assignScoutToCurrentMatch(event) {
		let scout: RxDocument<SuperScout> = event.detail.value;
		let matchKey = currentMatch.matchKey;
		scout.atomicUpdate(data => {
			data.assignedMatches.push(matchKey);
			data.updatedAt = new Date().getTime();
			return data;
		});
		modalOpen = false;
		currentMatch = null;
	}

	function formatDate(d) {
		const date1 = new Date(d * 1000); //unix timestamp to javascript millis

		const dateTimeFormat3 = new Intl.DateTimeFormat("en-US", {
			weekday: "short",
			month: "numeric",
			day: "numeric"
		});
		return dateTimeFormat3.format(date1); //Fri, m/dd
	}

	function getMatches(team, currentOrder) {
		let teamMatches = [];
		for (let match of matches) {
			const teamKeys = match.alliances.red.teamKeys.concat(match.alliances.blue.teamKeys);
			const matchTeams = teamKeys.map(t => parseInt(t.replace("frc", "")));
			if (matchTeams.includes(team) && match.order < currentOrder) {
				teamMatches.push(match.matchKey);
			}
		}
		// get last fest matches items
		let m = teamMatches.slice(Math.max(teamMatches.length - 3, 0));
		return m.join(", ");
	}

	function matchContainsOurTeam(match: RxDocument<Match>) {
		const teamKeys = match.alliances.red.teamKeys.concat(match.alliances.blue.teamKeys);
		const matchTeams = teamKeys.map(t => parseInt(t.replace("frc", "")));

		return matchTeams.includes(ourTeamNumber);
	}

	function matchIsAssigned(match: RxDocument<Match>) {
		return matchAssignedTo(match).length > 0;
	}

	function matchAssignedTo(match: RxDocument<Match>): RxDocument<SuperScout>[] {
		let assignedScouts: RxDocument<SuperScout>[] = [];
		for (let s of superScouts) {
			if (s.assignedMatches.includes(match.matchKey)) {
				assignedScouts.push(s);
			}
		}
		console.log(assignedScouts);
		return assignedScouts;
	}


</script>

<div class="container-fluid">
	<h1>Super Scout Setup</h1>

	<h2>1. Scouts <small class="text-muted fw-light fs-5">Enter scouts</small></h2>
	<Scouts dbTable="super_scouts" />


	<h2>2. Our Matches <small class="text-muted fw-light fs-5">Assign super scouts to teams</small></h2>
	<Table striped>
		<thead>
		<tr>
			<th>Match</th>
			<th colspan="3">Red Alliance</th>
			<th colspan="3">Blue Alliance</th>
		</tr>
		</thead>
		<tbody>
		{#each matches as m}
			<tr>
				<td rowspan="2">
					<a href="/match/{m.matchKey}">{m.matchKey.toUpperCase()}</a><br>
					{formatDate(m.scheduledTime)}
					{#if matchContainsOurTeam(m)}
						{#if matchIsAssigned(m)}
							<button class="btn btn-outline-primary" on:click={openModal(m)}>Change</button>
							<br>
							{matchAssignedTo(m).map(s => s.name).join(",")}
						{:else}
							<button class="btn btn-outline-primary" on:click={openModal(m)}>Assign</button>
						{/if}
					{/if}
				</td>

				{#each ['red', 'blue'] as color}
					{#each m.alliances[color].teamKeys as t}
						<td class="{color}bg" class:ourTeam={t.replace('frc','') == ourTeamNumber}>
							<a href="/team/{t.replace('frc','')}">{t.replace('frc', '')}</a>
						</td>
					{/each}
				{/each}
			</tr>
			<tr style="border-bottom: 2px solid black">
				{#each ['red', 'blue'] as color}
					{#each m.alliances[color].teamKeys as t}
						<td class="{color}bg">
							{#if t !== `frc${ourTeamNumber}`}
								{matchContainsOurTeam(m) && getMatches(parseInt(t.replace('frc', '')), m.order) || ""}
							{/if}
						</td>
					{/each}
				{/each}
			</tr>
		{/each}
		</tbody>
	</Table>
</div>

<Modal isOpen={modalOpen} toggle={toggleModal}>
	<ModalHeader toggle={toggleModal}>Assign <b>{currentMatch.matchKey.toUpperCase()}</b> to...</ModalHeader>
	<ModalBody>

		<Select items={scoutsSelectOptions} on:select={assignScoutToCurrentMatch} />

	</ModalBody>
</Modal>


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

	.redbg a {
		color: var(--accent-color);
	}
</style>
