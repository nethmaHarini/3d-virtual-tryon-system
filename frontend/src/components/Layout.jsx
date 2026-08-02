import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const THEME_STORAGE_KEY = "landing-theme";

function getInitialTheme() {
  if (typeof window === "undefined") {
    return "dark";
  }

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function Layout() {
  const [theme, setTheme] = useState(getInitialTheme);
  const isDark = theme === "dark";

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: isDark ? "#070d16" : "#f6f8ff",
        transition: "background-color 240ms ease",
      }}
    >
      <Navbar theme={theme} setTheme={setTheme} />
      {/* Padding top ensures the page content isn't hidden 
        behind the fixed navbar (72px height + spacing)
      */}
      <div style={{ paddingTop: "72px" }}>
        <Outlet context={{ theme, isDark }} />
      </div>
    </div>
  );
}

export default Layout;