import { createClient } from "@libsql/client";
import fs from "fs";

const DATA_DIR = process.env.DATA_DIR || "./data";
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const client = createClient({ url: `file:${DATA_DIR}/lifestyle.db` });

await client.execute(`
  CREATE TABLE IF NOT EXISTS daily_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL DEFAULT 'legacy',
    date TEXT NOT NULL,
    protein TEXT DEFAULT '{}',
    carbs TEXT DEFAULT '{}',
    alcohol TEXT DEFAULT '{}',
    coffee TEXT DEFAULT '{}',
    exercise TEXT DEFAULT '{}',
    notes TEXT DEFAULT '',
    updated_at TEXT NOT NULL
  )
`);

const cols = await client.execute(`PRAGMA table_info(daily_logs)`);
if (!cols.rows.some(r => r.name === "user_id")) {
  await client.execute(`ALTER TABLE daily_logs ADD COLUMN user_id TEXT NOT NULL DEFAULT 'legacy'`);
}

await client.execute(`CREATE UNIQUE INDEX IF NOT EXISTS daily_logs_user_date_unique ON daily_logs(user_id, date)`);

await client.execute(`
  CREATE TABLE IF NOT EXISTS user_settings (
    user_id TEXT PRIMARY KEY,
    goals TEXT NOT NULL DEFAULT '{}',
    updated_at TEXT NOT NULL
  )
`);

await client.close();
console.log("Lifestyle DB migrated");
