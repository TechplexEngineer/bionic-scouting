import type { RxDocument } from 'rxdb';
import type { Match } from '$lib/schema/match-schema';
import type { MyDatabase } from '$lib/store';
import { Settings } from '$lib/schema/settings-schema';
import Swal from 'sweetalert2';
import { goto } from '$app/navigation';
import type {PitReport} from "$lib/schema/pit-scout-schema";
import type {RxAttachment} from "rxdb";

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

export const formatDate = function (d: number): string {
	if (!d) {
		return '';
	}
	const date1 = new Date(d * 1000); //unix timestamp to javascript millis

	const dateTimeFormat3 = new Intl.DateTimeFormat('en-US', {
		weekday: 'short',
		month: 'numeric',
		day: 'numeric'
	});
	return dateTimeFormat3.format(date1); //Fri, m/dd
};

export const formatDateTime = function (d) {
	if (!d) {
		return '';
	}
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
	if (!match) {
		return [];
	}
	const teamKeys = match.alliances.red.teamKeys;
	return teamKeys.map((t) => parseInt(t.replace('frc', '')));
};
export const extractBlueTeamsFromMatch = (match: RxDocument<Match>) => {
	if (!match) {
		return [];
	}
	const teamKeys = match.alliances.blue.teamKeys;
	return teamKeys.map((t) => parseInt(t.replace('frc', '')));
};

export const getSettingQuery = (db: MyDatabase, settingKey: Settings) => {
	return db.settings.findOne({ selector: { key: settingKey } });
}


export const getCurrentEventQuery = (db: MyDatabase) => {
	return db.settings.findOne({ selector: { key: Settings.CurrentEvent } });
}

export const getCurrentEvent = async (db: MyDatabase, skipError?: boolean) => {
	const settingEvent = await getCurrentEventQuery(db).exec();
	if (!settingEvent) {
		if (skipError) {
			return;
		}
		const res = await Swal.fire({
			icon: 'error',
			title: 'Oops...',
			html: `Current event not set. Head over to Setup`,
			showCloseButton: true,
			confirmButtonText: 'Go to Setup'
		});
		if (res.isConfirmed) {
			goto('/tools/super');
			return;
		}
	}
	return settingEvent.value;
};

export const getOurTeamNumberQuery = (db: MyDatabase) => {
	return db.settings.findOne({ selector: { key: Settings.TeamNumber } });
}

export const getOurTeamNumber = async (db: MyDatabase, skipError?: true) => {
	const entry = await getOurTeamNumberQuery(db).exec();

	if (!entry) {
		if (skipError) {
			return;
		}
		const res = await Swal.fire({
			icon: 'error',
			title: 'Oops...',
			html: `Team number not set. Head over to Setup`,
			showCloseButton: true,
			confirmButtonText: 'Go to Setup'
		});
		if (res.isConfirmed) {
			goto('/tools/super');
			return;
		}
	}
	return parseInt(entry.value);
};

export const getDeviceNameQuery = (db: MyDatabase) => {
	return db.settings.findOne({ selector: { key: Settings.DeviceName } });
}

export const getDeviceName = async (db: MyDatabase, skipError?: true) => {
	const entry = await getDeviceNameQuery(db).exec();

	return entry.value;
};

export async function removeAllData(): Promise<void> {
	if (!confirm("Are you sure? there is no undo!")) {
		return;
	}
	// console.log("Removing all databases");
	const dbs = await indexedDB.databases();
	dbs.forEach(db => {
		// console.log("Delete", db);
		indexedDB.deleteDatabase(db.name);
	});

	localStorage.clear();
	location.reload();
}

export type PitReportWithAttachments = { doc: RxDocument<PitReport>, attachments: RxAttachment<PitReport> }