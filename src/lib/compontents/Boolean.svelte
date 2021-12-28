<script lang="ts">
	import { writable } from "svelte/store";

	/**
	 * Label to display in the button
	 */
	export let label: string;

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
	export let value = writable(false);
</script>


<label class="btn {classes.join(' ')}" class:active={$value}>
	{label}
	<input type="checkbox" class="btn-check" autocomplete="off" bind:checked={$value}>
</label>