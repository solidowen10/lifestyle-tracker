import { createClient } from "@libsql/client";
import * as fs from "fs";

const DATA_DIR = process.env.DATA_DIR || "./data";

async function migrate() {
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
  const hasUserId = cols.rows.some((r: any) => r.name === "user_id");
  if (!hasUserId) {
    await client.execute(`ALTER TABLE daily_logs ADD COLUMN user_id TEXT NOT NULL DEFAULT 'legacy'`);
  }

  await client.execute(`UPDATE daily_logs SET user_id = 'legacy' WHERE user_id IS NULL OR user_id = ''`);
  await client.execute(`DROP INDEX IF EXISTS daily_logs_date_unique`);
  await client.execute(`CREATE UNIQUE INDEX IF NOT EXISTS daily_logs_user_date_unique ON daily_logs(user_id, date)`);

  console.log("DB ready");
  await client.close();
}
migrate().catch(console.error);
