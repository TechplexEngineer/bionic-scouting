<script>
	import Counter from "$lib/compontents/Counter.svelte";
	import { writable } from "svelte/store";

	let value = 0;
</script>

<h1>Count is: {value}</h1>

<Counter bind:value={value} />