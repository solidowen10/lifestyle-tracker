"use client";

import { useState, useEffect, useRef, type CSSProperties } from "react";
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

const LOGO_SRC = "https://www.selinnaowen.com/wp-content/uploads/2026/06/tools-logo-1.png";
const LIFESTYLE_ACCENT = "#6B8F71";

const LURU_SHELL_STYLES = `
.luru-header {
  --shell-accent: #6B8F71;
  position: sticky;
  top: 0;
  z-index: 1000;
  min-height: 74px;
  padding: 0 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid rgba(25, 29, 33, 0.1);
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(14px);
}

.luru-brand {
  min-width: 0;
  display: inline-flex;
  align-items: center;
  gap: 18px;
  color: #191D21;
  text-decoration: none;
}

.luru-brand-logo {
  width: 28px;
  height: 28px;
  flex: 0 0 auto;
  object-fit: contain;
}

.luru-app-name {
  min-width: 0;
  overflow: hidden;
  color: #171B20;
  font-family: "Fraunces", Georgia, serif;
  font-size: clamp(28px, 3.1vw, 40px);
  font-weight: 650;
  line-height: 1;
  letter-spacing: 0;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.luru-app-name em {
  color: var(--shell-accent);
  font-style: italic;
}

.luru-menu {
  position: relative;
  flex: 0 0 auto;
}

.luru-menu-button {
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(25, 29, 33, 0.12);
  border-radius: 8px;
  background: #FFFFFF;
  color: #30373D;
  cursor: pointer;
  font-size: 22px;
  line-height: 1;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.luru-menu-button:hover,
.luru-menu-button[aria-expanded="true"] {
  border-color: color-mix(in srgb, var(--shell-accent) 40%, transparent);
  background: color-mix(in srgb, var(--shell-accent) 9%, #FFFFFF);
  color: var(--shell-accent);
}

.luru-menu-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: min(260px, calc(100vw - 24px));
  padding: 8px;
  display: none;
  border: 1px solid rgba(25, 29, 33, 0.1);
  border-radius: 8px;
  background: #FFFFFF;
  box-shadow: 0 18px 42px rgba(21, 26, 31, 0.14);
}

.luru-menu-dropdown.is-open {
  display: block;
}

.luru-menu-label {
  padding: 8px 10px 5px;
  color: #8B949E;
  font-family: "Plus Jakarta Sans", sans-serif;
  font-size: 10px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 0;
  text-transform: uppercase;
}

.luru-menu-item {
  width: 100%;
  min-height: 40px;
  padding: 9px 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #273039;
  cursor: pointer;
  font-family: "Plus Jakarta Sans", sans-serif;
  font-size: 14px;
  font-weight: 650;
  line-height: 1.2;
  text-align: left;
  text-decoration: none;
  transition: background 0.12s ease, color 0.12s ease;
}

.luru-menu-item:hover {
  background: color-mix(in srgb, var(--shell-accent) 9%, #FFFFFF);
  color: #15191D;
}

.luru-menu-icon {
  width: 24px;
  flex: 0 0 24px;
  text-align: center;
  color: var(--shell-accent);
  font-size: 16px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0;
}

.luru-menu-divider {
  height: 1px;
  margin: 8px 4px;
  border: 0;
  background: rgba(25, 29, 33, 0.1);
}

.luru-menu-logout {
  color: #737B83;
}

.luru-menu-logout:hover {
  background: #FFF4F4;
  color: #C0392B;
}

.luru-footer {
  margin-top: 64px;
  padding: 28px 20px 32px;
  border-top: 1px solid rgba(25, 29, 33, 0.1);
  text-align: center;
}

.luru-footer-tagline {
  margin: 0 0 8px;
  color: #8B949E;
  font-family: "Plus Jakarta Sans", sans-serif;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.45;
  letter-spacing: 0;
}

.luru-footer-link {
  color: var(--shell-accent);
  font-family: "Fredoka", sans-serif;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: 0;
  text-decoration: none;
}

.luru-footer-link:hover {
  text-decoration: underline;
}

@media (max-width: 520px) {
  .luru-header {
    padding: 0 14px;
    min-height: 62px;
  }

  .luru-brand {
    gap: 10px;
  }

  .luru-app-name {
    max-width: 58vw;
    font-size: 24px;
  }
}
`;

