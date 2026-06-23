import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/db";
import { getCurrentUser, loginUrl } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: "login required", loginUrl: loginUrl() }, { status: 401 });

  const row = await client.execute({
    sql: "SELECT goals FROM user_settings WHERE user_id = ?",
    args: [user.id],
  });

  if (!row.rows[0]) return NextResponse.json(null);

  try {
    return NextResponse.json(JSON.parse(String(row.rows[0].goals || "{}")));
  } catch {
    return NextResponse.json(null);
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: "login required", loginUrl: loginUrl() }, { status: 401 });

  const goals = await req.json();
  const now = new Date().toISOString();

  await client.execute({
    sql: `
      INSERT INTO user_settings (user_id, goals, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET goals = excluded.goals, updated_at = excluded.updated_at
    `,
    args: [user.id, JSON.stringify(goals), now],
  });

  return NextResponse.json({ ok: true });
}
