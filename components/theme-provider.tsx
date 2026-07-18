"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type ThemeName =
  | "indigo"
  | "purple"
  | "emerald"
  | "ocean"
  | "rose"
  | "orange"
  | "midnight";

export type DarkMode = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: ThemeName;
  dark: boolean;
  setTheme: (t: ThemeName) => void;
  setDark: (d: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "indigo",
  dark: false,
  setTheme: () => {},
  setDark: () => {}
});

export function useTheme() {
  return useContext(ThemeContext);
}

export const themeLabels: Record<ThemeName, string> = {
  indigo:   "Indigo",
  purple:   "Purple",
  emerald:  "Emerald",
  ocean:    "Ocean Blue",
  rose:     "Rose",
  orange:   "Orange",
  midnight: "Midnight"
};

export const themeColors: Record<ThemeName, string> = {
  indigo:   "#6366F1",
  purple:   "#7C3AED",
  emerald:  "#059669",
  ocean:    "#2563EB",
  rose:     "#E11D48",
  orange:   "#EA580C",
  midnight: "#475569"
};

const THEME_KEY = "courseai-theme";
const DARK_KEY  = "courseai-dark";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>("indigo");
  const [dark, setDarkState]   = useState(false);

  // Read from localStorage on mount (client only)
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY) as ThemeName | null;
    const savedDark  = localStorage.getItem(DARK_KEY);
    if (savedTheme) setThemeState(savedTheme);
    if (savedDark !== null) setDarkState(savedDark === "true");
  }, []);

  // Apply to <html> whenever they change
  useEffect(() => {
    const html = document.documentElement;
    if (theme === "indigo") {
      html.removeAttribute("data-theme");
    } else {
      html.setAttribute("data-theme", theme);
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  function setTheme(t: ThemeName) {
    setThemeState(t);
    localStorage.setItem(THEME_KEY, t);
  }

  function setDark(d: boolean) {
    setDarkState(d);
    localStorage.setItem(DARK_KEY, String(d));
  }

  return (
    <ThemeContext.Provider value={{ theme, dark, setTheme, setDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

/** Small theme-switcher widget — drop anywhere */
export function ThemeSwitcher() {
  const { theme, dark, setTheme, setDark } = useTheme();

  return (
    <div className="flex flex-wrap items-center gap-2">
      {(Object.entries(themeColors) as [ThemeName, string][]).map(([name, color]) => (
        <button
          key={name}
          title={themeLabels[name]}
          aria-label={`Switch to ${themeLabels[name]} theme`}
          onClick={() => setTheme(name)}
          className={`h-5 w-5 rounded-full border-2 transition-all ${
            theme === name
              ? "border-slate-900 scale-110 dark:border-white"
              : "border-transparent hover:scale-105"
          }`}
          style={{ backgroundColor: color }}
        />
      ))}
      <button
        aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
        onClick={() => setDark(!dark)}
        className="ml-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
      >
        {dark ? "☀ Light" : "☾ Dark"}
      </button>
    </div>
  );
}
