const pitSchema = {
	title: 'pitObjective',
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
		eventKey: {
			type: 'string' // should be in the format <year><eventName> eg: 2020week0
		},
		createdAt: {
			type: 'number'
		},
		updatedAt: {
			type: 'number'
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
