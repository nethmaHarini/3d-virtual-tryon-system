
import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";


function AvatarViewer() {
  const navigate = useNavigate();
  const location = useLocation();

  // Avatar value logic (preserved)
  const avatarValue = useMemo(() => {
    const stateAvatarUrl = location.state?.avatarUrl;
    const stateAvatarFile = location.state?.avatar_file || location.state?.avatarFile;
    if (typeof stateAvatarUrl === "string" && stateAvatarUrl.trim()) {
      return stateAvatarUrl;
    }
    if (typeof stateAvatarFile === "string" && stateAvatarFile.trim()) {
      return stateAvatarFile;
    }
    return null;
  }, [location.state]);

  // --- Styles ---
  const styles = {
        logoutFixed: {
          position: "fixed",
          top: 18,
          right: 28,
          zIndex: 1000,
          border: "1px solid rgba(255,255,255,0.28)",
          borderRadius: "12px",
          padding: "10px 16px",
          cursor: "pointer",
          background: "rgba(5, 17, 52, 0.75)",
          color: "#f0f6ff",
          fontWeight: 600,
          fontSize: "0.95rem",
        },
    page: {
      minHeight: "100vh",
      width: "100vw",
      background: "radial-gradient(circle at 15% 20%, #16388f 0%, #071337 40%, #030a20 100%)",
      color: "#eaf6ff",
      fontFamily: "'Segoe UI', 'Roboto', 'Arial', sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      padding: 0,
      margin: 0,
      boxSizing: "border-box",
    },
    nav: {
      width: "100%",
      minHeight: 64,
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
      position: "relative",
      padding: "8px 0 20px 0",
      boxSizing: "border-box",
      background: "none",
    },
    navInner: {
      width: "100%",
      maxWidth: "1160px",
      margin: "0 auto",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "relative",
      height: 64,
      padding: "0 4px",
    },
    appTitle: {
      position: "fixed",
      top: 18,
      left: 28,
      zIndex: 1100,
      margin: 0,
      fontSize: "2rem",
      letterSpacing: "0.05em",
      fontWeight: 800,
      color: "#7fd4ff",
      textShadow: "0 0 14px rgba(67, 193, 255, 0.65)",
      background: "none",
      pointerEvents: "none",
      userSelect: "none",
    },
    logoutButton: {
      border: "1px solid rgba(255,255,255,0.28)",
      borderRadius: "12px",
      padding: "10px 16px",
      cursor: "pointer",
      background: "rgba(5, 17, 52, 0.75)",
      color: "#f0f6ff",
      fontWeight: 600,
      fontSize: "0.95rem",
      margin: "0 0 0 24px",
    },
    contentWrap: {
      width: "100vw",
      minHeight: "calc(100vh - 64px)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 0,
      padding: 0,
    },
    heading: {
      color: "#1ce1ff",
      fontWeight: 900,
      fontSize: 34,
      letterSpacing: "0.13em",
      textTransform: "uppercase",
      textAlign: "center",
      margin: "0 0 10px 0",
      textShadow: "0 0 18px #1ce1ff, 0 0 2px #1ce1ff",
    },
    subtitle: {
      color: "#b6d8ff",
      fontWeight: 400,
      fontSize: 18,
      textAlign: "center",
      margin: "0 0 38px 0",
      letterSpacing: "0.01em",
      textShadow: "0 0 8px #1ce1ff33",
    },
    card: {
      width: "100%",
      maxWidth: 540,
      minHeight: 640,
      background: "linear-gradient(180deg, rgba(10, 28, 76, 0.98) 0%, rgba(6, 18, 52, 0.99) 100%)",
      borderRadius: 36,
      border: "1.5px solid rgba(120, 171, 255, 0.18)",
      boxShadow: "0 0 64px 0 #1ce1ff44, 0 24px 90px rgba(0, 0, 0, 0.62)",
      padding: "48px 44px 38px 44px",
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      margin: "0 auto",
      position: "relative",
    },
    avatarPanel: {
      width: 340,
      height: 480,
      background: "linear-gradient(180deg, #0b1e3a 60%, #0a1a2e 100%)",
      borderRadius: 36,
      boxShadow: "0 0 64px 0 #1ce1ff33, 0 0 0 3px #1ce1ff22 inset",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 0 38px 0",
      position: "relative",
      overflow: "hidden",
      border: "1.5px solid #1ce1ff33",
      transition: "box-shadow 0.2s, border 0.2s",
    },
    avatarSilhouette: {
      width: 180,
      height: 280,
      margin: "0 auto",
      display: "block",
      filter: "drop-shadow(0 0 32px #1ce1ff77)",
      opacity: 0.97,
      zIndex: 2,
      transition: "width 0.2s, height 0.2s",
    },
    gridFloor: {
      position: "absolute",
      left: 0,
      bottom: 0,
      width: "100%",
      height: 60,
      zIndex: 1,
      pointerEvents: "none",
      background: "linear-gradient(180deg, #1ce1ff11 0%, #1ce1ff00 100%)",
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "center",
    },
    avatarInfo: {
      margin: "0 0 18px 0",
      background: "rgba(8, 23, 62, 0.82)",
      border: "1px solid rgba(113, 169, 255, 0.22)",
      borderRadius: 12,
      padding: "10px 14px",
      color: "#d7e8ff",
      fontSize: 15,
      wordBreak: "break-word",
      textAlign: "center",
      minHeight: 32,
      maxWidth: 320,
      boxShadow: "0 0 8px #1ce1ff22",
    },
    actions: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 14,
      width: "100%",
      marginTop: 18,
    },
    primaryButton: {
      border: "none",
      borderRadius: 14,
      padding: "13px 0",
      cursor: "pointer",
      background: "linear-gradient(90deg, #1c7dff 0%, #27b3ff 100%)",
      color: "#ffffff",
      fontWeight: 700,
      letterSpacing: "0.03em",
      fontSize: 17,
      boxShadow: "0 10px 24px rgba(30, 137, 255, 0.32)",
      width: 210,
      marginBottom: 10,
      transition: "background 0.18s, box-shadow 0.18s",
    },
    secondaryButton: {
      border: "1.5px solid #1ce1ff55",
      borderRadius: 14,
      padding: "12px 0",
      cursor: "pointer",
      background: "rgba(7, 26, 82, 0.85)",
      color: "#b6d8ff",
      fontWeight: 600,
      letterSpacing: "0.03em",
      fontSize: 16,
      width: 210,
      marginTop: 0,
      transition: "background 0.18s, border 0.18s",
    },
  };

  // --- Handlers ---
  const handleLogout = () => {
    // If you have a logout function, call it here. Otherwise, just clear token and go to login.
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleSelectGarment = () => {
    navigate("/catalog");
  };

  const handleTryAgain = () => {
    navigate("/dashboard");
  };

  // --- SVGs ---
  const avatarSVG = (
    <svg viewBox="0 0 120 180" style={styles.avatarSilhouette} fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="60" cy="38" rx="28" ry="28" fill="#eaf6ff" fillOpacity="0.92"/>
      <rect x="32" y="66" width="56" height="70" rx="28" fill="#eaf6ff" fillOpacity="0.92"/>
      <rect x="18" y="120" width="24" height="48" rx="12" fill="#eaf6ff" fillOpacity="0.92"/>
      <rect x="78" y="120" width="24" height="48" rx="12" fill="#eaf6ff" fillOpacity="0.92"/>
      <rect x="48" y="136" width="24" height="36" rx="12" fill="#eaf6ff" fillOpacity="0.92"/>
    </svg>
  );

  const gridSVG = (
    <svg width="100%" height="60" viewBox="0 0 220 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g opacity="0.38">
        <rect x="0" y="59" width="220" height="1" fill="#1ce1ff"/>
        <rect x="0" y="49" width="220" height="1" fill="#1ce1ff"/>
        <rect x="0" y="39" width="220" height="1" fill="#1ce1ff"/>
        <rect x="0" y="29" width="220" height="1" fill="#1ce1ff"/>
        <rect x="0" y="19" width="220" height="1" fill="#1ce1ff"/>
        <rect x="0" y="9" width="220" height="1" fill="#1ce1ff"/>
        <rect x="20" y="0" width="1" height="60" fill="#1ce1ff"/>
        <rect x="60" y="0" width="1" height="60" fill="#1ce1ff"/>
        <rect x="100" y="0" width="1" height="60" fill="#1ce1ff"/>
        <rect x="140" y="0" width="1" height="60" fill="#1ce1ff"/>
        <rect x="180" y="0" width="1" height="60" fill="#1ce1ff"/>
      </g>
    </svg>
  );

  // --- Render ---
  return (
    <div style={styles.page}>
      {/* Fixed Logout Button at Screen Top Right */}
      <button type="button" onClick={handleLogout} style={styles.logoutFixed}>
        Logout
      </button>
      {/* Top Navigation Bar */}
      <h1 style={styles.appTitle}>VirtuFit3D Studio</h1>
      <div style={styles.nav}>
        <div style={{...styles.navInner, justifyContent: "space-between"}}>
          {/* Navigation content remains here */}
        </div>
      </div>
      <div style={styles.contentWrap}>
        <div style={styles.heading}>YOUR DIGITAL TWIN</div>
        <div style={styles.subtitle}>Avatar generated successfully from your inputs</div>
        <div style={styles.card}>
          <div style={styles.avatarPanel}>
            {/* Placeholder: Large, centered human silhouette SVG */}
            {avatarSVG}
            <div style={styles.gridFloor}>{gridSVG}</div>
          </div>
          {/* Muted message below the avatar panel */}
          <div
            style={{
              margin: "18px 0 0 0",
              textAlign: "center",
              fontSize: 16,
              color: "#8eb6d6",
              opacity: 0.82,
              fontWeight: 400,
              letterSpacing: "0.01em",
              lineHeight: 1.5,
              maxWidth: 380,
              alignSelf: "center"
            }}
          >
            3D avatar preview will appear here after model generation is connected.
          </div>
          <div style={styles.actions}>
            <button type="button" style={styles.primaryButton} onClick={handleSelectGarment}>
              Select Garment
            </button>
            <button type="button" style={styles.secondaryButton} onClick={handleTryAgain}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AvatarViewer;
