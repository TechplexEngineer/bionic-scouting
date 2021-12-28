<script context="module">
	// Disable server side rendering for this page
	export const ssr = false;
</script>

<svelte:head>
	<title>Setup</title>
</svelte:head>

<script lang="ts">

	import TeamNumber from "./_1teamNumber.svelte";
	import Scouts from "./_2scouts.svelte";
	import GetMatches from "./_3getMatches.svelte";


	let eventName = "";
	import * as tba from "$lib/tba";
	import Select from "svelte-select";
	import { Table } from "sveltestrap";
	import { matchSort } from "$lib/matches";

	let eventsToSelect = [];
	let currentYear = 2020; //@todo change to new Date().getFullYear()
	(async () => {
		eventsToSelect = (await tba.getEvents(currentYear)).map(e => ({ value: e.key, label: `${e.key} - (${e.name})` }));
	})();
	let selectedEvent; //@todo load the previously selected event


	async function loadMatches() {
		if (!selectedEvent || (selectedEvent && selectedEvent.length < 2)) {
			Swal.fire({
				icon: "error",
				title: "Oops...",
				text: "Event must be selected first!"
			});
			return;
		}
		let selectedEventKey = selectedEvent.value;
		const matches = await tba.getMatches(selectedEventKey);
		matchesTable = matches.sort(matchSort);
	}


	let matchesTable = [];
	let ourTeamNumber = 4909;

</script>

<div class="content">
	<h1>Setup</h1>

	<TeamNumber />

	<Scouts />

	<GetMatches />

	<h2>4. Assign students to matches</h2>
	<Table striped>
		<thead>
		<tr>
			<th>Match</th>
			<th colspan="3">Red Alliance</th>
			<th colspan="3">Blue Alliance</th>
		</tr>
		</thead>
		<tbody>
		{#each matchesTable as m}
			<tr>
				<td>
					{m.key.split('_')[1].toUpperCase()}
				</td>

				{#each ['red', 'blue'] as color}
					{#each m.alliances[color].team_keys as t}
						<td class="{color}bg" class:ourTeam={t.replace('frc','') == ourTeamNumber}>
							{t.replace('frc', '')}
						</td>
					{/each}
				{/each}

			</tr>
		{/each}
		</tbody>
	</Table>


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

	.redbg a {
		color: var(--accent-color);
	}
</style>
