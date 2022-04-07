import type { RxJsonSchema, RxCollection } from 'rxdb';
import type { Match as TBAMatch } from 'tba-api-v3client-ts';
import { keysToCamel } from '$lib/util';

export declare type Match_alliance = {
	/**
	 * Score for this alliance. Will be null or -1 for an unplayed match.
	 */
	score: number;
	teamKeys: Array<string>;
	/**
	 * TBA team keys (eg `frc254`) of any teams playing as a surrogate.
	 */
	surrogateTeamKeys?: Array<string>;
	/**
	 * TBA team keys (eg `frc254`) of any disqualified teams.
	 */
	dqTeamKeys?: Array<string>;
};

export type Match = {
	/**
	 * TBA match key with the format `yyyy[EVENT_CODE]_[COMP_LEVEL]m[MATCH_NUMBER]`, where `yyyy` is the year, and `EVENT_CODE` is the event code of the event, `COMP_LEVEL` is (qm, ef, qf, sf, f), and `MATCH_NUMBER` is the match number in the competition level. A set number may be appended to the competition level if more than one match in required per set.
	 */
	eventMatchKey: string;
	eventKey: string;
	matchKey: string;
	order: number;

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
	actualTime?: number | null;

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
	indexes: ['createdAt', 'updatedAt', 'order'],
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
		order: {
			type: 'number',
			description: 'The order the match will be played'
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
			enum: ['red', 'blue', ''],
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

export function TBAMatchToMatch(tbaMatch: TBAMatch): Match {
	const match = keysToCamel(tbaMatch);

	match.matchKey = match.key.split('_')[1];
	delete match.key;

	match.scheduledTime = match.time;
	delete match.time;

	match.createdAt = new Date().getTime();
	match.updatedAt = new Date().getTime();

	// delete match.scoreBreakdown;
	delete match.videos;
	delete match.predictedTime;
	delete match.postResultTime;

	// TBA sends null for some entries which doesn't play nice with RxDB, so we remove them (eg. scoreBreakdown and actualTime)
	for (const key in match) {
		if (match[key] === null) {
			delete match[key];
		}
	}

	return match;
}
