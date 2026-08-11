import AvatarCanvas from "./components/AvatarCanvas";
import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardSidebar from "./components/DashboardSidebar";
import { useAppTheme } from "./theme";
import API_URL from "./config";

function AvatarViewer() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useAppTheme();

  const avatarValue = useMemo(() => {
    const candidates = [
      location.state?.avatarUrl,
      location.state?.avatar_file,
      location.state?.avatarFile,
      localStorage.getItem("avatarUrl"),
      localStorage.getItem("avatar_file"),
      localStorage.getItem("generatedAvatar"),
    ];

    const cleanApiUrl = API_URL.replace(/\/$/, "");

    for (const value of candidates) {
      if (typeof value !== "string" || !value.trim()) {
        continue;
      }

      const trimmed = value.trim();

      // Accept only avatars served by the current backend
      if (trimmed.startsWith(`${cleanApiUrl}/generated-avatars/`)) {
        return trimmed;
      }

      // Accept relative generated-avatar URLs
      if (trimmed.startsWith("/generated-avatars/")) {
        return `${cleanApiUrl}${trimmed}`;
      }
    }

    return null;
  }, [location.state]);

  console.log("avatarValue =", avatarValue);

  const handleDownloadAvatar = () => {
    if (!avatarValue) {
      alert("No generated avatar is available to download.");
      return;
    }

    const link = document.createElement("a");

    link.href = avatarValue;

    const cleanUrl = avatarValue.split("?")[0];
    const fileName =
      cleanUrl.split("/").pop() || "generated_avatar.obj";

    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSelectGarment = () => {
    if (!avatarValue) {
      alert("Please generate an avatar first.");
      return;
    }

    navigate("/catalog", {
      state: {
        avatarUrl: avatarValue,
      },
    });
  };

  const handleTryAgain = () => {
    navigate("/dashboard?regen=true", {
      replace: true,
    });
  };

  const styles = {
    page: {
      minHeight: "100vh",
      width: "100vw",
      background: isDark
        ? "radial-gradient(circle at 12% 16%, rgba(54, 38, 206, 0.22) 0%, transparent 38%), radial-gradient(circle at 88% 84%, rgba(95, 11, 126, 0.24) 0%, transparent 48%), linear-gradient(155deg, #090f17 0%, #0d141d 48%, #111a27 100%)"
        : "radial-gradient(circle at 12% 16%, rgba(78, 107, 255, 0.16) 0%, transparent 38%), radial-gradient(circle at 88% 84%, rgba(138, 92, 255, 0.12) 0%, transparent 48%), linear-gradient(155deg, #f7f9ff 0%, #edf2ff 48%, #eaf0fb 100%)",
      color: isDark ? "#dce3f0" : "#152033",
      fontFamily: "'Manrope', 'Segoe UI', sans-serif",
      padding: 0,
      margin: 0,
      boxSizing: "border-box",
      overflowX: "hidden",
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
      color: isDark ? "#ffffff" : "#152033",
      letterSpacing: "-0.02em",
      lineHeight: 1.1,
      fontWeight: 800,
      fontFamily: "'Plus Jakarta Sans', 'Manrope', sans-serif",
    },

    headerSub: {
      margin: "8px 0 0 0",
      fontSize: "0.97rem",
      color: isDark ? "#c3c6d0" : "#5f6b7c",
      lineHeight: 1.5,
      maxWidth: 700,
    },

    statusBadge: {
      padding: "9px 14px",
      borderRadius: 999,
      border: isDark
        ? "1px solid rgba(255, 255, 255, 0.08)"
        : "1px solid rgba(18, 30, 52, 0.1)",
      background: isDark
        ? "rgba(21, 28, 38, 0.72)"
        : "rgba(255, 255, 255, 0.86)",
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      fontSize: "0.7rem",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.1em",
      color: isDark ? "#c3c6d0" : "#526078",
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
      background: isDark
        ? "rgba(21, 28, 38, 0.65)"
        : "rgba(255, 255, 255, 0.88)",
      border: isDark
        ? "1px solid rgba(255, 255, 255, 0.07)"
        : "1px solid rgba(18, 30, 52, 0.08)",
      borderRadius: 22,
      backdropFilter: "blur(24px)",
      boxShadow: isDark
        ? "0 22px 44px rgba(5, 12, 22, 0.34)"
        : "0 22px 44px rgba(83, 96, 117, 0.12)",
      boxSizing: "border-box",
      padding: 24,
    },

    stageGrid: {
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: 14,
      alignItems: "stretch",
    },

    avatarPanel: {
      width: "100%",
      maxWidth: "100%",
      minHeight: 600,
      background: isDark
        ? "radial-gradient(circle at 50% 28%, rgba(54, 38, 206, 0.18) 0%, rgba(13, 20, 29, 0.96) 58%, rgba(8, 15, 24, 0.98) 100%)"
        : "radial-gradient(circle at 50% 28%, rgba(78, 107, 255, 0.12) 0%, rgba(245, 248, 255, 0.96) 58%, rgba(235, 241, 252, 0.98) 100%)",
      borderRadius: 20,
      boxShadow: isDark
        ? "0 0 40px rgba(7, 16, 28, 0.42), 0 0 0 1px rgba(255, 255, 255, 0.08) inset"
        : "0 0 40px rgba(83, 96, 117, 0.12), 0 0 0 1px rgba(18, 30, 52, 0.06) inset",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
      border: isDark
        ? "1px solid rgba(164, 201, 252, 0.24)"
        : "1px solid rgba(78, 107, 255, 0.18)",
      boxSizing: "border-box",
    },

    canvasHint: {
      position: "absolute",
      top: 14,
      right: 14,
      borderRadius: 999,
      border: isDark
        ? "1px solid rgba(255, 255, 255, 0.1)"
        : "1px solid rgba(18, 30, 52, 0.1)",
      background: isDark
        ? "rgba(8, 15, 24, 0.72)"
        : "rgba(255, 255, 255, 0.88)",
      color: isDark ? "#c3c6d0" : "#526078",
      fontSize: "0.64rem",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      fontWeight: 700,
      padding: "7px 10px",
      zIndex: 2,
    },

    emptyState: {
      color: isDark ? "#c3c6d0" : "#526078",
      textAlign: "center",
      padding: 30,
      maxWidth: 430,
      position: "relative",
      zIndex: 3,
    },

    emptyTitle: {
      color: isDark ? "#ffffff" : "#152033",
      margin: "0 0 10px 0",
      fontSize: "1.35rem",
      fontWeight: 800,
      fontFamily: "'Plus Jakarta Sans', 'Manrope', sans-serif",
    },

    emptyText: {
      lineHeight: 1.6,
      margin: "0 0 20px 0",
      fontSize: "0.92rem",
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
      border: isDark
        ? "1px solid rgba(255, 255, 255, 0.08)"
        : "1px solid rgba(18, 30, 52, 0.08)",
      background: isDark
        ? "rgba(8, 15, 24, 0.72)"
        : "rgba(255, 255, 255, 0.82)",
      boxSizing: "border-box",
    },

    controlInfo: {
      margin: 0,
      color: isDark ? "#c3c6d0" : "#526078",
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
      border: isDark
        ? "1px solid rgba(164, 201, 252, 0.3)"
        : "1px solid rgba(78, 107, 255, 0.25)",
      background: isDark
        ? "rgba(164, 201, 252, 0.12)"
        : "rgba(78, 107, 255, 0.08)",
      color: isDark ? "#a4c9fc" : "#4e6bff",
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
      background:
        "linear-gradient(135deg, #3626ce 0%, #5f0b7e 100%)",
      color: "#ffffff",
      fontWeight: 700,
      letterSpacing: "0.04em",
      fontSize: "0.8rem",
      boxShadow: "0 12px 22px rgba(40, 30, 104, 0.42)",
      minWidth: 188,
      transition: "all 220ms ease",
    },

    secondaryButton: {
      border: isDark
        ? "1px solid rgba(255, 255, 255, 0.12)"
        : "1px solid rgba(18, 30, 52, 0.12)",
      borderRadius: 999,
      padding: "12px 18px",
      cursor: "pointer",
      background: isDark
        ? "rgba(8, 15, 24, 0.75)"
        : "rgba(255, 255, 255, 0.85)",
      color: isDark ? "#c3c6d0" : "#526078",
      fontWeight: 600,
      letterSpacing: "0.03em",
      fontSize: "0.8rem",
      minWidth: 188,
      transition: "all 220ms ease",
    },
  };

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Manrope:wght@400;500;600;700&display=swap');

        .avatar-action-primary:hover {
          transform: translateY(-1px);
          filter: brightness(1.05);
          box-shadow: 0 16px 28px rgba(40, 30, 104, 0.56);
        }

        .avatar-action-secondary:hover {
          transform: translateY(-1px);
        }

        @keyframes avatarPulse {
          0%, 100% {
            opacity: 0.4;
          }

          50% {
            opacity: 1;
          }
        }

        @media (max-width: 1220px) {
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

      <main
        style={styles.main}
        className="avatar-main"
      >
        <div style={styles.mainInner}>
          <header style={styles.pageHeader}>
            <div>
              <h2 style={styles.headerTitle}>
                Your Digital Twin
              </h2>

              <p style={styles.headerSub}>
                {avatarValue
                  ? "Avatar generated successfully from your inputs. Inspect details, download your model, or continue to garment selection."
                  : "Generate an avatar from the dashboard to view your personalized 3D model here."}
              </p>
            </div>

            <div style={styles.statusBadge}>
              <span style={styles.dot} />

              <span>
                {avatarValue
                  ? "Viewer Online"
                  : "Waiting for Avatar"}
              </span>
            </div>
          </header>

          <section style={styles.stageCard}>
            <div
              style={styles.stageGrid}
              className="avatar-stage-grid"
            >
              <div>
                <div style={styles.avatarPanel}>
                  <div style={styles.canvasHint}>
                    360 Viewer
                  </div>

                  {avatarValue ? (
                    <AvatarCanvas
                      modelPath={avatarValue}
                    />
                  ) : (
                    <div style={styles.emptyState}>
                      <h3 style={styles.emptyTitle}>
                        No generated avatar available
                      </h3>

                      <p style={styles.emptyText}>
                        Generate a new avatar from the dashboard using your
                        front, side, and back photos together with your height.
                      </p>

                      <button
                        type="button"
                        style={styles.primaryButton}
                        className="avatar-action-primary"
                        onClick={handleTryAgain}
                      >
                        Generate Avatar
                      </button>
                    </div>
                  )}
                </div>

                {avatarValue && (
                  <div style={styles.controlBar}>
                    <p style={styles.controlInfo}>
                      Drag to rotate 360°. Scroll to zoom.
                      Right-click drag to orbit view.
                    </p>

                    <div style={styles.controlPills}>
                      <span style={styles.controlPill}>
                        Rotate
                      </span>

                      <span style={styles.controlPill}>
                        Zoom
                      </span>

                      <span style={styles.controlPill}>
                        Orbit
                      </span>
                    </div>
                  </div>
                )}

                <div style={styles.actions}>
                  {avatarValue && (
                    <>
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
                    </>
                  )}

                  {avatarValue && (
  <button
    type="button"
    style={styles.secondaryButton}
    className="avatar-action-secondary"
    onClick={handleTryAgain}
  >
    Try Again
  </button>
)}
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