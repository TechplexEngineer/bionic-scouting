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

	let factNames = ["climber", "drivetrain"];
	let facts: {name:string, value:string}[] = [
		{name:"", value:""}, // need to start with at least one to show the form
	];
</script>

<div class="content">
	<h1>Pit Subjective</h1>

	<label for="team">Team Number:</label>
	<Select id="team" items={items} bind:value={value} on:select={handleSelect} />

	<h1 class="mt-3">Facts:</h1>

	{#each facts as fact, idx}
		<div class="d-flex">
			<div class="flex-grow-1 pe-1">
				<Select items={factNames} bind:value={fact.value} isCreatable=true on:select={handleSelect} />
			</div>
			<button class="btn btn-warning" on:click={()=>{
				if (confirm("Are you sure?")) {
					facts = facts.filter((f, idx) => f !== fact)
				}
			}}>Remove</button>
		</div>

		<div class="form-floating mt-1 mb-2">
			<textarea class="form-control" placeholder="Leave a comment here" style="height: 75px"></textarea>
			<label>Notes</label>
		</div>
	{/each}
	<div class="d-flex justify-content-end mt-2">
		<button on:click={()=>{facts = [...facts, {name:"", value:""}]}} class="btn btn-success">+ Add Fact</button>
	</div>


<!-- ==================	NOTES                         -->

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
