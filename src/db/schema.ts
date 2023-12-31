import {
  int,
  timestamp,
  mysqlTable,
  primaryKey,
  varchar,
  serial,
  text,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import type { AdapterAccount } from "@auth/core/adapters";

export const users = mysqlTable("user", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("emailVerified", {
    mode: "date",
    fsp: 3,
  }).defaultNow(),
  image: varchar("image", { length: 255 }),
});

export type User = typeof users.$inferSelect;

export const usersRelations = relations(users, ({ one }) => ({
  accounts: one(accounts, {
    fields: [users.id],
    references: [accounts.userId],
  }),
}));

export const sessionRelations = relations(users, ({ one }) => ({
  sessions: one(sessions, {
    fields: [users.id],
    references: [sessions.userId],
  }),
}));

export const accounts = mysqlTable(
  "account",
  {
    userId: varchar("userId", { length: 255 }).notNull(),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    refresh_token: varchar("refresh_token", { length: 255 }),
    access_token: varchar("access_token", { length: 255 }),
    expires_at: int("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey(account.provider, account.providerAccountId),
  })
);

export const sessions = mysqlTable("session", {
  sessionToken: varchar("sessionToken", { length: 255 }).notNull().primaryKey(),
  userId: varchar("userId", { length: 255 }).notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = mysqlTable(
  "verificationToken",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier, vt.token),
  })
);

export const message = mysqlTable("message", {
  id: serial("id").primaryKey(),
  text: varchar("text", { length: 191 }).notNull(),
  userId: varchar("userId", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Message = typeof message.$inferSelect;

//each message has one user
export const messagesRelation = relations(message, ({ one }) => ({
  author: one(users, {
    fields: [message.userId],
    references: [users.id],
  }),
}));

//each user has many messages
export const UserMessagesRelations = relations(users, ({ many }) => ({
  messages: many(message),
}));
