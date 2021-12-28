import type { RxJsonSchema } from 'rxdb';

export type Fact = {
	name: string;
	notes: string;
};

export type PitReport = {
	eventTeamKey: string;
	eventKey: string;
	createdAt: number;
	updatedAt: number;
	teamNumber: number;
	notes: string;
	facts: Fact[];
};

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
	required: ['eventKey', 'teamNumber']
};
export default pitSchema;
