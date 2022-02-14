import type { RxJsonSchema, RxCollection } from 'rxdb';

export type SuperScout = {
	createdAt: number;
	updatedAt: number;
	name: string;
	active?: boolean;
	assignedMatches: string[]; //matchKeys
};

export type SuperScoutCollection = RxCollection<SuperScout>;

const scoutsSchema: RxJsonSchema<SuperScout> = {
	title: 'scouts',
	description: 'People who will be operating the scouting system',
	version: 0,
	type: 'object',
	indexes: ['createdAt', 'updatedAt'],
	primaryKey: 'name',
	properties: {
		createdAt: {
			type: 'number',
			description: 'When the document was created milliseconds since unix epoch'
		},
		updatedAt: {
			type: 'number',
			description: 'When the document was last modified milliseconds since unix epoch'
		},
		name: {
			type: 'string',
			description: 'Name of the scout'
		},
		active: {
			type: 'boolean',
			default: true,
			description: 'If the scheduler should include this scout'
		},
		assignedMatches: {
			type: 'array',
			default: [],
			items: {
				type: 'string'
			}
		}
	},
	required: ['name']
};
export default scoutsSchema;