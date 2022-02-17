<script lang="ts">
	import * as bt from "$lib/bluetooth";
	import Select from "svelte-select";
	import { BluetoothSerial } from "bionic-bt-serial";

	import { getDb } from "$lib/store";
	import { onMount } from "svelte";
	import { doReplication } from "$lib/sync/replication";

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
		}, { timeoutMs: 5 * 1000 });
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

		const state = await doReplication(db, macAddress, "notes");
		console.log(state);


	}

	async function click_startMessageCenter() {
		console.log("Starting message center");
		await bt.startMessageCenter();
	}


</script>


<div class="col {colClass} card">
	<div class="card-body">
		<h5 class="card-title">Message Center: Send</h5>
		<Select items={connectedDevices} bind:value={sendMessageToItem} />

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