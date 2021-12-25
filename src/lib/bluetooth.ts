import type { RawDataResult, BTDevice } from 'bionic-bt-serial';
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

	// If hot module reload is enabled, if reloading the layout remove the listener
	// Since layout keeps track of initialization we use this to prevent duplicate listeners during dev
	if (import.meta.hot) {
		import.meta.hot.on('vite:beforeUpdate', (data) => {
			function reducer(previousValue, currentValue) {
				return previousValue || currentValue.path == '/src/routes/__layout.svelte';
			}

			if (data.type == 'update' && data.updates.reduce(reducer, false)) {
				if (listnerHandle) {
					console.log('Removing rawData listener');
					listnerHandle.remove();
				}
			}
		});
	}
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

type Message = { msgId: string; action: string; data; params; from: BTDevice };

async function handleIncomingMessage(info: { bytes: number[]; from: BTDevice }) {
	let msgStr = '';
	for (let i = 0; i < info.bytes.length; i++) {
		msgStr += String.fromCharCode(info.bytes[i]);
	}

	const m: { msgId: string; data: { action: string; data } } = JSON.parse(msgStr);

	const msg: Message = m.data;
	msg.from = info.from;
	msg.msgId = m.msgId;

	console.log('Got Message: ', msg);
	if (pendingMessageIds[msg.msgId]) {
		const pendingFn = pendingMessageIds[msg.msgId];
		pendingFn(msg.data);
		delete pendingMessageIds[msg.msgId];
		return;
	}
	// unsolicited message
	// console.log('Received unsolicited message: ', msg);
	// // @todo handle remote procedure call requests
	// if (!msg.action) {
	// 	console.log('message does not have an action', msg);
	// 	return;
	// }
	switch (msg.action) {
		case 'getNotes': {
			// @todo check if all params are set and proper types
			const query = db.notes
				.find()
				.where('updatedAt')
				.gt(msg.params.updatedSince)
				.sort({ updatedAt: 'desc' })
				.limit(msg.params.limit);
			const results = await query.exec();
			const reply = await sendMessage(
				msg.from.macAddress,
				{
					action: 'getNotesResponse',
					data: results
				},
				{ timeoutMs: -1, responseToMsgId: msg.msgId }
			);
			console.log(`Sending getNotesResponse to ${msg.from.macAddress} res: ${reply}`);
			break;
		}
		case 'putNotes':
			break;
		case 'unknownActionResponse':
			// console.log('got an unknownActionResponse');
			// Nothing to do
			break;
		default: {
			const reply = await sendMessage(
				msg.from.macAddress,
				{
					action: 'unknownActionResponse',
					data: ''
				},
				{ timeoutMs: -1, responseToMsgId: msg.msgId }
			);
			console.log(`Sending unknownActionResponse to ${msg.from.macAddress} res: ${reply}`);
			console.log(`Unknown Action: ${msg.action}`);
		}
	}
}

type PromiseResolveFn = (a: string) => void;
const pendingMessageIds: Record<string, PromiseResolveFn> = {};

/**
 * Send a message and wait for a reply
 * @param macAddr Where to send the message. Must be a paired and connected device(eg. AA:BB:CC:DD:EE:FF)
 * @param data the JSON serializable data to send
 * @param options
 */
export async function sendMessage(
	macAddr: string,
	data: any, // must be stringifiable
	options?: { timeoutMs?: number; responseToMsgId?: string }
): Promise<any> {
	if (options === undefined) {
		options = {};
	}
	if (!listnerHandle) {
		console.error('message center is not running.');
		throw new Error('message center is not running.');
	}
	const msg = {
		msgId: options.responseToMsgId || uuidv4(),
		data: data
	};
	const msgStr = JSON.stringify(msg);
	const msgArr: number[] = [];
	for (let i = 0; i < msgStr.length; i++) {
		msgArr[i] = msgStr.charCodeAt(i);
	}

	console.log(`Sending Message: ${msgStr} to ${macAddr}`);
	const success = await BluetoothSerial.write({
		macAddress: macAddr,
		data: msgArr
	});
	if (!success) {
		throw new Error(`unable to send message: ${msg.msgId} - ${JSON.stringify(data)}`);
	}
	if (options.timeoutMs === undefined) {
		options.timeoutMs = 30 * 1000;
	}
	if (options.timeoutMs < 0) {
		// no reply is needed, thus we are done.
		return;
	}
	// let timeoutHandle = setTimeout(() => {}, timeoutMs);
	const prom = new Promise((resolve, reject) => {
		const handle = setTimeout(() => {
			reject(
				`Did not receive a reply within the timeout of ${options.timeoutMs}ms for message ${msgStr} to ${macAddr}`
			);
		}, options.timeoutMs);

		pendingMessageIds[msg.msgId] = (arg) => {
			console.log(`Resolving ${msgStr} with arg ${arg}`);
			clearTimeout(handle);
			resolve(arg);
		};
	});

	// @todo does this clean up the memory leak?
	// Messages that do not get a reply need to be removed from the pending queue or we have a leak
	prom.then(() => {
		console.log('Cleanup ', msg.msgId);
		delete pendingMessageIds[msg.msgId];
	});
	return prom;
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
