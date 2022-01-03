<script lang="ts">
	import { createEventDispatcher } from "svelte";

	/**
	 * one event: change
	 */
	const dispatch = createEventDispatcher();
	/**
	 * Label to display in the button
	 */
	export let label: string;
	export let labelSelected: string | null = null;

	/**
	 * Classes to apply to the label
	 * Recommend:
	 *  - btn-outline-primary -- Blue
	 *  - btn-outline-secondary -- Grey
	 *  - btn-outline-success -- Green
	 *  - btn-outline-info -- Teal
	 *  - btn-outline-warning -- Yellow
	 *  - btn-outline-danger -- Red
	 *  - btn-outline-light -- White
	 *  - btn-outline-dark -- Black
	 */
	export let classes: string[] = ["btn-outline-primary"];
	export let value = false;

	// when value changes dispatch a 'change' event
	$: dispatch("change", value);
</script>


<label class="btn {classes.join(' ')} p-3" class:active={value}>
	{#if labelSelected != null && value}
		{labelSelected}
	{:else}
		{label}
	{/if}
	<input type="checkbox" class="btn-check" autocomplete="off" bind:checked={value}>
</label>