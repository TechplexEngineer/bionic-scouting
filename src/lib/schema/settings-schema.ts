const settingsSchema = {
	title: 'settings',
	description: 'App Wide Configuration',
	version: 0,
	type: 'object',
	indexes: ['createdAt', 'updatedAt', 'key'],
	primaryKey: {
		// where should the composed string be stored
		key: 'eventTeamKey',
		// fields that will be used to create the composed key
		fields: ['eventKey', 'teamNumber'],
		// separator which is used to concat the fields values.
		separator: '_'
	},
	properties: {
		createdAt: {
			type: 'number'
		},
		updatedAt: {
			type: 'number'
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
