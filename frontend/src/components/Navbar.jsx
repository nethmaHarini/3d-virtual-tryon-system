import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

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
      background: "linear-gradient(90deg, rgba(10, 15, 30, 0.3) 0%, rgba(54, 38, 206, 0.12) 100%)",
      backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)",
      borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
      borderTop: "1px solid rgba(255, 255, 255, 0.03)",
      boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0,0,0,0.4)",
      zIndex: 100,
      fontFamily: "'Plus Jakarta Sans', 'Manrope', sans-serif",
    },
    // Left Zone
    leftZone: {
      flex: 1, // Takes up equal space to keep center links perfectly centered
      display: "flex",
      alignItems: "center",
    },
    logo: {
      color: "#ffffff",
      fontSize: "1.45rem",
      fontWeight: 800,
      letterSpacing: "-0.02em",
      cursor: "pointer",
      margin: 0,
      textShadow: "0 0 20px rgba(164, 201, 252, 0.3)",
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
      color: "#c3cce1",
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
    signInBtn: {
      background: "rgba(255, 255, 255, 0.03)",
      color: "#ffffff",
      border: "1px solid rgba(255, 255, 255, 0.15)",
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
    e.target.style.color = isHovering ? "#ffffff" : "#c3cce1";
    e.target.style.textShadow = isHovering ? "0 0 12px rgba(255,255,255,0.4)" : "none";
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
            e.target.style.background = "rgba(255,255,255,0.1)";
            e.target.style.borderColor = "rgba(255,255,255,0.4)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "rgba(255,255,255,0.03)";
            e.target.style.borderColor = "rgba(255,255,255,0.15)";
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