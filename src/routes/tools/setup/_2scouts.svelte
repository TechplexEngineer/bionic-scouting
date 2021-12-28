<script lang="ts">
	import Swal from "sweetalert2";
	import "sweetalert2/dist/sweetalert2.css";

	let scouts = []; //@todo

	let scoutName = "";

	function addScout() {
		if (scoutName.length < 2) {
			return; //nothing to do
		}
		scouts = [...scouts, scoutName];
		scoutName = ""; //clear form for next name
	}

	function removeScout(s) {
		return () => {
			scouts = scouts.filter(v => (v != s));
		};
	}

	let fileInput; //Bound to the file input
	async function processScoutNameFileUpload(e) {
		console.log(e.target.value);
		const papa = await import("papaparse");
		let file = e.target.files[0];

		papa.parse(file, {
			header: false,
			complete: async function(results) {
				console.log("parse", results.data);
				if (scouts.length > 0) {
					// ask if we should merge or replace
					let response = await Swal.fire({
						title: "Should we merge the list with the existing scouts?",
						showDenyButton: true,
						showCancelButton: true,
						confirmButtonText: "Merge",
						denyButtonText: `Replace`
					});
					// console.log(response, results.data);
					if (response.isDismissed) {
						return; // nothing to do
					}
					if (response.isDenied) {
						scouts = []; //remove all scouts
					}
					//fallthrough, default behavior is merge
				}
				// console.log(results.data.map(i => i.name));
				scouts = scouts.concat(results.data.flat().filter(Boolean));
			}
		});
	}

	async function confirmRemoveAllScouts() {
		let result = await Swal.fire({
			icon: "question",
			title: "Remove all scouts?",
			showCancelButton: true,
			confirmButtonText: "Remove All",
			confirmButtonColor: "#dd6b55"
		});
		if (result.isConfirmed) {
			scouts = [];
		}
	}

	let scoutsIsCollapsed = true;
</script>

<h2>2. Enter scout names or load list</h2>
<div class="d-flex">
	<div>
		<button class="me-4 btn btn-outline-primary" on:click={()=>{fileInput.click();}}>Upload List</button>
		<input type="file" class="form-control d-none" bind:this={fileInput} on:change={processScoutNameFileUpload}>
	</div>
	<div class="flex-fill">
		<form class="input-group mb-3" on:submit|preventDefault={addScout}>
			<input type="text" class="form-control" placeholder="Scout name" bind:value={scoutName}>
			<button class="btn btn-outline-success" type="submit">Add</button>
		</form>
	</div>
	<div class="ms-4">
		<button class="btn btn-outline-danger" on:click={confirmRemoveAllScouts}>Remove All</button>
	</div>
</div>
<div class="d-flex">
	<h3 class="flex-fill">Scouts: <small class="text-muted fs-5">({scouts.length})</small></h3>
	<button class="btn btn-outline-secondary" on:click={()=>{scoutsIsCollapsed = !scoutsIsCollapsed}}>
		{#if scoutsIsCollapsed}Expand{:else}Collapse{/if}
	</button>
</div>
{#if !scoutsIsCollapsed}
	<table class="table table-striped">
		<thead>
		<tr>
			<th>Name</th>
			<th></th>
		</tr>
		</thead>
		<tbody>
		{#each scouts.sort() as s}
			<tr>
				<td>
					{s}
				</td>
				<td>
					<button class="btn btn-warning" on:click={removeScout(s)}>Remove</button>
				</td>
			</tr>
		{/each}
		</tbody>
	</table>
{/if}