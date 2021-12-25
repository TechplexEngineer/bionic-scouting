<script lang="ts">
	import type writable from "svelte/store";

	export let selectedNote: typeof writable;
	import { onMount } from "svelte";

	import { getDb } from "$lib/store";

	let db$;
	let noteList = [];

	onMount(async () => {
		db$ = await getDb();
		db$.notes
			.find()
			.sort({ updatedAt: "desc" })
			.$.subscribe((notes) => (noteList = notes));
	});

	const handleEditNote = (note) => {
		selectedNote.set(note);
	};

	async function deleteNote(note) {
		selectedNote.set(null); // to clear the form
		await note.remove();
	}
</script>

<div>
	<h2>NoteList.svelte</h2>
	<ul>

		{#each noteList as note}
			<li>
                <span>
                    <button on:click={() => handleEditNote(note)} class="btn btn-link btn-sm">{note.name}</button>
									{#if note.body !== ''}<span style="color: #757575">—</span>{/if}
									<span class="text-muted">
                        {note.body ?? ''}
                    </span>
                </span>

				<span class="meta">
                    {new Date(note.updatedAt).toLocaleDateString('en-US')}
					<button on:click={() => deleteNote(note)} class="btn btn-danger btn-sm">delete</button>
                </span>
			</li>
		{/each}
	</ul>
</div>

<style>

</style>