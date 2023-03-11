<svelte:head>
    <title>Subjective Setup</title>
</svelte:head>

<script lang="ts">
    import {Modal, ModalBody, ModalHeader, Table} from "sveltestrap";
    import "sweetalert2/dist/sweetalert2.css";
    import {onMount} from "svelte";
    import {getDb, MyDatabase} from "$lib/store";
    import {Settings} from "$lib/schema/settings-schema";
    import {goto} from "$app/navigation";
    import Swal from "sweetalert2";
    import "sweetalert2/dist/sweetalert2.css";
    import type {RxDocument} from "rxdb";
    import type {SuperScout} from "$lib/schema/super-scout-schema";
    import type {Match} from "$lib/schema/match-schema";
    import Scouts from "./setup/_2scouts.svelte";
    import Select from "svelte-select";
    import {
        formatDate,
        getCurrentEvent,
        getCurrentEventQuery,
        getOurTeamNumber,
        getOurTeamNumberQuery
    } from "$lib/util";
    import DeviceName from "./setup/_0deviceName.svelte";
    import TeamNumber from "./setup/_1teamNumber.svelte";
    import GetMatches from "./setup/_3getMatches.svelte";
    import ScoutingDataSheet from "./setup/_scoutingDataSheet.svelte";


    let db: MyDatabase;
    let eventKey: string; //eg. 2020week0 (current event)
    let matches: RxDocument<Match>[] = [];
    let ourTeamNumber: number; //eg. 4909
    let ourMatches: RxDocument<Match>[] = [];
    type ScoutSelect = { label: string, value: RxDocument<SuperScout> };
    let scoutsSelectOptions: ScoutSelect[] = [];
    let superScouts: RxDocument<SuperScout>[] = [];
    let superScoutsLoaded = false;

    let numMatchesToScout = 3;

    let matchSubscription = null

    onMount(async () => {
        db = await getDb();

        getCurrentEventQuery(db).$.subscribe(d => {
            eventKey = d.value;

            // console.log("EventKey", eventKey);
            if (matchSubscription != null) {
                matchSubscription.unsubscribe();
                matchSubscription = null;
                // console.log("cancelling", eventKey);
            }
            matchSubscription = db.matches.find().where({eventKey}).sort({order: "asc"}).$.subscribe(d => {
                matches = d
            })
        })

        getOurTeamNumberQuery(db).$.subscribe(d => {
            ourTeamNumber = parseInt(d.value);
        })

        // Find our matches
        for (let match of matches) {
            const teamKeys = match.alliances.red.teamKeys.concat(match.alliances.blue.teamKeys);
            const matchTeams = teamKeys.map(t => parseInt(t.replace("frc", "")));
            if (matchTeams.includes(ourTeamNumber)) {
                ourMatches.push(match);
            }
        }

        await db.super_scouts.find().where({active: true, eventKey: eventKey}).sort({createdAt: "asc"}).$.subscribe((d: RxDocument<SuperScout>[]) => {
            superScoutsLoaded = false;

            scoutsSelectOptions = d.map(s => ({label: s.name, value: s}));
            superScouts = d;

            // trick to force the scout name to stay up to date.
            setTimeout(() => {
                superScoutsLoaded = true;
            }, 0);
        });
    });

    let modalOpen = false;
    let currentMatch: RxDocument<Match> | null; // match that was selected when button selected

    function toggleModal() {
        modalOpen = !modalOpen;
    }

    function openModal(match: RxDocument<Match>) {
        return () => {
            currentMatch = match;
            modalOpen = true;
        };
    }

    const removeMatchFromScouts = async function (matchKey: string) {
        //1. Find all super scouts
        let ss = await db.super_scouts.find().where({active: true}).exec();
        //2. Filter to super scouts assigned to this match
        ss = ss.filter(scout => {
            return scout.assignedMatches.filter(am => (am.assignedMatch == matchKey));
        });
        //3. for each, remove assignment
        for (let scout of ss) {
            await scout.atomicUpdate(data => {
                data.assignedMatches = data.assignedMatches.filter(am => am.assignedMatch !== matchKey);
                // console.log("remove", data.name, "from", matchKey, data.assignedMatches);
                data.updatedAt = new Date().getTime();
                return data;
            });
        }
    };

    // Select handler
    async function assignScoutToCurrentMatch(event) {
        let scout: RxDocument<SuperScout> = event.detail.value;
        let matchKey = currentMatch.matchKey;


        await removeMatchFromScouts(matchKey);
        // console.log("assignedMatches", ss.map(x => ({name: x.name, m: x.assignedMatches})));


        // Add this match to this scout
        await scout.atomicUpdate(data => {

            let teamsInMatch = getTeamsInMatch(currentMatch);
            let teamMatches: { team: number, match: string }[] = [];
            for (let teamNumber of teamsInMatch) {

                // no need to scout our team
                if (teamNumber == ourTeamNumber) {
                    continue;
                }
                let matches = getMatches(teamNumber, currentMatch.order, numMatchesToScout);
                let tm: { team: number, match: string }[] = matches.map(m => ({
                    team: teamNumber,
                    match: m + ""
                }));
                // console.log(tm);
                teamMatches = teamMatches.concat(tm);
            }

            data.assignedMatches.push({
                assignedMatch: matchKey,
                teamMatches: teamMatches
            });
            // console.log("Assign", data.name, "to", matchKey);
            data.updatedAt = new Date().getTime();
            return data;
        });

        modalOpen = false;
        currentMatch = null;
    }

    function getTeamsInMatch(match: RxDocument<Match>): number[] {
        const teamKeys = match.alliances.red.teamKeys.concat(match.alliances.blue.teamKeys);
        return teamKeys.map(t => parseInt(t.replace("frc", "")));
    }

    // get matches this team played in before this match (currentOrder)
    function getMatches(team, currentOrder, numMatchesToScout): number[] {
        let teamMatches = [];
        for (let match of matches) {
            const matchTeams = getTeamsInMatch(match);
            if (matchTeams.includes(team) && match.order < currentOrder) {
                teamMatches.push(match.matchKey);
            }
        }
        // get last few matches items
        let m = teamMatches.slice(Math.max(teamMatches.length - numMatchesToScout, 0));
        return m;
    }

    function matchContainsOurTeam(match: RxDocument<Match>, ourTeamNumber) {
        const teamKeys = match.alliances.red.teamKeys.concat(match.alliances.blue.teamKeys);
        const matchTeams = teamKeys.map(t => parseInt(t.replace("frc", "")));
        const result = matchTeams.includes(ourTeamNumber);
        return result;
    }

    function matchIsAssigned(match: RxDocument<Match>) {
        return matchAssignedTo(match).length > 0;
    }

    function matchAssignedTo(match: RxDocument<Match>): RxDocument<SuperScout>[] {
        // console.log("matchAssignedTo");
        let assignedScouts: RxDocument<SuperScout>[] = [];
        for (let s of superScouts) {
            // console.log(superScouts);
            if (s.assignedMatches.map(am => am.assignedMatch).includes(match.matchKey)) {
                assignedScouts.push(s);
            }
        }
        // console.log(assignedScouts);
        return assignedScouts;
    }

    // get the scout assigned to the match for the select field
    function matchAssignedToSelect(match: RxDocument<Match>): ScoutSelect {
        let assigned = matchAssignedTo(match);
        if (assigned && assigned.length > 0) {
            return {
                label: assigned[0].name,
                value: assigned[0]
            };
        }
        return null;
    }

    const clearScouts = function (match: RxDocument<Match>) {
        removeMatchFromScouts(match.matchKey);
        modalOpen = false;
    };


