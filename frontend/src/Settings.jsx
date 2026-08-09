import React, { useState } from "react";
import DashboardSidebar from "./components/DashboardSidebar";
import "./Settings.css";

function Settings() {
  const [activeSection, setActiveSection] = useState("general");
  const [productUpdates, setProductUpdates] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  return (
    <div className="settings-page">
      <DashboardSidebar />

      <main className="settings-content">
        <header className="settings-page-header">
          <h2>Settings</h2>
          <p>Manage your preferences</p>
        </header>

        <nav className="settings-top-nav" aria-label="Settings sections">
          <button
            className={`settings-top-nav-item ${activeSection === "general" ? "active" : ""}`}
            onClick={() => setActiveSection("general")}
          >
            <span className="settings-nav-icon">⚙</span>
            <span>General</span>
          </button>

          <button
            className={`settings-top-nav-item ${activeSection === "appearance" ? "active" : ""}`}
            onClick={() => setActiveSection("appearance")}
          >
            <span className="settings-nav-icon">◉</span>
            <span>Appearance</span>
          </button>

          <button
            className={`settings-top-nav-item ${activeSection === "privacy" ? "active" : ""}`}
            onClick={() => setActiveSection("privacy")}
          >
            <span className="settings-nav-icon">▢</span>
            <span>Privacy</span>
          </button>

          <button
            className={`settings-top-nav-item ${activeSection === "support" ? "active" : ""}`}
            onClick={() => setActiveSection("support")}
          >
            <span className="settings-nav-icon">?</span>
            <span>Help & Support</span>
          </button>
        </nav>

        {/* ================= GENERAL ================= */}
        {activeSection === "general" && (
          <div className="settings-section">
            <div className="section-header">
              <h1>General</h1>
              <p>
                Manage your general application preferences.
              </p>
            </div>

            {/* GENERAL SETTINGS CARD */}
            <div className="settings-card">
              <div className="settings-card-title">
                <span>⚙</span>
                <h3>General Settings</h3>
              </div>

              <div className="setting-row">
                <div>
                  <h4>Language</h4>
                  <p>Select your preferred language.</p>
                </div>

                <select>
                  <option>English</option>
                </select>
              </div>

              <div className="setting-divider"></div>

              <div className="setting-row">
                <div>
                  <h4>Time Zone</h4>
                  <p>Select your current time zone.</p>
                </div>

                <select>
                  <option>(GMT+05:30) Colombo</option>
                </select>
              </div>
            </div>

            {/* PREFERENCES CARD */}
            <div className="settings-card">
              <div className="settings-card-title">
                <span>✉</span>
                <h3>Preferences</h3>
              </div>

              <div className="setting-row">
                <div>
                  <h4>Product Updates</h4>
                  <p>
                    Receive important updates about the system.
                  </p>
                </div>

                <button
                  className={`toggle ${
                    productUpdates ? "on" : ""
                  }`}
                  onClick={() =>
                    setProductUpdates(!productUpdates)
                  }
                >
                  <span></span>
                </button>
              </div>

              <div className="setting-divider"></div>

              <div className="setting-row">
                <div>
                  <h4>Auto Save Try-On Results</h4>
                  <p>
                    Automatically save your virtual try-on results.
                  </p>
                </div>

                <button
                  className={`toggle ${
                    autoSave ? "on" : ""
                  }`}
                  onClick={() => setAutoSave(!autoSave)}
                >
                  <span></span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= APPEARANCE ================= */}
        {activeSection === "appearance" && (
          <div className="settings-section">
            <div className="section-header">
              <h1>Appearance</h1>
              <p>
                Customize how the application looks.
              </p>
            </div>

            <div className="settings-card">
              <div className="settings-card-title">
                <span>◉</span>
                <h3>Appearance Settings</h3>
              </div>

              <p>
                Appearance settings will be added here.
              </p>
            </div>
          </div>
        )}

        {/* ================= PRIVACY ================= */}
        {activeSection === "privacy" && (
          <div className="settings-section">
            <div className="section-header">
              <h1>Privacy</h1>
              <p>
                Manage your personal data and privacy settings.
              </p>
            </div>

            <div className="settings-card">
              <div className="settings-card-title">
                <span>▢</span>
                <h3>Privacy Settings</h3>
              </div>

              <p>
                Privacy settings will be added here.
              </p>
            </div>
          </div>
        )}

        {/* ================= HELP ================= */}
        {activeSection === "support" && (
          <div className="settings-section">
            <div className="section-header">
              <h1>Help & Support</h1>
              <p>
                Get help using the virtual try-on system.
              </p>
            </div>

            <div className="settings-card">
              <div className="settings-card-title">
                <span>?</span>
                <h3>Help & Support</h3>
              </div>

              <p>
                Help and support options will be added here.
              </p>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default Settings;