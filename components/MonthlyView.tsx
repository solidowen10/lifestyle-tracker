"use client";
import { useState, useEffect } from "react";
import { CATEGORIES, isLimitCategory, isOverDailyTarget, type Category } from "@/lib/items";

const CAT_COLORS: Record<Category, string> = {
  protein: "#FFB347", carbs: "#9B72CF", alcohol: "#E05B6A", coffee: "#C8914F", exercise: "#6DB97F",
};

function toDateStr(d: Date) { return d.toISOString().split("T")[0]; }
function daysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function firstDayOfMonth(y: number, m: number) { return new Date(y, m, 1).getDay(); }

function totalTaps(obj: Record<string, number> | null) {
  if (!obj || typeof obj !== "object") return 0;
  return Object.values(obj).reduce((s, v) => s + (v || 0), 0);
}

interface DayData {
  date: string;
  protein: Record<string, number>;
  carbs: Record<string, number>;
  alcohol: Record<string, number>;
  coffee: Record<string, number>;
  exercise: Record<string, number>;
}

interface Props {
  goals: Record<Category, number>;
}

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_LABELS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

export default function MonthlyView({ goals }: Props) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [entries, setEntries] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const from = `${year}-${String(month + 1).padStart(2, "0")}-01`;
      const days = daysInMonth(year, month);
      const to = `${year}-${String(month + 1).padStart(2, "0")}-${String(days).padStart(2, "0")}`;
      try {
        const res = await fetch(`/lifestyle-tracker/api/entries?from=${from}&to=${to}`);
        const rows = await res.json();
        setEntries(Array.isArray(rows) ? rows : []);
      } finally { setLoading(false); }
    };
    load();
  }, [year, month]);

  const entryMap = Object.fromEntries(entries.map(e => [e.date, e]));
  const days = daysInMonth(year, month);
  const firstDay = firstDayOfMonth(year, month);
  const today = toDateStr(new Date());

  const navMonth = (delta: number) => {
    let m = month + delta, y = year;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setMonth(m); setYear(y);
  };

  // Monthly stats
  const totalDays = entries.length;
  const proteinGoalDays = entries.filter(e => totalTaps(e.protein) >= goals.protein).length;
  const exerciseDays = entries.filter(e => totalTaps(e.exercise) > 0).length;
  const alcoholDays = entries.filter(e => totalTaps(e.alcohol) > 0).length;
  const alcoholFreeDays = entries.filter(e => totalTaps(e.alcohol) === 0).length;
  const alcoholOverLimitDays = entries.filter(e => isOverDailyTarget("alcohol", totalTaps(e.alcohol), goals.alcohol)).length;
  const coffeeFreeDays = entries.filter(e => totalTaps(e.coffee) === 0).length;
  const coffeeOverLimitDays = entries.filter(e => isOverDailyTarget("coffee", totalTaps(e.coffee), goals.coffee)).length;
  const totalProtein = entries.reduce((s, e) => s + totalTaps(e.protein), 0);
  const totalAlcohol = entries.reduce((s, e) => s + totalTaps(e.alcohol), 0);
  const totalCoffee = entries.reduce((s, e) => s + totalTaps(e.coffee), 0);

  return (
    <div style={{ padding: "0 0 2rem" }}>
      {/* Month nav */}
      <div className="month-nav">
        <button className="date-nav-btn" onClick={() => navMonth(-1)}>‹</button>
        <span className="month-title">{MONTH_NAMES[month]} {year}</span>
        <button className="date-nav-btn" onClick={() => navMonth(1)}>›</button>
      </div>

      {/* Calendar */}
      <div className="card">
        <div className="cal-grid">
          {DAY_LABELS.map(d => <div className="cal-day-label" key={d}>{d}</div>)}
          {Array.from({ length: firstDay }, (_, i) => (
            <div className="cal-cell empty" key={`e${i}`} />
          ))}
          {Array.from({ length: days }, (_, i) => {
            const day = i + 1;
            const ds = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const entry = entryMap[ds];
            const isToday = ds === today;
            const dots: string[] = [];
            if (entry) {
              if (totalTaps(entry.protein) > 0) dots.push(CAT_COLORS.protein);
              if (totalTaps(entry.carbs) > 0) dots.push(CAT_COLORS.carbs);
              if (totalTaps(entry.alcohol) > 0) dots.push(CAT_COLORS.alcohol);
              if (totalTaps(entry.coffee) > 0) dots.push(CAT_COLORS.coffee);
              if (totalTaps(entry.exercise) > 0) dots.push(CAT_COLORS.exercise);
            }
            return (
              <div key={day} className={`cal-cell ${entry ? "has-data" : ""} ${isToday ? "today" : ""}`}>
                <span className="cal-cell-num">{day}</span>
                <div className="cal-cell-dots">
                  {dots.slice(0, 3).map((c, i) => (
                    <div key={i} className="dot" style={{ background: c }} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid var(--cream-dark)" }}>
          {CATEGORIES.map(cat => (
            <div key={cat.id} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: CAT_COLORS[cat.id] }} />
              <span style={{ fontSize: "0.7rem", color: "var(--ink-muted)" }}>{cat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly stats */}
      <div className="card">
        <div className="card-title">📊 Month Summary</div>
        {loading ? <div style={{ textAlign: "center", color: "var(--ink-muted)", fontSize: "0.85rem" }}>Loading…</div> : (
          <>
            <div className="stat-row">
              <span className="stat-key">Days logged</span>
              <span className="stat-val">{totalDays} / {days}</span>
            </div>
            <div className="stat-row">
              <span className="stat-key">🥩 Protein goal days</span>
              <span className="stat-val" style={{ color: "var(--mango)" }}>
                {totalDays > 0 ? Math.round(proteinGoalDays / totalDays * 100) : 0}%
              </span>
            </div>
            <div style={{ margin: "0 0 0.5rem" }}>
              <div className="progress-bar-wrap">
                <div className="progress-bar-fill" style={{
                  width: `${totalDays > 0 ? proteinGoalDays / totalDays * 100 : 0}%`,
                  background: "var(--mango-light)"
                }} />
              </div>
            </div>
            <div className="stat-row">
              <span className="stat-key">🍷 Alcohol days</span>
              <span className="stat-val" style={{ color: alcoholDays > 10 ? "var(--cherry)" : "var(--ink)" }}>{alcoholDays}</span>
            </div>
            <div className="stat-row">
              <span className="stat-key">🌿 Alcohol-free logged days</span>
              <span className="stat-val" style={{ color: "var(--lime)" }}>{alcoholFreeDays} / {totalDays}</span>
            </div>
            <div className="stat-row">
              <span className="stat-key">⚠ Alcohol over-limit days</span>
              <span className="stat-val" style={{ color: alcoholOverLimitDays > 0 ? "var(--cherry)" : "var(--ink-muted)" }}>{alcoholOverLimitDays}</span>
            </div>
            <div className="stat-row">
              <span className="stat-key">🍺 Total drinks</span>
              <span className="stat-val">{totalAlcohol}</span>
            </div>
            <div className="stat-row">
              <span className="stat-key">🏃 Exercise days</span>
              <span className="stat-val" style={{ color: "var(--lime)" }}>{exerciseDays}</span>
            </div>
            <div style={{ margin: "0 0 0.5rem" }}>
              <div className="progress-bar-wrap">
                <div className="progress-bar-fill" style={{
                  width: `${exerciseDays / days * 100}%`,
                  background: "var(--lime-light)"
                }} />
              </div>
            </div>
            <div className="stat-row">
              <span className="stat-key">🌿 Coffee-free logged days</span>
              <span className="stat-val" style={{ color: "var(--lime)" }}>{coffeeFreeDays} / {totalDays}</span>
            </div>
            <div className="stat-row">
              <span className="stat-key">⚠ Coffee over-limit days</span>
              <span className="stat-val" style={{ color: coffeeOverLimitDays > 0 ? "var(--cherry)" : "var(--ink-muted)" }}>{coffeeOverLimitDays}</span>
            </div>
            <div className="stat-row">
              <span className="stat-key">☕ Total coffees</span>
              <span className="stat-val">{totalCoffee}</span>
            </div>
            <div className="stat-row">
              <span className="stat-key">🥩 Total protein servings</span>
              <span className="stat-val">{totalProtein}</span>
            </div>
          </>
        )}
      </div>

      {/* Category breakdown */}
      <div className="card">
        <div className="card-title">📈 Category Trends</div>
        {CATEGORIES.map(cat => {
          const totals = entries.map(e => totalTaps(e[cat.id] as Record<string, number>));
          const avg = totals.length ? (totals.reduce((s, v) => s + v, 0) / totals.length).toFixed(1) : "0";
          const max = Math.max(...totals, 0);
          const targetLabel = isLimitCategory(cat.id) ? "limit" : "goal";
          return (
            <div key={cat.id} style={{ marginBottom: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                <span style={{ fontSize: "0.85rem" }}>{cat.emoji} {cat.label}</span>
                <span style={{ fontSize: "0.8rem", color: "var(--ink-muted)", fontFamily: "Fredoka, sans-serif" }}>avg {avg} / {targetLabel} {goals[cat.id]}</span>
              </div>
              {/* Mini bar chart — 7-day recent */}
              <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 32 }}>
                {Array.from({ length: Math.min(days, 14) }, (_, i) => {
                  const d = days - Math.min(days, 14) + i + 1;
                  const ds2 = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                  const entry = entryMap[ds2];
                  const val = entry ? totalTaps(entry[cat.id] as Record<string, number>) : 0;
                  const pct = max > 0 ? val / max : 0;
                  const isOver = isOverDailyTarget(cat.id, val, goals[cat.id]);
                  return (
                    <div key={d} title={`${d}: ${val}`} style={{
                      flex: 1, borderRadius: "3px 3px 0 0",
                      height: `${Math.max(pct * 100, val > 0 ? 10 : 3)}%`,
                      background: isOver ? CAT_COLORS.alcohol : CAT_COLORS[cat.id],
                      opacity: val > 0 ? 1 : 0.2,
                      minHeight: 3,
                    }} />
                  );
                })}
              </div>
              <div style={{ fontSize: "0.65rem", color: "var(--ink-muted)", textAlign: "right", marginTop: 2 }}>last {Math.min(days, 14)} days</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
