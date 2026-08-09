import AvatarCanvas from "./components/AvatarCanvas";
import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardSidebar from "./components/DashboardSidebar";
import { useAppTheme } from "./theme";

function AvatarViewer() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useAppTheme();

  const avatarValue = useMemo(() => {
    const stateAvatarUrl = location.state?.avatarUrl;
    const stateAvatarFile =
      location.state?.avatar_file || location.state?.avatarFile;
    const storedAvatarUrl = localStorage.getItem("avatarUrl");
    const storedAvatarFile = localStorage.getItem("avatar_file");
    const storedGeneratedAvatar = localStorage.getItem("generatedAvatar");

    if (typeof stateAvatarUrl === "string" && stateAvatarUrl.trim()) {
      return stateAvatarUrl;
    }

    if (typeof stateAvatarFile === "string" && stateAvatarFile.trim()) {
      return stateAvatarFile;
    }

    if (typeof storedAvatarUrl === "string" && storedAvatarUrl.trim()) {
      return storedAvatarUrl;
    }

    if (typeof storedAvatarFile === "string" && storedAvatarFile.trim()) {
      return storedAvatarFile;
    }

    if (typeof storedGeneratedAvatar === "string" && storedGeneratedAvatar.trim()) {
      return storedGeneratedAvatar;
    }

    return null;
  }, [location.state]);

  console.log("avatarValue =", avatarValue);

  const handleDownloadAvatar = () => {
    const link = document.createElement("a");

    if (!avatarValue) {
      alert("No generated avatar is available to download.");
      return;
    }

    link.href = avatarValue;

    const cleanUrl = avatarValue.split("?")[0];
    const fileName = cleanUrl.split("/").pop() || "generated_avatar.obj";

    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const styles = {
    page: {
      minHeight: "100vh",
      width: "100vw",
      background:
        isDark
          ? "radial-gradient(circle at 12% 16%, rgba(54, 38, 206, 0.22) 0%, transparent 38%), radial-gradient(circle at 88% 84%, rgba(95, 11, 126, 0.24) 0%, transparent 48%), linear-gradient(155deg, #090f17 0%, #0d141d 48%, #111a27 100%)"
          : "radial-gradient(circle at 12% 16%, rgba(78, 107, 255, 0.16) 0%, transparent 38%), radial-gradient(circle at 88% 84%, rgba(138, 92, 255, 0.12) 0%, transparent 48%), linear-gradient(155deg, #f7f9ff 0%, #edf2ff 48%, #eaf0fb 100%)",
      color: isDark ? "#dce3f0" : "#152033",
      fontFamily: "'Manrope', 'Segoe UI', sans-serif",
      padding: 0,
      margin: 0,
      boxSizing: "border-box",
      overflowX: "hidden",
    },
    sidebar: {
      position: "fixed",
      left: 26,
      top: 22,
      bottom: 22,
      width: 220,
      borderRadius: 20,
      border: isDark ? "1px solid rgba(255, 255, 255, 0.06)" : "1px solid rgba(18, 30, 52, 0.08)",
      background: isDark ? "linear-gradient(180deg, rgba(8,12,20,0.72), rgba(10,14,26,0.64))" : "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(239,243,250,0.92))",
      backdropFilter: "blur(18px)",
      padding: 20,
      display: "flex",
      flexDirection: "column",
      gap: 12,
      zIndex: 20,
      boxShadow: isDark ? "0 28px 56px rgba(5, 12, 22, 0.56)" : "0 28px 56px rgba(83, 96, 117, 0.12)",
      boxSizing: "border-box",
    },
    sidebarBrand: {
      margin: 0,
      fontSize: "1.22rem",
      fontWeight: 800,
      color: isDark ? "#ffffff" : "#152033",
      letterSpacing: "-0.01em",
    },
    sidebarTag: {
      margin: "4px 0 18px 0",
      fontSize: "0.66rem",
      color: isDark ? "rgba(195, 198, 208, 0.72)" : "rgba(83, 96, 117, 0.78)",
      letterSpacing: "0.2em",
      textTransform: "uppercase",
      fontWeight: 700,
    },
    sidebarSection: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
    },
    sidebarHeader: { color: isDark ? 'rgba(173,182,204,0.7)' : 'rgba(83, 96, 117, 0.72)', fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', margin: '2px 0 6px 0' },
    sidebarButtonBase: {
      width: "100%",
      border: "1px solid transparent",
      borderRadius: 999,
      padding: "10px 12px",
      color: isDark ? "#c3c0ff" : "#425277",
      background: "transparent",
      fontSize: "0.95rem",
      fontWeight: 700,
      display: "flex",
      alignItems: "center",
      gap: 12,
      textAlign: "left",
      cursor: "pointer",
      transition: "all 180ms ease",
    },
    sidebarButtonActive: {
      background: isDark ? "linear-gradient(90deg, #6f3af2 0%, #a746d1 100%)" : "linear-gradient(90deg, #4e6bff 0%, #8a5cff 100%)",
      color: "#ffffff",
      boxShadow: isDark ? "0 10px 30px rgba(111,58,242,0.18)" : "0 10px 30px rgba(78,107,255,0.18)",
    },
    sidebarFooter: {
      marginTop: "auto",
      paddingTop: 12,
      borderTop: "1px solid rgba(255, 255, 255, 0.03)",
      display: "flex",
      flexDirection: "column",
      gap: 8,
    },
    notifyDot: { marginLeft: 8, display: 'inline-block', minWidth: 18, height: 18, borderRadius: 18, background: 'linear-gradient(90deg,#6f3af2,#a746d1)', color: '#fff', fontSize: 11, lineHeight: '18px', textAlign: 'center', fontWeight: 800 },
    profilePill: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      background: isDark ? "rgba(8, 15, 24, 0.9)" : "rgba(255, 255, 255, 0.92)",
      borderRadius: 16,
      padding: "10px 12px",
      border: isDark ? "1px solid rgba(255, 255, 255, 0.06)" : "1px solid rgba(18, 30, 52, 0.08)",
      boxSizing: "border-box",
    },
    avatarMini: {
      width: 34,
      height: 34,
      borderRadius: "999px",
      background: "linear-gradient(145deg, #3626ce 0%, #5f0b7e 100%)",
      display: "grid",
      placeItems: "center",
      color: "#ffffff",
      fontSize: "0.76rem",
      fontWeight: 700,
      letterSpacing: "0.04em",
      flexShrink: 0,
    },
    profileTitle: {
      margin: 0,
      fontSize: "0.82rem",
      color: isDark ? "#f3f6ff" : "#152033",
      fontWeight: 700,
    },
    profileSubtitle: {
      margin: "2px 0 0 0",
      fontSize: "0.62rem",
      color: isDark ? "rgba(195, 198, 208, 0.78)" : "rgba(83, 96, 117, 0.78)",
      letterSpacing: "0.16em",
      textTransform: "uppercase",
      fontWeight: 700,
    },
    main: {
      marginLeft: 346,
      marginRight: 26,
      paddingTop: 30,
      paddingBottom: 30,
      minHeight: "100vh",
      boxSizing: "border-box",
    },
    mainInner: {
      width: "100%",
      maxWidth: 1320,
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      gap: 22,
    },
    pageHeader: {
      marginBottom: 0,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "end",
      gap: 22,
      flexWrap: "wrap",
    },
    headerTitle: {
      margin: 0,
      fontSize: "2.25rem",
      color: "#ffffff",
      letterSpacing: "-0.02em",
      lineHeight: 1.1,
      fontWeight: 800,
      fontFamily: "'Plus Jakarta Sans', 'Manrope', sans-serif",
    },
    headerSub: {
      margin: "8px 0 0 0",
      fontSize: "0.97rem",
      color: "#c3c6d0",
      lineHeight: 1.5,
      maxWidth: 700,
    },
    statusBadge: {
      padding: "9px 14px",
      borderRadius: 999,
      border: "1px solid rgba(255, 255, 255, 0.08)",
      background: "rgba(21, 28, 38, 0.72)",
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      fontSize: "0.7rem",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.1em",
      color: "#c3c6d0",
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: "999px",
      background: "#a4c9fc",
      boxShadow: "0 0 10px rgba(164, 201, 252, 0.8)",
      animation: "avatarPulse 1.4s ease-in-out infinite",
    },
    stageCard: {
      width: "100%",
      maxWidth: 1020,
      margin: "0 auto",
      background: "rgba(21, 28, 38, 0.65)",
      border: "1px solid rgba(255, 255, 255, 0.07)",
      borderRadius: 22,
      backdropFilter: "blur(24px)",
      boxShadow: "0 22px 44px rgba(5, 12, 22, 0.34)",
      boxSizing: "border-box",
      padding: 24,
    },
    stageGrid: {
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: 14,
      alignItems: "stretch",
    },
    infoPanel: {
      borderRadius: 20,
      border: "1px solid rgba(255, 255, 255, 0.08)",
      background: "rgba(8, 15, 24, 0.72)",
      padding: 16,
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      gap: 14,
    },
    infoTitle: {
      margin: 0,
      color: "#ffffff",
      fontSize: "1.06rem",
      fontWeight: 800,
      fontFamily: "'Plus Jakarta Sans', 'Manrope', sans-serif",
    },
    infoSub: {
      margin: "6px 0 0 0",
      color: "#c3c6d0",
      fontSize: "0.8rem",
      lineHeight: 1.45,
    },
    infoGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      gap: 10,
    },
    statItem: {
      borderRadius: 12,
      border: "1px solid rgba(255, 255, 255, 0.07)",
      background: "rgba(21, 28, 38, 0.7)",
      padding: "10px 10px",
      boxSizing: "border-box",
    },
    statLabel: {
      margin: 0,
      color: "#8d9199",
      fontSize: "0.6rem",
      letterSpacing: "0.16em",
      textTransform: "uppercase",
      fontWeight: 700,
    },
    statValue: {
      margin: "6px 0 0 0",
      color: "#ffffff",
      fontSize: "0.92rem",
      fontWeight: 700,
    },
    infoChipRow: {
      display: "flex",
      flexWrap: "wrap",
      gap: 8,
    },
    infoChip: {
      borderRadius: 999,
      border: "1px solid rgba(164, 201, 252, 0.32)",
      background: "rgba(164, 201, 252, 0.12)",
      color: "#a4c9fc",
      padding: "6px 10px",
      fontSize: "0.66rem",
      fontWeight: 700,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
    },
    avatarPanel: {
      width: "100%",
      maxWidth: "100%",
      minHeight: 600,
      background:
        "radial-gradient(circle at 50% 28%, rgba(54, 38, 206, 0.18) 0%, rgba(13, 20, 29, 0.96) 58%, rgba(8, 15, 24, 0.98) 100%)",
      borderRadius: 20,
      boxShadow: "0 0 40px rgba(7, 16, 28, 0.42), 0 0 0 1px rgba(255, 255, 255, 0.08) inset",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
      border: "1px solid rgba(164, 201, 252, 0.24)",
      boxSizing: "border-box",
    },
    canvasHint: {
      position: "absolute",
      top: 14,
      right: 14,
      borderRadius: 999,
      border: "1px solid rgba(255, 255, 255, 0.1)",
      background: "rgba(8, 15, 24, 0.72)",
      color: "#c3c6d0",
      fontSize: "0.64rem",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      fontWeight: 700,
      padding: "7px 10px",
      zIndex: 2,
    },
    controlBar: {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      marginTop: 10,
      marginBottom: 2,
      padding: "10px 12px",
      borderRadius: 14,
      border: "1px solid rgba(255, 255, 255, 0.08)",
      background: "rgba(8, 15, 24, 0.72)",
      boxSizing: "border-box",
    },
    controlInfo: {
      margin: 0,
      color: "#c3c6d0",
      fontSize: "0.76rem",
      lineHeight: 1.4,
      letterSpacing: "0.01em",
    },
    controlPills: {
      display: "flex",
      flexWrap: "wrap",
      gap: 8,
      alignItems: "center",
    },
    controlPill: {
      borderRadius: 999,
      border: "1px solid rgba(164, 201, 252, 0.3)",
      background: "rgba(164, 201, 252, 0.12)",
      color: "#a4c9fc",
      padding: "6px 10px",
      fontSize: "0.66rem",
      fontWeight: 700,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
    },
    actions: {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      width: "100%",
      marginTop: 14,
    },
    primaryButton: {
      border: "none",
      borderRadius: 999,
      padding: "12px 18px",
      cursor: "pointer",
      background: "linear-gradient(135deg, #3626ce 0%, #5f0b7e 100%)",
      color: "#ffffff",
      fontWeight: 700,
      letterSpacing: "0.04em",
      fontSize: "0.8rem",
      boxShadow: "0 12px 22px rgba(40, 30, 104, 0.42)",
      minWidth: 188,
      transition: "all 220ms ease",
    },
    secondaryButton: {
      border: "1px solid rgba(255, 255, 255, 0.12)",
      borderRadius: 999,
      padding: "12px 18px",
      cursor: "pointer",
      background: "rgba(8, 15, 24, 0.75)",
      color: "#c3c6d0",
      fontWeight: 600,
      letterSpacing: "0.03em",
      fontSize: "0.8rem",
      minWidth: 188,
      transition: "all 220ms ease",
    },
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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Manrope:wght@400;500;600;700&display=swap');

        .avatar-nav-item:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(164, 201, 252, 0.24);
          transform: translateX(4px);
        }
        .avatar-action-primary:hover {
          transform: translateY(-1px);
          filter: brightness(1.05);
          box-shadow: 0 16px 28px rgba(40, 30, 104, 0.56);
        }
        .avatar-action-secondary:hover {
          transform: translateY(-1px);
          background: rgba(255, 255, 255, 0.09);
          color: #ffffff;
          border-color: rgba(164, 201, 252, 0.3);
        }
        @keyframes avatarPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        @media (max-width: 1220px) {
          .avatar-sidebar {
            position: static !important;
            width: auto !important;
            margin: 18px;
          }
          .avatar-main {
            margin-left: 18px !important;
            margin-right: 18px !important;
            padding-top: 4px !important;
          }
        }
        @media (max-width: 980px) {
          .avatar-stage-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <DashboardSidebar />

      <main style={styles.main} className="avatar-main">
        <div style={styles.mainInner}>
          <header style={styles.pageHeader}>
            <div>
              <h2 style={styles.headerTitle}>Your Digital Twin</h2>
              <p style={styles.headerSub}>
                Avatar generated successfully from your inputs. Inspect details, download your model, or continue to garment selection.
              </p>
            </div>
            <div style={styles.statusBadge}>
              <span style={styles.dot} />
              <span>Viewer Online</span>
            </div>
          </header>

          <section style={styles.stageCard}>
            <div style={styles.stageGrid} className="avatar-stage-grid">
              <div>
                <div style={styles.avatarPanel}>
                  <div style={styles.canvasHint}>360 Viewer</div>
                  <AvatarCanvas modelPath={avatarValue || "/models/final_avatar.obj"} />
                </div>

                <div style={styles.controlBar}>
                  <p style={styles.controlInfo}>Drag to rotate 360°. Scroll to zoom. Right-click drag to orbit view.</p>
                  <div style={styles.controlPills}>
                    <span style={styles.controlPill}>Rotate</span>
                    <span style={styles.controlPill}>Zoom</span>
                    <span style={styles.controlPill}>Orbit</span>
                  </div>
                </div>

                <div style={styles.actions}>
                  <button
                    type="button"
                    style={styles.primaryButton}
                    className="avatar-action-primary"
                    onClick={handleSelectGarment}
                  >
                    Select Garment
                  </button>

                  <button
                    type="button"
                    style={styles.secondaryButton}
                    className="avatar-action-secondary"
                    onClick={handleDownloadAvatar}
                  >
                    Download Avatar
                  </button>

                  <button
                    type="button"
                    style={styles.secondaryButton}
                    className="avatar-action-secondary"
                    onClick={handleTryAgain}
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </section>
          </div>
      </main>
    </div>
  );
}

export default AvatarViewer;