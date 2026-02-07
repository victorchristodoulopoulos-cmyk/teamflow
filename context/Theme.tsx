import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type ThemeMode = "dark" | "light";

type ThemeCtx = {
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeCtx | null>(null);

const STORAGE_KEY = "teamflow_theme";

function applyThemeToDom(theme: ThemeMode) {
  const root = document.documentElement;

  // ✅ para tu CSS :root[data-theme="light"]
  root.dataset.theme = theme;

  // ✅ opcional: si usas Tailwind dark:
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("dark");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    const initial: ThemeMode = saved === "light" || saved === "dark" ? saved : "dark";
    setThemeState(initial);
    applyThemeToDom(initial);
  }, []);

  const setTheme = (t: ThemeMode) => {
    setThemeState(t);
    localStorage.setItem(STORAGE_KEY, t);
    applyThemeToDom(t);
  };

  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");

  const value = useMemo(() => ({ theme, setTheme, toggle }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
