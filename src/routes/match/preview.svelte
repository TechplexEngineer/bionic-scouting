<svelte:head>
	<title>Match Preview</title>
</svelte:head>

<script lang="ts">
	import { Column, Table } from 'sveltestrap';
	import { Matches } from '$lib/matches';

	let matchNumber = 1;
	let match = {};

	let compLevels = {
		test: 0, // test match
		pm: 1, //practice match
		qm: 2, //qualification match
		ef: 3, //eighth finals
		qf: 4, //quarter finals
		sf: 5, //semi finals
		f: 6,  //finals
	};

	let sortedMatches = Matches.sort((a, b) => {
		if (compLevels[a.comp_level] !== compLevels[b.comp_level]) {
			return compLevels[a.comp_level] - compLevels[b.comp_level]
		}
		if (a.set_number !== b.set_number) {
			return a.set_number - b.set_number
		}
		if (a.match_number !== b.match_number) {
			return a.match_number - b.match_number
		}

	})
	console.log(sortedMatches.map((m)=>{return m.key}))

	// function getMatch(cb) {
	// 	for(let m of sortedMatches) {
	// 		if (cb(m)) {
	// 			return m
	// 		}
	// 	}
	// }

	$: match = sortedMatches[matchNumber-1]



	
</script>


<div class="content">
	<h1>Match Preview: {match.key.split('_')[1]}</h1>
</div>

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
	.bluebg {
		/*background-color: rgb(201, 218, 248)*/
	}
	.redbg {
		/*background-color: rgb(244, 204, 204)*/
	}

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
