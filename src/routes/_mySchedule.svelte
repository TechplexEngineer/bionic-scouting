<script lang="ts">
    import {onMount} from "svelte";
    import {getDb} from "$lib/store";
    import {Settings} from "$lib/schema/settings-schema";
    import {formatDateTime, getOurTeamNumber} from "$lib/util";
    import {matchSort} from "$lib/matches";
    import type {RxDocument} from "rxdb";
    import type {Match} from "$lib/schema/match-schema";
    import type {SuperScout} from "$lib/schema/super-scout-schema";
    import type {MatchSubjReport} from "$lib/schema/match-subj-schema";

    export let scout: RxDocument<SuperScout>;

    let ourTeamNumber;
    let scoutMatches: RxDocument<Match>[] = [];

    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }

    let myTeamMatchesToScout: { team: number, match: string }[] = [];
    let myAssignedMatches: RxDocument<Match>[] = [];

    let matchReports: RxDocument<MatchSubjReport>[] = [];


    onMount(async () => {

        const db = await getDb();
        let eventName = "...";
        db.settings.findOne({selector: {key: Settings.CurrentEvent}}).$.subscribe(v => {
            // console.log(v);
            if (v && v.value) {
                eventName = v.value;
            }
        });


        ourTeamNumber = getOurTeamNumber(db);


        let assignedMatchKeys = scout.assignedMatches.map(am => am.assignedMatch)
        db.matches.find().where({matchKey: {$in: assignedMatchKeys}}).$.subscribe(m => {
            myAssignedMatches = m.sort(matchSort);
            // console.log(myAssignedMatches);
        });

        myTeamMatchesToScout = scout.assignedMatches.map(am => am.teamMatches).flat();

        let myMatches = myTeamMatchesToScout.map(tm => tm.match).flat();
        myMatches = myMatches.filter(onlyUnique);
        // console.log("myMatches", myMatches);
        db.matches.find().where({matchKey: {$in: myMatches}}).$.subscribe(m => {
            scoutMatches = m.sort(matchSort);
        });

        db.match_subjective.find().where({eventKey: eventName}).$.subscribe(mr => {
            matchReports = mr;
            // console.log("matchReports", matchReports);
        })
    });

    const toWatch = function (matchKey: string, teamNumber: number) {
        return myTeamMatchesToScout.filter(m => m.team == teamNumber && m.match == matchKey).length > 0;
    };
    const getPrepFor = (matchKey: string, teamNumber: number) => {
        for (let m of scout.assignedMatches) {
            // console.log(m.teamMatches);
            let filter = m.teamMatches.filter(tm => tm.team == teamNumber && tm.match == matchKey);
            if (filter.length > 0) {
                return m.assignedMatch;
            }
        }
        return "???";
    };

    // Lesson I keep having to relearn, make pure functions, then the reactivity works
    const isScouted = (matchKey: string, teamNumber: number, matchForKey: string, mr) => {
        return mr.filter((mr) => {
            return mr.matchKey == matchKey && mr.teamNumber == teamNumber && mr.matchForKey == matchForKey
        }).length > 0
    }

</script>

<h2 class="mt-3">Match Reports / Assigned Matches: <small class="text-muted fs-5">{scout && scout.name}</small>
    <a href="#top" class="float-end text-muted fs-5">Top &#9650;</a>
</h2>

<table class="table table-striped">
    <thead>
    <tr>
        <th>Match</th>
        <th>Date</th>
        <th colspan="3">Red Alliance</th>
        <th colspan="3">Blue Alliance</th>
        <th></th>
    </tr>
    </thead>
    <tbody>
    {#each myAssignedMatches as m}
        <tr>
            <td>
                <a href="/match/{m.matchKey}">{m.matchKey.toUpperCase()}</a>
            </td>
            <td>
                {formatDateTime(m.scheduledTime)}
            </td>

            {#each ['red', 'blue'] as color}
                {#each m.alliances[color].teamKeys as t}
                    <td class="{color}bg"
                        class:ourTeam={t.replace('frc','') == ourTeamNumber}
                        class:toWatch={toWatch(m.matchKey, parseInt(t.replace('frc','')))}>
                        {t.replace('frc', '')}
                    </td>
                {/each}
            {/each}
            <td>
                <a href="match/subjective/report?for={m.matchKey}" class="btn btn-success">Report</a>
            </td>
        </tr>
    {/each}
    </tbody>
</table>

<h2 class="mt-3">My Schedule: <small class="text-muted fs-5">{scout && scout.name} (Super Scout)</small></h2>
<table class="table table-striped">
    <thead>
    <tr>
        <th>Match</th>
        <th>Date</th>
        <th colspan="3">Red Alliance</th>
        <th colspan="3">Blue Alliance</th>
    </tr>
    </thead>
    <tbody>
    {#each scoutMatches as m}
        <tr>
            <td>
                <a href="/match/{m.matchKey}">{m.matchKey.toUpperCase()}</a>
            </td>
            <td>
                {formatDateTime(m.scheduledTime)}
            </td>

            {#each ['red', 'blue'] as color}
                {#each m.alliances[color].teamKeys as t}
                    <td class="{color}bg"
                        class:ourTeam={t.replace('frc','') == ourTeamNumber}
                        class:toWatch={toWatch(m.matchKey, parseInt(t.replace('frc','')))}>
                        {t.replace('frc', '')}
                        {#if toWatch(m.matchKey, parseInt(t.replace('frc', '')))}

                            <a class={isScouted(m.matchKey, parseInt(t.replace('frc', '')), getPrepFor(m.matchKey, parseInt(t.replace('frc', ''))), matchReports) ? "btn btn-success" : "btn btn-warning"}
                               href={`/match/subjective?match=${m.matchKey}&team=${t.replace('frc','')}&for=${getPrepFor(m.matchKey, parseInt(t.replace('frc', '')))}`}>
                                {#if isScouted(m.matchKey, parseInt(t.replace('frc', '')), getPrepFor(m.matchKey, parseInt(t.replace('frc', ''))), matchReports) }
                                    ReScout
                                {:else}
                                    Scout
                                {/if}
                            </a>
                            <br>
                            For: {getPrepFor(m.matchKey, parseInt(t.replace('frc', '')))}
                        {/if}
                    </td>
                {/each}
            {/each}


        </tr>
    {/each}
    </tbody>
</table>

<style>
    .bluebg {
        background-color: rgb(201, 218, 248)
    }

    .ourTeam {
        filter: brightness(80%);
    }

    .redbg {
        background-color: rgb(244, 204, 204)
    }

    .toWatch.redbg {
        background-color: #F49090;
    }

    .toWatch.bluebg {
        background-color: #7AA8F8;
    }
</style>