import { createRxDatabase, addDefaultRxPlugins, addPouchPlugin, getRxStoragePouch } from 'rxdb';
import * as idb from 'pouchdb-adapter-idb';

import matchMetricsSchema from '$lib/schema/match-metrics-schema';
import matchSchema from '$lib/schema/match-schema';
import matchSubjectiveSchema from '$lib/schema/match-subj-schema';
import noteSchema from './schema/note-schema';
import pitSchema from '$lib/schema/pit-scout-schema';
import scoutsSchema from '$lib/schema/scouts-schema';
import settingsSchema from '$lib/schema/settings-schema';

import type { MatchMetricsCollection } from '$lib/schema/match-metrics-schema';
import type { MatchCollection } from '$lib/schema/match-schema';
import type { MatchSubjCollection } from '$lib/schema/match-subj-schema';
import type { NoteCollection } from '$lib/schema/note-schema';
import type { PitReportCollection } from '$lib/schema/pit-scout-schema';
import type { ScoutCollection } from '$lib/schema/scouts-schema';
import type { SettingsCollection } from '$lib/schema/settings-schema';
import type { RxDatabase } from 'rxdb';

addDefaultRxPlugins();
addPouchPlugin(idb);

let dbPromise;

type MyDatabaseCollections = {
	match_metrics: MatchMetricsCollection;
	matches: MatchCollection;
	match_subjective: MatchSubjCollection;
	notes: NoteCollection;
	pit_scouting: PitReportCollection;
	scouts: ScoutCollection;
	settings: SettingsCollection;
};

export type MyDatabase = RxDatabase<MyDatabaseCollections>;

const _create = async () => {
	const db: MyDatabase = await createRxDatabase<MyDatabaseCollections>({
		name: 'tgadb',
		storage: getRxStoragePouch('idb'),
		ignoreDuplicate: true
	});

	await db.addCollections({
		match_metrics: { schema: matchMetricsSchema },
		matches: { schema: matchSchema },
		match_subjective: { schema: matchSubjectiveSchema },
		notes: { schema: noteSchema },
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
