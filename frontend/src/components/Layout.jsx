import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { applyTheme, getResolvedTheme, getStoredThemeMode, subscribeToThemeChanges } from "../theme";

function Layout() {
  const [themeState, setThemeState] = useState(() => ({
    themeMode: getStoredThemeMode(),
    resolvedTheme: getResolvedTheme(),
  }));

  const isDark = themeState.resolvedTheme === "dark";

  useEffect(() => {
    return subscribeToThemeChanges((themeMode, resolvedTheme) => {
      setThemeState({ themeMode, resolvedTheme });
    });
  }, []);

  useEffect(() => {
    applyTheme(themeState.themeMode);
  }, [themeState.themeMode]);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: isDark ? "#070d16" : "#f6f8ff",
        transition: "background-color 240ms ease",
      }}
    >
      <Navbar theme={themeState.resolvedTheme} setTheme={applyTheme} />
      {/* Padding top ensures the page content isn't hidden 
        behind the fixed navbar (72px height + spacing)
      */}
      <div style={{ paddingTop: "72px" }}>
        <Outlet context={{ theme: themeState.resolvedTheme, isDark }} />
      </div>
    </div>
  );
}

export default Layout;