import { relations } from "drizzle-orm/relations";
import { startup, images, user, account, session, startupRequest, startupToStartupRequest, startupToTag, tag, userToStartupRequest, userToStartup, userToTag } from "./schema";

export const imagesRelations = relations(images, ({one}) => ({
	startup: one(startup, {
		fields: [images.startupId],
		references: [startup.id]
	}),
}));

export const startupRelations = relations(startup, ({one, many}) => ({
	images: many(images),
	user: one(user, {
		fields: [startup.creatorUser],
		references: [user.id]
	}),
	startupRequest: one(startupRequest, {
		fields: [startup.startupRequestId],
		references: [startupRequest.id]
	}),
	startupToStartupRequests: many(startupToStartupRequest),
	startupToTags: many(startupToTag),
	userToStartups: many(userToStartup),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	accounts: many(account),
	sessions: many(session),
	startups: many(startup),
	userToStartupRequests: many(userToStartupRequest),
	userToStartups: many(userToStartup),
	userToTags: many(userToTag),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const startupRequestRelations = relations(startupRequest, ({many}) => ({
	startups: many(startup),
	startupToStartupRequests: many(startupToStartupRequest),
	userToStartupRequests: many(userToStartupRequest),
}));

export const startupToStartupRequestRelations = relations(startupToStartupRequest, ({one}) => ({
	startup: one(startup, {
		fields: [startupToStartupRequest.startupId],
		references: [startup.id]
	}),
	startupRequest: one(startupRequest, {
		fields: [startupToStartupRequest.startupRequestId],
		references: [startupRequest.id]
	}),
}));

export const startupToTagRelations = relations(startupToTag, ({one}) => ({
	startup: one(startup, {
		fields: [startupToTag.startupId],
		references: [startup.id]
	}),
	tag: one(tag, {
		fields: [startupToTag.tagId],
		references: [tag.id]
	}),
}));

export const tagRelations = relations(tag, ({many}) => ({
	startupToTags: many(startupToTag),
	userToTags: many(userToTag),
}));

export const userToStartupRequestRelations = relations(userToStartupRequest, ({one}) => ({
	user: one(user, {
		fields: [userToStartupRequest.userId],
		references: [user.id]
	}),
	startupRequest: one(startupRequest, {
		fields: [userToStartupRequest.startupRequestId],
		references: [startupRequest.id]
	}),
}));

export const userToStartupRelations = relations(userToStartup, ({one}) => ({
	user: one(user, {
		fields: [userToStartup.userId],
		references: [user.id]
	}),
	startup: one(startup, {
		fields: [userToStartup.startupId],
		references: [startup.id]
	}),
}));

export const userToTagRelations = relations(userToTag, ({one}) => ({
	user: one(user, {
		fields: [userToTag.userId],
		references: [user.id]
	}),
	tag: one(tag, {
		fields: [userToTag.tagId],
		references: [tag.id]
	}),
}));