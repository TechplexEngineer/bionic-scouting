<script lang="ts">
	import { Table } from "sveltestrap";
	import { onMount } from "svelte";
	import type { MyDatabase } from "$lib/store";
	import { getDb } from "$lib/store";
	import type { Match } from "$lib/schema/match-schema";
	import type { RxDocument } from "rxdb";
	import { matchSort } from "$lib/matches";

	let db: MyDatabase;
	let matchesTable: RxDocument<Match>[] = [];
	let ourTeamNumber = 0;
	onMount(async () => {
		db = await getDb();

		db.matches.find().$.subscribe(matches => {
			matches.sort(matchSort);
			matchesTable = matches;
		});
		db.settings.findOne({ selector: { key: "ourTeamNumber" } }).$.subscribe(d => {
			ourTeamNumber = parseInt(d.value, 10);
		});
	});

</script>

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
				{m.matchKey}
			</td>

			{#each ['red', 'blue'] as color}
				{#each m.alliances[color].teamKeys as t}
					<td class="{color}bg" class:ourTeam={t.replace('frc','') == ourTeamNumber}>
						{t.replace('frc', '')}
					</td>
				{/each}
			{/each}

		</tr>
	{/each}
	</tbody>
</Table>

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