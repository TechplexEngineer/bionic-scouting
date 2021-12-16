<svelte:head>
	<title>Bluetooth Settings</title>
</svelte:head>

<script context="module" lang="ts">
	import {BluetoothSerial, BTDevice} from 'bionic-bt-serial';
</script>

<script lang="ts">

	import { onDestroy } from 'svelte';


	let devices: BTDevice[] = [];
	let deviceName = "loading...";
	let newDeviceName = "";
	let dataToSend = "";
	let isAdapterEnabled = false;
	let isServerListening = false;
	let connectedDevices: BTDevice[] = [];

	let discoveredDevices: BTDevice[] = [];
	(async ()=>{
		deviceName = (await BluetoothSerial.getName()).result;
		isAdapterEnabled = (await BluetoothSerial.isEnabled()).result
		isServerListening = (await BluetoothSerial.isListening()).result
	})()

	async function click_getBondedDevices() {
		console.log("click_getBondedDevices", await BluetoothSerial.getBondedDevices())
		devices = (await BluetoothSerial.getBondedDevices()).result
	}

	function listenCallback(message) {
		console.log(`listenCallback ${JSON.stringify(message.connected)}`)
	}

	async function click_startListening() {
		isServerListening = true;
		console.log("click_startListening", await BluetoothSerial.startListening({}, listenCallback))
	}
	async function click_stopListening() {
		isServerListening = false;
		console.log("click_stopListening", await BluetoothSerial.stopListening())
	}
	async function click_isListening() {
		let raw = await BluetoothSerial.isListening();
		isServerListening = raw.result;
		console.log("click_isListening", raw)
	}
	async function click_connect() {
		let info = await BluetoothSerial.getBondedDevices()
		let devices = info.result
		console.log("Devices: ", devices)
		if (devices && devices.length > 0) {
			let macAddress = devices[0].macAddress;
			console.log("Attempting to connect to: ", macAddress)
			console.log("click_connect", await BluetoothSerial.connect({macAddress: macAddress}))
		} else {
			console.log("no bonded devices");
		}
	}
	async function click_isConnected() {
		console.log("click_isConnected", await BluetoothSerial.isConnected({macAddress: "AA:BB:CC:DD:EE:FF"}))
	}
	async function click_disconnect() {
		console.log("click_disconnect", await BluetoothSerial.disconnect({macAddress: "AA:BB:CC:DD:EE:FF"}))
	}

	async function click_getConnectedDevices() {
		console.log("click_getConnectedDevices", await BluetoothSerial.getConnectedDevices())
	}

	function stringToArrayBuffer(str:string): ArrayBufferLike {
		var ret = new Uint8Array(str.length);
		for (var i = 0; i < str.length; i++) {
			ret[i] = str.charCodeAt(i);
		}
		return ret.buffer;
	};

	async function click_write() {
		let info = await BluetoothSerial.getBondedDevices()
		let devices = info.result;
		console.log("Devices: ", devices)
		if (devices && devices.length > 0) {
			let macAddress = devices[0].macAddress;
			console.log("click_write", await BluetoothSerial.write({
				macAddress: macAddress,
				data: stringToArrayBuffer("fred")
			}))
		} else {
			console.log("no bonded devices");
		}
	}
	async function click_isEnabled() {
		let raw = await BluetoothSerial.isEnabled();
		isAdapterEnabled = raw.result;
		console.log("click_isEnabled", raw)
	}
	async function click_enableAdapter() {

		console.log("click_enable", await BluetoothSerial.enableAdapter());
		isAdapterEnabled = true;
	}
	async function click_disableAdapter() {
		console.log("click_disable", await BluetoothSerial.disableAdapter());
		isAdapterEnabled = false;
	}
	async function click_showBluetoothSettings() {
		console.log("click_showBluetoothSettings", await BluetoothSerial.showBluetoothSettings())
	}

	function discoveryCallback(device: BTDevice) {
		console.log(`discoveryCallback ${JSON.stringify(device)}`)
		if (device != null) {
			discoveredDevices = [...discoveredDevices, device];
		}
	}

	async function click_startDiscovery() {
		console.log("click_startDiscovery", await BluetoothSerial.startDiscovery({}, discoveryCallback))
	}
	async function click_cancelDiscovery() {
		console.log("click_cancelDiscovery", await BluetoothSerial.cancelDiscovery())
	}
	async function click_setName() {
		console.log("click_setName", await BluetoothSerial.setName({name: newDeviceName}))
		deviceName = (await BluetoothSerial.getName()).result;
	}
	async function click_getName() {
		let raw = await BluetoothSerial.getName();
		deviceName = raw.result;
		console.log("click_getName", raw)
	}
	async function click_setDiscoverable() {
		console.log("click_setDiscoverable", await BluetoothSerial.setDiscoverable({durationSec:120}))
	}

	let listeners = [];
	let dataReceived: string[] = [];

	(async ()=>{
		listeners.push(await BluetoothSerial.addListener("discovered", (info: BTDevice) => {
			console.log("event: discovered:", info)
		}))
		listeners.push(await BluetoothSerial.addListener("rawData", (info: {bytes: ArrayBufferLike}) => {
			console.log("event: rawData:", info)
			dataReceived = [...dataReceived, info.bytes.toString()] //b/c Svelte reactivity is based on equals sign
		}))
		listeners.push(await BluetoothSerial.addListener("connected", (info: BTDevice) => {
			console.log("event: connected:", info)
		}))
		listeners.push(await BluetoothSerial.addListener("connectionFailed", (info: BTDevice) => {
			console.log("event: connectionFailed", info)
		}))
		listeners.push(await BluetoothSerial.addListener("connectionLost", (info: BTDevice) => {
			console.log("event: connectionLost", info)
		}))
		console.log(listeners[0], typeof listeners[0])
	})()

	//cleanup listeners when page is unloaded
	onDestroy(() => {
		for (const listener of listeners) {
			listener.remove()
		}
	});

	function clickMe() {
		console.log("Clicked!")
	}
