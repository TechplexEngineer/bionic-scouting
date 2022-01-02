//source: https://www.thebluealliance.com/api/v3/event/2020week0/matches
import type { Match } from '$lib/schema/match-schema';

export const compLevels = {
	test: 0, // test match
	pm: 1, // practice match
	qm: 2, // qualification match
	ef: 3, // eighth finals
	qf: 4, // quarter finals
	sf: 5, // semi finals
	f: 6 // finals
};

export function matchSort(a: Match, b: Match): number {
	if (compLevels[a.compLevel] !== compLevels[b.compLevel]) {
		return compLevels[a.compLevel] - compLevels[b.compLevel];
	}
	if (a.setNumber !== b.setNumber) {
		return a.setNumber - b.setNumber;
	}
	if (a.matchNumber !== b.matchNumber) {
		return a.matchNumber - b.matchNumber;
	}
}
