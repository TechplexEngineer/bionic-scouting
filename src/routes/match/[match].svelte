<svelte:head>
  <title>Match</title>
</svelte:head>

<script context="module">
  // Disable server side rendering for this page
  export const ssr = false;
</script>


<script lang="ts">
  import { page } from "$app/stores";
  import { Matches } from "$lib/matches";
  import { Table } from "sveltestrap";

  import Swal from "sweetalert2";

  function getMatch(key: string) {
    for (const m of Matches) {
      if (m.key.split("_")[1] == key) {
        return m;
      }
    }
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Invalid match" + key
    });
  }

  let match = {};
  $: match = getMatch($page.params.match);

  let ourTeamNumber = 4909;

</script>

<div class="container-fluid">
  <a class="btn btn-info float-start" href="schedule">&lt; Schedule</a>
  <h1>Match {$page.params.match.toUpperCase()}</h1>
</div>


{#if match}
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


    <tr>
      <td>
        {match.key.split('_')[1].toUpperCase()}
      </td>

      {#each match.alliances.red.team_keys as t}
        <td class="redbg" class:ourTeam={t.replace('frc','') == ourTeamNumber}>
          <a href="/team/{t.replace('frc','')}">{t.replace('frc', '')}</a>
        </td>
      {/each}

      {#each match.alliances.blue.team_keys as t}
        <td class="bluebg" class:ourTeam={t.replace('frc','') == ourTeamNumber}>
          <a href="/team/{t.replace('frc','')}">{t.replace('frc', '')}</a>
        </td>
      {/each}

      <td class="redbg"
          class:fw-bold={match.alliances.red.score > match.alliances.blue.score}>{match.alliances.red.score}</td>
      <td class="redbg"
          class:fw-bold={match.score_breakdown.red.rp > match.score_breakdown.blue.rp}>{match.score_breakdown.red.rp} RP
      </td>

      <td class="bluebg"
          class:fw-bold={match.alliances.blue.score > match.alliances.red.score}>{match.alliances.blue.score}</td>
      <td class="bluebg"
          class:fw-bold={match.score_breakdown.blue.rp > match.score_breakdown.red.rp}>{match.score_breakdown.blue.rp}
        RP
      </td>
    </tr>

    </tbody>
  </Table>

  <pre>
	BLUE
    {JSON.stringify(match.score_breakdown.blue, null, "    ")}
</pre>
  <pre>
	RED
    {JSON.stringify(match.score_breakdown.red, null, "    ")}
</pre>
{/if}

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
