import { writable } from 'svelte/store';
import * as bt from '$lib/bluetooth';
import { browser } from '$app/env';

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

	// only start the message center if not SSR.
	// If you try to load rxdb in SSR the indexed db adapter isn't loaded
	if (browser) {
		await bt.startMessageCenter();
	}
}
