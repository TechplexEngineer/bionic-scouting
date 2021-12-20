import { getEvents } from './tba';

test('gets a list of events from tba api', async () => {
	console.log(await getEvents(2020));
});
