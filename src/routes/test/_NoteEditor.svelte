<script>
    import {writable} from "svelte/store";

    export let selectedNote = writable({}); //caller is expected to pass in the selected not writeable store
    import {getDb, name, body} from '$lib/store';

    const isEmptyObject = (obj) => obj && Object.keys(obj).length === 0 && obj.constructor === Object;

    const resetForm = () => {
        name.set('');
        body.set('');
        selectedNote.set({});
    };

    selectedNote.subscribe(value => {
        if (value == null) {
            resetForm()
        }
    });

    const saveNote = async () => {
        const db$ = await getDb();
        if (isEmptyObject($selectedNote)) {
            await db$.notes
                .insert({
                    name: $name,
                    body: $body,
                    createdAt: new Date().getTime(),
                    updatedAt: new Date().getTime(),
                })
            resetForm()
        } else {
            await $selectedNote
                .update({
                    $set: {
                        name: $name,
                        body: $body,
                        updatedAt: new Date().getTime(),
                    },
                })
            resetForm()
        }
    };
</script>

<div>
    <input bind:value={$name} placeholder="Note Title" class="form-control mb-1"/>
    <textarea bind:value={$body} placeholder="Note Content..." class="form-control mb-2"></textarea>
    <div class="d-flex justify-content-between">
        <button on:click={resetForm} class="btn btn-danger">New Note</button>
        <button on:click={saveNote} class="btn btn-primary">Save Note</button>
    </div>
</div>

<style>
</style>