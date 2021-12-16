<svelte:head>
	<title>Home</title>
</svelte:head>

<script lang="ts">
	import Counter from '$lib/Counter.svelte';



</script>

<section>
	<Counter />
</section>

<style>

	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 1;
	}

</style>
