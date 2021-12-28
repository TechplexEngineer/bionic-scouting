<script>
	import Boolean from "$lib/compontents/Boolean.svelte";
	import { writable } from "svelte/store";
	import Select from "svelte-select";

	const value = writable(false);
	value.subscribe(v => {
		console.log("value", v);
	});
	const items = [
		{ label: "Blue (btn-outline-primary)", value: "btn-outline-primary" },
		{ label: "Gray (btn-outline-secondary)", value: "btn-outline-secondary" },
		{ label: "Green (btn-outline-success)", value: "btn-outline-success" },
		{ label: "Teal (btn-outline-info)", value: "btn-outline-info" },
		{ label: "Yellow (btn-outline-warning)", value: "btn-outline-warning" },
		{ label: "Red (btn-outline-danger)", value: "btn-outline-danger" },
		{ label: "White (btn-outline-light)", value: "btn-outline-light" },
		{ label: "Black (btn-outline-dark)", value: "btn-outline-dark" }
	];
	let classes = ["btn-outline-primary"];
	let startingValue = { label: "primary", value: "btn-outline-primary" };

	function handleSelect(event) {
		console.log("selected item", event.detail.value);

		classes = [event.detail.value];
	}
</script>

<h3>Config</h3>
<label>Color</label>
<Select isCreatable="true" items={items} value="{startingValue}" on:select={handleSelect}
				placeholder="Color..." />
<hr>
<Boolean label="Toggle" value={value} classes={classes} />
<hr>
<h2>Value is: {$value}</h2>