<script context="module">
	// Disable server side rendering for this page
	export const ssr = false;

	import "bootstrap/dist/css/bootstrap.min.css";
	import "../app.css";
	import { App } from "@capacitor/app";

	// not sure how else to do this so we only get do init work once
	import { init } from "$lib/init";

	init();

	async function getVersion() {
		const info = await App.getInfo();
		return info.version;
	}
</script>

<script lang="ts">
	import Header from "$lib/header/Header.svelte";

	import { onDestroy } from "svelte";

	onDestroy(() => {
		console.log("Layout OnDestroy");
	});
</script>

<Header />

<main>
	<slot />
</main>

<footer>
	{new Date().getFullYear()} &copy; FRC Team 4909 Bionics &mdash;
	{#await getVersion()}
		...
	{:then version}
		<!-- promise was fulfilled -->
		{version}
	{:catch error}
		{error.message}
	{/await}
</footer>

<style>
	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 1024px;
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 40px;
	}

	@media (min-width: 480px) {
		footer {
			padding: 40px 0;
		}
	}
</style>
