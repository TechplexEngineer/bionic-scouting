<script lang="ts">
	import { writable } from "svelte/store";

	export let ourTeamNumber = writable(4909);
</script>

<h2>1. Enter your team number</h2>
<input type="number" class="form-control mb-3" bind:value={$ourTeamNumber} placeholder="FRC Team Number">