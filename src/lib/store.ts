import { writable } from 'svelte/store';
import { createRxDatabase, addDefaultRxPlugins } from 'rxdb';
import { addPouchPlugin, getRxStoragePouch } from 'rxdb';
import * as idb from 'pouchdb-adapter-idb';
import noteSchema from './schema';

/**
 * RxDB ========================================================================
 */

addDefaultRxPlugins();
addPouchPlugin(idb);

let dbPromise;

const _create = async () => {
	const db = await createRxDatabase({
		name: 'rxdbdemo',
		storage: getRxStoragePouch('idb'),
		ignoreDuplicate: true
	});
	await db.addCollections({ notes: { schema: noteSchema } });
	dbPromise = db;
	return db;
};

export const db = () => (dbPromise ? dbPromise : _create());

/**
 * Svelte Writables ============================================================
 */

export const noteList = writable([]);
export const selectedNote = writable({});
export const name = writable('');
export const body = writable('');
