<script context="module">
	// Disable server side rendering for this page
	export const ssr = false;
</script>

<script lang="ts">
	import NoteEditor from "./_NoteEditor.svelte";
	import NoteList from "./_NoteList.svelte";
	import { writable } from "svelte/store";

	const selectedNote: writable<any> = writable({});
</script>

<div class="card">
	<h1 class="card-header">Notes</h1>
	<div class="card-body">
		<NoteEditor selectedNote={selectedNote} />

	</div>
	<div class="card-footer">
		<NoteList selectedNote={selectedNote} />
	</div>
</div>

<style>

</style>