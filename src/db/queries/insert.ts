import { db } from '../index'
import { InsertEvent, eventsTable } from '../schema'


export async function createEvent(data: InsertEvent) {
	await db.insert(eventsTable).values(data);
}
