import { NextRequest, NextResponse } from "next/server";
import { db, dailyLogs } from "@/lib/db";
import { and, eq } from "drizzle-orm";
import { getCurrentUser, loginUrl } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ error: "login required", loginUrl: loginUrl() }, { status: 401 });

    const body = await req.json();
    const { date, ...fields } = body;
    if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });

    const now = new Date().toISOString();
    const toStore: Record<string, string> = {};
    for (const [k, v] of Object.entries(fields)) {
      toStore[k] = typeof v === "object" ? JSON.stringify(v) : String(v ?? "");
    }

    const where = and(eq(dailyLogs.userId, user.id), eq(dailyLogs.date, date));
    const existing = await db.select().from(dailyLogs).where(where).limit(1);

    if (existing.length > 0) {
      await db.update(dailyLogs).set({ ...toStore, updatedAt: now }).where(where);
    } else {
      await db.insert(dailyLogs).values({ userId: user.id, date, ...toStore, updatedAt: now });
    }

    const row = await db.select().from(dailyLogs).where(where).limit(1);
    return NextResponse.json(row[0]);
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "error" }, { status: 500 });
  }
}
