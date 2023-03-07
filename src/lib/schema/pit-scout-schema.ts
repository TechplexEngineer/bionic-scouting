import type { RxJsonSchema, RxCollection } from 'rxdb';

export type Fact = {
	name: string;
	notes: string;
};

// analogous for team list
export type PitReport = {
	eventTeamKey?: string;
	eventKey: string;
	createdAt: number;
	updatedAt: number;
	teamNumber: number;
	imageUrl: string;
	notes: string;
	facts: Fact[];

	city?: string;
	country?: string;
	name?: string;
	nickname?: string;
	rookieYear?: number;
	schoolName?: string;
	stateProv?: string;
	numAttachments?: number;
	// pickListNotes?: string;
	// pickListPicked?: boolean;
	// pickListOrder?: number;
	//@todo https://rxdb.info/data-migration.html
};

export type PitReportCollection = RxCollection<PitReport>;

const pitSchema: RxJsonSchema<PitReport> = {
	title: 'pit-objective',
	description: 'Notes about a team',
	version: 0,
	type: 'object',
	indexes: ['createdAt', 'updatedAt', 'teamNumber'],
	primaryKey: {
		// where should the composed string be stored
		key: 'eventTeamKey',
		// fields that will be used to create the composed key
		fields: ['eventKey', 'teamNumber'],
		// separator which is used to concat the fields values.
		separator: '_'
	},
	properties: {
		eventTeamKey: {
			type: 'string'
		},
		eventKey: {
			type: 'string' // should be in the format <year><eventName> eg: 2020week0
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
		imageUrl: {
			type: 'string'
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
		},
		city: {
			type: 'string'
		},
		country: {
			type: 'string'
		},
		name: {
			type: 'string'
		},
		nickname: {
			type: 'string'
		},
		rookieYear: {
			type: 'number'
		},
		schoolName: {
			type: 'string'
		},
		stateProv: {
			type: 'string'
		},
		numAttachments: {
			default: 0,
			type: 'number'
		},
		// pickListNotes: {
		// 	type: 'string'
		// },
		// pickListPicked: {
		// 	type: 'boolean'
		// },
		// pickListOrder: {
		// 	type: 'number'
		// },
	},
	required: ['eventKey', 'teamNumber'],
	attachments: {}
};
export default pitSchema;
import type { Team } from 'tba-api-v3client-ts';
import { keysToCamel } from '$lib/util';

const fieldWhitelist = Object.keys(pitSchema.properties);

export function TBATeamToPitReport(tbaTeam: Team, eventKey: string): PitReport {
	const team = keysToCamel(tbaTeam);

	for (const key in team) {
		if (!fieldWhitelist.includes(key)) {
			delete team[key];
		}
	}

	team.createdAt = new Date().getTime();
	team.updatedAt = new Date().getTime();
	team.eventKey = eventKey;

	return team;
}
