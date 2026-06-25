"use client";

import { useEffect, useRef, useState } from "react";

export type LifestyleTab = "daily" | "monthly" | "settings";

const LOGO_SRC = "https://www.selinnaowen.com/wp-content/uploads/2026/06/tools-logo-1.png";

type MenuItem = {
  label: string;
  icon: string;
  tab: LifestyleTab;
};

const APP_MENU: MenuItem[] = [
  { label: "Daily", icon: "📅", tab: "daily" },
  { label: "Monthly", icon: "📆", tab: "monthly" },
  { label: "Settings", icon: "⚙", tab: "settings" },
];

export default function LuruShellHeader({
  activeTab,
  onSelectTab,
}: {
  activeTab: LifestyleTab;
  onSelectTab: (tab: LifestyleTab) => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  const selectTab = (tab: LifestyleTab) => {
    onSelectTab(tab);
    setOpen(false);
  };

  return (
    <header className="luru-shell-header">
      <div className="luru-shell-header-inner">
        <a className="luru-shell-brand" href="/lifestyle-tracker" aria-label="Lifestyle Tracker home">
          <img className="luru-shell-logo" src={LOGO_SRC} alt="lürú tools" />
          <span className="luru-shell-app-name">
            Lifestyle <em>Tracker</em>
          </span>
        </a>

        <div className="luru-shell-menu" ref={menuRef}>
          <button
            className="luru-shell-menu-button"
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
            className={`luru-shell-menu-panel${open ? " is-open" : ""}`}
            aria-label="Tool navigation"
          >
            <div className="luru-shell-menu-label">This app</div>
            {APP_MENU.map((item) => (
              <button
                key={item.tab}
                className={`luru-shell-menu-item${activeTab === item.tab ? " is-active" : ""}`}
                type="button"
                onClick={() => selectTab(item.tab)}
              >
                <span className="luru-shell-menu-icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            ))}

            <hr className="luru-shell-menu-divider" />
            <div className="luru-shell-menu-label">Other tools</div>
            <a className="luru-shell-menu-item" href="https://tool.selinnaowen.com/split-bill" onClick={() => setOpen(false)}>
              <span className="luru-shell-menu-icon" aria-hidden="true">🧾</span>
              <span>Shared Ledger</span>
            </a>
            <a className="luru-shell-menu-item" href="https://tool.selinnaowen.com/spending-tracker" onClick={() => setOpen(false)}>
              <span className="luru-shell-menu-icon" aria-hidden="true">💰</span>
              <span>Spending Tracker</span>
            </a>
            <a className="luru-shell-menu-item" href="https://tool.selinnaowen.com/" onClick={() => setOpen(false)}>
              <span className="luru-shell-menu-icon" aria-hidden="true">🏠</span>
              <span>All Tools</span>
            </a>

            <hr className="luru-shell-menu-divider" />
            <a className="luru-shell-menu-item luru-shell-menu-logout" href="/spending-tracker/api/auth/sign-out">
              <span className="luru-shell-menu-icon" aria-hidden="true">↩</span>
              <span>Log out</span>
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
