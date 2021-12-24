<svelte:head>
	<title>Home</title>
</svelte:head>

<script lang="ts">
	import { BluetoothSerial } from "bionic-bt-serial";

	let deviceName = "...";
	(async () => {
		deviceName = (await BluetoothSerial.getName()).result;
	})();
	let eventName = "Week 0";
</script>

<div class="container-fluid">
	<h1>This device is <b>{deviceName}</b></h1>
	<h1>Current Event <b>{eventName}</b></h1>
</div>

<style>

</style>
