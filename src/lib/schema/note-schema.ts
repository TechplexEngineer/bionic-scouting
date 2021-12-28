import type { RxJsonSchema } from 'rxdb';

export type Note = {
	name: string;
	body: string;
	createdAt: number;
	updatedAt: number;
};

const noteSchema: RxJsonSchema<Note> = {
	title: 'note',
	description: 'an individual note',
	version: 0,
	type: 'object',
	indexes: ['createdAt', 'updatedAt'],
	primaryKey: 'name',
	properties: {
		name: {
			type: 'string'
		},
		body: {
			type: 'string'
		},
		createdAt: {
			type: 'number',
			description: 'When the document was created milliseconds since unix epoch'
		},
		updatedAt: {
			type: 'number',
			description: 'When the document was last modified milliseconds since unix epoch'
		}
	},
	required: ['name']
};

export default noteSchema;
