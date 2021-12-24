import { BluetoothSerial } from 'bionic-bt-serial';
import { readable } from 'svelte/store';
// import * as timersPromises from 'timers/promises';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '$lib/store';

export const connections = readable([], (set) => {
	(async () => {
		set((await BluetoothSerial.getConnectedDevices()).result);
	})();
	const handle = setInterval(async () => {
		set((await BluetoothSerial.getConnectedDevices()).result);
	}, 5 * 1000);

	return () => clearInterval(handle);
});

let listnerHandle;
let db;

/**
 * Start listening for messages from bluetooth connections
 */
export async function startMessageCenter(): Promise<void> {
	if (listnerHandle) {
		listnerHandle.remove();
		listnerHandle = null;
	}
	listnerHandle = await BluetoothSerial.addListener('rawData', handleIncomingMessage); //@todo needs to include sender mac address
	db = await getDb();
}

/**
 * Stop listening for incoming messages
 * @todo should we purge the pending queue
 */
export async function stopMessageCenter(): Promise<void> {
	if (listnerHandle) {
		listnerHandle.remove();
		listnerHandle = null;
	}
}

export function isMessageCenterRunning(): boolean {
	return !!listnerHandle;
}

async function handleIncomingMessage(info: { bytes: number[] }) {
	let msgStr = '';
	for (let i = 0; i < info.bytes.length; i++) {
		msgStr += String.fromCharCode(info.bytes[i]);
	}
	const msg = JSON.parse(msgStr);
	if (pendingMessageIds[msg.msgId]) {
		const pendingFn = pendingMessageIds[msg.msgId];
		pendingFn(msg.data);
		return;
	}
	// unsolicited message
	console.log('Received unsolicited message: ', msg);
	// @todo handle remote procedure call requests
	if (!msg.action) {
		console.log('message does not have an action', msg);
		return;
	}
	switch (msg.action) {
		case 'getNotes': {
			// @todo check if all params are set ad proper types
			const query = db.notes
				.find()
				.where('updatedAt')
				.gt(msg.params.updatedSince)
				.sort({ updatedAt: 'desc' })
				.limit(msg.params.limit);
			const results = await query.exec();
			const reply = await sendMessage('@todo', { action: 'getNotesResponse', data: results });
			break;
		}
		case 'putNotes':
			break;
		default:
			console.log(`Unknown Action: ${msg.action}`);
	}
}

type PromiseResolveFn = (a: string) => void;
const pendingMessageIds: Record<string, PromiseResolveFn> = {};

/**
 * Send a message and wait for a reply
 * @param macAddr Where to send the message. Must be a paired and connected device(eg. AA:BB:CC:DD:EE:FF)
 * @param data the JSON serializable data to send
 * @param timeoutMs? <optional> defaults to 30 seconds (30*1000)
 */
export async function sendMessage(macAddr: string, data, timeoutMs?: number): Promise<any> {
	if (!listnerHandle) {
		throw new Error('message center is not running.');
	}
	const msg = {
		msgId: uuidv4(),
		data: data
	};
	const msgStr = JSON.stringify(msg);
	let msgArr = [];
	for (let i = 0; i < msgStr.length; i++) {
		msgArr[i] = msgStr.charCodeAt(i);
	}
	const success = await BluetoothSerial.write({
		macAddress: macAddr,
		data: msgArr
	});
	if (!success) {
		throw new Error(`unable to send message: ${msg.msgId} - ${JSON.stringify(data)}`);
	}
	if (timeoutMs === undefined) {
		timeoutMs = 30 * 1000;
	}
	// let timeoutHandle = setTimeout(() => {}, timeoutMs);
	const prom = new Promise((resolve, _reject) => {
		pendingMessageIds[msg.msgId] = resolve;
	});
	const timeout = setTimeoutPromise(timeoutMs, (resolve, reject) => {
		reject(`Did not receive a reply within the timeout of ${timeoutMs}ms`);
	});
	// @todo does this clean up the memory leak?
	// Messages that do not get a reply need to be removed from the pending queue or we have a leak
	timeout.then(() => {
		delete pendingMessageIds[msg.msgId];
	});
	return Promise.race([timeout, prom]);
}

async function setTimeoutPromise(
	timeoutMs,
	callback: (res: (value: unknown) => void, rej: (reason?: any) => void) => void
) {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			callback(resolve, reject);
		}, timeoutMs);
	});
}

function stringToArrayBuffer(str: string): ArrayBufferLike {
	const ret = new Uint8Array(str.length);
	for (let i = 0; i < str.length; i++) {
		ret[i] = str.charCodeAt(i);
	}
	return ret;
}

//src: https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
function arrayBufferToString(buf: ArrayBufferLike): string {
	return String.fromCharCode.apply(null, new Uint16Array(buf));
}

// BluetoothSerial.

// export function StartConnectedWatcher(): void {
//   if (connectionWatchHandle) {
//     clearInterval(connectionWatchHandle);
//     connectionWatchHandle = null;
//   }
//   connectionWatchHandle =
// }
