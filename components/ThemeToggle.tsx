import React from "react";
import { useTheme } from "../context/Theme";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 rounded-xl border border-ui/12 bg-surface/60 px-3 py-2 text-sm font-semibold text-text hover:bg-surface/80 transition"
      aria-label="Cambiar tema"
    >
      <span className="text-base">{theme === "dark" ? "🌙" : "☀️"}</span>
      <span>{theme === "dark" ? "Oscuro" : "Claro"}</span>
    </button>
  );
}
