<script lang="ts">
    import Swal from "sweetalert2";
    import "sweetalert2/dist/sweetalert2.css";

    import type {MyDatabase} from "$lib/store";
    import {onMount} from "svelte";
    import {getDb} from "$lib/store";
    import {Scout} from "$lib/schema/scouts-schema";
    import {Button} from "sveltestrap";
    import type {RxDocument} from "rxdb";
    import type {SuperScout} from "$lib/schema/super-scout-schema";

    export let dbTable: string; //eg. scouts or super_scouts

    let db: MyDatabase;

    let scouts = [];

    onMount(async () => {
        db = await getDb();
        await db[dbTable].find()
            .sort({name: "asc"})
            .$.subscribe((s) => {
                scouts = s;
            });
    });

    let scoutName = "";

    async function addScout() {
        if (scoutName.length < 2) {
            return; //nothing to do
        }
        const s: Scout = {
            name: scoutName,
            createdAt: new Date().getTime(),
            updatedAt: new Date().getTime()
        };

        if (await db[dbTable].findOne({selector: {name: scoutName}}).exec() != null) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: `Scout with name ${scoutName} already exists.`
            });
            return;
        }

        await db[dbTable].insert(s);
        scoutName = ""; //clear form for next name
    }

    function removeScout(scout: RxDocument<Scout>) {
        if (!confirm("Are you sure you want to DELETE scout: " + scout.name)) {
            return;
        }
        return async () => {
            await scout.remove();
        };
    }

    function clearAssignments(scout: RxDocument<SuperScout>) {
        scout.atomicUpdate(data => {
            data.assignedMatches = []
            return data
        })
    }

    let fileInput; //Bound to the file input
    async function processScoutNameFileUpload(e) {
        // console.log("File Name", e.target.value);
        const papa = await import("papaparse");
        let file = e.target.files[0];

        papa.parse(file, {
            header: false,
            complete: async function (results) {
                // console.log("parse", results.data);
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

                // scouts = scouts.concat(results.data.flat().filter(Boolean));
                results.data.flat().filter(Boolean).map(s => {
                    if (scouts.map(a => (a.name)).includes(s)) {
                        console.log("skipping", s);
                        return;
                    }
                    scoutName = s;
                    addScout();
                });

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
            await db[dbTable].find().remove();
        }
    }

    let scoutsIsCollapsed = true;

    function makeInactive(scout: RxDocument<Scout>) {
        return async () => {
            // console.log("makeInactive", scout);
            await scout.update({
                $set: {active: false}
            });
        };
    }

    function makeActive(scout: RxDocument<Scout>) {
        return async () => {
            // console.log("makeActive", scout);
            await scout.update({
                $set: {active: true}
            });
        };
    }

</script>

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
            <th>Active</th>
            {#if dbTable == "super_scouts"}
                <th>Assignments</th>
            {/if}
            <th>Actions</th>
        </tr>
        </thead>
        <tbody>
        {#each scouts.sort() as s}
            <tr>
                <td>
                    {s.name}
                </td>
                <td>
                    {#if s.active}
                        <Button color="success" on:click={makeInactive(s)}>Active</Button>
                    {:else}
                        <Button color="danger" on:click={makeActive(s)}>Inactive</Button>
                    {/if}
                </td>
                {#if dbTable == "super_scouts"}
                    <td>
                        {s.assignedMatches || ""}
                    </td>
                {/if}
                <td>
                    <button class="btn btn-warning" on:click={removeScout(s)}>Remove</button>
                    {#if dbTable == "super_scouts"}
                        <button class="btn btn-info" on:click={clearAssignments(s)}>Clear Assignments</button>
                    {/if}
                </td>
            </tr>
        {/each}
        </tbody>
    </table>
{/if}