<script lang="ts">
    import * as bt from "$lib/bluetooth";
    import Select from "svelte-select";
    import {BluetoothSerial} from "bionic-bt-serial";

    import {getDb} from "$lib/store";
    import {onMount} from "svelte";

    export let colClass: string;

    async function click_sendMessage() {
        if (!bt.isMessageCenterRunning()) {
            alert("Message center must be running.");
            return;
        }
        const macAddress = sendMessageToItem.value;
        const res = await bt.sendMessage(macAddress, {
            action: "chat",
            data: dataToSend
        }, {timeoutMs: 5 * 1000});
        console.log(res);
    }

    type SelectItem = { label: string, value: string };
    let connectedDevices: SelectItem[] = [];
    let sendMessageToItem: SelectItem;
    let dataToSend = "";
    let db;

    onMount(async () => {
        db = await getDb();
        let result = await BluetoothSerial.getConnectedDevices();
        connectedDevices = result.result.map(d => {
            return {
                label: `${d.name} (${d.macAddress}})`,
                value: d.macAddress
            };
        });
        if (connectedDevices.length > 0) {
            sendMessageToItem = connectedDevices[0];
        }
    });

    async function click_syncNotes() {
        const macAddress = sendMessageToItem.value;
        // const res = await bt.sendMessage(macAddress, {
        // 	action: "chat",
        // 	data: dataToSend
        // }, { timeoutMs: 5 * 1000 });
        // console.log(res);

        // Use dynamic import to solve "Error [ERR_UNSUPPORTED_DIR_IMPORT]: Directory import"
        let {replicateRxCollection} = await import("rxdb/src/plugins/replication")


        const replicationState = await replicateRxCollection({
            collection: db.notes,
            replicationIdentifier: "my-notes-replication",
            // retryTime
            pull: {
                async handler(latestPullDocument): Promise<{ documents: any, hasMoreDocuments: boolean }> {
                    let res;
                    try {
                        const limitPerPull = 10;
                        const minTimestamp = latestPullDocument ? latestPullDocument.updatedAt : 0;

                        res = await bt.sendMessage(macAddress, {
                            action: "getNotes",
                            data: "",
                            params: {
                                updatedSince: minTimestamp,
                                limit: limitPerPull
                            }
                        }, {timeoutMs: 5 * 1000});

                    } catch (e) {
                        console.log(e);
                        res = [];
                    }
                    return {documents: res, hasMoreDocuments: false};
                }
            },
            push: {
                batchSize: 5,
                async handler(docs): Promise<void> {

                    try {
                        const res = await bt.sendMessage(macAddress, {
                            action: "putNotes",
                            data: docs,
                            params: {
                                // updatedSince: minTimestamp,
                                // limit: limitPerPull
                            }
                        }, {timeoutMs: 5 * 1000});

                    } catch (e) {
                        console.log(e);
                    }
                    return;
                }
            },
            live: false //false=do one time replication, true=continuously sync changes
        });
        console.log("replication state", replicationState);
    }

    async function click_startMessageCenter() {
        console.log("Starting message center");
        await bt.startMessageCenter();
    }


</script>


<div class="col {colClass} card">
    <div class="card-body">
        <h5 class="card-title">Message Center: Send</h5>
        <Select items={connectedDevices} bind:value={sendMessageToItem}/>

        <input type="text" class="form-control" bind:value={dataToSend} placeholder="data to send">
        <button class="btn btn-primary" on:click={click_sendMessage}>sendMessage</button>

    </div>
</div>

<div class="col {colClass} card">
    <div class="card-body">
        <h5 class="card-title">Message Center: Receive</h5>

    </div>
</div>

<div class="col {colClass} card">
    <div class="card-body">

        <h5 class="card-title">Notes Sync</h5>
        <button class="btn btn-primary" on:click={click_startMessageCenter}>StartMessageCenter</button>
        <button class="btn btn-primary" on:click={click_syncNotes}>syncNotes</button>
    </div>
</div>