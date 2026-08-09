import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import DashboardSidebar from "./components/DashboardSidebar";
import "./Settings.css";

import {
  applyTheme,
  getStoredThemeMode,
} from "./theme";

function Settings() {
  const [activeSection, setActiveSection] =
    useState("general");

  // =====================================================
  // GENERAL SETTINGS
  // =====================================================

  const [language, setLanguage] =
    useState(
      localStorage.getItem("app-language") ||
        "English"
    );

  const [timeZone, setTimeZone] =
    useState(
      localStorage.getItem("app-timezone") ||
        "Colombo"
    );

  const [productUpdates, setProductUpdates] =
    useState(
      localStorage.getItem(
        "product-updates"
      ) !== "false"
    );

  const [autoSave, setAutoSave] =
    useState(
      localStorage.getItem(
        "auto-save-tryon"
      ) !== "false"
    );

  const [generalMessage, setGeneralMessage] =
    useState("");

  // =====================================================
  // APPEARANCE SETTINGS
  // =====================================================

  const [themeMode, setThemeMode] =
    useState(getStoredThemeMode());

  const [
    interfaceDensity,
    setInterfaceDensity,
  ] = useState(
    localStorage.getItem(
      "interface-density"
    ) || "comfortable"
  );

  const [
    viewerBackground,
    setViewerBackground,
  ] = useState(
    localStorage.getItem(
      "viewer-background"
    ) || "dark"
  );

  const [
    motionEffects,
    setMotionEffects,
  ] = useState(
    localStorage.getItem(
      "motion-effects"
    ) !== "false"
  );

  // =====================================================
  // HELP & SUPPORT
  // =====================================================

  const [
    supportSearch,
    setSupportSearch,
  ] = useState("");

  const [openFaq, setOpenFaq] =
    useState(null);

  const [
    issueType,
    setIssueType,
  ] = useState("Technical Issue");

  const [
    issueDescription,
    setIssueDescription,
  ] = useState("");

  const [
    supportMessage,
    setSupportMessage,
  ] = useState("");

  // =====================================================
  // THEME
  // =====================================================

  useEffect(() => {
    applyTheme(themeMode);
  }, [themeMode]);

  useEffect(() => {
    if (themeMode !== "system") {
      return;
    }

    const mediaQuery =
      window.matchMedia(
        "(prefers-color-scheme: dark)"
      );

    const handleSystemThemeChange = () => {
      if (
        getStoredThemeMode() === "system"
      ) {
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

  // =====================================================
  // DENSITY
  // =====================================================

  useEffect(() => {
    localStorage.setItem(
      "interface-density",
      interfaceDensity
    );

    document.documentElement.setAttribute(
      "data-density",
      interfaceDensity
    );
  }, [interfaceDensity]);

  // =====================================================
  // 3D VIEWER BACKGROUND
  // =====================================================

  useEffect(() => {
    localStorage.setItem(
      "viewer-background",
      viewerBackground
    );
  }, [viewerBackground]);

  // =====================================================
  // MOTION EFFECTS
  // =====================================================

  useEffect(() => {
    localStorage.setItem(
      "motion-effects",
      motionEffects
    );

    document.documentElement.setAttribute(
      "data-motion",
      motionEffects
        ? "on"
        : "off"
    );
  }, [motionEffects]);

  // =====================================================
  // GENERAL SETTINGS STORAGE
  // =====================================================

  useEffect(() => {
    localStorage.setItem(
      "app-language",
      language
    );
  }, [language]);

  useEffect(() => {
    localStorage.setItem(
      "app-timezone",
      timeZone
    );
  }, [timeZone]);

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

  // =====================================================
  // GENERAL ACTIONS
  // =====================================================

  const showGeneralMessage = (
    message
  ) => {
    setGeneralMessage(message);

    window.setTimeout(() => {
      setGeneralMessage("");
    }, 2500);
  };

  const handleSaveGeneralSettings =
    () => {
      localStorage.setItem(
        "app-language",
        language
      );

      localStorage.setItem(
        "app-timezone",
        timeZone
      );

      localStorage.setItem(
        "product-updates",
        productUpdates
      );

      localStorage.setItem(
        "auto-save-tryon",
        autoSave
      );

      showGeneralMessage(
        "Settings saved successfully."
      );
    };

  const handleRestoreGeneralDefaults =
    () => {
      const confirmed =
        window.confirm(
          "Restore General settings to their default values?"
        );

      if (!confirmed) {
        return;
      }

      setLanguage("English");
      setTimeZone("Colombo");
      setProductUpdates(true);
      setAutoSave(true);

      localStorage.setItem(
        "app-language",
        "English"
      );

      localStorage.setItem(
        "app-timezone",
        "Colombo"
      );

      localStorage.setItem(
        "product-updates",
        "true"
      );

      localStorage.setItem(
        "auto-save-tryon",
        "true"
      );

      showGeneralMessage(
        "General settings restored to defaults."
      );
    };

  // =====================================================
  // SUPPORT DATA
  // =====================================================

  const supportTopics = useMemo(
    () => [
      {
        id: "avatar-create",
        title:
          "How do I create a 3D avatar?",
        category:
          "Avatar Generation",
        keywords:
          "avatar generation create height front side back photos",
        target:
          "avatar-help",
      },
      {
        id: "three-photos",
        title:
          "Why are three photos required?",
        category:
          "Avatar Generation",
        keywords:
          "three photos front side back avatar images",
        target:
          "avatar-help",
      },
      {
        id: "tryon-use",
        title:
          "How do I use virtual try-on?",
        category:
          "Virtual Try-On",
        keywords:
          "virtual try-on garment catalog clothes avatar",
        target:
          "tryon-help",
      },
      {
        id: "fit-feedback",
        title:
          "How does fit feedback work?",
        category:
          "Fit Feedback",
        keywords:
          "fit feedback tight loose garment size fitting",
        target:
          "tryon-help",
      },
      {
        id: "photos-privacy",
        title:
          "What happens to my uploaded photos?",
        category:
          "Privacy",
        keywords:
          "photos privacy uploaded images front side back delete",
        target:
          "privacy",
      },
      {
        id: "avatar-display",
        title:
          "Why is my avatar not displaying?",
        category:
          "Troubleshooting",
        keywords:
          "avatar viewer not displaying error problem",
        target:
          "troubleshooting",
      },
    ],
    []
  );

  const filteredSupportTopics =
    useMemo(() => {
      const query =
        supportSearch
          .trim()
          .toLowerCase();

      if (!query) {
        return [];
      }

      return supportTopics.filter(
        (topic) =>
          topic.title
            .toLowerCase()
            .includes(query) ||
          topic.category
            .toLowerCase()
            .includes(query) ||
          topic.keywords
            .toLowerCase()
            .includes(query)
      );
    }, [
      supportSearch,
      supportTopics,
    ]);

  // =====================================================
  // SUPPORT ACTIONS
  // =====================================================

  const scrollToSection = (id) => {
    if (id === "privacy") {
      setActiveSection("privacy");

      window.setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }, 50);

      return;
    }

    document
      .getElementById(id)
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  const toggleFaq = (index) => {
    setOpenFaq(
      openFaq === index
        ? null
        : index
    );
  };

  const handleReportProblem = () => {
    if (
      !issueDescription.trim()
    ) {
      setSupportMessage(
        "Please describe the problem before submitting."
      );

      return;
    }

    setSupportMessage(
      "Thank you. Your issue has been recorded."
    );

    setIssueDescription("");

    window.setTimeout(() => {
      setSupportMessage("");
    }, 3000);
  };

  return (
    <div className="settings-page">
      <DashboardSidebar />

      <main className="settings-content">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="settings-page-header">
          <h2>
            Settings
          </h2>

          <p>
            Manage your preferences and
            application settings.
          </p>
        </header>

        {/* =================================================
            NAVIGATION
        ================================================= */}

        <nav
          className="settings-top-nav"
          aria-label="Settings sections"
        >

          <button
            type="button"
            className={`settings-top-nav-item ${
              activeSection === "general"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveSection(
                "general"
              )
            }
          >
            <span className="settings-nav-icon">
              ⚙
            </span>

            <span>
              General
            </span>
          </button>

          <button
            type="button"
            className={`settings-top-nav-item ${
              activeSection ===
              "appearance"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveSection(
                "appearance"
              )
            }
          >
            <span className="settings-nav-icon">
              ◉
            </span>

            <span>
              Appearance
            </span>
          </button>

          <button
            type="button"
            className={`settings-top-nav-item ${
              activeSection ===
              "privacy"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveSection(
                "privacy"
              )
            }
          >
            <span className="settings-nav-icon">
              ▢
            </span>

            <span>
              Privacy Policy
            </span>
          </button>

          <button
            type="button"
            className={`settings-top-nav-item ${
              activeSection ===
              "support"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveSection(
                "support"
              )
            }
          >
            <span className="settings-nav-icon">
              ?
            </span>

            <span>
              Help & Support
            </span>
          </button>

        </nav>

        {/* =================================================
            GENERAL
        ================================================= */}

        {activeSection ===
          "general" && (
          <div className="settings-section">

            <div className="section-header">
              <h1>
                General
              </h1>

              <p>
                Manage your general application
                preferences.
              </p>
            </div>

            {/* GENERAL SETTINGS */}

            <div className="settings-card">

              <div className="settings-card-title">
                <span className="card-icon">
                  ⚙
                </span>

                <div>
                  <h3>
                    General Settings
                  </h3>

                  <p>
                    Configure basic application
                    preferences.
                  </p>
                </div>
              </div>

              {/* LANGUAGE */}

              <div className="setting-row">
                <div>
                  <h4>
                    Language
                  </h4>

                  <p>
                    Select your preferred
                    application language.
                  </p>
                </div>

                <select
                  value={language}
                  onChange={(event) =>
                    setLanguage(
                      event.target.value
                    )
                  }
                >
                  <option value="English">
                    English
                  </option>

                  <option value="Sinhala">
                    Sinhala
                  </option>

                  <option value="Tamil">
                    Tamil
                  </option>
                </select>
              </div>

              <div className="setting-divider" />

              {/* TIME ZONE */}

              <div className="setting-row">
                <div>
                  <h4>
                    Time Zone
                  </h4>

                  <p>
                    Select your current time
                    zone.
                  </p>
                </div>

                <select
                  value={timeZone}
                  onChange={(event) =>
                    setTimeZone(
                      event.target.value
                    )
                  }
                >
                  <option value="Colombo">
                    (GMT+05:30) Colombo
                  </option>

                  <option value="London">
                    (GMT+00:00) London
                  </option>

                  <option value="Dubai">
                    (GMT+04:00) Dubai
                  </option>

                  <option value="Singapore">
                    (GMT+08:00) Singapore
                  </option>
                </select>
              </div>

            </div>

            {/* PREFERENCES */}

            <div className="settings-card">

              <div className="settings-card-title">
                <span className="card-icon">
                  ✉
                </span>

                <div>
                  <h3>
                    Preferences
                  </h3>

                  <p>
                    Configure application
                    behaviour.
                  </p>
                </div>
              </div>

              {/* PRODUCT UPDATES */}

              <div className="setting-row">
                <div>
                  <h4>
                    Product Updates
                  </h4>

                  <p>
                    Receive important updates
                    about VirtuFit 3D.
                  </p>
                </div>

                <button
                  type="button"
                  className={`toggle ${
                    productUpdates
                      ? "on"
                      : ""
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

              {/* AUTO SAVE */}

              <div className="setting-row">
                <div>
                  <h4>
                    Auto Save Try-On Results
                  </h4>

                  <p>
                    Automatically save
                    supported virtual try-on
                    results.
                  </p>
                </div>

                <button
                  type="button"
                  className={`toggle ${
                    autoSave
                      ? "on"
                      : ""
                  }`}
                  onClick={() =>
                    setAutoSave(
                      !autoSave
                    )
                  }
                  aria-pressed={
                    autoSave
                  }
                >
                  <span />
                </button>
              </div>

            </div>

            {/* ACTIONS */}

            <div className="general-actions">

              <button
                type="button"
                className="restore-default-button"
                onClick={
                  handleRestoreGeneralDefaults
                }
              >
                ↻ Restore Defaults
              </button>

              <div className="general-action-right">

                {generalMessage && (
                  <span className="general-save-message">
                    {generalMessage}
                  </span>
                )}

                <button
                  type="button"
                  className="save-settings-button"
                  onClick={
                    handleSaveGeneralSettings
                  }
                >
                  ✓ Save Changes
                </button>

              </div>

            </div>

          </div>
        )}

        {/* =================================================
            APPEARANCE
        ================================================= */}

        {activeSection ===
          "appearance" && (
          <div className="settings-section">

            <div className="section-header">
              <h1>
                Appearance
              </h1>

              <p>
                Personalize the visual
                experience of VirtuFit 3D.
              </p>
            </div>

            {/* APPLICATION THEME */}

            <div className="settings-card">

              <div className="settings-card-title">
                <span className="card-icon">
                  ◉
                </span>

                <div>
                  <h3>
                    Application Theme
                  </h3>

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
                      <strong>
                        Dark
                      </strong>

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
                      <strong>
                        Light
                      </strong>

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
                    themeMode ===
                    "system"
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    setThemeMode(
                      "system"
                    )
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
                      <strong>
                        System
                      </strong>

                      <p>
                        Follow your device theme
                        automatically.
                      </p>
                    </div>

                    <span className="selection-circle">
                      {themeMode ===
                      "system"
                        ? "✓"
                        : ""}
                    </span>

                  </div>
                </button>

              </div>

            </div>

            {/* INTERFACE */}

            <div className="settings-card">

              <div className="settings-card-title">
                <span className="card-icon">
                  ▤
                </span>

                <div>
                  <h3>
                    Interface
                  </h3>

                  <p>
                    Adjust spacing and
                    interface density.
                  </p>
                </div>
              </div>

              <div className="setting-row">

                <div>
                  <h4>
                    Interface Density
                  </h4>

                  <p>
                    Choose how much spacing
                    appears between interface
                    elements.
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

              <div className="settings-card-title">
                <span className="card-icon">
                  ◇
                </span>

                <div>
                  <h3>
                    3D Viewer
                  </h3>

                  <p>
                    Customize how your 3D
                    avatar viewer appears.
                  </p>
                </div>
              </div>

              <div className="setting-row">

                <div>
                  <h4>
                    Viewer Background
                  </h4>

                  <p>
                    Choose the background
                    displayed behind your 3D
                    avatar.
                  </p>
                </div>

                <div className="viewer-background-options">

                  <button
                    type="button"
                    className={`viewer-bg-choice dark-choice ${
                      viewerBackground ===
                      "dark"
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      setViewerBackground(
                        "dark"
                      )
                    }
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
                  />

                  <button
                    type="button"
                    className={`viewer-bg-choice light-choice ${
                      viewerBackground ===
                      "light"
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      setViewerBackground(
                        "light"
                      )
                    }
                  />

                </div>

              </div>

              <div className="setting-divider" />

              <div className="setting-row">

                <div>
                  <h4>
                    Motion Effects
                  </h4>

                  <p>
                    Enable smooth interface
                    transitions and animations.
                  </p>
                </div>

                <button
                  type="button"
                  className={`toggle ${
                    motionEffects
                      ? "on"
                      : ""
                  }`}
                  onClick={() =>
                    setMotionEffects(
                      !motionEffects
                    )
                  }
                >
                  <span />
                </button>

              </div>

            </div>

          </div>
        )}

        {/* =================================================
            PRIVACY
        ================================================= */}

        {activeSection ===
          "privacy" && (
          <div className="settings-section">

            <div className="section-header">
              <h1>
                Privacy Policy
              </h1>

              <p>
                Learn how VirtuFit 3D
                processes, stores, and
                protects your information.
              </p>
            </div>

            <div className="settings-card">

              <div className="settings-card-title">
                <span className="card-icon">
                  ▢
                </span>

                <div>
                  <h3>
                    Your Privacy Matters
                  </h3>

                  <p>
                    Privacy principles applied
                    throughout the virtual
                    try-on system.
                  </p>
                </div>
              </div>

              <p className="privacy-policy-text">
                VirtuFit 3D processes personal
                information only as required to
                provide account, personalized
                3D avatar generation, and
                virtual try-on functionality.
              </p>

            </div>

            <div className="settings-card">

              <div className="settings-card-title">
                <span className="card-icon">
                  ◫
                </span>

                <div>
                  <h3>
                    Information We Process
                  </h3>

                  <p>
                    Information required for
                    personalized virtual try-on.
                  </p>
                </div>
              </div>

              <div className="privacy-policy-list">

                <div className="privacy-policy-item">
                  <span className="privacy-policy-dot" />

                  <div>
                    <h4>
                      Account Information
                    </h4>

                    <p>
                      Used to authenticate users
                      and provide personalized
                      system access.
                    </p>
                  </div>
                </div>

                <div className="privacy-policy-item">
                  <span className="privacy-policy-dot" />

                  <div>
                    <h4>
                      Body Photos
                    </h4>

                    <p>
                      Front, side, and back body
                      images are processed for
                      3D avatar generation.
                    </p>
                  </div>
                </div>

                <div className="privacy-policy-item">
                  <span className="privacy-policy-dot" />

                  <div>
                    <h4>
                      Height Information
                    </h4>

                    <p>
                      Used to scale the generated
                      avatar according to the
                      user's physical height.
                    </p>
                  </div>
                </div>

                <div className="privacy-policy-item">
                  <span className="privacy-policy-dot" />

                  <div>
                    <h4>
                      Generated 3D Avatar
                    </h4>

                    <p>
                      Retained for use in future
                      virtual try-on sessions.
                    </p>
                  </div>
                </div>

              </div>

            </div>

            <div className="settings-card">

              <div className="settings-card-title">
                <span className="card-icon">
                  ⌛
                </span>

                <div>
                  <h3>
                    Photo and Height Retention
                  </h3>

                  <p>
                    How avatar input data is
                    handled.
                  </p>
                </div>
              </div>

              <div className="privacy-highlight-box">

                <div className="privacy-highlight-icon">
                  ✓
                </div>

                <div>
                  <h4>
                    Temporary Photo Processing
                  </h4>

                  <p>
                    Front, side, and back photos
                    are temporary processing data
                    and are deleted after
                    successful avatar generation.
                  </p>
                </div>

              </div>

              <div className="privacy-highlight-box">

                <div className="privacy-highlight-icon">
                  ✓
                </div>

                <div>
                  <h4>
                    Height Is Not Permanently
                    Stored
                  </h4>

                  <p>
                    Height information is used
                    during avatar scaling and is
                    not retained afterward.
                  </p>
                </div>

              </div>

            </div>

            <div className="settings-card">

              <div className="settings-card-title">
                <span className="card-icon">
                  ◇
                </span>

                <div>
                  <h3>
                    3D Avatar Storage
                  </h3>

                  <p>
                    How generated avatar data is
                    retained.
                  </p>
                </div>
              </div>

              <p className="privacy-policy-text">
                The generated 3D avatar is stored
                as the persistent personalized
                asset associated with the
                authenticated user.
              </p>

              <div className="privacy-security-row">

                <span className="privacy-security-icon">
                  🔒
                </span>

                <div>
                  <h4>
                    Owner-Only Access
                  </h4>

                  <p>
                    Stored avatars are associated
                    with their respective
                    authenticated users.
                  </p>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* =================================================
            HELP & SUPPORT
        ================================================= */}

        {activeSection ===
          "support" && (
          <div className="settings-section support-section">

            <section className="support-hero">

              <div className="support-hero-content">

                <h1>
                  How can we help?
                </h1>

                <p>
                  Find answers about avatar
                  generation, virtual try-on,
                  fit feedback, privacy, and
                  using VirtuFit 3D.
                </p>

                <div className="support-search-box">

                  <span className="support-search-icon">
                    ⌕
                  </span>

                  <input
                    type="text"
                    placeholder="Search help..."
                    value={supportSearch}
                    onChange={(event) =>
                      setSupportSearch(
                        event.target.value
                      )
                    }
                  />

                  {supportSearch && (
                    <button
                      type="button"
                      className="support-search-clear"
                      onClick={() =>
                        setSupportSearch("")
                      }
                    >
                      ×
                    </button>
                  )}

                </div>

                <div className="popular-searches">

                  <span>
                    Popular searches:
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setSupportSearch(
                        "Avatar generation"
                      )
                    }
                  >
                    Avatar generation
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setSupportSearch(
                        "Virtual try-on"
                      )
                    }
                  >
                    Virtual try-on
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setSupportSearch(
                        "Fit feedback"
                      )
                    }
                  >
                    Fit feedback
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setSupportSearch(
                        "Uploaded photos"
                      )
                    }
                  >
                    Uploaded photos
                  </button>

                </div>

              </div>

            </section>

            {supportSearch.trim() && (
              <div className="support-search-results">

                <div className="support-results-header">

                  <h3>
                    Search Results
                  </h3>

                  <span>
                    {
                      filteredSupportTopics.length
                    }{" "}
                    result
                    {
                      filteredSupportTopics.length !==
                      1
                        ? "s"
                        : ""
                    }
                  </span>

                </div>

                {filteredSupportTopics.length >
                0 ? (
                  filteredSupportTopics.map(
                    (topic) => (
                      <button
                        type="button"
                        className="support-result-item"
                        key={topic.id}
                        onClick={() =>
                          scrollToSection(
                            topic.target
                          )
                        }
                      >
                        <span className="support-result-icon">
                          ?
                        </span>

                        <div>
                          <strong>
                            {topic.title}
                          </strong>

                          <p>
                            {topic.category}
                          </p>
                        </div>

                        <span className="support-result-arrow">
                          ›
                        </span>
                      </button>
                    )
                  )
                ) : (
                  <div className="support-no-results">

                    <strong>
                      No help topics found
                    </strong>

                    <p>
                      Try searching for avatar,
                      photos, virtual try-on, or
                      fit feedback.
                    </p>

                  </div>
                )}

              </div>
            )}

            <div className="settings-card">

              <div className="settings-card-title">
                <span className="card-icon">
                  ?
                </span>

                <div>
                  <h3>
                    Quick Help
                  </h3>

                  <p>
                    Choose a topic to find the
                    help you need.
                  </p>
                </div>
              </div>

              <div className="support-quick-grid">

                <button
                  type="button"
                  className="support-quick-card"
                  onClick={() =>
                    scrollToSection(
                      "avatar-help"
                    )
                  }
                >
                  <span className="support-card-icon">
                    ◇
                  </span>

                  <div>
                    <strong>
                      Avatar Generation
                    </strong>

                    <p>
                      Learn how to create your
                      personalized 3D avatar.
                    </p>
                  </div>

                  <span className="support-arrow">
                    ›
                  </span>
                </button>

                <button
                  type="button"
                  className="support-quick-card"
                  onClick={() =>
                    scrollToSection(
                      "tryon-help"
                    )
                  }
                >
                  <span className="support-card-icon">
                    ◈
                  </span>

                  <div>
                    <strong>
                      Virtual Try-On
                    </strong>

                    <p>
                      Learn how to try garments
                      using your avatar.
                    </p>
                  </div>

                  <span className="support-arrow">
                    ›
                  </span>
                </button>

                <button
                  type="button"
                  className="support-quick-card"
                  onClick={() =>
                    scrollToSection(
                      "troubleshooting"
                    )
                  }
                >
                  <span className="support-card-icon">
                    ⚙
                  </span>

                  <div>
                    <strong>
                      Troubleshooting
                    </strong>

                    <p>
                      Fix common avatar and
                      try-on problems.
                    </p>
                  </div>

                  <span className="support-arrow">
                    ›
                  </span>
                </button>

              </div>

            </div>

            <div
              className="settings-card support-guide-card"
              id="avatar-help"
            >

              <div className="settings-card-title">
                <span className="card-icon">
                  ◇
                </span>

                <div>
                  <h3>
                    How to Create Your 3D Avatar
                  </h3>

                  <p>
                    Follow these steps for better
                    avatar generation results.
                  </p>
                </div>
              </div>

              <div className="support-step-list">

                {[
                  [
                    "Enter Your Height",
                    "Enter your correct height so the generated avatar can be scaled appropriately.",
                  ],
                  [
                    "Upload a Front Photo",
                    "Stand straight and ensure your full body is clearly visible.",
                  ],
                  [
                    "Upload a Side Photo",
                    "Turn sideways while keeping your full body visible.",
                  ],
                  [
                    "Upload a Back Photo",
                    "Face away from the camera while keeping the same distance and posture.",
                  ],
                  [
                    "Generate Your Avatar",
                    "Submit the information and wait while VirtuFit 3D creates your personalized avatar.",
                  ],
                ].map(
                  (
                    [
                      title,
                      description,
                    ],
                    index
                  ) => (
                    <div
                      className="support-step"
                      key={title}
                    >
                      <span className="support-step-number">
                        {index + 1}
                      </span>

                      <div>
                        <h4>
                          {title}
                        </h4>

                        <p>
                          {description}
                        </p>
                      </div>
                    </div>
                  )
                )}

              </div>

              <div className="support-tip">

                <span>
                  ✓
                </span>

                <p>
                  Use good lighting, a clear
                  background, fitted clothing,
                  and a consistent camera
                  position for all three photos.
                </p>

              </div>

            </div>

            <div
              className="settings-card support-guide-card"
              id="tryon-help"
            >

              <div className="settings-card-title">
                <span className="card-icon">
                  ◈
                </span>

                <div>
                  <h3>
                    Using Virtual Try-On
                  </h3>

                  <p>
                    Learn how to try garments on
                    your personalized avatar.
                  </p>
                </div>
              </div>

              <div className="support-step-list">

                {[
                  [
                    "Open the Garment Catalog",
                    "Browse the available garments in the catalog.",
                  ],
                  [
                    "Select a Garment",
                    "Choose the garment you want to preview.",
                  ],
                  [
                    "Start Virtual Try-On",
                    "Apply the selected garment to your personalized avatar.",
                  ],
                  [
                    "View Fit Feedback",
                    "Review the fit information generated by the system.",
                  ],
                ].map(
                  (
                    [
                      title,
                      description,
                    ],
                    index
                  ) => (
                    <div
                      className="support-step"
                      key={title}
                    >
                      <span className="support-step-number">
                        {index + 1}
                      </span>

                      <div>
                        <h4>
                          {title}
                        </h4>

                        <p>
                          {description}
                        </p>
                      </div>
                    </div>
                  )
                )}

              </div>

            </div>

            <div
              className="settings-card"
              id="troubleshooting"
            >

              <div className="settings-card-title">
                <span className="card-icon">
                  ⚙
                </span>

                <div>
                  <h3>
                    Troubleshooting
                  </h3>

                  <p>
                    Solutions for common
                    VirtuFit 3D problems.
                  </p>
                </div>
              </div>

              <div className="troubleshooting-list">

                <div className="troubleshooting-item">
                  <div className="troubleshooting-icon">
                    !
                  </div>

                  <div>
                    <h4>
                      Avatar Generation Failed
                    </h4>

                    <p>
                      Check that all three photos
                      are uploaded, your height is
                      entered, and your full body
                      is clearly visible.
                    </p>
                  </div>
                </div>

                <div className="troubleshooting-item">
                  <div className="troubleshooting-icon">
                    !
                  </div>

                  <div>
                    <h4>
                      Avatar Is Not Displaying
                    </h4>

                    <p>
                      Refresh the page and verify
                      that avatar generation
                      completed successfully.
                    </p>
                  </div>
                </div>

                <div className="troubleshooting-item">
                  <div className="troubleshooting-icon">
                    !
                  </div>

                  <div>
                    <h4>
                      Garment Does Not Appear
                    </h4>

                    <p>
                      Reselect the garment and
                      restart the virtual try-on
                      process.
                    </p>
                  </div>
                </div>

                <div className="troubleshooting-item">
                  <div className="troubleshooting-icon">
                    !
                  </div>

                  <div>
                    <h4>
                      Connection Error
                    </h4>

                    <p>
                      Check your internet
                      connection and confirm that
                      the backend service is
                      running.
                    </p>
                  </div>
                </div>

              </div>

            </div>

            <div className="settings-card">

              <div className="settings-card-title">
                <span className="card-icon">
                  ?
                </span>

                <div>
                  <h3>
                    Frequently Asked Questions
                  </h3>

                  <p>
                    Answers to common questions
                    about VirtuFit 3D.
                  </p>
                </div>
              </div>

              <div className="faq-list">

                {[
                  [
                    "Why do I need three photos?",
                    "Front, side, and back views provide multiple body perspectives used during personalized 3D avatar generation.",
                  ],
                  [
                    "Why is my height required?",
                    "Height is used to scale the generated body model to your physical height.",
                  ],
                  [
                    "Are my uploaded photos stored?",
                    "Uploaded front, side, and back photos are treated as temporary processing data for avatar generation.",
                  ],
                  [
                    "Can I use my avatar again later?",
                    "Yes. Your generated 3D avatar is associated with your account for future virtual try-on sessions.",
                  ],
                  [
                    "What garments can I try on?",
                    "Use the Garment Catalog to see the garment types currently available for virtual try-on.",
                  ],
                ].map(
                  (
                    [
                      question,
                      answer,
                    ],
                    index
                  ) => (
                    <div
                      className="faq-item"
                      key={question}
                    >
                      <button
                        type="button"
                        className="faq-question"
                        onClick={() =>
                          toggleFaq(
                            index
                          )
                        }
                      >
                        <span>
                          {question}
                        </span>

                        <span
                          className={`faq-arrow ${
                            openFaq ===
                            index
                              ? "open"
                              : ""
                          }`}
                        >
                          ⌄
                        </span>
                      </button>

                      {openFaq ===
                        index && (
                        <div className="faq-answer">
                          {answer}
                        </div>
                      )}

                    </div>
                  )
                )}

              </div>

            </div>

            <div className="settings-card">

              <div className="settings-card-title">
                <span className="card-icon">
                  ✉
                </span>

                <div>
                  <h3>
                    Report a Problem
                  </h3>

                  <p>
                    Tell us about a problem you
                    experienced while using
                    VirtuFit 3D.
                  </p>
                </div>
              </div>

              <div className="support-form">

                <div className="support-form-group">

                  <label>
                    Issue Type
                  </label>

                  <select
                    value={
                      issueType
                    }
                    onChange={(
                      event
                    ) =>
                      setIssueType(
                        event.target
                          .value
                      )
                    }
                  >
                    <option>
                      Technical Issue
                    </option>

                    <option>
                      Avatar Generation
                    </option>

                    <option>
                      Virtual Try-On
                    </option>

                    <option>
                      Garment Catalog
                    </option>

                    <option>
                      Login / Account
                    </option>

                    <option>
                      Other
                    </option>
                  </select>

                </div>

                <div className="support-form-group">

                  <label>
                    Describe the Problem
                  </label>

                  <textarea
                    value={
                      issueDescription
                    }
                    onChange={(
                      event
                    ) =>
                      setIssueDescription(
                        event.target
                          .value
                      )
                    }
                    placeholder="Describe what happened..."
                    rows={5}
                  />

                </div>

                <div className="support-form-footer">

                  {supportMessage && (
                    <p className="support-message">
                      {
                        supportMessage
                      }
                    </p>
                  )}

                  <button
                    type="button"
                    className="support-submit-button"
                    onClick={
                      handleReportProblem
                    }
                  >
                    Submit Report
                  </button>

                </div>

              </div>

            </div>

          </div>
        )}

      </main>
    </div>
  );
}

export default Settings;