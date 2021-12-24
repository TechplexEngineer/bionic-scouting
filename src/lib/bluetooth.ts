import { BluetoothSerial } from 'bionic-bt-serial';
import { readable } from 'svelte/store';

export const connections = readable([], (set) => {
	(async () => {
		set((await BluetoothSerial.getConnectedDevices()).result);
	})();
	const handle = setInterval(async () => {
		set((await BluetoothSerial.getConnectedDevices()).result);
	}, 5 * 1000);

	return () => clearInterval(handle);
});

// export function StartConnectedWatcher(): void {
//   if (connectionWatchHandle) {
//     clearInterval(connectionWatchHandle);
//     connectionWatchHandle = null;
//   }
//   connectionWatchHandle =
// }
