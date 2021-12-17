<svelte:head>
	<title>Pit Objective</title>
</svelte:head>

<script lang="ts">
	import { sortedTeams } from '$lib/teams'
	import Select from 'svelte-select';

	let items = sortedTeams.map(t=>{
		return {value: t.team_number, label:t.team_number}
	});

	let value = null;

	function handleSelect(event) {
		console.log('selected item', event.detail.value);
		// .. do something here 🙂
		console.log("value", value)
	}
</script>

<div class="content">
	<h1>Pit Objective</h1>

	<label for="team">Team Number:</label>
	<Select id="team" items={items} bind:value={value} on:select={handleSelect}/>


	<div class="d-flex mb-2 mt-4">
		<h3 class="flex-fill">Robot Image</h3>
		<button class="btn btn-info align-self-end">Take Photo</button>
	</div>

	<div class="d-flex" style="height: 300px; background-color: #868e96">
		<div class="w-auto h-auto"></div>
	</div>

	<div class="form-floating mt-4">
		<textarea class="form-control" placeholder="Leave a comment here" style="height: 175px"></textarea>
		<label>Notes</label>
	</div>

	<div class="d-flex justify-content-end mt-2">
		<button class="btn btn-success">Save</button>
	</div>


</div>

<style>
</style>
