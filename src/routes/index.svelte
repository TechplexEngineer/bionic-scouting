<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	import Counter from '$lib/Counter.svelte';
	import {BluetoothSerial, BTDevice} from 'bionic-bt-serial';
	// import { Plugins } from '@capacitor/core';

	let devices: BTDevice[] = [];

	async function click_getBondedDevices() {
		// getBondedDevices(): Promise<{ devices: BTDevice[] } | string>;
		console.log("click_getBondedDevices", await BluetoothSerial.getBondedDevices())
		devices = (await BluetoothSerial.getBondedDevices()).devices
	}

	function listenCallback(message) {
		console.log(`listenCallback ${JSON.stringify(message.connected)}`)
	}

	async function click_startListening() {
		// startListening(callback: ListenCallback): Promise<void>;
		console.log("click_startListening", await BluetoothSerial.startListening(listenCallback))
	}
	async function click_stopListening() {
		// stopListening(): Promise<void>;
		console.log("click_stopListening", await BluetoothSerial.stopListening())
	}
	async function click_isListening() {
		// isListening(): Promise<{ result: boolean}>;
		console.log("click_isListening", await BluetoothSerial.isListening())
	}
	async function click_connect() {
		let info = await BluetoothSerial.getBondedDevices()
		let devices = info.devices
		console.log("Devices: ", devices)
		if (devices && devices.length > 0) {
			let macAddress ="AA:BB:CC:DD:EE:FF";
			macAddress = devices[0].macAddress
			console.log("Attempting to connect to: ", macAddress)
			console.log("click_connect", await BluetoothSerial.connect({macAddress: macAddress}))
		}
		// connect(options: { macAddress:string }): Promise<void>;
	}
	async function click_isConnected() {
		// isConnected(options: { macAddress:string }): Promise<{ result: boolean}>;
		console.log("click_isConnected", await BluetoothSerial.isConnected({macAddress: "AA:BB:CC:DD:EE:FF"}))
	}
	async function click_disconnect() {
		// disconnect(): Promise<void>;
		console.log("click_disconnect", await BluetoothSerial.disconnect())
	}
	async function click_write() {
		// write(options: {macAddress:string, data:object}): Promise<{ result: boolean}>;
		console.log("click_write", await BluetoothSerial.write({
			macAddress: "AA:BB:CC:DD:EE:FF",
			data: {}
		}))
	}
	async function click_isEnabled() {
		// isEnabled(): Promise<{result:boolean}>;
		console.log("click_isEnabled", await BluetoothSerial.isEnabled())
	}
	async function click_enable() {
		// enable(): Promise<void>;
		console.log("click_enable", await BluetoothSerial.enable())
	}
	async function click_showBluetoothSettings() {
		// showBluetoothSettings(): Promise<void>;
		console.log("click_showBluetoothSettings", await BluetoothSerial.showBluetoothSettings())
	}

	function discoveryCallback(device: BTDevice) {
		console.log(`discoveryCallback ${JSON.stringify(device)}`)
	}

	async function click_startDiscovery() {
		// startDiscovery(callback: DiscoveryCallback): Promise<void>;
		console.log("click_startDiscovery", await BluetoothSerial.startDiscovery(discoveryCallback))
	}
	async function click_cancelDiscovery() {
		// cancelDiscovery(): Promise<void>;
		console.log("click_cancelDiscovery", await BluetoothSerial.cancelDiscovery())
	}
	async function click_setName() {
		// setName(options: {name: string}): Promise<void>;
		console.log("click_setName", await BluetoothSerial.setName({name: "newName"}))
	}
	async function click_getName() {
		// getName(): Promise<{name: string}>;
		console.log("click_getName", await BluetoothSerial.getName())
	}
	async function click_setDiscoverable() {
		// setDiscoverable(options: {durationSec?: number}): Promise<void>;
		console.log("click_setDiscoverable", await BluetoothSerial.setDiscoverable(120))
	}

	BluetoothSerial.addListener("discovery", (info: any) => {
		console.log("discovery", info)
	})
	BluetoothSerial.addListener("data", (info: any) => {
		console.log("data", info)
	})
	BluetoothSerial.addListener("connected", (info: any) => {
		console.log("connected", info)
	})
	BluetoothSerial.addListener("connectionFailed", (info: any) => {
		console.log("connectionFailed", info)
	})
	BluetoothSerial.addListener("connectionLost", (info: any) => {
		console.log("connectionLost", info)
	})

	function clickMe() {
		console.log("Clicked!")
	}


</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<section>

	<button class="btn btn-primary" on:click={click_getBondedDevices}>getBondedDevices</button>
	<ul>
		{#each devices as device}
			<li>{device.name} -- {device.macAddress} -- {device.class}</li>
		{/each}
	</ul>
	<button class="btn btn-primary" on:click={click_startListening}>startListening</button>
	<button class="btn btn-primary" on:click={click_stopListening}>stopListening</button>
	<button class="btn btn-primary" on:click={click_isListening}>isListening</button>
	<button class="btn btn-primary" on:click={click_connect}>connect</button>
	<button class="btn btn-primary" on:click={click_isConnected}>isConnected</button>
	<button class="btn btn-primary" on:click={click_disconnect}>disconnect</button>
	<button class="btn btn-primary" on:click={click_write}>write</button>
	<button class="btn btn-primary" on:click={click_isEnabled}>isEnabled</button>
	<button class="btn btn-primary" on:click={click_enable}>enable</button>
	<button class="btn btn-primary" on:click={click_showBluetoothSettings}>showBluetoothSettings</button>
	<button class="btn btn-primary" on:click={click_startDiscovery}>startDiscovery</button>
	<button class="btn btn-primary" on:click={click_cancelDiscovery}>cancelDiscovery</button>
	<button class="btn btn-primary" on:click={click_setName}>setName</button>
	<button class="btn btn-primary" on:click={click_getName}>getName</button>
	<button class="btn btn-primary" on:click={click_setDiscoverable}>setDiscoverable</button>

	<button class="btn btn-primary" on:click={clickMe}>test</button>

	<Counter />
</section>

<style>

	button {
		margin-bottom: 10px;
	}

	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 1;
	}

	h1 {
		width: 100%;
	}

	.welcome {
		position: relative;
		width: 100%;
		height: 0;
		padding: 0 0 calc(100% * 495 / 2048) 0;
	}

	.welcome img {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		display: block;
	}
</style>
