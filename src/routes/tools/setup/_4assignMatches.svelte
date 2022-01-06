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


    let eventKey = "";

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

        db.settings.findOne({selector: {key: Settings.CurrentEvent}}).$.subscribe(d => {
            if (d && d.value) {
                eventKey = d.value;
            }
        });
    });

    function copyFromTo(fromIdx, toIdx) {
        return async () => {
            // console.log(matchesTable[fromIdx].matchKey, matchesTable[toIdx].matchKey)

            let dstTeams = matchesTable[toIdx].alliances.red.teamKeys.concat(matchesTable[toIdx].alliances.blue.teamKeys);
            let srcTeams = matchesTable[fromIdx].alliances.red.teamKeys.concat(matchesTable[fromIdx].alliances.blue.teamKeys);

            dstTeams = dstTeams.map(t=>parseInt(t.replace('frc','')));
            srcTeams = srcTeams.map(t=>parseInt(t.replace('frc','')));//order is red1,2,3 then Blue,1,2,3

            for (let i=0; i<srcTeams.length; i++) {
                const srcQuery = {
                    eventKey: matchesTable[fromIdx].eventKey,
                    matchKey: matchesTable[fromIdx].matchKey,
                    teamNumber: srcTeams[i]
                };
                const matchReportSrc = await db.match_metrics.findOne().where(srcQuery).exec();

                const dstQuery = {
                    eventKey:matchesTable[fromIdx].eventKey,
                    matchKey: matchesTable[fromIdx].matchKey,
                    // teamNumber: dstTeams[i]
                };
                const matchReportDst = await db.match_metrics.findOne().where(dstQuery).exec();
                console.log(matchReportDst)

                if (!matchReportSrc) {
                    console.log("unable to find src match report for: ", srcQuery)
                    continue;
                }
                if (!matchReportDst) {
                    console.log("unable to find dst match report for: ", dstQuery)
                    continue;
                }
                // await matchReportDst.atomicUpdate(data=>{
                //     data.scoutName = matchReportSrc.scoutName;
                //     return data
                // })
            }
        }
    }


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
                    {#if idx > 0}
                        <button class="btn btn-outline-primary btn-sm mt-3" on:click={copyFromTo(idx-1, idx)}>Copy Above</button>
                    {/if}
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