const matchSubjectiveSchema = {
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
			type: 'number'
		},
		updatedAt: {
			type: 'number'
		},
		teamNumber: {
			type: 'number'
		},
		// Pregame
		preStartingLocation: {
			type: 'string',
			metadata: {
				tab: 'Pre',
				cardClasses: 'col-12',
				control: 'buttons'
			},
			enum: ['Tower', 'Trench', 'Middle']
		},
		preStartingLocationX: {
			type: 'number',
			metadata: {
				tab: 'Pre',
				hidden: true
			}
		},
		preStartingLocationY: {
			type: 'number',
			metadata: {
				tab: 'Pre',
				hidden: true
			}
		},
		prePowerCells: {
			type: 'number',
			metadata: {
				label: 'Number of power cells loaded',
				tab: 'Pre',
				cardClasses: 'col-12'
			}
		},
		// Auto
		autoHigh: {
			type: 'number',
			metadata: {
				tab: 'Auto'
			},
			minimum: 0,
			maximum: 3
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
export default matchSubjectiveSchema;
