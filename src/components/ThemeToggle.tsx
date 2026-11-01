"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const nextIsDark = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", nextIsDark);
    try {
      localStorage.setItem("ebd-theme", nextIsDark ? "dark" : "light");
    } catch {
      // Keep the current session toggle working when storage is unavailable.
    }
    setIsDark(nextIsDark);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Ativar modo ${isDark ? "claro" : "escuro"}`}
      aria-pressed={isDark}
      title={`Ativar modo ${isDark ? "claro" : "escuro"}`}
      className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-church-200 hover:bg-church-50 hover:text-church-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-700 ${
        compact ? "h-11 w-11" : "h-11 px-3 text-xs font-semibold"
      }`}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      {!compact && <span>{isDark ? "Modo claro" : "Modo escuro"}</span>}
    </button>
  );
}
