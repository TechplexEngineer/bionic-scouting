<svelte:head>
    <title>Match Subjective</title>
</svelte:head>

<script context="module">
    // Disable server side rendering for this page
    export const ssr = false;
</script>

<script lang="ts">
    import Select from "svelte-select";
    import {sortedTeams} from "$lib/teams";

    let factNames = ["climber", "drivetrain"];
    let facts: { name: string, value: string }[] = [
        {name: "", value: ""} // need to start with at least one to show the form
    ];

    function handleSelect(event) {
        console.log("selected item", event.detail.value);
        // .. do something here 🙂
    }

    let teams = sortedTeams.map(t => {
        return {
            value: t.team_number,
            label: `${t.team_number}  ${"&nbsp; ".repeat(6 - t.team_number.toString().length)} ${t.nickname}`
        };
    });

    let selectedTeam;
</script>

<div class="content">

    <a class="btn btn-info float-start" href="/">&lt; My Schedule</a>
    <h1>Match Subjective</h1>

    <label for="team">Team Number:</label>
    <Select id="team" items={teams} bind:value={selectedTeam} on:select={handleSelect}/>
    <!-- Notes -->
    <div class="form-floating mt-4">
        <textarea id="notes" class="form-control" placeholder=" " style="height: 150px"></textarea>
        <label for="notes">Notes</label>
    </div>

    <!--	Facts-->
    <div class="d-flex mb-2 mt-4">
        <h3 class="flex-fill">Facts</h3>
        <button on:click={()=>{facts = [{name:"", value:""}, ...facts]}} class="btn btn-success align-self-end">+ Add
            Fact
        </button>
    </div>

    {#each facts as fact, idx}
        <div class="d-flex">
            <div class="flex-grow-1 pe-1">
                <Select items={factNames} bind:value={fact.value} isCreatable="true" on:select={handleSelect}/>
            </div>
            <button class="btn btn-warning" on:click={()=>{
				if (confirm("Are you sure?")) {
					facts = facts.filter((f, idx) => f !== fact)
				}
			}}>Remove
            </button>
        </div>

        <div class="form-floating mt-1 mb-2">
            <textarea id="notes" class="form-control" placeholder="Leave a comment here"
                      style="height: 75px"></textarea>
            <label for="notes">Notes</label>
        </div>
    {/each}


    <div class="d-flex justify-content-end mt-2">
        <button class="btn btn-success">Save</button>
    </div>
</div>

<style>
</style>
