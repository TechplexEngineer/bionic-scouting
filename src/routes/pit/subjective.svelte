<svelte:head>
	<title>Pit Subjective</title>
</svelte:head>

<script lang="ts">
	import { sortedTeams } from '$lib/teams'
	import Select from 'svelte-select';

	let items = sortedTeams.map(t=>{
		return {value: t.team_number, label:t.team_number}
	});
	console.log(items)

	let value = null;

	function handleSelect(event) {
		console.log('selected item', event.detail.value);
		// .. do something here 🙂
		console.log("value", value)
	}
</script>

<div class="content">
	<h1>Pit Subjective</h1>

	<label for="team">Team Number:</label>
	<Select id="team" items={items} bind:value={value} on:select={handleSelect} />


</div>



<style>
</style>
