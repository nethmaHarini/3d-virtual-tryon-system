
import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AvatarCanvas from "./components/AvatarCanvas";
import DashboardSidebar from "./components/DashboardSidebar";
import TryOnJourneyBar from "./components/TryOnJourneyBar";
import { useAppTheme } from "./theme";
import API_URL from "./config";

const fitData = [
  { region: "Chest", status: "Tight", color: "#ff6b7a" },
  { region: "Waist", status: "Perfect", color: "#5ad989" },
  { region: "Hip", status: "Loose", color: "#67b7ff" },
];

export default function TryOn() {
  const location = useLocation();
  const { isDark } = useAppTheme();
  const { garment, selectedSize } = location.state || {};
  const navigate = useNavigate();

  const resolvedAvatarUrl = useMemo(() => {
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

      if (trimmed.startsWith(`${cleanApiUrl}/generated-avatars/`)) {
        return trimmed;
      }

      if (trimmed.startsWith("/generated-avatars/")) {
        return `${cleanApiUrl}${trimmed}`;
      }
    }

    return "/models/final_avatar.obj";
  }, [location.state]);

  const colors = isDark
    ? {
        pageBackground:
          "radial-gradient(circle at 12% 16%, rgba(124, 58, 237, 0.14) 0%, transparent 38%), radial-gradient(circle at 88% 84%, rgba(95, 11, 126, 0.12) 0%, transparent 48%), linear-gradient(155deg, #090d16 0%, #0d1320 48%, #101827 100%)",
        cardBackground: "#111827",
        panelBackground: "#161e2e",
        panelBorder: "1px solid #2a3447",
        text: "#f8fafc",
        heading: "#f8fafc",
        muted: "#a7b0c0",
        subtext: "#a7b0c0",
        recommendationBg: "#1b2435",
        recommendationText: "#e2e8f0",
        chipText: "#dbe4f3",
        chipBg: "#111827",
        buttonBg: "linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)",
        previewBarBg: "#111827",
        previewText: "#f8fafc",
        previewMeta: "#a7b0c0",
      }
    : {
        pageBackground:
          "radial-gradient(circle at 12% 16%, rgba(124, 58, 237, 0.1) 0%, transparent 38%), radial-gradient(circle at 88% 84%, rgba(138, 92, 255, 0.08) 0%, transparent 48%), linear-gradient(155deg, #f8fafc 0%, #eef3ff 48%, #edf2ff 100%)",
        cardBackground: "rgba(255, 255, 255, 0.9)",
        panelBackground: "rgba(255, 255, 255, 0.96)",
        panelBorder: "1px solid rgba(18, 30, 52, 0.08)",
        text: "#0f172a",
        heading: "#0f172a",
        muted: "#475569",
        subtext: "#475569",
        recommendationBg: "#f8fafc",
        recommendationText: "#334155",
        chipText: "#334155",
        chipBg: "rgba(255,255,255,0.95)",
        buttonBg: "linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)",
        previewBarBg: "rgba(255, 255, 255, 0.9)",
        previewText: "#0f172a",
        previewMeta: "#64748b",
      };

  const styles = {
    page: {
      minHeight: "100vh",
      width: "100%",
      minWidth: 0,
      background: colors.pageBackground,
      color: colors.text,
      fontFamily: "'Manrope', 'Segoe UI', sans-serif",
      position: "relative",
      overflowX: "hidden",
      boxSizing: "border-box",
    },
    main: {
      marginLeft: 286,
      marginRight: 32,
      paddingTop: 28,
      paddingBottom: 32,
      minWidth: 0,
      boxSizing: "border-box",
    },
    mainInner: {
      width: "100%",
      maxWidth: 1400,
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      gap: 24,
      minWidth: 0,
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
      border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(18, 30, 52, 0.1)",
      background: isDark ? "rgba(21, 28, 38, 0.72)" : "rgba(255, 255, 255, 0.86)",
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
    contentGrid: {
      display: "grid",
      gridTemplateColumns: "minmax(0, 1.2fr) minmax(310px, 0.8fr)",
      gap: 28,
      alignItems: "stretch",
    },
    stageCard: {
      width: "100%",
      maxWidth: "100%",
      background: colors.cardBackground,
      border: colors.panelBorder,
      borderRadius: 22,
      backdropFilter: "blur(24px)",
      boxShadow: isDark ? "0 16px 34px rgba(2, 6, 23, 0.28)" : "0 16px 34px rgba(15, 23, 42, 0.08)",
      boxSizing: "border-box",
      padding: 24,
      transition: "box-shadow 180ms ease, border-color 180ms ease",
    },
    avatarPanel: {
      width: "100%",
      minHeight: 600,
      background: isDark
        ? "radial-gradient(circle at 50% 28%, rgba(124, 58, 237, 0.18) 0%, rgba(17, 24, 39, 0.96) 58%, rgba(10, 15, 24, 0.98) 100%)"
        : "radial-gradient(circle at 50% 28%, rgba(124, 58, 237, 0.08) 0%, rgba(245, 248, 255, 0.96) 58%, rgba(235, 241, 252, 0.98) 100%)",
      borderRadius: 20,
      boxShadow: isDark ? "0 0 0 1px rgba(255, 255, 255, 0.06) inset, 0 18px 32px rgba(2, 6, 23, 0.24)" : "0 0 0 1px rgba(17, 24, 39, 0.05) inset, 0 18px 32px rgba(15, 23, 42, 0.08)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
      border: isDark ? "1px solid rgba(124, 58, 237, 0.18)" : "1px solid rgba(124, 58, 237, 0.12)",
    },
    canvasHint: {
      position: "absolute",
      top: 14,
      right: 14,
      borderRadius: 999,
      border: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(18, 30, 52, 0.1)",
      background: isDark ? "rgba(8, 15, 24, 0.72)" : "rgba(255, 255, 255, 0.88)",
      color: isDark ? "#c3c6d0" : "#526078",
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
      border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(18, 30, 52, 0.08)",
      background: isDark ? "rgba(8, 15, 24, 0.72)" : "rgba(255, 255, 255, 0.82)",
      boxSizing: "border-box",
      boxShadow: isDark ? "0 8px 18px rgba(2, 6, 23, 0.16)" : "0 8px 18px rgba(15, 23, 42, 0.04)",
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
      border: isDark ? "1px solid rgba(164, 201, 252, 0.3)" : "1px solid rgba(78, 107, 255, 0.25)",
      background: isDark ? "rgba(164, 201, 252, 0.12)" : "rgba(78, 107, 255, 0.08)",
      color: isDark ? "#a4c9fc" : "#4e6bff",
      padding: "6px 10px",
      fontSize: "0.66rem",
      fontWeight: 700,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
    },
    fitPanel: {
      background: colors.cardBackground,
      border: colors.panelBorder,
      borderRadius: 24,
      boxShadow: isDark ? "0 16px 32px rgba(2, 6, 23, 0.28)" : "0 18px 30px rgba(15, 23, 42, 0.08)",
      backdropFilter: "blur(24px)",
      padding: 28,
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      gap: 18,
      transition: "box-shadow 180ms ease, border-color 180ms ease",
    },
    sectionHeader: {
      margin: 0,
      color: colors.heading,
      fontSize: "1.12rem",
      fontWeight: 800,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
    },
    fitSubtitle: {
      margin: 0,
      color: colors.subtext,
      fontSize: "0.96rem",
      lineHeight: 1.6,
    },
    fitTable: {
      display: "flex",
      flexDirection: "column",
      gap: 10,
      width: "100%",
      background: isDark ? "rgba(8, 15, 24, 0.48)" : "rgba(248, 250, 252, 0.9)",
      borderRadius: 16,
      border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(15, 23, 42, 0.06)",
      padding: "6px 12px",
      boxSizing: "border-box",
    },
    fitRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
      padding: "10px 0",
      borderBottom: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(18,30,52,0.06)",
      color: colors.text,
      fontSize: "1rem",
    },
    fitRegion: {
      fontWeight: 600,
      color: colors.text,
    },
    fitStatus: {
      fontWeight: 800,
      letterSpacing: "0.03em",
    },
    recommendation: {
      background: colors.recommendationBg,
      borderRadius: 16,
      border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(18,30,52,0.06)",
      padding: "16px 18px",
      boxSizing: "border-box",
      color: colors.recommendationText,
      boxShadow: isDark ? "inset 0 1px 0 rgba(255,255,255,0.03)" : "inset 0 1px 0 rgba(255,255,255,0.9)",
    },
    recommendationLabel: {
      margin: 0,
      color: colors.heading,
      fontSize: "0.82rem",
      fontWeight: 800,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
    },
    recommendationText: {
      margin: "10px 0 0",
      color: colors.recommendationText,
      lineHeight: 1.7,
      fontSize: "0.96rem",
    },
    saveButton: {
      marginTop: "auto",
      border: "none",
      borderRadius: 16,
      background: colors.buttonBg,
      color: "#ffffff",
      padding: "16px 20px",
      fontSize: "0.9rem",
      fontWeight: 800,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      cursor: "pointer",
      boxShadow: "0 12px 24px rgba(124, 58, 237, 0.2)",
      transition: "transform 180ms ease, box-shadow 180ms ease, filter 180ms ease",
    },
    tryAnotherButton: {
      marginTop: 12,
      border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(18,30,52,0.08)",
      borderRadius: 16,
      background: "transparent",
      color: isDark ? "#dfe7f8" : "#152033",
      padding: "12px 18px",
      fontSize: "0.88rem",
      fontWeight: 800,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      cursor: "pointer",
      boxShadow: "none",
      transition: "transform 160ms ease, box-shadow 160ms ease, filter 160ms ease",
    },
  };

  const handleSave = async () => {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

    await fetch(`${API_URL}/save-fit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: 1,
        garmentName: garment?.title || garment?.name || "Unknown Garment",
        size: selectedSize || "Not selected",
        chest: "Tight",
        waist: "Perfect",
        hip: "Loose",
        recommendation: "AI recommendation...",
        avatarUrl: resolvedAvatarUrl,
      }),
    });

    alert("Saved successfully");
  };

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Manrope:wght@400;500;600;700&display=swap');

        @keyframes avatarPulse {
         0%, 100% { opacity: 0.4; }
         50% { opacity: 1; }
        }

        @media (max-width: 1220px) {
         .tryon-main { margin-left: 18px !important; margin-right: 18px !important; }
        }

        @media (max-width: 980px) {
         .tryon-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <DashboardSidebar />

      <main style={styles.main} className="tryon-main">
        <div style={styles.mainInner}>
         <TryOnJourneyBar currentStep={3} />

         <header style={styles.pageHeader}>
           <div>
             <h2 style={styles.headerTitle}>Your Digital Twin</h2>
             <p style={styles.headerSub}>
               {resolvedAvatarUrl !== "/models/final_avatar.obj"
                 ? "Avatar generated successfully from your inputs. Inspect details, or continue to garment selection."
                 : "Generate an avatar from the dashboard to view your personalized 3D model here."}
             </p>
           </div>

           <div style={styles.statusBadge}>
             <span style={styles.dot} />
             <span>{resolvedAvatarUrl !== "/models/final_avatar.obj" ? "Viewer Online" : "Waiting for Avatar"}</span>
           </div>
         </header>

         <div style={styles.contentGrid} className="tryon-grid">
           <section style={styles.stageCard}>
             <div style={styles.avatarPanel}>
               <div style={styles.canvasHint}>360 Viewer</div>

               <AvatarCanvas modelPath={resolvedAvatarUrl} backgroundMode={localStorage.getItem("viewer-background") || "dark"} />
             </div>

             <div style={styles.controlBar}>
               <p style={styles.controlInfo}>Drag to rotate 360°. Scroll to zoom. Right-click drag to orbit view.</p>
               <div style={styles.controlPills}>
                 <span style={styles.controlPill}>Rotate</span>
                 <span style={styles.controlPill}>Zoom</span>
                 <span style={styles.controlPill}>Orbit</span>
               </div>
             </div>
           </section>

           <aside style={styles.fitPanel}>
             <h2 style={styles.sectionHeader}>Fit Analysis</h2>
             <p style={styles.fitSubtitle}>Simulation complete based on your digital twin measurements</p>

             <div style={styles.fitTable}>
               {fitData.map(({ region, status, color }) => (
                 <div key={region} style={styles.fitRow}>
                   <span style={styles.fitRegion}>{region}</span>
                   <span style={{ ...styles.fitStatus, color }}>{status}</span>
                 </div>
               ))}
             </div>

             <div style={styles.recommendation}>
               <p style={styles.recommendationLabel}>Recommendation</p>
               <p style={styles.recommendationText}>
                 Based on the fit analysis, the selected size may be slightly tight in the chest region. A larger size or stretch-fit style may provide a more balanced overall fit.
               </p>
             </div>

             <button type="button" style={styles.saveButton} onClick={handleSave}>
               Save Fit Analysis
             </button>

             <button
               type="button"
               style={styles.tryAnotherButton}
               onClick={() => navigate('/catalog')}
               aria-label="Try another garment"
             >
               Try Another Garment
             </button>
           </aside>
         </div>
        </div>
      </main>
    </div>
  );
}
