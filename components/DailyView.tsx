"use client";
import { useState, useEffect, useCallback } from "react";
import { Ring } from "./Ring";
import TapGrid from "./TapGrid";
import {
  CATEGORIES,
  isDailyTargetMet,
  isLimitCategory,
  isOverDailyTarget,
  type Category,
} from "@/lib/items";

function toDateStr(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function fmtDate(d: Date) {
  const today = toDateStr(new Date());
  if (toDateStr(d) === today) return "Today";
  const yesterday = toDateStr(new Date(Date.now() - 86400000));
  if (toDateStr(d) === yesterday) return "Yesterday";
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

type Counts = Record<string, number>;
type AllCounts = Record<Category, Counts>;

const EMPTY_COUNTS: AllCounts = { protein: {}, carbs: {}, alcohol: {}, coffee: {}, exercise: {} };

const CAT_COLORS: Record<Category, { color: string; over: string }> = {
  protein:  { color: "--mango",  over: "--cherry" },
  carbs:    { color: "--grape",  over: "--cherry" },
  alcohol:  { color: "--cherry", over: "--cherry" },
  coffee:   { color: "--lemon",  over: "--cherry" },
  exercise: { color: "--lime",   over: "--cherry" },
};

function totalTaps(counts: Counts) {
  return Object.values(counts).reduce((s, v) => s + v, 0);
}

function ringValueFor(category: Category, total: number, target: number) {
  if (!isLimitCategory(category)) return total;
  if (target === 0) return total === 0 ? 1 : 0;
  return Math.max(target - total, 0);
}

function ringMaxFor(category: Category, target: number) {
  if (!isLimitCategory(category)) return Math.max(target, 1);
  return Math.max(target, 1);
}

function summaryTextFor(category: Category, total: number, target: number) {
  if (isLimitCategory(category)) {
    if (total === 0) return "Good";
    return `${total}/${target} max`;
  }
  return `${total}/${target}`;
}

function cardStatusFor(category: Category, total: number, target: number) {
  if (isLimitCategory(category)) {
    if (total === 0) return "Good work - none today";
    if (isOverDailyTarget(category, total, target)) return `${total}/${target} over limit`;
    return `${total}/${target} max`;
  }
  if (isDailyTargetMet(category, total, target)) return `${total}/${target} done`;
  return `${total}/${target}`;
}

interface Props {
  goals: Record<Category, number>;
}

export default function DailyView({ goals }: Props) {
  const [date, setDate] = useState(new Date());
  const [counts, setCounts] = useState<AllCounts>({ ...EMPTY_COUNTS });
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [showToast, setShowToast] = useState(false);

  const ds = toDateStr(date);
  const isToday = ds === toDateStr(new Date());

  const load = useCallback(async (d: Date) => {
    setLoading(true);
    try {
      const res = await fetch(`/lifestyle-tracker/api/entries?date=${toDateStr(d)}`);
      const row = await res.json();
      if (row) {
        setCounts({
          protein:  (row.protein  && typeof row.protein  === "object") ? row.protein  : {},
          carbs:    (row.carbs    && typeof row.carbs    === "object") ? row.carbs    : {},
          alcohol:  (row.alcohol  && typeof row.alcohol  === "object") ? row.alcohol  : {},
          coffee:   (row.coffee   && typeof row.coffee   === "object") ? row.coffee   : {},
          exercise: (row.exercise && typeof row.exercise === "object") ? row.exercise : {},
        });
        setNotes(row.notes || "");
      } else {
        setCounts({ ...EMPTY_COUNTS });
        setNotes("");
      }
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load(date);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [date, load]);

  const showMsg = (msg: string) => {
    setToast(msg); setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const save = useCallback(async (quiet = false) => {
    try {
      await fetch("/lifestyle-tracker/api/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: ds,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          ...counts,
          notes,
        }),
      });
      if (!quiet) showMsg("Saved ✓");
    } catch {
      if (!quiet) showMsg("Could not save");
    }
  }, [ds, counts, notes]);

  useEffect(() => {
    if (loading) return;
    const t = setTimeout(() => {
      save(true);
    }, 500);
    return () => clearTimeout(t);
  }, [counts, notes, loading, save]);

  const navDay = (delta: number) => setDate(d => new Date(d.getFullYear(), d.getMonth(), d.getDate() + delta));

  return (
    <>
      <div className="daily-top-panel">
        <div className="date-nav">
          <button className="date-nav-btn" type="button" onClick={() => navDay(-1)}>‹</button>
          <span className={`date-display ${isToday ? "today" : ""}`}>{fmtDate(date)}</span>
          <button className="date-nav-btn" type="button" onClick={() => navDay(1)} disabled={isToday} style={{ opacity: isToday ? 0.3 : 1 }}>›</button>
        </div>

        <div className="ring-summary">
          {CATEGORIES.map(cat => {
            const total = totalTaps(counts[cat.id]);
            const goal = goals[cat.id];
            const isLimit = isLimitCategory(cat.id);
            const isOver = isOverDailyTarget(cat.id, total, goal);
            const isMet = isDailyTargetMet(cat.id, total, goal);
            const color = isLimit && total === 0 ? "var(--lime)" : `var(${CAT_COLORS[cat.id].color})`;
            return (
              <div className={`ring-item ${isMet ? "is-good" : ""}`} key={cat.id}>
                <Ring
                  value={ringValueFor(cat.id, total, goal)}
                  max={ringMaxFor(cat.id, goal)}
                  color={color}
                  over={isOver}
                />
                <span className={`ring-value ${isOver ? "is-over" : isMet ? "is-good" : ""}`}>
                  {summaryTextFor(cat.id, total, goal)}
                </span>
                <span className="ring-label">{cat.label}</span>
              </div>
            );
          })}
        </div>

        {loading && <p className="daily-loading">Loading...</p>}
      </div>

      {CATEGORIES.map(cat => {
        const total = totalTaps(counts[cat.id]);
        const goal = goals[cat.id];
        const isOver = isOverDailyTarget(cat.id, total, goal);
        const isMet = isDailyTargetMet(cat.id, total, goal);
        return (
          <div className={`card category-card ${isMet ? "is-good" : ""}`} key={cat.id} style={{ borderColor: isOver ? "var(--cherry)" : undefined }}>
            <div className="card-title">
              {cat.emoji} {cat.label}
              <span className={`card-status ${isOver ? "is-over" : isMet ? "is-good" : ""}`}>
                {cardStatusFor(cat.id, total, goal)}
              </span>
            </div>
            <TapGrid
              items={cat.items}
              counts={counts[cat.id]}
              categoryGoal={goal}
              onChange={c => setCounts(prev => ({ ...prev, [cat.id]: c }))}
              color={CAT_COLORS[cat.id].color}
              overColor="--cherry"
              goalMode={cat.goalMode}
              emptyText={isLimitCategory(cat.id) ? "Good work - none today" : "Tap items above to log"}
            />
          </div>
        );
      })}

      <div className="card">
        <div className="card-title">📝 Notes</div>
        <textarea
          className="text-input"
          placeholder="Anything else about today…"
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
      </div>

      <div className={`toast ${showToast ? "" : "hidden"}`}>{toast}</div>
    </>
  );
}
