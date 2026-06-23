import { NextRequest, NextResponse } from "next/server";
import { db, dailyLogs } from "@/lib/db";
import { eq, gte, lte, and } from "drizzle-orm";
import { getCurrentUser, loginUrl } from "@/lib/auth";

function parse(row: Record<string, unknown>) {
  const fields = ["protein","carbs","alcohol","coffee","exercise"];
  for (const f of fields) {
    if (typeof row[f] === "string") {
      try { row[f] = JSON.parse(row[f] as string); } catch { row[f] = {}; }
    }
  }
  return row;
}

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: "login required", loginUrl: loginUrl() }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  try {
    if (date) {
      const rows = await db.select().from(dailyLogs).where(and(eq(dailyLogs.userId, user.id), eq(dailyLogs.date, date))).limit(1);
      return NextResponse.json(rows[0] ? parse(rows[0] as Record<string, unknown>) : null);
    }
    if (from && to) {
      const rows = await db.select().from(dailyLogs)
        .where(and(eq(dailyLogs.userId, user.id), gte(dailyLogs.date, from), lte(dailyLogs.date, to)))
        .orderBy(dailyLogs.date);
      return NextResponse.json(rows.map(r => parse(r as Record<string, unknown>)));
    }
    return NextResponse.json({ error: "provide date or from+to" }, { status: 400 });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "error" }, { status: 500 });
  }
}
