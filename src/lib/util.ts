import type { RxDocument } from 'rxdb';
import type { Match } from '$lib/schema/match-schema';

export const capitalizeFirst = function (str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1);
};

export const toCamel = (s: string) => {
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
export const keysToCamel = function (o) {
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

export const formatDate = function (d) {
	const date1 = new Date(d * 1000); //unix timestamp to javascript millis

	const dateTimeFormat3 = new Intl.DateTimeFormat('en-US', {
		weekday: 'short',
		month: 'numeric',
		day: 'numeric'
	});
	return dateTimeFormat3.format(date1); //Fri, m/dd
};

export const formatDateTime = function (d) {
	const date1 = new Date(d * 1000); //unix timestamp to javascript millis

	const dateTimeFormat3 = new Intl.DateTimeFormat('en-US', {
		weekday: 'short',
		month: 'numeric',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric'
	});
	return dateTimeFormat3.format(date1); //Fri, m/dd
};

/**
 * Func is only executed after timeout ms elapse between calls to debounce
 * @src https://www.freecodecamp.org/news/javascript-debounce-example/
 * @param func
 * @param timeout
 */
export function debounce(func, timeout = 300) {
	let timer;
	return (...args) => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			func.apply(this, args);
		}, timeout);
	};
}

export const extractTeamsFromMatch = (match: RxDocument<Match>) => {
	const teamKeys = match.alliances.red.teamKeys.concat(match.alliances.blue.teamKeys);
	const matchTeams = teamKeys.map((t) => parseInt(t.replace('frc', '')));
	return matchTeams;
};

export const extractRedTeamsFromMatch = (match: RxDocument<Match>) => {
	const teamKeys = match.alliances.red.teamKeys;
	return teamKeys.map((t) => parseInt(t.replace('frc', '')));
};
export const extractBlueTeamsFromMatch = (match: RxDocument<Match>) => {
	const teamKeys = match.alliances.blue.teamKeys;
	return teamKeys.map((t) => parseInt(t.replace('frc', '')));
};
