<svelte:head>
    <title>Settings</title>
</svelte:head>

<script lang="ts">
    import {onMount} from "svelte";
    import {getDb, MyDatabase} from "$lib/store";
    import SpinButton from "$lib/compontents/SpinButton.svelte";
    import {getCurrentEvent} from "$lib/util";
    import Select from "svelte-select";
    import Swal from "sweetalert2";

    let db: MyDatabase;
    let eventKey: string; //eg. 2020week0 (current event)


    onMount(async () => {
        db = await getDb();

        eventKey = await getCurrentEvent(db);
    })


    let syncMessages = "Sync not started.";

    enum SyncDirection {
        PUSH = "PUSH",
        PULL = "PULL",
        BOTH = "BOTH"
    }
    const syncOptions: {label:string, value:string}[] = [
        { label: "Pit Scouting & Pics", value:"pit_scouting"},
        { label: "Match Schedule", value:"matches"},
        { label: "Match Observations", value:"match_subjective"},
        // { label: "notes", value:"notes"},
        // { label: "settings", value:"settings"}, //special case skip device name
        { label: "Strategists & Assignments", value:"super_scouts"},
    ];
    let selectedSyncDb:{label:string, value:string} = syncOptions[0];

    const LogSyncMessage = (msg: string) => {
        syncMessages += `${new Date().toLocaleDateString('en-US')} ${new Date().toLocaleTimeString('en-US')}:: ${msg}\n`;
    }

    //@todo only one sync should happen at a time for messages to make any sense.
    const sync = (syncDir: SyncDirection) => {
        return (): Promise<void> => {

            return new Promise((resolve, reject) => {
                // this is a total hack
                process.browser = true;
                // this solves our sync problem

                syncMessages = '';
                let dbURL = `${import.meta.env.VITE_COUCHDB_URL}/db_${eventKey}_${selectedSyncDb.value}/`;
                LogSyncMessage(`Started Sync: Direction ${syncDir}`);
                const url = new URL(dbURL);
                url.password = "<REDACTED>";
                LogSyncMessage(`    URL: ${url.toString()}`)

                let dbToSync;
                switch (selectedSyncDb.value) {
                    case "pit_scouting":
                        dbToSync = db.pit_scouting;
                        break;
                    case "matches":
                        dbToSync = db.matches;
                        break;
                    case "match_subjective":
                        dbToSync = db.match_subjective;
                        break;
                    case "notes":
                        dbToSync = db.notes;
                        break;
                    case "settings":
                        dbToSync = db.settings;
                        break;
                    case "super_scouts":
                        dbToSync = db.super_scouts;
                        break;
                    default:
                        Swal.fire({
                            icon: "error",
                            title: "Unexpected sync db",
                            html: `Error: ${selectedSyncDb} is not a valid option`,
                            showConfirmButton: false
                        });
                        return;
                }


                const replicationState = dbToSync.syncCouchDB({
                    remote: dbURL, // remote database. This can be the serverURL, another RxCollection or a PouchDB-instance
                    waitForLeadership: true,              // (optional) [default=true] to save performance, the sync starts on leader-instance only
                    direction: {                          // direction (optional) to specify sync-directions
                        pull: syncDir == SyncDirection.PULL || syncDir == SyncDirection.BOTH, // default=true
                        push: syncDir == SyncDirection.PUSH || syncDir == SyncDirection.BOTH  // default=true
                    },
                    options: {                             // sync-options (optional) from https://pouchdb.com/api.html#replication
                        live: false, // false means one shot
                        retry: false,
                        batch_size: 5
                    },

                    // query: dbToSync.find().where({eventKey}).eq(eventKey) // query (optional) only documents that match that query will be synchronised
                });


                // replicationState.
                replicationState.change$.subscribe(change => {
                    // console.log("change", change);
                    let msg =`---> change `;
                    if (change.ok) {
                        msg += `completed: ${change.docs_read} pending: ${change.pending} `
                    } else {
                        msg += JSON.stringify(change);
                    }
                    LogSyncMessage(msg);
                });
                replicationState.docs$.subscribe(docData => {
                    // console.log("docData", docData);
                    LogSyncMessage(`---> docData ${JSON.stringify(docData)}`);
                });
                replicationState.denied$.subscribe(docData => {
                    // console.log("denied", docData);
                    LogSyncMessage(`---> denied ${JSON.stringify(docData)}`);
                });
                replicationState.active$.subscribe(active => {
                    // console.log("active", active);
                    LogSyncMessage(`---> active ${active}`);
                });
                replicationState.alive$.subscribe(alive => {
                    // console.log("alive", alive);
                    LogSyncMessage(`---> alive ${alive}`);
                });
                replicationState.complete$.subscribe((completed: boolean | { ok: boolean, errors: string[], last_seq: number, start_time: string, end_time: string, docs_read: number, docs_written: number, doc_write_failures: number, status: string }) => {
                    // console.log("completed", completed);
                    if (completed && typeof completed !== "boolean") {
                        LogSyncMessage(`Sync Complete: read:${completed.docs_read} written:${completed.docs_written}`);
                    }
                    resolve();
                    // undo our nasty hack
//                 process.browser = undefined;
                });
                replicationState.error$.subscribe(error => {
                    // console.log("error", error);
                    LogSyncMessage(`Error Syncing: ${error.message} ${error.stack} ${error}`);
                    resolve();
                });
            });
        }
    }
</script>

<div class="content">
    <h1>Sync</h1>
    <div class="d-flex mb-4">
        <div class="flex-grow-1 me-2">
            <Select items={syncOptions} bind:value={selectedSyncDb}/>
        </div>
        <SpinButton class="btn btn-warning me-2" onClick={sync(SyncDirection.PULL)}>Pull Data</SpinButton>
        <SpinButton class="btn btn-info" onClick={sync(SyncDirection.PUSH)}>Push Data</SpinButton>
    </div>

    <label for="syncMessages">Sync Messages:</label>
    <textarea id="syncMessages" class="form-control mt-2" disabled rows="25" bind:value={syncMessages}></textarea>
</div>

<style>
</style>
