import { sql } from "drizzle-orm/sql"
import { foreignKey, pgPolicy, integer, interval, pgTable, varchar, uuid, text, boolean, timestamp } from "drizzle-orm/pg-core"
import { authUsers, authenticatedRole } from "drizzle-orm/supabase"
import { timestamps } from "@/db/helpers/columns.helpers"
import * as t from "drizzle-orm/pg-core"

// PROFILES //

export const profilesTable = pgTable(
	'profiles',
	{
		id: uuid().primaryKey(),
		name: text().unique(),
		phone: integer(),
		email: varchar(),
		userRole: integer('user_role').default(4),
		rmsId: integer('rms_id'),
		...timestamps
	},
	(table) => [
		foreignKey({
			columns: [table.id],
			foreignColumns: [authUsers.id],
			name: 'profiles_id_fk',
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.userRole],
			foreignColumns: [rolesTable.id],
			name: 'profiles_role_fk',
		}).onDelete('cascade'),
		pgPolicy("authenticated users can view all profiles", {
			for: 'select',
			to: authenticatedRole,
			using: sql`true`,
		}),
	]
);

// ROLES //

export const rolesTable = pgTable(
	'user_roles',
	{
		id: integer('id').primaryKey(),
		title: text('title'),
		canViewAll: boolean('can_update_all').default(false),
		canUpdateAll: boolean('can_update_all').default(false),
		canDeleteAll: boolean('can_delete_all').default(false),
		canInsertAll: boolean('can_insert_all').default(false),
		canViewSelf: boolean('can_view_self').default(true),
		canUpdateSelf: boolean('can_update_self').default(true),
		canDeleteSelf: boolean('can_delete_self').default(true),
		canInsertSelf: boolean('can_insert_self').default(true),
	},
	(table) => [
		pgPolicy("authenticated can view", {
			for: 'select',
			to: authenticatedRole,
			using: sql`true`,
		}),
	]
);

// EVENTS //

export const eventsTable = pgTable(
	'events',
	{
		id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
		ownedBy: uuid('owned_by').notNull(),
		createdBy: uuid('created_by').notNull(),
		source: varchar('source').notNull().default('internal'),
		externalId: varchar('external_id'),
		title: varchar('title').notNull(),
		start: timestamp('starts_at').notNull(),
		end: timestamp('ends_at').notNull(),
		color: varchar('color'),
		isPending: boolean('is_pending'),
		lastSync: timestamp('last_sync'),
		syncStatus: varchar('sync_status'),
		msTag: varchar('ms_etag'),
		approvalStatus: varchar('approval_status'),
		...timestamps
	},
	(table) => [
		foreignKey({
			columns: [table.ownedBy],
			foreignColumns: [profilesTable.id],
			name: 'events_owned_by_fk',
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.createdBy],
			foreignColumns: [profilesTable.id],
			name: 'events_created_by_fk',
		}).onDelete('cascade'),
		pgPolicy("authenticated users can view all events", {
			for: 'select',
			to: authenticatedRole,
			using: sql`true`,
		}),
		pgPolicy("users can modify their own data", {
			for: 'all',
			to: authenticatedRole,
			using: sql`exists(select 1 from profiles where auth.uid() = profiles.id)`,
			withCheck: sql`exists(select 1 from profiles where auth.uid() = profiles.id)`,
		}),
	]
);

// SHIFT PRESETS //

export const shiftPresetsTable = pgTable(
	'shift_presets',
	{
		id: uuid('id').primaryKey(),
		name: varchar('name').notNull(),
		note: varchar('note'),
		color: varchar('color'),
		duration: interval('duration').notNull(),
		...timestamps
	},
	(table) => [
		pgPolicy("authenticated admins have full access", {
			as: 'permissive',
			to: authenticatedRole,
			for: 'all',
			using: sql`exists(select 1 from profiles where auth.uid() = profiles.id and profiles.user_role <= 3)`,
			withCheck: sql`exists(select 1 from profiles where auth.uid() = profiles.id and profiles.user_role <= 3)`,
		}),
	]
);

// TYPES //

export type InsertProfile = typeof profilesTable.$inferInsert;
export type SelectProfile = typeof profilesTable.$inferSelect;
export type UpdateProfile = typeof profilesTable.$inferUpdate;

export type InsertRole = typeof rolesTable.$inferInsert;
export type SelectRole = typeof rolesTable.$inferSelect;

export type InsertEvent = typeof eventsTable.$inferInsert;
export type SelectEvent = typeof eventsTable.$inferSelect;
export type DeleteEvent = typeof eventsTable.$inferDelete;
export type UpdateEvent = typeof eventsTable.$inferUpdate;

export type InsertShift = typeof shiftPresetsTable.$inferInsert;
export type SelectShift = typeof shiftPresetsTable.$inferSelect;
export type UpdateShift = typeof shiftPresetsTable.$inferUpdate;
export type DeleteShift = typeof shiftPresetsTable.$inferDelete;