function Header({ onSelectTab }: { onSelectTab: (tab: Tab) => void }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const shellStyle = { "--shell-accent": LIFESTYLE_ACCENT } as CSSProperties;

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const selectTab = (tab: Tab) => {
    onSelectTab(tab);
    setOpen(false);
  };

  return (
    <>
      <style>{LURU_SHELL_STYLES}</style>
      <header className="luru-header" style={shellStyle}>
        <a className="luru-brand" href="/lifestyle-tracker" aria-label="Lifestyle Tracker home">
          <img className="luru-brand-logo" src={LOGO_SRC} alt="lürú tools" />
          <span className="luru-app-name">
            Lifestyle <em>Tracker</em>
          </span>
        </a>

        <div className="luru-menu" ref={menuRef}>
          <button
            className="luru-menu-button"
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={open}
            aria-controls="luru-lifestyle-menu"
            onClick={() => setOpen((value) => !value)}
          >
            ☰
          </button>

          <nav
            id="luru-lifestyle-menu"
            className={`luru-menu-dropdown${open ? " is-open" : ""}`}
            aria-label="Tool navigation"
          >
            <div className="luru-menu-label">This app</div>
            <button className="luru-menu-item" type="button" onClick={() => selectTab("daily")}>
              <span className="luru-menu-icon" aria-hidden="true">📅</span>
              <span>Daily</span>
            </button>
            <button className="luru-menu-item" type="button" onClick={() => selectTab("monthly")}>
              <span className="luru-menu-icon" aria-hidden="true">📆</span>
              <span>Monthly</span>
            </button>
            <button className="luru-menu-item" type="button" onClick={() => selectTab("settings")}>
              <span className="luru-menu-icon" aria-hidden="true">⚙</span>
              <span>Settings</span>
            </button>

            <hr className="luru-menu-divider" />
            <div className="luru-menu-label">Other tools</div>
            <a className="luru-menu-item" href="https://tool.selinnaowen.com/split-bill" onClick={() => setOpen(false)}>
              <span className="luru-menu-icon" aria-hidden="true">🧾</span>
              <span>Shared Ledger</span>
            </a>
            <a className="luru-menu-item" href="https://tool.selinnaowen.com/spending-tracker" onClick={() => setOpen(false)}>
              <span className="luru-menu-icon" aria-hidden="true">💰</span>
              <span>Spending Tracker</span>
            </a>
            <a className="luru-menu-item" href="https://tool.selinnaowen.com/" onClick={() => setOpen(false)}>
              <span className="luru-menu-icon" aria-hidden="true">🏠</span>
              <span>All Tools</span>
            </a>

            <hr className="luru-menu-divider" />
            <a className="luru-menu-item luru-menu-logout" href="/auth/logout?next=/lifestyle-tracker">
              <span className="luru-menu-icon" aria-hidden="true">↩</span>
              <span>Log out</span>
            </a>
          </nav>
        </div>
      </header>
    </>
  );
}

function Footer() {
  return (
    <footer className="luru-footer" style={{ "--shell-accent": LIFESTYLE_ACCENT } as CSSProperties}>
      <p className="luru-footer-tagline">Small tools, built and self-hosted by Owen.</p>
      <a className="luru-footer-link" href="https://tool.selinnaowen.com/">
        lürú tools
      </a>
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
        <Header onSelectTab={setTab} />
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
        <Header onSelectTab={setTab} />
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
      <Header onSelectTab={setTab} />

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