</script>

<style>
	.col.card {
		padding-left: 0;
		padding-right: 0;
	}
	.card-title>small {
		color: #6c757d;
	}
</style>

<div class="content">
	<h1>Bluetooth Tools</h1>

	<div class="row">
		<div class="col col-sm-6 card">
			<div class="card-body">
				<h5 class="card-title">Paired Devices<br><small>May not be in range</small></h5>
				<button class="btn btn-primary" on:click={click_getBondedDevices}>getBondedDevices</button>
				<ul>
					{#each devices as device}
						<li>{device.name} -- {device.macAddress} -- {device.class}</li>
					{/each}
				</ul>
			</div>
		</div>
		<div class="col col-sm-6 card">
			<div class="card-body">
				<h5 class="card-title">Discovery<br><small>Find unpaired devices</small></h5>
				<button class="btn btn-primary" on:click={click_startDiscovery}>Start</button>
				<button class="btn btn-primary" on:click={click_cancelDiscovery}>Cancel</button>
				<button class="btn btn-primary" on:click={click_setDiscoverable}>setDiscoverable</button>
				<ul>
					{#each discoveredDevices as device}
						<li>{device.name} -- {device.macAddress} -- {device.class} <button class="btn btn-primary btn-sm" on:click={()=>{
							BluetoothSerial.connect({macAddress: device.macAddress})
						}}>Connect</button></li>
					{/each}
				</ul>


			</div>
		</div>
		<div class="col col-sm-6 card">
			<div class="card-body">
				<h5 class="card-title">Server: {#if isServerListening}Listening{:else}Idle{/if}</h5>
				<button class="btn btn-primary" on:click={click_startListening}>startListening</button>
				<button class="btn btn-primary" on:click={click_stopListening}>stopListening</button>
				<button class="btn btn-primary" on:click={click_isListening}>isListening</button>
			</div>
		</div>
		<div class="col col-sm-6 card">
			<div class="card-body">
				<h5 class="card-title">Client:</h5>
				<button class="btn btn-primary" on:click={click_connect}>connect</button>
				<button class="btn btn-primary" on:click={click_isConnected}>isConnected</button>
				<button class="btn btn-primary" on:click={click_disconnect}>disconnect</button>
				<button class="btn btn-primary" on:click={click_getConnectedDevices}>getConnectedDevices</button>
				<ul>
					{#each connectedDevices as device}
					<li>{device.name} -- {device.macAddress} -- {device.class}</li>
					{/each}
				</ul>

			</div>
		</div>
		<div class="col col-sm-6 card">
			<div class="card-body">
				<h5 class="card-title">Adapter: {#if isAdapterEnabled}Enabled{:else}Disabled{/if}</h5>
				<button class="btn btn-primary" on:click={click_isEnabled}>isEnabled</button>
				<button class="btn btn-primary" on:click={click_enableAdapter}>Enable</button>
				<button class="btn btn-primary" on:click={click_disableAdapter}>Disable</button>
			</div>
		</div>
		<div class="col col-sm-6 card">
			<div class="card-body">
				<h5 class="card-title">Name: {deviceName}</h5>
				<button class="btn btn-primary" on:click={click_getName}>getName</button>
				<button class="btn btn-primary" on:click={click_setName}>setName</button>
				<input type="text" class="form-control" bind:value={newDeviceName} placeholder="new adapter name">
			</div>
		</div>

		<div class="col col-sm-6 card">
			<div class="card-body">
				<h5 class="card-title">Send Data</h5>
				<button class="btn btn-primary" on:click={click_write}>write</button>
				<input type="text" class="form-control" bind:value={dataToSend}>
			</div>
		</div>
		<div class="col col-sm-6 card">
			<div class="card-body">
				<h5 class="card-title">Received Data</h5>
				<ul>
					{#each dataReceived as d}
					<li>{d}</li>
					{/each}
				</ul>
			</div>
		</div>
		<div class="col col-sm-6 card">
			<div class="card-body">
				<h5 class="card-title">Misc</h5>
				<button class="btn btn-primary" on:click={click_showBluetoothSettings}>showBluetoothSettings</button>


				<button class="btn btn-primary" on:click={clickMe}>test</button>
			</div>
		</div>

	</div>
</div>

