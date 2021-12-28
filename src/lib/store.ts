import { writable } from 'svelte/store';
import { createRxDatabase, addDefaultRxPlugins } from 'rxdb';
import type RxDatabaseBase from 'rxdb';
import { addPouchPlugin, getRxStoragePouch } from 'rxdb';
import * as idb from 'pouchdb-adapter-idb';
import noteSchema from './schema/note-schema';
import matchObjectiveSchema from '$lib/schema/match-obj-schema';
import matchSubjectiveSchema from '$lib/schema/match-subj-schema';

/**
 * RxDB ========================================================================
 */

addDefaultRxPlugins();
addPouchPlugin(idb);

let dbPromise;

// Only available once getDb has been called and resolved
export let collections;

const _create = async () => {
	const db = await createRxDatabase({
		name: 'tgadb',
		storage: getRxStoragePouch('idb'),
		ignoreDuplicate: true
	});
	collections = await db.addCollections({
		notes: { schema: noteSchema },
		match_objective: { schema: matchObjectiveSchema },
		match_subjective: { schema: matchSubjectiveSchema }
	});
	dbPromise = db;
	return db;
};

export function getDb(): Promise<typeof createRxDatabase> {
	return dbPromise ? dbPromise : _create();
}
