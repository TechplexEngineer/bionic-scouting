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

export let collections;

const _create = async () => {
	const db = await createRxDatabase({
		name: 'tgadb',
		storage: getRxStoragePouch('idb'),
		ignoreDuplicate: true
	});
	collections = await db.addCollections({ notes: { schema: noteSchema } });
	dbPromise = db;
	return db;
};

export function getDb(): Promise<typeof createRxDatabase> {
	return dbPromise ? dbPromise : _create();
}
