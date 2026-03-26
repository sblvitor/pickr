import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  topic: text("topic").notNull(),
  chosenOption: text("chosen_option"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})