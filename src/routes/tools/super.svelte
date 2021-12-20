<svelte:head>
    <title>Subjective Setup</title>
</svelte:head>

<script lang="ts">
    import {sortedMatches} from "$lib/matches";
    import {Modal, ModalBody, ModalHeader, Table} from "sveltestrap";
    import "sweetalert2/dist/sweetalert2.css";

    let ourTeamNumber = 4909; //@todo

    let ourMatches = sortedMatches.filter(m => {
        return m.alliances.red.team_keys.includes(`frc${ourTeamNumber}`) ||
            m.alliances.blue.team_keys.includes(`frc${ourTeamNumber}`);
    });

    let pairedDevices = [ //@todo
        {name: "Red1", super: false, assignedMatches: []},
        {name: "Red2", super: false, assignedMatches: []},
        {name: "Red3", super: false, assignedMatches: []},
        {name: "Blue1", super: false, assignedMatches: []},
        {name: "Blue2", super: false, assignedMatches: []},
        {name: "Blue3", super: false, assignedMatches: []},
        {name: "Super1", super: false, assignedMatches: []},
        {name: "Super2", super: false, assignedMatches: []},
        {name: "Super3", super: false, assignedMatches: []},
    ];

    function refreshDevices() {
        console.log("@todo? maybe not needed");
    }

    let open = false;
    let currentMatch;
    let currentTeam;

    function toggle(match, team: number) {
        return () => {
            currentMatch = match;
            currentTeam = team;
            open = !open;
        }
    }

    let superDevices = [];
    $: superDevices = pairedDevices.filter(v => v.super)

    function toggleAssignDevToMatch(dev, match, team: number) {
        return () => {
            let eventMatchTeam = `${match.key}_${team}`;
            if (dev.assignedMatches.includes(eventMatchTeam)) {
                dev.assignedMatches = dev.assignedMatches.filter(v => (v == eventMatchTeam))
            } else {
                dev.assignedMatches = [...dev.assignedMatches, eventMatchTeam];
            }
            pairedDevices = pairedDevices; // trigger update of devices table
            ourMatches = ourMatches; //trigger update of assigned buttons
            toggle(null, null)() // close the modal
        }
    }

    function isAssigned(match, team: number) {
        let eventMatchTeam = `${match.key}_${team}`;
        return pairedDevices.map(d => d.assignedMatches).flat().includes(eventMatchTeam)
    }

</script>

<div class="container-fluid">
    <h1>Super Scout Setup</h1>

    <div class="d-flex justify-content-between">
        <h2>Paired Devices</h2>
        <div>
            <button class="btn btn-info btn-sm" on:click={refreshDevices}>Refresh</button>
        </div>
    </div>
    <small class="text-muted fw-light fs-5">1. Select devices to be super scouts</small>

    <table class="table table-striped">
        <thead>
        <tr>
            <th>Device</th>
            <th></th>
            <th>Teams</th>
        </tr>
        </thead>
        <tbody>
        {#each pairedDevices as d}
            <tr>
                <td>{d.name}</td>
                <td>
                    <button class:btn-warning={d.super} on:click={()=>{d.super = !d.super}}
                            class="btn btn-primary btn-sm">
                        {#if d.super}
                            Mark as Objective
                        {:else}
                            Mark as Super
                        {/if}
                    </button>
                </td>
                <td>
                    <ul>
                        {#each d.assignedMatches as t}
                            <li>{t}</li>
                        {/each}
                    </ul>
                </td>
            </tr>
        {/each}
        </tbody>
    </table>

    <h2>Our Matches <small class="text-muted fw-light fs-5">2. Assign super scouts to teams</small></h2>
    <Table striped>
        <thead>
        <tr>
            <th>Match</th>
            <th colspan="3">Red Alliance</th>
            <th colspan="3">Blue Alliance</th>
        </tr>
        </thead>
        <tbody>
        {#each ourMatches as m}
            <tr>
                <td rowspan="2">
                    <a href="/match/{m.key.split('_')[1]}">{m.key.split('_')[1].toUpperCase()}</a>
                </td>

                {#each ['red', 'blue'] as color}
                    {#each m.alliances[color].team_keys as t}
                        <td class="{color}bg" class:ourTeam={t.replace('frc','') == ourTeamNumber}>
                            <a href="/team/{t.replace('frc','')}">{t.replace('frc', '')}</a>
                        </td>
                    {/each}
                {/each}
            </tr>
            <tr>
                {#each ['red', 'blue'] as color}
                    {#each m.alliances[color].team_keys as t}
                        <td class="{color}bg">
                            {#if t !== `frc${ourTeamNumber}`}
                                {#if isAssigned(m, t)}
                                    <button on:click={toggle(m, t)} class="btn btn-success btn-sm">
                                        Unassign
                                    </button>
                                {:else}
                                    <button on:click={toggle(m, t)} class="btn btn-secondary btn-sm">
                                        Assign
                                    </button>
                                {/if}
                            {/if}
                        </td>
                    {/each}
                {/each}
            </tr>
        {/each}
        </tbody>
    </Table>
</div>

<Modal isOpen={open} toggle={toggle()}>
    <ModalHeader toggle={toggle()}>Assign <b>{currentMatch.key.split('_')[1].toUpperCase()}</b> to...</ModalHeader>
    <ModalBody>
        {#each superDevices as dev}
            <button on:click={toggleAssignDevToMatch(dev, currentMatch, currentTeam)}
                    class="btn btn-success me-1">{dev.name}</button>

        {:else}
            <p>No scouts designated as super scouts</p>
        {/each}
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
