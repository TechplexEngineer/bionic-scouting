<script lang="ts">
    import Select from "svelte-select";
    import {onMount} from "svelte";
    import {getDb, MyDatabase} from "$lib/store";
    import SpinButton from "$lib/compontents/SpinButton.svelte";
    import {Settings} from "$lib/schema/settings-schema";
    import Swal from "sweetalert2";
    import "sweetalert2/dist/sweetalert2.css";
    import {goto} from "$app/navigation";
    import {getCurrentEvent} from "$lib/util";

    let db: MyDatabase;
    type SelectOption = { label: string, value: string };
    let scoutsSelect: SelectOption[] = [];

    let scoutGroups: { scout1?: SelectOption, scout2?: SelectOption, scout3?: SelectOption }[] = [
        {
            // scout1: {label: "", value: ""},
            // scout2: {label: "", value: ""},
            // scout3: {label: "", value: ""},
        },
        {},
        {}
    ];

    onMount(async () => {
        db = await getDb();

        db.scouts.find({selector: {active: true}}).$.subscribe(scouts => {
            scoutsSelect = scouts.map(s => {
                return {label: s.name, value: s.name};
            });
        });
    });

    function add() {
        // console.log("adding!");
        scoutGroups = [...scoutGroups, {}];
    }

    function remove(idx) {
        return () => {
            // console.log("Delete", idx);
            delete scoutGroups[idx];
            scoutGroups = scoutGroups;
        };
    }

    function assign(idx: number, scout: string) {
        return (e) => {
            scoutGroups[idx][scout] = e.detail;
        };
    }

    // bound variable
    let matchesPerShift = 5;

    async function build() {

        // console.log(JSON.stringify(scoutGroups, null, 4));

        const eventKey = await getCurrentEvent(db);


        const matches = await db.matches.find().where({eventKey}).sort({order: "asc"}).exec();
        // console.log("Matches: ", matches.map(m => ({k: m.matchKey, o: m.order})));

        // remove existing scout assignments
        if (!confirm("WARNING THIS WILL REMOVE MATCH DATA! Proceed?")) {
            return;
        }
        await db.match_metrics.find().where({eventKey}).remove();


        let bulkInsertMatches = [];

        let numGroups = scoutGroups.length;
        let groupCounter = 0;
        let matchCounter = 0;
        for (const m of matches) {

            // console.log(`G:${groupCounter} M:${matchCounter}`);
            const redTeams = m.alliances.red.teamKeys.map(t => parseInt(t.replace("frc", "")));
            const blueTeams = m.alliances.blue.teamKeys.map(t => parseInt(t.replace("frc", "")));

            let scoutCounter = 1;
            for (const t of redTeams) {
                bulkInsertMatches.push({
                    order: m.order,
                    eventKey: m.eventKey,
                    matchKey: m.matchKey,
                    teamNumber: t,
                    scoutName: scoutGroups[groupCounter % numGroups][`scout${scoutCounter++}`].label,
                    createdAt: new Date().getTime(),
                    updatedAt: new Date().getTime()
                });

            }
            let blueGroupCounter = groupCounter + 1;
            scoutCounter = 1;
            for (const t of blueTeams) {
                bulkInsertMatches.push({
                    order: m.order,
                    eventKey: m.eventKey,
                    matchKey: m.matchKey,
                    teamNumber: t,
                    scoutName: scoutGroups[blueGroupCounter % numGroups][`scout${scoutCounter++}`].label,
                    createdAt: new Date().getTime(),
                    updatedAt: new Date().getTime()
                });
            }

            matchCounter += 1;
            if (matchCounter % matchesPerShift == 0) {
                groupCounter += 1;
                // console.log(`matchCounter${matchCounter} % matchesPerShift${matchesPerShift} == 0`);
            }
        }
        await db.match_metrics.bulkInsert(bulkInsertMatches);
    }


</script>

<h2>5. [Auto] Assign students to matches</h2>
<small>Defaults to first 6 scouts alphabetically</small>
<table class="table table-striped">
    <thead>
    <tr>
        <th>Member 1</th>
        <th>Member 2</th>
        <th>Member 3</th>
        <th>
            <button on:click={add} class="btn btn-outline-success">Add</button>
        </th>
    </tr>
    </thead>
    <tbody>
    {#each scoutGroups as g, idx}
        {#if g}
            <tr>
                <td>
                    <Select items={scoutsSelect}
                            on:select={assign(idx, 'scout1')}
                            value={scoutsSelect[idx*3]}
                            containerStyles="--itemPadding:5px"/>
                </td>
                <td>
                    <Select items={scoutsSelect}
                            on:select={assign(idx, 'scout2')}
                            value={scoutsSelect[idx*3+1]}
                            containerStyles="--itemPadding:5px"/>
                </td>
                <td>
                    <Select items={scoutsSelect}
                            on:select={assign(idx, 'scout3')}
                            value={scoutsSelect[idx*3+2]}
                            containerStyles="--itemPadding:5px"/>
                </td>
                <td>
                    <button on:click={remove(idx)} class="btn btn-outline-danger">Remove</button>
                </td>
            </tr>
        {/if}
    {/each}
    </tbody>
</table>

<div class="mb-3 row">
    <label for="matchesPerShift" class="col-sm-3 col-form-label">Matches per shift</label>
    <div class="col-sm-9">
        <input type="number" class="form-control" id="matchesPerShift" bind:value={matchesPerShift}>
    </div>
</div>

<SpinButton onClick={build} class="btn-primary">Build Assignments</SpinButton>