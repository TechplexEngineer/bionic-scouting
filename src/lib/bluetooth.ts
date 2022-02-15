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

export const adapterName = readable('', (set) => {
	(async () => {
		set((await BluetoothSerial.getName()).result);
	})();
	const handle = setInterval(async () => {
		set((await BluetoothSerial.getName()).result);
	}, 5 * 1000);

	return () => clearInterval(handle);
});

let listenerHandle;
let db;

/**
 * Start listening for messages from bluetooth connections
 */
export async function startMessageCenter(): Promise<void> {
	if (listenerHandle) {
		listenerHandle.remove();
		listenerHandle = null;
	}
	listenerHandle = await BluetoothSerial.addListener('rawData', handleIncomingMessage); //@todo needs to include sender mac address
	db = await getDb();

	// If hot module reload is enabled, if reloading the layout remove the listener
	// Since layout keeps track of initialization we use this to prevent duplicate listeners during dev
	if (import.meta.hot) {
		import.meta.hot.on('vite:beforeUpdate', (data) => {
			function reducer(previousValue, currentValue) {
				return previousValue || currentValue.path == '/src/routes/__layout.svelte';
			}

			if (data.type == 'update' && data.updates.reduce(reducer, false)) {
				if (listenerHandle) {
					console.log('Removing rawData listener');
					listenerHandle.remove();
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
	if (listenerHandle) {
		listenerHandle.remove();
		listenerHandle = null;
	}
}

export function isMessageCenterRunning(): boolean {
	return !!listenerHandle;
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
		const obj = pendingMessageIds[msg.msgId];
		obj.resolve(msg.data);
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
		case 'get': {
			// @todo check if all params are set and proper types
			const query = db[msg.params.collection] //@todo error handling for missing collection
				.find()
				.where('updatedAt')
				.gt(msg.params.updatedSince)
				.sort({ updatedAt: 'desc' })
				.limit(msg.params.limit);
			const results = await query.exec();
			const reply = await sendMessage(
				msg.from.macAddress,
				{
					action: 'getResponse',
					data: results
				},
				{ timeoutMs: -1, responseToMsgId: msg.msgId }
			);
			break;
		}
		case 'put':
			for (const doc of msg.data) {
				await db[msg.params.collection].upsert(doc);
			}
			await sendMessage(
				msg.from.macAddress,
				{
					action: 'putResponse',
					data: ''
				},
				{ timeoutMs: -1, responseToMsgId: msg.msgId }
			);
			break;
		case 'unknownActionResponse':
			// Nothing to do
			break;
		default: {
			await sendMessage(
				msg.from.macAddress,
				{
					action: 'unknownActionResponse',
					data: ''
				},
				{ timeoutMs: -1, responseToMsgId: msg.msgId }
			);
		}
	}
}

type PromiseResolveFn = (a: string) => void;
const pendingMessageIds: Record<string, { date: number; resolve: PromiseResolveFn }> = {};

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
	if (!listenerHandle) {
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

		pendingMessageIds[msg.msgId] = {
			date: Date.now(),
			resolve: (arg) => {
				console.log(`Resolving ${msgStr} with arg ${arg}`);
				clearTimeout(handle);
				resolve(arg);
			}
		};
	});

	// @todo does this clean up the memory leak?
	// Messages that do not get a reply need to be removed from the pending queue or we have a leak
	prom.then(() => {
		console.log('Cleanup ', msg.msgId);
		delete pendingMessageIds[msg.msgId];
		console.log('pending messages:', pendingMessageIds);
	});
	return prom;
}
