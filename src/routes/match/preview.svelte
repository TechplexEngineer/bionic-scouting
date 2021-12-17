<svelte:head>
	<title>Match Preview</title>
</svelte:head>

<script lang="ts">
	import { Column, Table } from 'sveltestrap';
	import { sortedMatches } from '$lib/matches';

	let matchNumber = 1;
	let match = {};

	$: match = sortedMatches[matchNumber-1]
</script>


<div class="container-fluid">
	<h1>Match Preview: <a href="/match/{match.key.split('_')[1]}">{match.key.split('_')[1]}</a></h1>

	<div class="input-group mb-3 row">
		<button type="button" class="btn btn-primary col" on:click={()=>{
		if (matchNumber - 1 > 0) {matchNumber -= 1}
	}}>&lt; Previous</button>
		<input type="number" class="form-control col" value={matchNumber} on:change={(e)=>{
		if (0 <= e.target.value && e.target.value < sortedMatches.length+1) {
			matchNumber = e.target.value;
		} else {
			e.target.value = matchNumber;
		}
	}}>
		<button type="button" class="btn btn-primary col" on:click={()=>{
		if (matchNumber + 1 < sortedMatches.length+1) {
			matchNumber += 1
		}
	}}>Next &gt;</button>
	</div>
</div>

<!-- Blue -->
<Table striped>
	<thead>
	<tr>
		<th class="text-primary bluebg">Blue</th>
		<th>Metric 1</th>
		<th>Metric 2</th>
		<th>Metric 3</th>
	</tr>
	</thead>
	<tbody>
	{#each match.alliances.blue.team_keys as team}
		<tr>
			<th scope="row" class="bluebg">
				<a href="/team/{team.replace('frc','')}">{team.replace('frc','')}</a>
			</th>
			<td>a</td>
			<td>b</td>
			<td>c</td>
		</tr>
	{/each}
	</tbody>
</Table>

<!-- Red -->
<Table striped>
	<thead>
		<tr>
			<th class="text-danger redbg">Red</th>
			<th>Metric 1</th>
			<th>Metric 2</th>
			<th>Metric 3</th>
		</tr>
	</thead>
	<tbody>
		{#each match.alliances.red.team_keys as team}
		<tr>
			<th scope="row" class="redbg">
				<a href="/team/{team.replace('frc','')}">{team.replace('frc','')}</a>
			</th>
			<td>a</td>
			<td>b</td>
			<td>c</td>
		</tr>
		{/each}
	</tbody>
</Table>

<style>
	a {
		text-decoration: none;
		border-bottom: 2px solid;
	}

	a:hover {
		border-bottom: 5px solid;
	}

	.redbg a {
		color: var(--accent-color);
	}
</style>
