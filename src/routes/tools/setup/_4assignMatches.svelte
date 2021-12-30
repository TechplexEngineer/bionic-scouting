<script lang="ts">
    import {Table} from "sveltestrap";
    import {onMount} from "svelte";
    import type {MyDatabase} from "$lib/store";
    import {getDb} from "$lib/store";
    import type {Match} from "$lib/schema/match-schema";
    import type {RxDocument} from "rxdb";
    import {matchSort} from "$lib/matches";
    import Select from "svelte-select";
    import {Settings} from "$lib/schema/settings-schema";
    import type {MatchMetricsReport} from "$lib/schema/match-metrics-schema";

    let db: MyDatabase;
    let matchesTable: RxDocument<Match>[] = [];
    let ourTeamNumber = 0;

    type SelectOption = { label: string, value: string };
    let scoutsSelect: SelectOption[] = [];
    let eventKey = "";
    let matchMetrics = {};
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
                eventKey = d.value
            }
        });

        db.scouts.find({selector: {active: true}}).$.subscribe(scouts => {
            scoutsSelect = scouts.map(s => {
                return {label: s.name, value: s.name}
            })
        });

        db.match_metrics.find().$.subscribe(rxMatchMetrics => {
            for (const mm of rxMatchMetrics) {
                matchMetrics[mm.eventMatchTeamKey] = mm
            }
            console.log("matchMetrics", matchMetrics);
            //@todo Since this loads after the page renders, we need to re-render the component...
        });
    });

    function assignScout(teamNumber, matchKey) {
        return async (scoutItem) => {
            let scoutName = scoutItem.detail.value
            // console.log(`assign ${scoutName} to ${teamNumber} for ${matchKey} at ${eventKey}`);

            const match = await db.match_metrics.findOne({
                selector: {
                    eventKey: eventKey,
                    matchKey: matchKey,
                    teamNumber: teamNumber,
                }
            }).exec();

            if (match) {
                // update
                await match.update({
                    $set: {
                        updatedAt: new Date().getTime(),
                        scoutName: scoutName,
                    }
                })
            } else {
                // insert
                let a: MatchMetricsReport = {
                    createdAt: new Date().getTime(),
                    updatedAt: new Date().getTime(),
                    eventKey: eventKey,
                    matchKey: matchKey,
                    teamNumber: parseInt(teamNumber),
                    scoutName: scoutName,
                };
                await db.match_metrics.insert(a)
            }

        }
    }

    function getScoutForMatchTeam(matchKey, teamNumber) {
        let key = `${eventKey}_${matchKey}_${teamNumber}`;
        let mm = matchMetrics[key]
        console.log(matchKey, teamNumber, mm);
        if (!mm) {
            return undefined;
        }
        return {label: mm.scoutName, value: mm.scoutName}
    }

</script>

<h2>4. Assign students to matches</h2>
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
    {#each matchesTable as m}
        <tr>
            <td rowspan="2">
                {m.matchKey}
            </td>

            {#each ['red'] as color}
                {#each m.alliances[color].teamKeys as t, idx}
                    <td class="{color}bg" class:our-team={t.replace('frc','') == ourTeamNumber}>
                        {t.replace('frc', '')}
                        <br>
                        <Select items={scoutsSelect}
                                value={getScoutForMatchTeam(m.matchKey, t.replace('frc', ''))}
                                listAutoWidth={false}
                                on:select={assignScout(t.replace('frc',''), m.matchKey)}
                                containerStyles="--itemPadding:5px"/>
                    </td>
                {/each}
            {/each}

        </tr>
        <tr>
            {#each ['blue'] as color}
                {#each m.alliances[color].teamKeys as t, idx}
                    <td class="{color}bg" class:our-team={t.replace('frc','') == ourTeamNumber}>
                        {t.replace('frc', '')}
                        <br>
                        <Select items={scoutsSelect} listAutoWidth={false}
                                on:select={assignScout(t.replace('frc',''), m.matchKey)}
                                containerStyles="--itemPadding:5px"/>
                    </td>
                {/each}
            {/each}
        </tr>
    {/each}
    </tbody>
</Table>

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