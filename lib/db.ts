import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { integer, text, sqliteTable, uniqueIndex } from "drizzle-orm/sqlite-core";
import * as fs from "fs";

const DATA_DIR = process.env.DATA_DIR || "./data";
if (typeof window === "undefined" && !fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const client = createClient({ url: `file:${DATA_DIR}/lifestyle.db` });
export const db = drizzle(client);

export const dailyLogs = sqliteTable("daily_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().default("legacy"),
  date: text("date").notNull(),
  protein: text("protein").default("{}"),
  carbs: text("carbs").default("{}"),
  alcohol: text("alcohol").default("{}"),
  coffee: text("coffee").default("{}"),
  exercise: text("exercise").default("{}"),
  notes: text("notes").default(""),
  updatedAt: text("updated_at").notNull(),
}, (table) => ({
  userDateIdx: uniqueIndex("daily_logs_user_date_unique").on(table.userId, table.date),
}));

export type DailyLog = typeof dailyLogs.$inferSelect;
