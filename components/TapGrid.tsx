"use client";
import { type GoalMode, type ItemDef } from "@/lib/items";

interface TapGridProps {
  items: ItemDef[];
  counts: Record<string, number>;  // { chicken: 2, fish: 1 }
  categoryGoal: number;            // total taps goal for category
  onChange: (counts: Record<string, number>) => void;
  color?: string;      // accent color CSS var name e.g. "--mango"
  overColor?: string;  // over-limit color e.g. "--cherry"
  goalMode?: GoalMode;
  emptyText?: string;
}

export default function TapGrid({
  items,
  counts,
  categoryGoal,
  onChange,
  color = "--mango",
  overColor = "--cherry",
  goalMode = "minimum",
  emptyText = "Tap items above to log",
}: TapGridProps) {
  const totalTaps = Object.values(counts).reduce((s, v) => s + v, 0);
  const isOverLimit = goalMode === "maximum" && totalTaps > categoryGoal;

  const tap = (key: string) => {
    const cur = counts[key] || 0;
    onChange({ ...counts, [key]: cur + 1 });
  };

  const untap = (key: string) => {
    const cur = counts[key] || 0;
    if (cur <= 0) return;
    onChange({ ...counts, [key]: cur - 1 });
  };

  return (
    <div>
      {/* Item rows */}
      {items.map(item => {
        const count = counts[item.key] || 0;
        if (count === 0) return null; // only show active items in chip area
        return null; // chips shown below
      })}

      {/* Emoji picker grid */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
        {items.map(item => {
          const count = counts[item.key] || 0;
          const isActive = count > 0;
          return (
            <button
              key={item.key}
              onClick={() => tap(item.key)}
              onContextMenu={e => { e.preventDefault(); untap(item.key); }}
              title={`${item.label} — tap to add, right-click to remove`}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                gap: "2px",
                padding: "0.5rem 0.6rem",
                borderRadius: "12px",
                border: `1.5px solid ${isActive ? `var(${color})` : "var(--border)"}`,
                background: isActive ? `var(${color})22` : "#fff",
                cursor: "pointer",
                minWidth: 52,
                transition: "all 0.1s",
                position: "relative",
              }}
            >
              <span style={{ fontSize: "1.5rem", lineHeight: 1 }}>{item.emoji}</span>
              <span style={{ fontSize: "0.65rem", color: "var(--ink-muted)", fontFamily: "var(--font-seasons)" }}>{item.label}</span>
              {count > 0 && (
                <span style={{
                  position: "absolute", top: -6, right: -6,
                  background: isOverLimit ? `var(${overColor})` : `var(${color})`,
                  color: "#fff",
                  borderRadius: "10px",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  padding: "1px 5px",
                  fontFamily: "var(--font-seasons)",
                  minWidth: 16, textAlign: "center",
                }}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tap chip strip — shows all tapped items as emoji sequence */}
      {totalTaps > 0 && (
        <div style={{
          background: "var(--cream)",
          borderRadius: "12px",
          padding: "0.6rem 0.75rem",
          display: "flex",
          flexWrap: "wrap",
          gap: "4px",
          alignItems: "center",
          minHeight: 40,
        }}>
          {items.flatMap(item => {
            const count = counts[item.key] || 0;
            return Array.from({ length: count }, (_, i) => {
              const tapIndex = items.slice(0, items.findIndex(x => x.key === item.key))
                .reduce((s, x) => s + (counts[x.key] || 0), 0) + i;
              const isOver = goalMode === "maximum" && tapIndex >= categoryGoal;
              return (
                <button
                  key={`${item.key}-${i}`}
                  onClick={() => untap(item.key)}
                  title={`Remove one ${item.label}`}
                  style={{
                    fontSize: "1.25rem",
                    background: "none", border: "none", cursor: "pointer",
                    padding: "2px",
                    borderRadius: "6px",
                    outline: isOver ? `2px solid var(${overColor})` : "none",
                    outlineOffset: "1px",
                    transition: "transform 0.1s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.2)")}
                  onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                >
                  {item.emoji}
                </button>
              );
            });
          })}
          <span style={{
            marginLeft: "auto",
            fontFamily: "var(--font-seasons)",
            fontSize: "0.9rem",
            fontWeight: 600,
            color: isOverLimit ? `var(${overColor})` : "var(--ink-muted)",
          }}>
            {totalTaps}/{categoryGoal}
            {goalMode === "maximum" && <span style={{ marginLeft: 4 }}>max</span>}
            {isOverLimit && <span style={{ marginLeft: 4 }}>⚠️</span>}
          </span>
        </div>
      )}

      {totalTaps === 0 && (
        <div style={{ fontSize: "0.78rem", color: "var(--ink-muted)", textAlign: "center", padding: "0.5rem 0" }}>
          {emptyText}
        </div>
      )}
    </div>
  );
}
