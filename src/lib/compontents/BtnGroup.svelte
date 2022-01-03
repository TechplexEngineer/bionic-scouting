<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { v4 as uuidv4 } from "uuid";

	let id = uuidv4();


	/**
	 * one event: change
	 */
	const dispatch = createEventDispatcher();

	/**
	 * Button options
	 * Labels must be unique
	 */
	export let options: { label: string }[] = [];

	/**
	 * The currently active button
	 */
	export let selected = null;

	export let allowDeselect = true;

	function onClick(newSelectedOption) {
		return () => {
			if (selected.label == newSelectedOption.label && allowDeselect) {
				selected = null;
				dispatch("change", selected);
				return;
			}
			selected = newSelectedOption;
			dispatch("change", selected);
		};
	}

</script>

<div class="btn-group" role="group">
	{#each options as option, idx}
		<input id="{id}-{idx}" type="radio" class="btn-check" autocomplete="off"
			   checked={selected && selected.label == option.label}
			   on:click={onClick(option)}>
		<label class="btn btn-outline-primary p-3" for="{id}-{idx}">
			{option.label}
		</label>

	{/each}
</div>