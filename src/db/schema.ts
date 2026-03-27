import {
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import type { AnyPgColumn } from "drizzle-orm/pg-core";

export const sessionStatusEnum = pgEnum("session_status", [
  "open",
  "deciding",
  "chosen",
  "closed",
]);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull(),
    topic: text("topic").notNull(),
    status: sessionStatusEnum("status").notNull().default("open"),
    chosenOptionId: uuid("chosen_option_id").references(
      (): AnyPgColumn => sessionOptions.id,
      { onDelete: "set null" },
    ),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("sessions_code_unique").on(table.code),
    index("sessions_status_idx").on(table.status),
  ],
);

export const sessionMembers = pgTable(
  "session_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    nickname: text("nickname").notNull(),
    isHost: boolean("is_host").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("session_members_session_id_idx").on(table.sessionId),
    uniqueIndex("session_members_session_id_nickname_unique").on(
      table.sessionId,
      table.nickname,
    ),
  ],
);

export const sessionOptions = pgTable(
  "session_options",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    createdByMemberId: uuid("created_by_member_id").references(
      () => sessionMembers.id,
      { onDelete: "set null" },
    ),
    label: text("label").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("session_options_session_id_idx").on(table.sessionId),
    index("session_options_created_by_member_id_idx").on(table.createdByMemberId),
  ],
);