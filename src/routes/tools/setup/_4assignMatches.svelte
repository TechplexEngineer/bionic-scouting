<script lang="ts">
    import {Table} from "sveltestrap";
    import {onMount} from "svelte";
    import type {MyDatabase} from "$lib/store";
    import {getDb} from "$lib/store";
    import type {Match} from "$lib/schema/match-schema";
    import type {RxDocument} from "rxdb";
    import {matchSort} from "$lib/matches";
    import {Settings} from "$lib/schema/settings-schema";

    import ScoutAssign from './_scoutAssign.svelte';
    import {writable} from "svelte/store";

    let db: MyDatabase;
    let matchesTable: RxDocument<Match>[] = [];
    let ourTeamNumber = 0;


    let eventKey = ""; //writable("");

    onMount(async () => {
        db = await getDb();

        db.matches.find().$.subscribe(matches => {
            matches.sort(matchSort);
            matchesTable = matches;
        });

        db.settings.findOne({selector: {key: Settings.TeamNumber}}).$.subscribe(d => {
            if (d && d.value) {
                ourTeamNumber = parseInt(d.value, 10);
            }
        });
        // let res = await db.settings.findOne({selector: {key: Settings.CurrentEvent}}).exec();
        // if (res && res.value) {
        //     console.log("Event is: ", res.value);
        //     eventKey.set = res.value;
        // }

        db.settings.findOne({selector: {key: Settings.CurrentEvent}}).$.subscribe(d => {
            if (d && d.value) {
                eventKey = d.value;
            }
        });
    });


</script>

<h2>4. Assign students to matches</h2>

<!-- this if statement is annoying.. shouldn't be needed-->
{#if eventKey && eventKey.length}
    <Table striped>
        <thead>
        <tr>
            <th style="width: 0"></th>
            <th>1</th>
            <th>2</th>
            <th>3</th>
        </tr>
        </thead>
        <tbody>
        {#each matchesTable as m, idx}
            <tr>
                <td rowspan="2">
                    {m.matchKey} ({idx + 1})
                </td>

                {#each ['red'] as color}
                    {#each m.alliances[color].teamKeys as t, idx}
                        <td class="{color}bg" class:our-team={t.replace('frc','') == ourTeamNumber}>
                            {t.replace('frc', '')}
                            <br>
                            <ScoutAssign eventKey={eventKey} match={m} teamNumber={t.replace('frc','')}/>
                        </td>
                    {/each}
                {/each}

            </tr>
            <tr style="border-bottom: 2px solid black">
                {#each ['blue'] as color}
                    {#each m.alliances[color].teamKeys as t, idx}
                        <td class="{color}bg" class:our-team={t.replace('frc','') == ourTeamNumber}>
                            {t.replace('frc', '')}
                            <br>
                            <ScoutAssign eventKey={eventKey} match={m} teamNumber={t.replace('frc','')}/>

                        </td>
                    {/each}
                {/each}
            </tr>
        {/each}
        </tbody>
    </Table>
{/if}

<style>
    .bluebg {
        background-color: rgb(201, 218, 248)
    }

    .bluebg.our-team {
        background-color: rgb(109, 158, 235) !important;
    }

    .redbg {
        background-color: rgb(244, 204, 204)
    }

    .redbg.our-team {
        background-color: rgb(224, 102, 102) !important;
    }

    .redbg a {
        color: var(--accent-color);
    }
</style>