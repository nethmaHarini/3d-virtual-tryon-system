import { useEffect, useState } from "react";

const THEME_STORAGE_KEY = "app-theme";
const THEME_CHANGE_EVENT = "app-theme-change";

function canUseWindow() {
  return typeof window !== "undefined";
}

export function getSystemTheme() {
  if (!canUseWindow()) {
    return "dark";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function getStoredThemeMode() {
  if (!canUseWindow()) {
    return "dark";
  }

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

  if (savedTheme === "light" || savedTheme === "dark" || savedTheme === "system") {
    return savedTheme;
  }

  return "system";
}

export function getResolvedTheme(themeMode = getStoredThemeMode()) {
  return themeMode === "system" ? getSystemTheme() : themeMode;
}

export function applyTheme(themeMode = getStoredThemeMode()) {
  if (!canUseWindow()) {
    return "dark";
  }

  window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);

  const resolvedTheme = getResolvedTheme(themeMode);
  const root = window.document.documentElement;

  const tokens =
    resolvedTheme === "dark"
      ? {
          "--bg": "#090D16",
          "--sidebar": "#0D1220",
          "--surface": "#111827",
          "--surface-raised": "#161E2E",
          "--border": "#263044",
          "--text-primary": "#F8FAFC",
          "--text-secondary": "#A7B0C0",
          "--text-muted": "#727C8E",
          "--primary": "#7C3AED",
          "--primary-hover": "#8B5CF6",
          "--primary-soft": "rgba(124, 58, 237, 0.14)",
          "--success": "#22C55E",
          "--warning": "#F59E0B",
          "--danger": "#EF4444",
          "--info": "#38BDF8",
        }
      : {
          "--bg": "#F5F7FB",
          "--sidebar": "#FFFFFF",
          "--surface": "#F9FAFC",
          "--surface-raised": "#FFFFFF",
          "--border": "#E2E8F0",
          "--text-primary": "#0F172A",
          "--text-secondary": "#475569",
          "--text-muted": "#64748B",
          "--primary": "#7C3AED",
          "--primary-hover": "#8B5CF6",
          "--primary-soft": "rgba(124, 58, 237, 0.10)",
          "--success": "#22C55E",
          "--warning": "#F59E0B",
          "--danger": "#EF4444",
          "--info": "#38BDF8",
        };

  Object.entries(tokens).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  root.setAttribute("data-theme", resolvedTheme);
  root.style.colorScheme = resolvedTheme;

  window.dispatchEvent(
    new CustomEvent(THEME_CHANGE_EVENT, {
      detail: {
        themeMode,
        resolvedTheme,
      },
    })
  );

  return resolvedTheme;
}

export function initializeTheme() {
  return applyTheme(getStoredThemeMode());
}

export function subscribeToThemeChanges(handler) {
  if (!canUseWindow()) {
    return () => {};
  }

  const handleThemeChange = (event) => {
    handler(event.detail?.themeMode || getStoredThemeMode(), event.detail?.resolvedTheme || getResolvedTheme());
  };

  const handleStorageChange = (event) => {
    if (event.key === THEME_STORAGE_KEY) {
      handler(getStoredThemeMode(), getResolvedTheme());
    }
  };

  window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);
  window.addEventListener("storage", handleStorageChange);

  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
    window.removeEventListener("storage", handleStorageChange);
  };
}

export function useAppTheme() {
  const [themeState, setThemeState] = useState(() => ({
    themeMode: getStoredThemeMode(),
    resolvedTheme: getResolvedTheme(),
  }));

  useEffect(() => {
    return subscribeToThemeChanges((themeMode, resolvedTheme) => {
      setThemeState({ themeMode, resolvedTheme });
    });
  }, []);

  const setThemeMode = (nextThemeMode) => {
    applyTheme(nextThemeMode);
  };

  return {
    themeMode: themeState.themeMode,
    resolvedTheme: themeState.resolvedTheme,
    isDark: themeState.resolvedTheme === "dark",
    setThemeMode,
  };
}
