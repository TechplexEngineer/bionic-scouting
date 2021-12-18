<svelte:head>
    <title>Pit</title>
</svelte:head>

<script lang="ts">
    import {sortedTeams} from "$lib/teams";
    import Select from "svelte-select";

    let items = sortedTeams.map(t => {
        return {
            value: t.team_number,
            label: `${t.team_number}  ${"&nbsp; ".repeat(6 - t.team_number.toString().length)} ${t.nickname}`
        };
    });

    let value = null;

    function handleSelect(event) {
        console.log("selected item", event.detail.value);
        // .. do something here 🙂
        console.log("value", value);
    }

    let factNames = ["climber", "drivetrain"];
    let facts: { name: string, value: string }[] = [
        {name: "", value: ""} // need to start with at least one to show the form
    ];
</script>

<div class="content">
    <h1>Pit Scout</h1>

    <label for="team">Team Number:</label>
    <Select id="team" items={items} bind:value={value} on:select={handleSelect}/>


    <!--	Robot Photo-->
    <div class="d-flex mb-2 mt-4">
        <h3 class="flex-fill">Robot Image</h3>
        <button class="btn btn-info align-self-end">Take Photo</button>
    </div>

    <div class="d-flex" style="height: 250px; background-color: #868e96">
        <div class="w-auto h-auto"></div>
    </div>

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
            <textarea id="fact" class="form-control" placeholder="Leave a comment here" style="height: 75px"></textarea>
            <label for="fact">Notes</label>
        </div>
    {/each}


    <div class="d-flex justify-content-end mt-2">
        <button class="btn btn-success">Save</button>
    </div>


</div>

<style>
</style>
