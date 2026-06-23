"use client";

import { useState, useEffect } from "react";
import DailyView from "@/components/DailyView";
import MonthlyView from "@/components/MonthlyView";
import SettingsView from "@/components/SettingsView";
import { DEFAULT_GOALS, type Category } from "@/lib/items";

const GOALS_KEY = "luru-lifestyle-goals";

function loadGoals(): Record<Category, number> {
  if (typeof window === "undefined") return { ...DEFAULT_GOALS };
  try {
    const s = localStorage.getItem(GOALS_KEY);
    return s ? { ...DEFAULT_GOALS, ...JSON.parse(s) } : { ...DEFAULT_GOALS };
  } catch {
    return { ...DEFAULT_GOALS };
  }
}

type Tab = "daily" | "monthly" | "settings";

function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="app-header">
      <a className="app-logo" href="/lifestyle-tracker">
        <img src="/lifestyle-tracker/tools-logo.png" alt="lürú tools" />
        <span className="title-main">Lifestyle</span>
        <span className="title-accent">Tracker</span>
      </a>
      <div className="header-menu-wrap">
        <button className="hamburger-btn" onClick={() => setOpen(!open)} aria-label="Open menu">☰</button>
        {open && <div className="header-menu"><a href="/spending-tracker/dashboard">Spending Tracker</a><a href="/split-bill/my-groups">Shared Ledger</a><hr /><a href="/spending-tracker/api/auth/sign-out">Log Out</a></div>}
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-divider" />
      <p>A tool to track your lifestyle.</p>
      <p>© <a href="https://tool.selinnaowen.com/">lürú tools</a></p>
    </footer>
  );
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("daily");
  const [goals, setGoals] = useState<Record<Category, number>>({ ...DEFAULT_GOALS });
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setGoals(loadGoals());

    fetch("/lifestyle-tracker/api/whoami", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then(async (data) => {
        setUser(data?.user || null);
        if (data?.user) {
          const goalsRes = await fetch("/lifestyle-tracker/api/goals", { cache: "no-store" });
          if (goalsRes.ok) {
            const savedGoals = await goalsRes.json();
            if (savedGoals) setGoals({ ...DEFAULT_GOALS, ...savedGoals });
          }
        }
      })
      .finally(() => setAuthLoading(false));
  }, []);

  const saveGoals = (g: Record<Category, number>) => {
    setGoals(g);
    localStorage.setItem(GOALS_KEY, JSON.stringify(g));
    fetch("/lifestyle-tracker/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(g),
    }).catch(() => {});
  };

  if (authLoading) {
    return (
      <div className="app-container">
        <Header />
        <div className="card">
          <p>Checking login…</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app-container">
        <Header />
        <div className="card">
          <div className="card-title">LINE login required</div>
          <p style={{ color: "var(--ink-muted)", marginBottom: "1rem" }}>
            Log in once with LINE to use Lifestyle Tracker across lürú tools.
          </p>
          <a className="save-btn" href="/spending-tracker/login?next=/lifestyle-tracker" style={{ display: "block", textAlign: "center", textDecoration: "none" }}>
            Log in with LINE
          </a>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="app-container">
      <Header />

      <nav className="tab-bar">
        <button className={`tab-btn ${tab === "daily" ? "active" : ""}`} onClick={() => setTab("daily")}>Daily</button>
        <button className={`tab-btn ${tab === "monthly" ? "active" : ""}`} onClick={() => setTab("monthly")}>Monthly</button>
        <button className={`tab-btn ${tab === "settings" ? "active" : ""}`} onClick={() => setTab("settings")}>Settings</button>
      </nav>

      {tab === "daily" && <DailyView goals={goals} />}
      {tab === "monthly" && <MonthlyView goals={goals} />}
      {tab === "settings" && <SettingsView goals={goals} onChange={saveGoals} />}

      <Footer />
    </div>
  );
}