</script>

<div class="container-fluid">
    <h1>Strategist Setup</h1>

    <DeviceName/>
    <ScoutingDataSheet/>

    <TeamNumber/>
    <GetMatches/>

    <h2>3. Strategists <small class="text-muted fw-light fs-5">Enter strategist names</small></h2>
    <Scouts dbTable="super_scouts"/>


    <h2>4. Our Matches <small class="text-muted fw-light fs-5">Assign strategists to teams</small></h2>

    <label for="numMatchesToScout">Num Matches to Scout [1,5]</label>
    <input type="number" class="form-control" id="numMatchesToScout" min="1" max="5" bind:value={numMatchesToScout}>

    <Table striped>
        <thead>
        <tr>
            <th>Match</th>
            <th colspan="3">Red Alliance</th>
            <th colspan="3">Blue Alliance</th>
        </tr>
        </thead>
        <tbody>
        {#each matches as m}
            <tr>
                <td rowspan="2">
                    <a href="/match/{m.matchKey}">{m.matchKey.toUpperCase()}</a><br>
                    {formatDate(m.scheduledTime)}
                    {#if matchContainsOurTeam(m, ourTeamNumber)}
                        {#if superScoutsLoaded && matchIsAssigned(m)}
                            <button class="btn btn-success" on:click={openModal(m)}>Change</button>
                            <br>
                            {matchAssignedTo(m).map(s => s.name).join(",")}
                        {:else}
                            <button class="btn btn-warning" on:click={openModal(m)}>Assign</button>
                        {/if}
                    {/if}
                </td>

                {#each ['red', 'blue'] as color}
                    {#each m.alliances[color].teamKeys as t}
                        <td class="{color}bg" class:ourTeam={t.replace('frc','') == ourTeamNumber}>
                            <a href="/team/{t.replace('frc','')}">{t.replace('frc', '')}</a>
                        </td>
                    {/each}
                {/each}
            </tr>
            <tr style="border-bottom: 2px solid black">
                {#each ['red', 'blue'] as color}
                    {#each m.alliances[color].teamKeys as t}
                        <td class="{color}bg">
                            {#if t !== `frc${ourTeamNumber}`}
                                {matchContainsOurTeam(m, ourTeamNumber) && getMatches(parseInt(t.replace('frc', '')), m.order, numMatchesToScout).join(", ") || ""}
                            {/if}
                        </td>
                    {/each}
                {/each}
            </tr>
        {/each}
        </tbody>
    </Table>
</div>

<Modal isOpen={modalOpen} toggle={toggleModal}>
    <ModalHeader toggle={toggleModal}>Assign <b>{currentMatch.matchKey.toUpperCase()}</b> to...</ModalHeader>
    <ModalBody>

        <Select value={matchAssignedToSelect(currentMatch)}
                items={scoutsSelectOptions}
                on:select={assignScoutToCurrentMatch}/>
        <button class="btn btn-warning float-end mt-2" on:click={clearScouts(currentMatch)}>Clear
            Scouts
        </button>

    </ModalBody>
</Modal>


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

    .redbg a {
        color: var(--accent-color);
    }
</style>
