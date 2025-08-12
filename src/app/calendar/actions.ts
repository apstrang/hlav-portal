'use server'

import { createEvent } from '@/db/queries/insert'

export async function createEventAction(formData: FormData) {
	const raw = Object.fromEntries(formData.entries());

	const data = {
		title: raw.title as string,
		start: new Date(raw.start as string).toISOString(),
		end: new Date(raw.end as string).toISOString(),
	};

	await createEvent(data);
}