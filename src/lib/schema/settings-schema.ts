import type { RxJsonSchema, RxCollection } from 'rxdb';

export type Setting = {
	createdAt: number;
	updatedAt: number;
	key: string;
	value: string;
};

export type SettingsCollection = RxCollection<Setting>;

const settingsSchema: RxJsonSchema<Setting> = {
	title: 'settings',
	description: 'App Wide Configuration',
	version: 0,
	type: 'object',
	indexes: ['createdAt', 'updatedAt'],
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

export enum Settings {
	CurrentEvent = 'currentEvent',
	TeamNumber = 'ourTeamNumber'
}
