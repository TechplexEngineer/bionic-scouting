<svelte:head>
    <title>Settings</title>
</svelte:head>

<script lang="ts">
    import {onMount} from "svelte";
    import {getDb, MyDatabase} from "$lib/store";
    import SpinButton from "$lib/compontents/SpinButton.svelte";

    let db: MyDatabase;
    onMount(async () => {
        db = await getDb();
    })

    let syncMessages = "Sync not started.";

    enum SyncDirection {
        PUSH = "PUSH",
        PULL = "PULL",
        BOTH = "BOTH"
    }

    const LogSyncMessage = (msg: string) => {
        syncMessages += `${new Date().toLocaleDateString('en-US')} ${new Date().toLocaleTimeString('en-US')}:: ${msg}\n`;
    }

    //@todo only one sync should happen at a time for messages to make any sense.
    const sync = (syncDir: SyncDirection) => {
        return () => {
            // this is a total hack
            process.browser = true;
            // this solves our sync problem

            syncMessages = '';
            LogSyncMessage(`Started Sync: Direction ${syncDir}`);

            const replicationState = db.pit_scouting.syncCouchDB({
                remote: "http://tga_app:oH2955UqY8bg@104.248.113.190:5984/events_2022/", // remote database. This can be the serverURL, another RxCollection or a PouchDB-instance
                waitForLeadership: true,              // (optional) [default=true] to save performance, the sync starts on leader-instance only
                direction: {                          // direction (optional) to specify sync-directions
                    pull: syncDir == SyncDirection.PULL || syncDir == SyncDirection.BOTH, // default=true
                    push: syncDir == SyncDirection.PUSH || syncDir == SyncDirection.BOTH  // default=true
                },
                options: {                             // sync-options (optional) from https://pouchdb.com/api.html#replication
                    live: false, // false means one shot
                    retry: false
                },
                // query: myCollection.find().where('age').gt(18) // query (optional) only documents that match that query will be synchronised
            });


            // replicationState.
            replicationState.change$.subscribe(change => {
                console.log("change", change);
            });
            replicationState.docs$.subscribe(docData => {
                console.log("docData", docData);
            });
            replicationState.denied$.subscribe(docData => {
                console.log("docData", docData);
            });
            replicationState.active$.subscribe(active => {
                console.log("active", active);
            });
            replicationState.alive$.subscribe(alive => {
                console.log("alive", alive);
            });
            replicationState.complete$.subscribe((completed: boolean | { ok: boolean, errors: string[], last_seq: number, start_time: string, end_time: string, docs_read: number, docs_written: number, doc_write_failures: number, status: string }) => {
                console.log("completed", completed);
                if (completed && typeof completed !== "boolean") {
                    LogSyncMessage(`Sync Complete: read:${completed.docs_read} written:${completed.docs_written}`);
                }
                // undo our nasty hack
                process.browser = undefined;
            });
            replicationState.error$.subscribe(error => {
                console.log("error", error);
                LogSyncMessage(`Error Syncing: ${error.message}`);
            });
        }
    }
</script>

<div class="content">
    <h1>Sync</h1>
    <div class="d-flex justify-content-between mb-4">
        <SpinButton class="btn btn-warning" onClick={sync(SyncDirection.PULL)}>Pull Pit Data</SpinButton>
        <SpinButton class="btn btn-info" onClick={sync(SyncDirection.PUSH)}>Push Pit Data</SpinButton>
    </div>

    <label for="syncMessages">Sync Messages:</label>
    <textarea id="syncMessages" class="form-control mt-2" disabled rows="25" bind:value={syncMessages}></textarea>
</div>

<style>
</style>
