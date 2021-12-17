<svelte:head>
  <title>Match Schedule</title>
</svelte:head>

<script context="module">
  // Disable server side rendering for this page
  export const ssr = false;
</script>

<script>
  import { Table } from "sveltestrap";
  import { sortedMatches } from "$lib/matches";

  let ourTeamNumber = 4909;
</script>


<div class="container-fluid">
  <h1>Match Schedule</h1>
</div>

<!-- Blue -->
<Table striped>
  <thead>
  <tr>
    <th>Match</th>
    <th colspan="3">Red Alliance</th>
    <th colspan="3">Blue Alliance</th>
    <th colspan="4">Scores</th>
  </tr>
  </thead>
  <tbody>
  {#each sortedMatches as m}
    <tr>
      <td>
        <!--				<a href="/match/{m.key.split('_')[1]}">{m.key.split('_')[1].toUpperCase()}</a>-->
      </td>

      {#each m.alliances.red.team_keys as t}
        <td class="redbg" class:ourTeam={t.replace('frc','') == ourTeamNumber}>
          {t.replace('frc', '')}
        </td>
      {/each}

      {#each m.alliances.blue.team_keys as t}
        <td class="bluebg" class:ourTeam={t.replace('frc','') == ourTeamNumber}>
          {t.replace('frc', '')}
        </td>
      {/each}

      <td class="redbg" class:fw-bold={m.alliances.red.score > m.alliances.blue.score}>{m.alliances.red.score}</td>
      <td class="redbg" class:fw-bold={m.score_breakdown.red.rp > m.score_breakdown.blue.rp}>{m.score_breakdown.red.rp}
        RP
      </td>

      <td class="bluebg" class:fw-bold={m.alliances.blue.score > m.alliances.red.score}>{m.alliances.blue.score}</td>
      <td class="bluebg"
          class:fw-bold={m.score_breakdown.blue.rp > m.score_breakdown.red.rp}>{m.score_breakdown.blue.rp} RP
      </td>
    </tr>
  {/each}
  </tbody>
</Table>

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

    a {
        text-decoration: none;
        border-bottom: 2px solid;
    }

    a:hover {
        border-bottom: 5px solid;
    }

    .redbg a {
        color: var(--accent-color);
    }
</style>
