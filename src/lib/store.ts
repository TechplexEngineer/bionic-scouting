import { writable } from 'svelte/store';
import { createRxDatabase, addDefaultRxPlugins } from 'rxdb';
import type RxDatabaseBase from 'rxdb';
import { addPouchPlugin, getRxStoragePouch } from 'rxdb';
import * as idb from 'pouchdb-adapter-idb';
import noteSchema from './schema/note-schema';

/**
 * RxDB ========================================================================
 */

addDefaultRxPlugins();
addPouchPlugin(idb);

let dbPromise;

export let notesCollection;

const _create = async () => {
	const db = await createRxDatabase({
		name: 'rxdbdemo',
		storage: getRxStoragePouch('idb'),
		ignoreDuplicate: true
	});
	notesCollection = await db.addCollections({ notes: { schema: noteSchema } });
	dbPromise = db;
	return db;
};

export function getDb(): Promise<typeof createRxDatabase> {
	return dbPromise ? dbPromise : _create();
}

/**
 * Svelte Writables ============================================================
 */

export const noteList = writable([]);
export const name = writable('');
export const body = writable('');

// export function replicateNotes
