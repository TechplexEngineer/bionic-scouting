const matchObjectiveSchema = {
	title: 'matchObjective',
	description: 'Metrics about a match',
	version: 0,
	type: 'object',
	indexes: ['createdAt', 'updatedAt'],
	primaryKey: {
		// where should the composed string be stored
		key: 'matchEventKey',
		// fields that will be used to create the composed key
		fields: ['eventKey', 'matchKey'],
		// separator which is used to concat the fields values.
		separator: '_'
	},
	properties: {
		eventKey: {
			type: 'string' // should be in the format <year><eventName> eg: 2020week0
		},
		matchKey: {
			type: 'string' // eg: qm4 qf1m1 sf2m1 f1m2
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
		// Pregame
		preStartingLocationX: {
			type: 'number',
			metadata: {
				tab: 'Pre'
			}
		},
		preStartingLocationY: {
			type: 'number',
			metadata: {
				tab: 'Pre'
			}
		},
		prePowerCells: {
			type: 'number',
			metadata: {
				tab: 'Pre'
			}
		},
		// Auto
		autoHigh: {
			type: 'number',
			metadata: {
				tab: 'Auto'
			}
		},
		autoLow: {
			type: 'number',
			metadata: {
				tab: 'Auto'
			}
		},
		autoInitLine: {
			type: 'boolean',
			metadata: {
				tab: 'Auto'
			}
		},
		autoPenalties: {
			type: 'number',
			metadata: {
				tab: 'Auto'
			}
		},
		// Teleop
		teleopPenalties: {
			type: 'number',
			metadata: {
				tab: 'Teleop'
			}
		},
		teleopHighGoal: {
			type: 'number',
			metadata: {
				tab: 'Teleop'
			}
		},
		teleopLowGoal: {
			type: 'number',
			metadata: {
				tab: 'Teleop'
			}
		},
		teleopClimbLocation: {
			type: 'string',
			enum: ['center', 'end'],
			metadata: {
				tab: 'Teleop'
			}
		},
		teleopClimbSuccess: {
			type: 'boolean',
			metadata: {
				tab: 'Teleop'
			}
		}
	},
	required: ['eventKey', 'matchKey']
};
export default matchObjectiveSchema;
