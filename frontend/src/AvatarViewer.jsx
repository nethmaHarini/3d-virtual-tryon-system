import AvatarCanvas from "./components/AvatarCanvas";
import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function AvatarViewer() {
  const navigate = useNavigate();
  const location = useLocation();

  const avatarValue = useMemo(() => {
    const stateAvatarUrl = location.state?.avatarUrl;
    const stateAvatarFile =
      location.state?.avatar_file || location.state?.avatarFile;

    if (typeof stateAvatarUrl === "string" && stateAvatarUrl.trim()) {
      return stateAvatarUrl;
    }

    if (typeof stateAvatarFile === "string" && stateAvatarFile.trim()) {
      return stateAvatarFile;
    }

    return null;
  }, [location.state]);

  console.log("avatarValue =", avatarValue);

  const handleDownloadAvatar = () => {
    const fileToDownload = "/models/final_avatar.obj";
    const link = document.createElement("a");
    link.href = fileToDownload;
    link.download = "final_avatar.obj";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
      background:
        "radial-gradient(circle at 15% 20%, #16388f 0%, #071337 40%, #030a20 100%)",
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
      fontSize: "2.5rem",
      letterSpacing: "0.05em",
      fontWeight: 800,
      color: "#7fd4ff",
      textShadow: "0 0 14px rgba(67, 193, 255, 0.65)",
      background: "none",
      pointerEvents: "none",
      userSelect: "none",
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
      maxWidth: 1100,
      minHeight: 760,
      background:
        "linear-gradient(180deg, rgba(10, 28, 76, 0.98) 0%, rgba(6, 18, 52, 0.99) 100%)",
      borderRadius: 36,
      border: "1.5px solid rgba(120, 171, 255, 0.18)",
      boxShadow:
        "0 0 64px 0 #1ce1ff44, 0 24px 90px rgba(0, 0, 0, 0.62)",
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
      width: "100%",
      maxWidth: 900,
      height: 620,
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
    },
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleSelectGarment = () => {
    navigate("/catalog", {
      state: {
        avatarUrl: avatarValue,
      },
    });
  };

  const handleTryAgain = () => {
    navigate("/dashboard");
  };

  return (
    <div style={styles.page}>
      <button type="button" onClick={handleLogout} style={styles.logoutFixed}>
        Logout
      </button>

      <h1 style={styles.appTitle}>VirtuFit3D Studio</h1>

      <div style={styles.nav}>
        <div style={{ ...styles.navInner, justifyContent: "space-between" }} />
      </div>

      <div style={styles.contentWrap}>
        <div style={styles.heading}>YOUR DIGITAL TWIN</div>
        <div style={styles.subtitle}>
          Avatar generated successfully from your inputs
        </div>

        <div style={styles.card}>
          <div style={styles.avatarPanel}>
            <AvatarCanvas modelPath={avatarValue || "/models/final_avatar.obj"} />
          </div>

          <div style={styles.actions}>
            <button
              type="button"
              style={styles.primaryButton}
              onClick={handleSelectGarment}
            >
              Select Garment
            </button>

            <button
              type="button"
              style={styles.secondaryButton}
              onClick={handleDownloadAvatar}
            >
              Download Avatar
            </button>

            <button
              type="button"
              style={styles.secondaryButton}
              onClick={handleTryAgain}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AvatarViewer;