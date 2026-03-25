import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  topic: text("topic").notNull(),
  chosenOption: text("chosen_option"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})