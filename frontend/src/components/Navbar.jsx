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
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "0 6%",
      boxSizing: "border-box",
      background: isDark
        ? "linear-gradient(90deg, rgba(10, 15, 30, 0.3) 0%, rgba(54, 38, 206, 0.12) 100%)"
        : "linear-gradient(90deg, rgba(245, 248, 255, 0.85) 0%, rgba(227, 233, 255, 0.65) 100%)",
      backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)",
      borderBottom: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(21, 36, 68, 0.1)",
      borderTop: isDark ? "1px solid rgba(255, 255, 255, 0.03)" : "1px solid rgba(255, 255, 255, 0.8)",
      boxShadow: isDark
        ? "0 10px 40px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0,0,0,0.4)"
        : "0 8px 32px rgba(31, 47, 86, 0.12)",
      zIndex: 100,
      fontFamily: "'Plus Jakarta Sans', 'Manrope', sans-serif",
      transition: "all 220ms ease",
    },
    // Left Zone
    leftZone: {
      flex: 1, // Takes up equal space to keep center links perfectly centered
      display: "flex",
      alignItems: "center",
    },
    logo: {
      color: isDark ? "#ffffff" : "#1a2542",
      fontSize: "1.45rem",
      fontWeight: 800,
      letterSpacing: "-0.02em",
      cursor: "pointer",
      margin: 0,
      textShadow: isDark ? "0 0 20px rgba(164, 201, 252, 0.3)" : "none",
      transition: "all 0.3s ease",
    },
    // Center Zone
    linkGroup: {
      display: "flex",
      gap: "40px",
      alignItems: "center",
      justifyContent: "center",
    },
    navLink: {
      color: isDark ? "#c3cce1" : "#425277",
      fontSize: "0.9rem",
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.25s ease",
    },
    // Right Zone
    actionGroup: {
      flex: 1, // Takes up equal space to keep center links perfectly centered
      display: "flex",
      gap: "16px",
      alignItems: "center",
      justifyContent: "flex-end",
    },
    themeToggleBtn: {
      width: 40,
      height: 40,
      borderRadius: "999px",
      border: isDark ? "1px solid rgba(191, 212, 255, 0.35)" : "1px solid rgba(45, 61, 96, 0.2)",
      background: isDark ? "rgba(35, 47, 69, 0.75)" : "rgba(255, 255, 255, 0.9)",
      color: isDark ? "#f1f5ff" : "#1a2745",
      fontSize: "1rem",
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.22s ease",
      fontFamily: "inherit",
    },
    signInBtn: {
      background: isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(255, 255, 255, 0.75)",
      color: isDark ? "#ffffff" : "#172442",
      border: isDark ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid rgba(25, 40, 70, 0.2)",
      padding: "10px 24px",
      borderRadius: "999px",
      fontSize: "0.9rem",
      fontWeight: 600,
      cursor: "pointer",
      backdropFilter: "blur(10px)",
      transition: "all 0.3s ease",
      fontFamily: "inherit",
    },
    getStartedBtn: {
      background: "linear-gradient(135deg, #3626ce 0%, #5f0b7e 100%)",
      color: "#ffffff",
      border: "none",
      padding: "11px 26px",
      borderRadius: "999px",
      fontSize: "0.9rem",
      fontWeight: 700,
      cursor: "pointer",
      boxShadow: "0 8px 20px rgba(31, 22, 81, 0.4)",
      transition: "all 0.3s ease",
      fontFamily: "inherit",
    }
  };

  // Helper function for the link hover effect
  const handleLinkHover = (e, isHovering) => {
    e.target.style.color = isHovering ? (isDark ? "#ffffff" : "#101b34") : isDark ? "#c3cce1" : "#425277";
    e.target.style.textShadow = isHovering && isDark ? "0 0 12px rgba(255,255,255,0.4)" : "none";
  };

  return (
    <nav style={styles.nav}>
      {/* 1. LEFT: Logo */}
      <div style={styles.leftZone}>
        <h2 style={styles.logo} onClick={() => navigate("/")}>
          VirtuFit 3D
        </h2>
      </div>

      {/* 2. CENTER: Navigation Links */}
      <div style={styles.linkGroup} className="desktop-nav-links">
        <span 
          style={styles.navLink}
          onMouseEnter={(e) => handleLinkHover(e, true)}
          onMouseLeave={(e) => handleLinkHover(e, false)}
        >
          Features
        </span>
        <span 
          style={styles.navLink}
          onMouseEnter={(e) => handleLinkHover(e, true)}
          onMouseLeave={(e) => handleLinkHover(e, false)}
        >
          How it Works
        </span>
        <span 
          style={styles.navLink}
          onMouseEnter={(e) => handleLinkHover(e, true)}
          onMouseLeave={(e) => handleLinkHover(e, false)}
        >
          FAQ
        </span>
      </div>

      {/* 3. RIGHT: Action Buttons */}
      <div style={styles.actionGroup}>
        <button 
          style={styles.signInBtn}
          onClick={() => navigate("/login")}
          onMouseEnter={(e) => {
            e.target.style.background = isDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.95)";
            e.target.style.borderColor = isDark ? "rgba(255,255,255,0.4)" : "rgba(25,40,70,0.35)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = isDark ? "rgba(255,255,255,0.03)" : "rgba(255, 255, 255, 0.75)";
            e.target.style.borderColor = isDark ? "rgba(255,255,255,0.15)" : "rgba(25, 40, 70, 0.2)";
          }}
        >
          Sign In
        </button>

        <button 
          style={styles.getStartedBtn}
          onClick={() => navigate("/login")} // Change to "/signup" if you make a separate sign-up route
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.filter = "brightness(1.15)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.filter = "brightness(1)";
          }}
        >
          Get Started
        </button>
        <button
          type="button"
          style={styles.themeToggleBtn}
          aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
          title={`Switch to ${isDark ? "light" : "dark"} mode`}
          onClick={() => setTheme(isDark ? "light" : "dark")}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.filter = "brightness(1.05)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.filter = "brightness(1)";
          }}
        >
          {isDark ? "☀" : "🌙"}
        </button>
      </div>

      {/* CSS to hide center links on small screens to prevent overlap */}
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