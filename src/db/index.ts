import { config } from "dotenv"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { eventsTable } from './db/schema'
import { eq } from 'drizzle-orm'

config({ path: ".env.local" });

const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle({ client });

/*
async function main () {
	const event: typeof eventsTable.$inferInsert = {

	}
}
*/