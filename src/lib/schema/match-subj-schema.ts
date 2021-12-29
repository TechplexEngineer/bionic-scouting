import type { RxJsonSchema, RxCollection } from 'rxdb';

export type Fact = {
	name: string;
	notes: string;
};

export type MatchSubjReport = {
	eventMatchKey: string;
	eventKey: string;
	matchKey: string;
	matchForKey: string;
	createdAt: number;
	updatedAt: number;
	teamNumber: number;
	notes: string;
	facts: Fact[];
};

export type MatchSubjCollection = RxCollection<MatchSubjReport>;

const matchSubjectiveSchema: RxJsonSchema<MatchSubjReport> = {
	title: 'match-subjective',
	description: 'Observations about a match',
	version: 0,
	type: 'object',
	indexes: ['createdAt', 'updatedAt'],
	primaryKey: {
		// where should the composed string be stored
		key: 'eventMatchKey',
		// fields that will be used to create the composed key
		fields: ['eventKey', 'matchKey'],
		// separator which is used to concat the fields values.
		separator: '_'
	},
	properties: {
		eventMatchKey: {
			type: 'string'
		},
		eventKey: {
			type: 'string' // should be in the format <year><eventName> eg: 2020week0
		},
		matchKey: {
			type: 'string' // eg: qm4 qf1m1 sf2m1 f1m2
			// match being observed
		},
		matchForKey: {
			type: 'string' // eg: qm4 qf1m1 sf2m1 f1m2
			// observations for this match
		},
		createdAt: {
			type: 'number',
			description: 'When the document was created milliseconds since unix epoch'
		},
		updatedAt: {
			type: 'number',
			description: 'When the document was last modified milliseconds since unix epoch'
		},
		teamNumber: {
			type: 'number'
		},
		notes: {
			type: 'string'
		},
		facts: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					name: {
						type: 'string'
					},
					notes: {
						type: 'string'
					}
				}
			}
		}
	},
	required: ['eventKey', 'matchKey']
};
export default matchSubjectiveSchema;
