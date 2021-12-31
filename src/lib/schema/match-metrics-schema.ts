import type { RxJsonSchema, RxCollection } from 'rxdb';

export type MatchMetricsReport = {
	eventMatchTeamKey?: string;
	eventKey: string;
	matchKey: string;
	createdAt: number;
	updatedAt: number;
	teamNumber: number;
	scoutName: string;
	submitted: boolean;

	preStartingLocation?: string;
	preStartingLocationX?: number;
	preStartingLocationY?: number;
	prePowerCells?: number;
	autoHigh?: number;
	autoLow?: number;
	autoInitLine?: boolean;
	autoPenalties?: number;
	teleopPenalties?: number;
	teleopHighGoal?: number;
	teleopLowGoal?: number;
	teleopClimbLocation?: string;
	teleopClimbSuccess?: boolean;
};

export type MatchMetricsCollection = RxCollection<MatchMetricsReport>;

const matchMetricsSchema: RxJsonSchema<MatchMetricsReport> = {
	title: 'match-objective',
	description: 'Metrics about a team in a match',
	version: 0,
	type: 'object',
	indexes: ['createdAt', 'updatedAt'],
	primaryKey: {
		// where should the composed string be stored
		key: 'eventMatchTeamKey',
		// fields that will be used to create the composed key
		fields: ['eventKey', 'matchKey', 'teamNumber'],
		// separator which is used to concat the fields values.
		separator: '_'
	},
	properties: {
		eventMatchTeamKey: {
			type: 'string'
		},
		eventKey: {
			type: 'string' // should be in the format <year><eventName> eg: 2020week0
		},
		matchKey: {
			type: 'string' // eg: qm4 qf1m1 sf2m1 f1m2
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
		scoutName: {
			type: 'string'
		},
		submitted: {
			type: 'boolean',
			description: 'Match has been played and data recorded',
			default: false
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
export default matchMetricsSchema;
