
import React from "react";
import { useLocation } from "react-router-dom";
import AvatarCanvas from "./components/AvatarCanvas";
import DashboardSidebar from "./components/DashboardSidebar";
import { useAppTheme } from "./theme";

const fitData = [
  { region: "Chest", status: "Tight", color: "#ff6b7a" },
  { region: "Waist", status: "Perfect", color: "#5ad989" },
  { region: "Hip", status: "Loose", color: "#67b7ff" },
];

export default function TryOn() {
  const location = useLocation();
  const { isDark } = useAppTheme();
  const { garment, selectedSize, avatarUrl } = location.state || {};

  const colors = isDark
    ? {
        pageBackground:
         "radial-gradient(circle at 12% 14%, rgba(54, 38, 206, 0.22) 0%, transparent 34%), radial-gradient(circle at 86% 84%, rgba(95, 11, 126, 0.2) 0%, transparent 44%), linear-gradient(155deg, #090f17 0%, #0d141d 46%, #111a27 100%)",
        cardBackground: "rgba(21, 28, 38, 0.68)",
        panelBackground: "rgba(9, 15, 24, 0.94)",
        panelBorder: "1px solid rgba(255, 255, 255, 0.08)",
        text: "#dce3f0",
        heading: "#ffffff",
        muted: "#c3c6d0",
        subtext: "#b8bfd0",
        recommendationBg: "rgba(26, 35, 49, 0.76)",
        recommendationText: "#dfe7f8",
        chipText: "#c3c6d0",
        chipBg: "rgba(8, 15, 24, 0.78)",
        buttonBg: "linear-gradient(135deg, #3626ce 0%, #5f0b7e 100%)",
        previewBarBg: "rgba(8, 15, 24, 0.72)",
        previewText: "#edf4ff",
        previewMeta: "#b7c3d9",
      }
    : {
        pageBackground:
         "radial-gradient(circle at 12% 14%, rgba(78, 107, 255, 0.16) 0%, transparent 34%), radial-gradient(circle at 86% 84%, rgba(138, 92, 255, 0.12) 0%, transparent 44%), linear-gradient(155deg, #f7f9ff 0%, #edf2ff 46%, #eaf0fb 100%)",
        cardBackground: "rgba(255, 255, 255, 0.76)",
        panelBackground: "rgba(255, 255, 255, 0.9)",
        panelBorder: "1px solid rgba(18, 30, 52, 0.08)",
        text: "#152033",
        heading: "#101b31",
        muted: "#53607d",
        subtext: "#596b86",
        recommendationBg: "rgba(246, 248, 255, 0.95)",
        recommendationText: "#31415d",
        chipText: "#51637d",
        chipBg: "rgba(255,255,255,0.8)",
        buttonBg: "linear-gradient(135deg, #3626ce 0%, #5f0b7e 100%)",
        previewBarBg: "rgba(255, 255, 255, 0.88)",
        previewText: "#17253d",
        previewMeta: "#667b9c",
      };

  const styles = {
    page: {
      minHeight: "100vh",
      width: "100vw",
      background: colors.pageBackground,
      color: colors.text,
      fontFamily: "'Manrope', 'Segoe UI', sans-serif",
      position: "relative",
      overflowX: "hidden",
      boxSizing: "border-box",
    },
    main: {
      marginLeft: 346,
      marginRight: 26,
      paddingTop: 34,
      paddingBottom: 30,
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
    headingWrap: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "end",
      flexWrap: "wrap",
      gap: 16,
      marginBottom: 2,
    },
    eyebrow: {
      margin: 0,
      fontSize: "0.72rem",
      fontWeight: 800,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      color: isDark ? "rgba(195,198,208,0.72)" : "rgba(83,96,117,0.78)",
    },
    heading: {
      margin: "6px 0 0",
      fontSize: "2.28rem",
      fontWeight: 800,
      letterSpacing: "-0.02em",
      lineHeight: 1.1,
      color: colors.heading,
      fontFamily: "'Plus Jakarta Sans', 'Manrope', sans-serif",
    },
    statusChip: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      background: colors.chipBg,
      border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(18,30,52,0.08)",
      borderRadius: 999,
      padding: "9px 14px",
      color: colors.chipText,
      fontSize: "0.7rem",
      fontWeight: 700,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
    },
    chipDot: {
      width: 8,
      height: 8,
      borderRadius: "999px",
      background: "#a4c9fc",
      boxShadow: "0 0 10px rgba(164, 201, 252, 0.8)",
    },
    contentGrid: {
      display: "grid",
      gridTemplateColumns: "minmax(0, 1.1fr) minmax(290px, 0.9fr)",
      gap: 28,
      alignItems: "stretch",
    },
    primaryCard: {
      background: colors.cardBackground,
      border: colors.panelBorder,
      borderRadius: 24,
      boxShadow: isDark ? "0 22px 44px rgba(5,12,22,0.34)" : "0 20px 42px rgba(34,57,95,0.18)",
      backdropFilter: "blur(24px)",
      padding: 28,
      boxSizing: "border-box",
    },
    sectionHeader: {
      margin: 0,
      color: colors.heading,
      fontSize: "1.12rem",
      fontWeight: 800,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
    },
    subtitle: {
      margin: "10px 0 22px",
      color: colors.muted,
      fontSize: "0.98rem",
      lineHeight: 1.6,
      maxWidth: 620,
    },
    avatarCard: {
      background: colors.panelBackground,
      border: colors.panelBorder,
      borderRadius: 22,
      overflow: "hidden",
    },
    avatarViewport: {
      width: "100%",
      height: 580,
      background: isDark ? "radial-gradient(circle at 50% 20%, rgba(143, 113, 255, 0.18) 0%, transparent 26%), linear-gradient(180deg, rgba(9, 15, 24, 0.96) 0%, rgba(13, 21, 31, 0.9) 100%)" : "radial-gradient(circle at 50% 18%, rgba(117, 146, 255, 0.16) 0%, transparent 26%), linear-gradient(180deg, rgba(247, 249, 255, 0.96) 0%, rgba(230, 239, 255, 0.8) 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      padding: 0,
      overflow: "hidden",
    },
    previewBar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 18,
      background: colors.previewBarBg,
      borderTop: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(18,30,52,0.08)",
      padding: "16px 18px",
      boxSizing: "border-box",
    },
    previewTextBlock: {
      display: "flex",
      flexDirection: "column",
      gap: 4,
      minWidth: 0,
    },
    previewTitle: {
      color: colors.previewText,
      fontSize: "1rem",
      fontWeight: 700,
      letterSpacing: "-0.01em",
    },
    previewMeta: {
      color: colors.previewMeta,
      fontSize: "0.78rem",
      fontWeight: 600,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
    },
    view360Button: {
      border: "none",
      borderRadius: 12,
      padding: "11px 16px",
      background: colors.buttonBg,
      color: "#ffffff",
      fontSize: "0.8rem",
      fontWeight: 800,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      cursor: "pointer",
      boxShadow: "0 12px 24px rgba(98, 78, 205, 0.3)",
      flexShrink: 0,
    },
    fitPanel: {
      background: colors.cardBackground,
      border: colors.panelBorder,
      borderRadius: 24,
      boxShadow: isDark ? "0 22px 44px rgba(5,12,22,0.34)" : "0 20px 42px rgba(34,57,95,0.18)",
      backdropFilter: "blur(24px)",
      padding: 28,
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      gap: 18,
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
      boxShadow: "0 12px 24px rgba(98, 78, 205, 0.3)",
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
        avatarUrl,
      }),
    });

    alert("Saved successfully");
  };

  return (
    <div style={styles.page}>
      <DashboardSidebar />

      <main style={styles.main}>
        <div style={styles.mainInner}>
         <div style={styles.headingWrap}>
           <div>
             <p style={styles.eyebrow}>Try-on studio</p>
             <h1 style={styles.heading}>Virtual Fitting Room</h1>
           </div>
           <div style={styles.statusChip}>
             <span style={styles.chipDot} />
             Live preview
           </div>
         </div>

         <div style={styles.contentGrid}>
           <section style={styles.primaryCard}>
             <h2 style={styles.sectionHeader}>Your Digital Twin</h2>
             <p style={styles.subtitle}>
               Experience precision fit with your personalized high-fidelity 3D avatar.
             </p>

             <div style={styles.avatarCard}>
               <div style={styles.avatarViewport}>
                 <AvatarCanvas
                   modelPath={avatarUrl || "/models/final_avatar.obj"}
                   backgroundMode={localStorage.getItem("viewer-background") || "dark"}
                 />
               </div>

               <div style={styles.previewBar}>
                 <div style={styles.previewTextBlock}>
                   <span style={styles.previewTitle}>
                     {garment ? `${garment.title || garment.name} Preview` : "3D Human Avatar Preview"}
                   </span>
                   <span style={styles.previewMeta}>
                     {selectedSize
                       ? `Selected size: ${selectedSize}`
                       : "Real-time photorealistic simulation enabled"}
                   </span>
                 </div>

                 <button
                   type="button"
                   style={styles.view360Button}
                   onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                 >
                   View in 360
                 </button>
               </div>
             </div>
           </section>

           <aside style={styles.fitPanel}>
             <h2 style={styles.sectionHeader}>Fit Analysis</h2>
             <p style={styles.fitSubtitle}>
               Simulation complete based on your digital twin measurements
             </p>

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
           </aside>
         </div>
        </div>
      </main>
    </div>
  );
}
