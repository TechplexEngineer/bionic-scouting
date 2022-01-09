<script context="module">
	// Disable server side rendering for this page
	export const ssr = false;
</script>

<svelte:head>
	<title>Setup</title>
</svelte:head>

<script lang="ts">

	import TeamNumber from "./_1teamNumber.svelte";
	import Scouts from "./_2scouts.svelte";
	import GetMatches from "./_3getMatches.svelte";
	import AssignMatches from "./_4assignMatches.svelte";

	import MatchAssigner from "./_5matchAssiginer.svelte";


</script>

<div class="content">
	<h1>Setup</h1>

	<TeamNumber/>

	<Scouts/>

	<GetMatches/>

	<AssignMatches/>

	<MatchAssigner/>

</div>


<style>

</style>
