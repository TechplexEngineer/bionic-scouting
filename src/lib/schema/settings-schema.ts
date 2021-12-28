import type { RxJsonSchema } from 'rxdb';

export type Setting = {
	createdAt: number;
	updatedAt: number;
	key: string;
	value: string;
};

const settingsSchema: RxJsonSchema<Setting> = {
	title: 'settings',
	description: 'App Wide Configuration',
	version: 0,
	type: 'object',
	indexes: ['createdAt', 'updatedAt', 'key'],
	primaryKey: 'key',
	properties: {
		createdAt: {
			type: 'number',
			description: 'When the document was created milliseconds since unix epoch'
		},
		updatedAt: {
			type: 'number',
			description: 'When the document was last modified milliseconds since unix epoch'
		},
		key: {
			type: 'string'
		},
		value: {
			type: 'string'
		}
	},
	required: ['key', 'value']
};
export default settingsSchema;
