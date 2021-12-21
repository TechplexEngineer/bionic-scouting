<script>
  import { Table } from "sveltestrap";

  export let match;
  export let matches;
  export let ourTeamNumber = 4909; //@todo


  let matchesTable = [];
  if (match) {
    matchesTable = [match];
  } else if (matches) {
    matchesTable = matches;
  } else {
    console.warn("match or matches should be set");
  }
  console.log(matchesTable);
</script>

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
  {#each matchesTable as m}
    <tr>
      <td>
        {m.key.split('_')[1].toUpperCase()}
      </td>

      {#each m.alliances.red.team_keys as t}
        <td class="redbg" class:ourTeam={t.replace('frc','') == ourTeamNumber}>
          <a href="/team/{t.replace('frc','')}">{t.replace('frc', '')}</a>
        </td>
      {/each}

      {#each m.alliances.blue.team_keys as t}
        <td class="bluebg" class:ourTeam={t.replace('frc','') == ourTeamNumber}>
          <a href="/team/{t.replace('frc','')}">{t.replace('frc', '')}</a>
        </td>
      {/each}

      <td class="redbg"
          class:fw-bold={m.alliances.red.score > m.alliances.blue.score}>{m.alliances.red.score}</td>
      <td class="redbg"
          class:fw-bold={m.score_breakdown.red.rp > m.score_breakdown.blue.rp}>{m.score_breakdown.red.rp}
        RP
      </td>

      <td class="bluebg"
          class:fw-bold={m.alliances.blue.score > m.alliances.red.score}>{m.alliances.blue.score}</td>
      <td class="bluebg"
          class:fw-bold={m.score_breakdown.blue.rp > m.score_breakdown.red.rp}>{m.score_breakdown.blue.rp}
        RP
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

    .redbg a {
        color: var(--accent-color);
    }
</style>