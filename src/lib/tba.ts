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
	const events = await EventService.getEventsByYearSimple(year);

	return events.map((evt) => ({ key: evt.key, name: evt.name }));
}

export async function getMatches(eventKey: string): Promise<Array<Match>> {
	return await EventService.getEventMatches(eventKey);
}

export async function getTeams(eventKey: string): Promise<Array<Team>> {
	return await EventService.getEventTeams(eventKey);
}
