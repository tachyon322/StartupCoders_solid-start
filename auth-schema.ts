import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  primaryKey,
  uuid as pgUuid,
  serial,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

export const user = pgTable("user", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").unique(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  description: text('description'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const userRelations = relations(user, ({ many }) => ({
  createdStartups: many(startup, { relationName: "creator" }),
  participatingStartups: many(userToStartup, { relationName: "user" }),
  receivedStartupRequests: many(userToStartupRequest, { relationName: "user" }),
  tags: many(userToTag),
}));

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const tag = pgTable("tag", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
});

export const tagRelations = relations(tag, ({ many }) => ({
  users: many(userToTag),
  startups: many(startupToTag),
}));

export const userToTag = pgTable("user_to_tag", {
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  tagId: integer("tag_id").notNull().references(() => tag.id, { onDelete: "cascade" }),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.tagId] }),
}));

export const userToTagRelations = relations(userToTag, ({ one }) => ({
  user: one(user, {
    fields: [userToTag.userId],
    references: [user.id],
  }),
  tag: one(tag, {
    fields: [userToTag.tagId],
    references: [tag.id],
  }),
}));

export const statusEnum = pgEnum("status", ["pending", "approved", "rejected"]);

export const startupRequest = pgTable("startup_request", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),
  status: statusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const startupRequestRelations = relations(startupRequest, ({ many }) => ({
  requestBy: many(userToStartupRequest, { relationName: "startupRequest" }),
  startup: many(startupToStartupRequest, { relationName: "startupRequest" }),
}));

export const userToStartupRequest = pgTable("user_to_startup_request", {
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  startupRequestId: integer("startup_request_id").notNull().references(() => startupRequest.id, { onDelete: "cascade" }),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.startupRequestId] }),
}));

export const userToStartupRequestRelations = relations(userToStartupRequest, ({ one }) => ({
  user: one(user, {
    fields: [userToStartupRequest.userId],
    references: [user.id],
    relationName: "user",
  }),
  startupRequest: one(startupRequest, {
    fields: [userToStartupRequest.startupRequestId],
    references: [startupRequest.id],
    relationName: "startupRequest",
  }),
}));

export const startup = pgTable("startup", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  websiteUrl: text("website_url"),
  creatorUser: text("creator_user").notNull().references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  startupRequestId: integer("startup_request_id").references(() => startupRequest.id, { onDelete: "set null" }),
});

export const startupRelations = relations(startup, ({ one, many }) => ({
  creatorId: one(user, {
    fields: [startup.creatorUser],
    references: [user.id],
    relationName: "creator",
  }),
  participants: many(userToStartup, { relationName: "startup" }),
  tags: many(startupToTag),
  images: many(images),
  startupRequest: one(startupRequest, {
    fields: [startup.startupRequestId],
    references: [startupRequest.id],
  }),
}));

export const userToStartup = pgTable("user_to_startup", {
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  startupId: text("startup_id").notNull().references(() => startup.id, { onDelete: "cascade" }),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.startupId] }),
}));

export const userToStartupRelations = relations(userToStartup, ({ one }) => ({
  user: one(user, {
    fields: [userToStartup.userId],
    references: [user.id],
    relationName: "user",
  }),
  startup: one(startup, {
    fields: [userToStartup.startupId],
    references: [startup.id],
    relationName: "startup",
  }),
}));

export const startupToTag = pgTable("startup_to_tag", {
  startupId: text("startup_id").notNull().references(() => startup.id, { onDelete: "cascade" }),
  tagId: integer("tag_id").notNull().references(() => tag.id, { onDelete: "cascade" }),
}, (t) => ({
  pk: primaryKey({ columns: [t.startupId, t.tagId] }),
}));

export const startupToTagRelations = relations(startupToTag, ({ one }) => ({
  startup: one(startup, {
    fields: [startupToTag.startupId],
    references: [startup.id],
  }),
  tag: one(tag, {
    fields: [startupToTag.tagId],
    references: [tag.id],
  }),
}));

export const startupToStartupRequest = pgTable("startup_to_startup_request", {
  startupId: text("startup_id").notNull().references(() => startup.id, { onDelete: "cascade" }),
  startupRequestId: integer("startup_request_id").notNull().references(() => startupRequest.id, { onDelete: "cascade" }),
}, (t) => ({
  pk: primaryKey({ columns: [t.startupId, t.startupRequestId] }),
}));

export const startupToStartupRequestRelations = relations(startupToStartupRequest, ({ one }) => ({
  startup: one(startup, {
    fields: [startupToStartupRequest.startupId],
    references: [startup.id],
    relationName: "startup",
  }),
  startupRequest: one(startupRequest, {
    fields: [startupToStartupRequest.startupRequestId],
    references: [startupRequest.id],
    relationName: "startupRequest",
  }),
}));

export const images = pgTable("images", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  url: text("url").notNull(),
  startupId: text("startup_id").notNull().references(() => startup.id, { onDelete: "cascade" }),
});

export const imagesRelations = relations(images, ({ one }) => ({
  startup: one(startup, {
    fields: [images.startupId],
    references: [startup.id],
  }),
}));
