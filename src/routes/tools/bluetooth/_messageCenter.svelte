<script lang="ts">
	import * as bt from "$lib/bluetooth";
	import Select from "svelte-select";
	import { BluetoothSerial } from "bionic-bt-serial";

	async function click_startMessageCenter() {
		await bt.startMessageCenter();
		console.log("Message Center Started");
	}

	async function click_stopMessageCenter() {
		await bt.stopMessageCenter();
		console.log("Message Center Stopped");
	}

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

	(async () => {
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
	})();


</script>


<div class="col col-sm-6 card">
	<div class="card-body">
		<h5 class="card-title">Message Center</h5>
		<button class="btn btn-primary" on:click={click_startMessageCenter}>startMessageCenter</button>
		<button class="btn btn-primary" on:click={click_stopMessageCenter}>stopMessageCenter</button>
	</div>
</div>

<div class="col col-sm-6 card">
	<div class="card-body">
		<h5 class="card-title">Message Center: Send</h5>
		<Select items={connectedDevices} bind:value={sendMessageToItem} />

		<input type="text" class="form-control" bind:value={dataToSend} placeholder="data to send">
		<button class="btn btn-primary" on:click={click_sendMessage}>sendMessage</button>

	</div>
</div>

<div class="col col-sm-6 card">
	<div class="card-body">
		<h5 class="card-title">Message Center: Receive</h5>

	</div>
</div>
