import { pgTable, foreignKey, text, timestamp, unique, serial, integer, boolean, primaryKey, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const status = pgEnum("status", ['pending', 'approved', 'rejected'])


export const images = pgTable("images", {
	id: text().default(gen_random_uuid()).primaryKey().notNull(),
	url: text().notNull(),
	startupId: text("startup_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.startupId],
			foreignColumns: [startup.id],
			name: "images_startup_id_startup_id_fk"
		}).onDelete("cascade"),
]);

export const account = pgTable("account", {
	id: text().default(gen_random_uuid()).primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const session = pgTable("session", {
	id: text().default(gen_random_uuid()).primaryKey().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	token: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_user_id_user_id_fk"
		}).onDelete("cascade"),
	unique("session_token_unique").on(table.token),
]);

export const startupRequest = pgTable("startup_request", {
	id: serial().primaryKey().notNull(),
	message: text().notNull(),
	status: status().default('pending').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const startup = pgTable("startup", {
	id: text().default(gen_random_uuid()).primaryKey().notNull(),
	name: text().notNull(),
	description: text().notNull(),
	websiteUrl: text("website_url"),
	creatorUser: text("creator_user").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	startupRequestId: integer("startup_request_id"),
}, (table) => [
	foreignKey({
			columns: [table.creatorUser],
			foreignColumns: [user.id],
			name: "startup_creator_user_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.startupRequestId],
			foreignColumns: [startupRequest.id],
			name: "startup_startup_request_id_startup_request_id_fk"
		}).onDelete("set null"),
]);

export const tag = pgTable("tag", {
	id: integer().primaryKey().notNull(),
	name: text().notNull(),
});

export const verification = pgTable("verification", {
	id: text().default(gen_random_uuid()).primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const user = pgTable("user", {
	id: text().default(gen_random_uuid()).primaryKey().notNull(),
	username: text(),
	name: text(),
	email: text().notNull(),
	emailVerified: boolean("email_verified").notNull(),
	image: text(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("user_username_unique").on(table.username),
	unique("user_email_unique").on(table.email),
]);

export const startupToStartupRequest = pgTable("startup_to_startup_request", {
	startupId: text("startup_id").notNull(),
	startupRequestId: integer("startup_request_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.startupId],
			foreignColumns: [startup.id],
			name: "startup_to_startup_request_startup_id_startup_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.startupRequestId],
			foreignColumns: [startupRequest.id],
			name: "startup_to_startup_request_startup_request_id_startup_request_i"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.startupId, table.startupRequestId], name: "startup_to_startup_request_startup_id_startup_request_id_pk"}),
]);

export const startupToTag = pgTable("startup_to_tag", {
	startupId: text("startup_id").notNull(),
	tagId: integer("tag_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.startupId],
			foreignColumns: [startup.id],
			name: "startup_to_tag_startup_id_startup_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.tagId],
			foreignColumns: [tag.id],
			name: "startup_to_tag_tag_id_tag_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.startupId, table.tagId], name: "startup_to_tag_startup_id_tag_id_pk"}),
]);

export const userToStartupRequest = pgTable("user_to_startup_request", {
	userId: text("user_id").notNull(),
	startupRequestId: integer("startup_request_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "user_to_startup_request_user_id_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.startupRequestId],
			foreignColumns: [startupRequest.id],
			name: "user_to_startup_request_startup_request_id_startup_request_id_f"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.userId, table.startupRequestId], name: "user_to_startup_request_user_id_startup_request_id_pk"}),
]);

export const userToStartup = pgTable("user_to_startup", {
	userId: text("user_id").notNull(),
	startupId: text("startup_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "user_to_startup_user_id_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.startupId],
			foreignColumns: [startup.id],
			name: "user_to_startup_startup_id_startup_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.userId, table.startupId], name: "user_to_startup_user_id_startup_id_pk"}),
]);

export const userToTag = pgTable("user_to_tag", {
	userId: text("user_id").notNull(),
	tagId: integer("tag_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "user_to_tag_user_id_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.tagId],
			foreignColumns: [tag.id],
			name: "user_to_tag_tag_id_tag_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.userId, table.tagId], name: "user_to_tag_user_id_tag_id_pk"}),
]);
