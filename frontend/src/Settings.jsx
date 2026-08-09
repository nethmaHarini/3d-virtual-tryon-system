import React, { useEffect, useState } from "react";
import DashboardSidebar from "./components/DashboardSidebar";
import "./Settings.css";
import { applyTheme, getResolvedTheme, getStoredThemeMode } from "./theme";

function Settings() {
  const [activeSection, setActiveSection] = useState("general");

  // =========================
  // GENERAL SETTINGS
  // =========================

  const [productUpdates, setProductUpdates] = useState(
    localStorage.getItem("product-updates") !== "false"
  );

  const [autoSave, setAutoSave] = useState(
    localStorage.getItem("auto-save-tryon") !== "false"
  );

  // =========================
  // APPEARANCE SETTINGS
  // =========================

  const [themeMode, setThemeMode] = useState(
    getStoredThemeMode()
  );

  const [interfaceDensity, setInterfaceDensity] = useState(
    localStorage.getItem("interface-density") || "comfortable"
  );

  const [viewerBackground, setViewerBackground] = useState(
    localStorage.getItem("viewer-background") || "dark"
  );

  const [motionEffects, setMotionEffects] = useState(
    localStorage.getItem("motion-effects") !== "false"
  );

  // =========================
  // APPLY THEME
  // =========================

  useEffect(() => {
    applyTheme(themeMode);
  }, [themeMode]);

  // Listen for Windows / OS theme change
  useEffect(() => {
    if (themeMode !== "system") {
      return;
    }

    const mediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

    const handleSystemThemeChange = () => {
      if (getStoredThemeMode() === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener(
      "change",
      handleSystemThemeChange
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        handleSystemThemeChange
      );
    };
  }, [themeMode]);

  // =========================
  // APPLY DENSITY
  // =========================

  useEffect(() => {
    localStorage.setItem("interface-density", interfaceDensity);

    document.documentElement.setAttribute("data-density", interfaceDensity);
  }, [interfaceDensity]);

  // =========================
  // SAVE VIEWER BACKGROUND
  // =========================

  useEffect(() => {
    localStorage.setItem(
      "viewer-background",
      viewerBackground
    );
  }, [viewerBackground]);

  // =========================
  // APPLY MOTION SETTING
  // =========================

  useEffect(() => {
    localStorage.setItem(
      "motion-effects",
      motionEffects
    );

    document.documentElement.setAttribute(
      "data-motion",
      motionEffects ? "on" : "off"
    );
  }, [motionEffects]);

  // =========================
  // SAVE GENERAL SETTINGS
  // =========================

  useEffect(() => {
    localStorage.setItem(
      "product-updates",
      productUpdates
    );
  }, [productUpdates]);

  useEffect(() => {
    localStorage.setItem(
      "auto-save-tryon",
      autoSave
    );
  }, [autoSave]);

  return (
    <div className="settings-page">
      <DashboardSidebar />

      <main className="settings-content">

        {/* PAGE HEADER */}

        <header className="settings-page-header">
          <h2>Settings</h2>
          <p>Manage your preferences</p>
        </header>

        {/* TOP NAVIGATION */}

        <nav
          className="settings-top-nav"
          aria-label="Settings sections"
        >
          <button
            className={`settings-top-nav-item ${
              activeSection === "general"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveSection("general")
            }
          >
            <span className="settings-nav-icon">
              ⚙
            </span>

            <span>General</span>
          </button>

          <button
            className={`settings-top-nav-item ${
              activeSection === "appearance"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveSection("appearance")
            }
          >
            <span className="settings-nav-icon">
              ◉
            </span>

            <span>Appearance</span>
          </button>

          <button
            className={`settings-top-nav-item ${
              activeSection === "privacy"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveSection("privacy")
            }
          >
            <span className="settings-nav-icon">
              ▢
            </span>

            <span>Privacy</span>
          </button>

          <button
            className={`settings-top-nav-item ${
              activeSection === "support"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveSection("support")
            }
          >
            <span className="settings-nav-icon">
              ?
            </span>

            <span>Help & Support</span>
          </button>
        </nav>

        {/* =====================================
            GENERAL
        ===================================== */}

        {activeSection === "general" && (
          <div className="settings-section">

            <div className="section-header">
              <h1>General</h1>

              <p>
                Manage your general application
                preferences.
              </p>
            </div>

            {/* GENERAL SETTINGS */}

            <div className="settings-card">

              <div className="settings-card-title">
                <span>⚙</span>

                <h3>General Settings</h3>
              </div>

              <div className="setting-row">

                <div>
                  <h4>Language</h4>

                  <p>
                    Select your preferred language.
                  </p>
                </div>

                <select defaultValue="English">
                  <option value="English">
                    English
                  </option>
                </select>

              </div>

              <div className="setting-divider" />

              <div className="setting-row">

                <div>
                  <h4>Time Zone</h4>

                  <p>
                    Select your current time zone.
                  </p>
                </div>

                <select defaultValue="Colombo">
                  <option value="Colombo">
                    (GMT+05:30) Colombo
                  </option>
                </select>

              </div>

            </div>

            {/* GENERAL PREFERENCES */}

            <div className="settings-card">

              <div className="settings-card-title">
                <span>✉</span>

                <h3>Preferences</h3>
              </div>

              <div className="setting-row">

                <div>
                  <h4>Product Updates</h4>

                  <p>
                    Receive important updates about
                    the system.
                  </p>
                </div>

                <button
                  type="button"
                  className={`toggle ${
                    productUpdates ? "on" : ""
                  }`}
                  onClick={() =>
                    setProductUpdates(
                      !productUpdates
                    )
                  }
                  aria-pressed={
                    productUpdates
                  }
                >
                  <span />
                </button>

              </div>

              <div className="setting-divider" />

              <div className="setting-row">

                <div>
                  <h4>
                    Auto Save Try-On Results
                  </h4>

                  <p>
                    Automatically save your virtual
                    try-on results.
                  </p>
                </div>

                <button
                  type="button"
                  className={`toggle ${
                    autoSave ? "on" : ""
                  }`}
                  onClick={() =>
                    setAutoSave(!autoSave)
                  }
                  aria-pressed={autoSave}
                >
                  <span />
                </button>

              </div>

            </div>

          </div>
        )}

        {/* =====================================
            APPEARANCE
        ===================================== */}

        {activeSection === "appearance" && (
          <div className="settings-section">

            <div className="section-header">
              <h1>Appearance</h1>

              <p>
                Personalize the visual experience
                of VirtuFit 3D.
              </p>
            </div>

            {/* APPLICATION THEME */}

            <div className="settings-card">

              <div className="settings-card-title settings-card-title-description">

                <span className="card-icon">
                  ◉
                </span>

                <div>
                  <h3>Application Theme</h3>

                  <p>
                    Choose how the application
                    interface should appear.
                  </p>
                </div>

              </div>

              <div className="appearance-option-grid">

                {/* DARK */}

                <button
                  type="button"
                  className={`appearance-option-card ${
                    themeMode === "dark"
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    setThemeMode("dark")
                  }
                >

                  <div className="theme-preview dark-preview">

                    <div className="preview-sidebar" />

                    <div className="preview-content">
                      <span />
                      <span />
                      <span />
                    </div>

                  </div>

                  <div className="appearance-option-info">

                    <div>
                      <strong>Dark</strong>

                      <p>
                        Use the dark VirtuFit
                        interface.
                      </p>
                    </div>

                    <span className="selection-circle">
                      {themeMode === "dark"
                        ? "✓"
                        : ""}
                    </span>

                  </div>

                </button>

                {/* LIGHT */}

                <button
                  type="button"
                  className={`appearance-option-card ${
                    themeMode === "light"
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    setThemeMode("light")
                  }
                >

                  <div className="theme-preview light-preview">

                    <div className="preview-sidebar" />

                    <div className="preview-content">
                      <span />
                      <span />
                      <span />
                    </div>

                  </div>

                  <div className="appearance-option-info">

                    <div>
                      <strong>Light</strong>

                      <p>
                        Use a bright and clean
                        interface.
                      </p>
                    </div>

                    <span className="selection-circle">
                      {themeMode === "light"
                        ? "✓"
                        : ""}
                    </span>

                  </div>

                </button>

                {/* SYSTEM */}

                <button
                  type="button"
                  className={`appearance-option-card ${
                    themeMode === "system"
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    setThemeMode("system")
                  }
                >

                  <div className="theme-preview system-preview">

                    <div className="system-dark-half">
                      <span />
                      <span />
                    </div>

                    <div className="system-light-half">
                      <span />
                      <span />
                    </div>

                  </div>

                  <div className="appearance-option-info">

                    <div>
                      <strong>System</strong>

                      <p>
                        Follow your device theme
                        automatically.
                      </p>
                    </div>

                    <span className="selection-circle">
                      {themeMode === "system"
                        ? "✓"
                        : ""}
                    </span>

                  </div>

                </button>

              </div>

            </div>

            {/* INTERFACE */}

            <div className="settings-card">

              <div className="settings-card-title settings-card-title-description">

                <span className="card-icon">
                  ▤
                </span>

                <div>
                  <h3>Interface</h3>

                  <p>
                    Adjust spacing and interface
                    density.
                  </p>
                </div>

              </div>

              <div className="setting-row">

                <div>
                  <h4>Interface Density</h4>

                  <p>
                    Choose how much spacing appears
                    between interface elements.
                  </p>
                </div>

                <div className="segmented-control">

                  <button
                    type="button"
                    className={
                      interfaceDensity ===
                      "comfortable"
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setInterfaceDensity(
                        "comfortable"
                      )
                    }
                  >
                    Comfortable
                  </button>

                  <button
                    type="button"
                    className={
                      interfaceDensity ===
                      "compact"
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setInterfaceDensity(
                        "compact"
                      )
                    }
                  >
                    Compact
                  </button>

                </div>

              </div>

            </div>

            {/* 3D VIEWER */}

            <div className="settings-card">

              <div className="settings-card-title settings-card-title-description">

                <span className="card-icon">
                  ◇
                </span>

                <div>
                  <h3>3D Viewer</h3>

                  <p>
                    Customize how your 3D avatar
                    viewer appears.
                  </p>
                </div>

              </div>

              <div className="setting-row">

                <div>
                  <h4>Viewer Background</h4>

                  <p>
                    Choose the background displayed
                    behind your 3D avatar.
                  </p>
                </div>

                <div className="viewer-background-options">

                  <button
                    type="button"
                    className={`viewer-bg-choice dark-choice ${
                      viewerBackground === "dark"
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      setViewerBackground("dark")
                    }
                    title="Dark"
                    aria-label="Dark viewer background"
                  />

                  <button
                    type="button"
                    className={`viewer-bg-choice neutral-choice ${
                      viewerBackground ===
                      "neutral"
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      setViewerBackground(
                        "neutral"
                      )
                    }
                    title="Neutral"
                    aria-label="Neutral viewer background"
                  />

                  <button
                    type="button"
                    className={`viewer-bg-choice light-choice ${
                      viewerBackground === "light"
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      setViewerBackground("light")
                    }
                    title="Light"
                    aria-label="Light viewer background"
                  />

                </div>

              </div>

              <div className="setting-divider" />

              <div className="setting-row">

                <div>
                  <h4>Motion Effects</h4>

                  <p>
                    Enable smooth transitions and
                    interface animations.
                  </p>
                </div>

                <button
                  type="button"
                  className={`toggle ${
                    motionEffects ? "on" : ""
                  }`}
                  onClick={() =>
                    setMotionEffects(
                      !motionEffects
                    )
                  }
                  aria-pressed={
                    motionEffects
                  }
                >
                  <span />
                </button>

              </div>

            </div>

          </div>
        )}

        {/* =====================================
            PRIVACY
        ===================================== */}

        {activeSection === "privacy" && (
          <div className="settings-section">

            <div className="section-header">

              <h1>Privacy</h1>

              <p>
                Manage your personal data and
                privacy settings.
              </p>

            </div>

            <div className="settings-card">

              <div className="settings-card-title">

                <span>▢</span>

                <h3>Privacy Settings</h3>

              </div>

              <p className="placeholder-text">
                Privacy settings will be added here.
              </p>

            </div>

          </div>
        )}

        {/* =====================================
            HELP
        ===================================== */}

        {activeSection === "support" && (
          <div className="settings-section">

            <div className="section-header">

              <h1>Help & Support</h1>

              <p>
                Get help using the virtual try-on
                system.
              </p>

            </div>

            <div className="settings-card">

              <div className="settings-card-title">

                <span>?</span>

                <h3>Help & Support</h3>

              </div>

              <p className="placeholder-text">
                Help and support options will be
                added here.
              </p>

            </div>

          </div>
        )}

      </main>
    </div>
  );
}

export default Settings;