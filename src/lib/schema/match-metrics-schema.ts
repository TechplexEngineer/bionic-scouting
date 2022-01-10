import type { RxJsonSchema, RxCollection } from 'rxdb';

export type MatchMetricsReport = {
	eventMatchTeamKey?: string;
	eventKey: string;
	matchKey: string;
	createdAt: number;
	updatedAt: number;
	teamNumber: number;
	scoutName: string;
	submitted?: boolean;
	order: number;

	preStartingLocation?: string;
	preCargoLoaded?: number;
	autoHigh?: number;
	autoLow?: number;
	autoTaxi?: boolean;
	autoPenalties?: number;
	teleopPenalties?: number;
	teleopHighGoal?: number;
	teleopLowGoal?: number;
	teleopClimb?: string;
};

export type MatchMetricsCollection = RxCollection<MatchMetricsReport>;

const matchMetricsSchema: RxJsonSchema<MatchMetricsReport> = {
	title: 'match-objective',
	description: 'Metrics about a team in a match',
	version: 0,
	type: 'object',
	indexes: ['createdAt', 'updatedAt', 'order'],
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
		order: {
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
			enum: ['Near Hangar', 'Away From Hangar']
		},
		preCargoLoaded: {
			type: 'number',
			minimum: 0,
			maximum: 1,
			metadata: {
				label: 'Number of Cargo loaded',
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
			minimum: 0
		},
		autoLow: {
			type: 'number',
			metadata: {
				tab: 'Auto'
			},
			minimum: 0
		},
		autoTaxi: {
			type: 'boolean',
			metadata: {
				tab: 'Auto',
				labelNotSelected: 'Not Crossed',
				labelSelected: 'Crossed'
			}
		},
		autoPenalties: {
			type: 'number',
			metadata: {
				tab: 'Auto'
			},
			minimum: 0
		},

		// Teleop
		teleopHighGoal: {
			type: 'number',
			metadata: {
				tab: 'Teleop'
			},
			minimum: 0
		},
		teleopLowGoal: {
			type: 'number',
			metadata: {
				tab: 'Teleop'
			},
			minimum: 0
		},
		teleopClimb: {
			type: 'string',
			enum: ['None', 'L1', 'L2', 'L3', 'L4'],
			metadata: {
				tab: 'Teleop',
				control: 'buttons'
			}
		},
		teleopPenalties: {
			type: 'number',
			metadata: {
				tab: 'Teleop'
			},
			minimum: 0
		}
	},
	required: ['eventKey', 'matchKey', 'order']
};
export default matchMetricsSchema;
