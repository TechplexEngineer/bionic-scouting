<svelte:head>
	<title>Team {teamNumber}</title>
</svelte:head>

<script lang="ts">
	import { page } from '$app/stores';
	import { Teams } from "$lib/teams";

	let team;
	let teamNumber = $page.params.teamNumber;

	$: team = getTeam(Number(teamNumber))

	function getTeam(teamNumber:number) {
		for (const t of Teams) {
			if (t.team_number == teamNumber) {
				return t
			}
		}
	}

</script>

{#if team}
<div class="container-fluid">
	<h1>Team {teamNumber} - {team.nickname}</h1>
	<div class="row">
		<div class="col"><h2><b>From:</b> {team.city}, {team.state_prov}, {team.country}</h2></div>
		<div class="col text-end"><h2><b>Rookie Year:</b> {team.rookie_year}</h2></div>
	</div>

	<h1>@todo Robot Photo</h1>

	<h1 class="mt-5">@todo metrics</h1>

</div>
{/if}
