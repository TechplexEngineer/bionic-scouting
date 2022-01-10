<script lang="ts">
    import Select from "svelte-select";
    import {onMount} from "svelte";
    import {getDb} from "$lib/store";
    import {Settings} from "$lib/schema/settings-schema";
    import type {MatchMetricsReport} from "$lib/schema/match-metrics-schema";
    import {writable} from "svelte/store";
    import type {Match} from "$lib/schema/match-schema";
    import type {RxDocument} from "rxdb";
    import Swal from "sweetalert2";

    export let match: RxDocument<Match>;
    export let teamNumber: number; //eg. frc4909
    export let eventKey: string; //eg. 2020week0

    let db;
    type SelectOption = { label: string, value: string };
    let scoutsSelect: SelectOption[] = [];
    let value;
    onMount(async () => {
        db = await getDb();

        db.scouts.find({selector: {active: true}}).$.subscribe(scouts => {
            scoutsSelect = scouts.map(s => {
                return {label: s.name, value: s.name}
            })
        });

        let eventMatchTeamKey = `${eventKey}_${match.matchKey}_${teamNumber}`;

        db.match_metrics
            .findOne({selector: {eventMatchTeamKey: eventMatchTeamKey}})
            .$.subscribe(rxMatchMetric => {
            if (rxMatchMetric != null) {
                // console.log("Metric", rxMatchMetric.scoutName);
                value = rxMatchMetric.scoutName
            }
        });
    })


    function assignScout(teamNumber, matchKey) {
        return async (scoutItem) => {
            let scoutName = scoutItem.detail.value
            // console.log(`assign ${scoutName} to ${teamNumber} for ${matchKey} at ${eventKey}`);

            // console.log(value, eventKey, matchKey, teamNumber, match, scoutName);
            if (value && value == scoutName) {
                // No change needed
                return
            }

            // we have a previous value
            if (value) {
                let eventMatchTeamKey = `${eventKey}_${matchKey}_${teamNumber}`;

                // console.log(eventMatchTeamKey);

                const match = await db.match_metrics.findOne({
                    selector: {eventMatchTeamKey: eventMatchTeamKey}
                }).exec();
                if (!match) {
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: `Unable to find entry for ${eventMatchTeamKey} error 101.`
                    });
                    return;
                }
                // update
                await match.update({
                    $set: {
                        updatedAt: new Date().getTime(),
                        scoutName: scoutName,
                    }
                });
            } else {
                // insert
                let a: MatchMetricsReport = {
                    order: match.order,
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


</script>


<Select items={scoutsSelect}
        value={value}
        on:select={assignScout(teamNumber, match.matchKey)}
        containerStyles="--itemPadding:5px"/>

