"use client";

import { useEffect, useState, type ReactNode } from "react";
import DailyView from "@/components/DailyView";
import LuruFooter from "@/components/LuruFooter";
import LuruShellHeader, { type LifestyleTab } from "@/components/LuruShellHeader";
import MonthlyView from "@/components/MonthlyView";
import SettingsView from "@/components/SettingsView";
import { DEFAULT_GOALS, type Category } from "@/lib/items";

const GOALS_KEY = "luru-lifestyle-goals";

function loadGoals(): Record<Category, number> {
  if (typeof window === "undefined") return { ...DEFAULT_GOALS };
  try {
    const savedGoals = localStorage.getItem(GOALS_KEY);
    return savedGoals ? { ...DEFAULT_GOALS, ...JSON.parse(savedGoals) } : { ...DEFAULT_GOALS };
  } catch {
    return { ...DEFAULT_GOALS };
  }
}

export default function Home() {
  const [tab, setTab] = useState<LifestyleTab>("daily");
  const [goals, setGoals] = useState<Record<Category, number>>({ ...DEFAULT_GOALS });
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<unknown>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.resolve().then(() => {
      if (!cancelled) setGoals(loadGoals());
    });

    fetch("/lifestyle-tracker/api/whoami", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then(async (data) => {
        if (cancelled) return;
        setUser(data?.user || null);
        if (data?.user) {
          const goalsRes = await fetch("/lifestyle-tracker/api/goals", { cache: "no-store" });
          if (goalsRes.ok) {
            const savedGoals = await goalsRes.json();
            if (savedGoals && !cancelled) setGoals({ ...DEFAULT_GOALS, ...savedGoals });
          }
        }
      })
      .finally(() => {
        if (!cancelled) setAuthLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const saveGoals = (nextGoals: Record<Category, number>) => {
    setGoals(nextGoals);
    localStorage.setItem(GOALS_KEY, JSON.stringify(nextGoals));
    fetch("/lifestyle-tracker/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextGoals),
    }).catch(() => {});
  };

  const shell = (children: ReactNode) => (
    <div className="app-container">
      <LuruShellHeader activeTab={tab} onSelectTab={setTab} />
      {children}
      <LuruFooter />
    </div>
  );

  if (authLoading) {
    return shell(
      <main className="app-main app-main-narrow">
        <div className="card">
          <p className="muted-copy">Checking login...</p>
        </div>
      </main>,
    );
  }

  if (!user) {
    return shell(
      <main className="app-main app-main-narrow">
        <div className="card">
          <div className="card-title">LINE login required</div>
          <p className="muted-copy">Log in once with LINE to use Lifestyle Tracker across lürúee tools.</p>
          <a className="login-button" href="/spending-tracker/login?next=/lifestyle-tracker">
            Log in with LINE
          </a>
        </div>
      </main>,
    );
  }

  return shell(
    <>
      <nav className="tab-bar" aria-label="Lifestyle Tracker views">
        <button className={`tab-btn ${tab === "daily" ? "active" : ""}`} type="button" onClick={() => setTab("daily")}>
          Daily
        </button>
        <button className={`tab-btn ${tab === "monthly" ? "active" : ""}`} type="button" onClick={() => setTab("monthly")}>
          Monthly
        </button>
        <button className={`tab-btn ${tab === "settings" ? "active" : ""}`} type="button" onClick={() => setTab("settings")}>
          Settings
        </button>
      </nav>

      <main className="app-main">
        {tab === "daily" && <DailyView goals={goals} />}
        {tab === "monthly" && <MonthlyView goals={goals} />}
        {tab === "settings" && <SettingsView goals={goals} onChange={saveGoals} />}
      </main>
    </>,
  );
}
