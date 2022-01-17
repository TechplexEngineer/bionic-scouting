const TBA_KEY = `QehLoNZFqjsoiGRwzhbna8k5MEoj1C40i9gQNLBPM0KUw8AsVCm4hFTYxVQzZql6`;

import type { Team, Match } from 'tba-api-v3client-ts';
import { EventService, OpenAPI } from 'tba-api-v3client-ts';

// Pull TBA key from environment variable and set as header value
OpenAPI.HEADERS = {
	'X-TBA-Auth-Key': TBA_KEY
};

export type Event = { key: string; name: string };
export type EventList = Event[];

export async function getEvents(year: number): Promise<EventList> {
	const resp = await fetch(`https://www.thebluealliance.com/api/v3/events/${year}/simple`, {
		headers: {
			accept: 'application/json',
			'x-tba-auth-key': TBA_KEY
		}
	});
	const events = await resp.json();

	// const events = await EventService.getEventsByYearSimple(year);

	return events.map((evt) => ({ key: evt.key, name: evt.name }));
}

export async function getMatches(eventKey: string): Promise<Array<Match>> {
	const resp = await fetch(`https://www.thebluealliance.com/api/v3/event/${eventKey}/matches`, {
		headers: {
			accept: 'application/json',
			'x-tba-auth-key': TBA_KEY
		}
	});
	return await resp.json();
	// return await EventService.getEventMatches(eventKey);
}

export async function getTeams(eventKey: string): Promise<Array<Team>> {
	const resp = await fetch(`https://www.thebluealliance.com/api/v3/event/${eventKey}/teams`, {
		headers: {
			accept: 'application/json',
			'x-tba-auth-key': TBA_KEY
		}
	});
	return await resp.json();
	// return await EventService.getEventTeams(eventKey);
}
