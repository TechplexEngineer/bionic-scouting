import { writable } from 'svelte/store';
import { createRxDatabase, addDefaultRxPlugins } from 'rxdb';
import type { RxCollection } from 'rxdb';
import { addPouchPlugin, getRxStoragePouch } from 'rxdb';
import * as idb from 'pouchdb-adapter-idb';

import matchMetricsSchema from '$lib/schema/match-metrics-schema';
import matchSubjectiveSchema from '$lib/schema/match-subj-schema';
import noteSchema from './schema/note-schema';
import pitSchema from '$lib/schema/pit-scout-schema';
import scoutsSchema from '$lib/schema/scouts-schema';
import settingsSchema from '$lib/schema/settings-schema';

/**
 * RxDB ========================================================================
 */

addDefaultRxPlugins();
addPouchPlugin(idb);

let dbPromise;
import type { MatchMetricsCollection } from '$lib/schema/match-metrics-schema';
import type { MatchSubjCollection } from '$lib/schema/match-subj-schema';
import type { NoteCollection } from '$lib/schema/note-schema';
import type { PitReportCollection } from '$lib/schema/pit-scout-schema';
import type { ScoutCollection } from '$lib/schema/scouts-schema';
import type { SettingsCollection } from '$lib/schema/settings-schema';

type MyDatabaseCollections = {
	match_metrics: MatchMetricsCollection;
	match_subjective: MatchSubjCollection;
	notes: NoteCollection;
	pit_scouting: PitReportCollection;
	scouts: ScoutCollection;
	settings: SettingsCollection;
};

import type { RxDatabase } from 'rxdb';

export type MyDatabase = RxDatabase<MyDatabaseCollections>;

// // Only available once getDb has been called and resolved
// export let collections;

const _create = async () => {
	const db: MyDatabase = await createRxDatabase<MyDatabaseCollections>({
		name: 'tgadb',
		storage: getRxStoragePouch('idb'),
		ignoreDuplicate: true
	});

	await db.addCollections({
		notes: { schema: noteSchema },
		match_metrics: { schema: matchMetricsSchema },
		match_subjective: { schema: matchSubjectiveSchema },
		pit_scouting: { schema: pitSchema },
		scouts: { schema: scoutsSchema },
		settings: { schema: settingsSchema }
	});
	dbPromise = db;
	return db;
};

export function getDb(): Promise<MyDatabase> {
	return dbPromise ? dbPromise : _create();
}
