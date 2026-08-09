import { useNavigate } from "react-router-dom";

function Navbar({ theme, setTheme }) {
  const navigate = useNavigate();
  const isDark = theme === "dark";

  const styles = {
    nav: {
      position: "fixed",
      top: 0,
      left: 0,

      width: "100%",
      height: "76px",

      display: "grid",
      gridTemplateColumns: "1fr auto 1fr",
      alignItems: "center",

      padding: "0 6%",
      boxSizing: "border-box",

      background: isDark
        ? "rgba(9, 14, 28, 0.94)"
        : "rgba(245, 248, 255, 0.94)",

      backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)",

      borderBottom: isDark
        ? "1px solid rgba(255,255,255,0.08)"
        : "1px solid rgba(21,36,68,0.1)",

      boxShadow: isDark
        ? "0 8px 30px rgba(0,0,0,0.18)"
        : "0 8px 30px rgba(31,47,86,0.10)",

      zIndex: 100,

      fontFamily:
        "'Plus Jakarta Sans', 'Manrope', sans-serif",

      transition: "all 220ms ease",
    },

    leftZone: {
      justifySelf: "start",
      display: "flex",
      alignItems: "center",
    },

    logo: {
      margin: 0,

      color: isDark
        ? "#ffffff"
        : "#1a2542",

      fontSize: "1.45rem",
      fontWeight: 800,

      letterSpacing: "-0.02em",

      cursor: "pointer",

      textShadow: isDark
        ? "0 0 20px rgba(164,201,252,0.3)"
        : "none",

      transition: "all 0.3s ease",
    },

    linkGroup: {
      justifySelf: "center",

      display: "flex",
      alignItems: "center",

      gap: "40px",
    },

    navLink: {
      color: isDark
        ? "#c3cce1"
        : "#425277",

      fontSize: "0.9rem",
      fontWeight: 600,

      cursor: "pointer",

      whiteSpace: "nowrap",

      transition:
        "color 0.25s ease, text-shadow 0.25s ease",
    },

    actionGroup: {
      justifySelf: "end",

      display: "flex",
      alignItems: "center",
    },

    themeToggleBtn: {
      width: 40,
      height: 40,

      borderRadius: "999px",

      border: isDark
        ? "1px solid rgba(191,212,255,0.35)"
        : "1px solid rgba(45,61,96,0.2)",

      background: isDark
        ? "rgba(35,47,69,0.75)"
        : "rgba(255,255,255,0.9)",

      color: isDark
        ? "#f1f5ff"
        : "#1a2745",

      fontSize: "1rem",

      cursor: "pointer",

      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",

      transition:
        "transform 0.22s ease, filter 0.22s ease",

      fontFamily: "inherit",
    },
  };

  const handleLinkHover = (
    e,
    isHovering
  ) => {
    e.currentTarget.style.color =
      isHovering
        ? isDark
          ? "#ffffff"
          : "#101b34"
        : isDark
          ? "#c3cce1"
          : "#425277";

    e.currentTarget.style.textShadow =
      isHovering && isDark
        ? "0 0 12px rgba(255,255,255,0.4)"
        : "none";
  };

  return (
    <nav style={styles.nav}>
      {/* LEFT */}
      <div style={styles.leftZone}>
        <h2
          style={styles.logo}
          onClick={() =>
            navigate("/")
          }
        >
          VirtuFit 3D
        </h2>
      </div>

      {/* CENTER */}
      <div
        style={styles.linkGroup}
        className="desktop-nav-links"
      >
        <span
          style={styles.navLink}
          onClick={() =>
            navigate("/")
          }
          onMouseEnter={(e) =>
            handleLinkHover(
              e,
              true
            )
          }
          onMouseLeave={(e) =>
            handleLinkHover(
              e,
              false
            )
          }
        >
          Home
        </span>

        <span
          style={styles.navLink}
          onClick={() =>
            navigate(
              "/features"
            )
          }
          onMouseEnter={(e) =>
            handleLinkHover(
              e,
              true
            )
          }
          onMouseLeave={(e) =>
            handleLinkHover(
              e,
              false
            )
          }
        >
          Features
        </span>

        <span
          style={styles.navLink}
          onClick={() =>
            navigate(
              "/how-it-works"
            )
          }
          onMouseEnter={(e) =>
            handleLinkHover(
              e,
              true
            )
          }
          onMouseLeave={(e) =>
            handleLinkHover(
              e,
              false
            )
          }
        >
          How it Works
        </span>

        <span
          style={styles.navLink}
          onClick={() =>
            navigate("/faq")
          }
          onMouseEnter={(e) =>
            handleLinkHover(
              e,
              true
            )
          }
          onMouseLeave={(e) =>
            handleLinkHover(
              e,
              false
            )
          }
        >
          FAQ
        </span>
      </div>

      {/* RIGHT */}
      <div style={styles.actionGroup}>
        <button
          type="button"
          style={
            styles.themeToggleBtn
          }
          aria-label={`Switch to ${
            isDark
              ? "light"
              : "dark"
          } mode`}
          title={`Switch to ${
            isDark
              ? "light"
              : "dark"
          } mode`}
          onClick={() =>
            setTheme(
              isDark
                ? "light"
                : "dark"
            )
          }
          onMouseEnter={(e) => {
            e.currentTarget.style.transform =
              "translateY(-2px)";
            e.currentTarget.style.filter =
              "brightness(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform =
              "translateY(0)";
            e.currentTarget.style.filter =
              "brightness(1)";
          }}
        >
          {isDark ? "☀" : "🌙"}
        </button>
      </div>

      <style>{`
        @media (max-width: 950px) {
          .desktop-nav-links {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
}

export default Navbar;