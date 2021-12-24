import { writable } from 'svelte/store';
import * as bt from '$lib/bluetooth';

const initCount = writable(0); // used to make sure init() is only called once

export const init = (): void => {
	initCount.update((v) => {
		if (v === 0) {
			//do init
			_init();
		}
		return v + 1;
	});
};

async function _init(): Promise<void> {
	console.log('Init');
	await bt.startMessageCenter();
}
