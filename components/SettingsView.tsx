"use client";
import { CATEGORIES, DEFAULT_GOALS, isLimitCategory, type Category } from "@/lib/items";

const CAT_COLORS: Record<Category, string> = {
  protein: "--mango", carbs: "--grape", alcohol: "--cherry", coffee: "--lemon", exercise: "--lime",
};

interface Props {
  goals: Record<Category, number>;
  onChange: (goals: Record<Category, number>) => void;
}

export default function SettingsView({ goals, onChange }: Props) {
  const set = (cat: Category, val: number) => {
    onChange({ ...goals, [cat]: Math.max(0, val) });
  };

  return (
    <div className="settings-page" style={{ padding: "1rem 0 2rem" }}>
      <div style={{ padding: "0.5rem 1.25rem 1rem" }}>
        <div style={{ fontFamily: "Fredoka, sans-serif", fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.25rem" }}>Daily Goals & Limits</div>
        <div style={{ fontSize: "0.8rem", color: "var(--ink-muted)" }}>
          Set minimum targets for food and movement, plus maximum limits for alcohol and coffee.
          No alcohol or coffee logged is treated as a good day.
        </div>
      </div>

      {CATEGORIES.map(cat => {
        const goal = goals[cat.id];
        const color = `var(${CAT_COLORS[cat.id]})`;
        const isLimit = isLimitCategory(cat.id);
        const label = isLimit ? "Limit" : "Goal";
        return (
          <div className="card" key={cat.id} style={{ borderLeft: `4px solid ${color}` }}>
            <div className="card-title" style={{ marginBottom: "0.75rem" }}>
              {cat.emoji} {cat.label}
            </div>

            {/* Stepper */}
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <button
                onClick={() => set(cat.id, goal - 1)}
                style={{
                  width: 38, height: 38, borderRadius: "50%",
                  border: "1.5px solid var(--border)", background: "#fff",
                  fontSize: "1.2rem", cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center", color: "var(--ink)",
                }}>−</button>

              {/* Emoji chips for goal visualization */}
              <div style={{ flex: 1, display: "flex", flexWrap: "wrap", gap: "4px", minHeight: 36, alignItems: "center" }}>
                {Array.from({ length: goal }, (_, i) => (
                  <span key={i} style={{ fontSize: "1.3rem", cursor: "pointer" }}
                    onClick={() => set(cat.id, i + 1)}
                    title={`Set ${label.toLowerCase()} to ${i + 1}`}
                  >{cat.items[0]?.emoji}</span>
                ))}
                {goal === 0 && (
                  <span style={{ fontSize: "0.8rem", color: "var(--ink-muted)" }}>
                    {isLimit ? "Avoid today" : "No goal set"}
                  </span>
                )}
              </div>

              <button
                onClick={() => set(cat.id, goal + 1)}
                style={{
                  width: 38, height: 38, borderRadius: "50%",
                  border: "1.5px solid var(--border)", background: "#fff",
                  fontSize: "1.2rem", cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center", color: "var(--ink)",
                }}>+</button>
            </div>

            <div style={{ marginTop: "0.6rem", fontSize: "0.8rem", color: "var(--ink-muted)", textAlign: "center" }}>
              {label}: <strong style={{ color: "var(--ink)", fontFamily: "Fredoka, sans-serif", fontSize: "1rem" }}>{goal}</strong> {isLimit ? "servings/day max" : "servings/day minimum"}
            </div>
            {isLimit && (
              <div style={{ marginTop: "0.25rem", fontSize: "0.76rem", color: "var(--lime)", textAlign: "center", fontWeight: 700 }}>
                Less is better. Zero counts as good work.
              </div>
            )}

            {/* Available items for this category */}
            <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid var(--cream-dark)" }}>
              <div style={{ fontSize: "0.7rem", color: "var(--ink-muted)", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600 }}>Tracked items</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                {cat.items.map(item => (
                  <span key={item.key} style={{
                    padding: "0.2rem 0.5rem", borderRadius: "20px",
                    border: "1.5px solid var(--border)",
                    fontSize: "0.8rem", background: "var(--cream)",
                    color: "var(--ink-muted)",
                  }}>{item.emoji} {item.label}</span>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      <div className="settings-action-row">
        <button
          onClick={() => onChange({ ...DEFAULT_GOALS })}
          style={{
            width: "100%", padding: "0.75rem",
            border: "1.5px solid var(--border)", borderRadius: "12px",
            background: "#fff", color: "var(--ink-muted)",
            fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.875rem",
            cursor: "pointer",
          }}>Reset to defaults</button>
      </div>

      <div className="settings-action-row">
        <a
          href="/spending-tracker/api/auth/sign-out"
          style={{
            display: "block",
            width: "100%",
            padding: "0.75rem",
            border: "1.5px solid var(--border)",
            borderRadius: "12px",
            background: "#fff",
            color: "var(--cherry)",
            fontFamily: "Plus Jakarta Sans, sans-serif",
            fontSize: "0.875rem",
            cursor: "pointer",
            textAlign: "center",
            textDecoration: "none",
            marginTop: "0.75rem",
          }}
        >Log out</a>
      </div>

    </div>
  );
}
