import type { RxJsonSchema, RxCollection } from 'rxdb';
import type { Mat319ch as TBAMatch, Match_alliance } from 'tba-api-v3client-ts';

export type Match = {
	/**
	 * TBA match key with the format `yyyy[EVENT_CODE]_[COMP_LEVEL]m[MATCH_NUMBER]`, where `yyyy` is the year, and `EVENT_CODE` is the event code of the event, `COMP_LEVEL` is (qm, ef, qf, sf, f), and `MATCH_NUMBER` is the match number in the competition level. A set number may be appended to the competition level if more than one match in required per set.
	 */
	eventMatchKey: string;
	eventKey: string;
	matchKey: string;

	/**
	 * A list of alliances, the teams on the alliances, and their score.
	 */
	alliances?: {
		red?: Match_alliance;
		blue?: Match_alliance;
	}; //TBAMatch.alliances;
	/**
	 * The competition level the match was played at.
	 */
	compLevel: TBAMatch.comp_level;
	/**
	 * The set number in a series of matches where more than one match is required in the match series.
	 */
	setNumber: number; //TBAMatch.set_number;
	/**
	 * The match number of the match in the competition level.
	 */
	matchNumber: number; //TBAMatch.match_number;
	/**
	 * Score breakdown for auto, teleop, etc. points. Varies from year to year. May be null.
	 */
	scoreBreakdown?: any; //TBAMatch.score_breakdown;
	/**
	 * The color (red/blue) of the winning alliance. Will contain an empty string in the event of no winner, or a tie.
	 */
	winningAlliance: TBAMatch.winning_alliance;

	/**
	 * UNIX timestamp (seconds since 1-Jan-1970 00:00:00) of the scheduled match time, as taken from the published schedule.
	 */
	scheduledTime?: number;
	/**
	 * UNIX timestamp (seconds since 1-Jan-1970 00:00:00) of actual match start time.
	 */
	actualTime?: number;

	createdAt: number;
	updatedAt: number;
};

export type MatchCollection = RxCollection<Match>;

const MatchAllianceJsonSchema = {
	type: 'object',
	properties: {
		dqTeamKeys: {
			type: 'array',
			items: {
				type: 'string'
			}
		},
		score: {
			type: 'integer'
		},
		surrogateTeamKeys: {
			type: 'array',
			items: {
				type: 'string'
			}
		},
		teamKeys: {
			type: 'array',
			items: {
				type: 'string'
			}
		}
	},
	required: ['dqTeamKeys', 'score', 'surrogateTeamKeys', 'teamKeys']
};

const matchSchema: RxJsonSchema<Match> = {
	title: 'match-objective',
	description: 'Metrics about a match',
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
		},
		alliances: {
			type: 'object',
			properties: {
				red: MatchAllianceJsonSchema,
				blue: MatchAllianceJsonSchema
			}
		},
		compLevel: {
			type: 'string',
			enum: ['qm', 'ef', 'qf', 'sf', 'f']
		},
		setNumber: {
			type: 'number'
		},
		matchNumber: {
			type: 'number'
		},
		scoreBreakdown: {
			type: 'object'
		},
		winningAlliance: {
			type: 'string',
			enum: ['red', 'blue'],
			description:
				'The color (red/blue) of the winning alliance. Will contain an empty string in the event of no winner, or a tie.'
		},
		scheduledTime: {
			type: 'number'
		},
		actualTime: {
			type: 'number'
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
	required: ['eventKey', 'matchKey']
};
export default matchSchema;

const toCamel = (s) => {
	return s.replace(/([-_][a-z])/gi, ($1) => {
		return $1.toUpperCase().replace('-', '').replace('_', '');
	});
};

const isArray = function (a) {
	return Array.isArray(a);
};

const isObject = function (o) {
	return o === Object(o) && !isArray(o) && typeof o !== 'function';
};

// src https://matthiashager.com/converting-snake-case-to-camel-case-object-keys-with-javascript
const keysToCamel = function (o) {
	if (isObject(o)) {
		const n = {};

		Object.keys(o).forEach((k) => {
			n[toCamel(k)] = keysToCamel(o[k]);
		});

		return n;
	} else if (isArray(o)) {
		return o.map((i) => {
			return keysToCamel(i);
		});
	}

	return o;
};

export function TBAMatchToMatch(tbaMatch: TBAMatch): Match {
	const match = keysToCamel(tbaMatch);

	match.matchKey = match.key.split('_')[1];
	delete match.key;

	match.scheduledTime = match.time;
	delete match.time;

	// delete match.scoreBreakdown;
	delete match.videos;
	delete match.predictedTime;
	delete match.postResultTime;
	return match;
}
