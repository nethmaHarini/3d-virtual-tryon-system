import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "./components/DashboardSidebar";
import { useAppTheme } from "./theme";

function ViewHistory() {
  const navigate = useNavigate();
  const { isDark } = useAppTheme();
  const email = localStorage.getItem("userEmail");

  const [historyItems, setHistoryItems] = useState([]);

  // For now this loads from localStorage as demo data; replace with API call when available
  useEffect(() => {
    try {
      const stored = localStorage.getItem("viewHistory");
      if (stored) {
        setHistoryItems(JSON.parse(stored));
      } else {
        setHistoryItems([]);
      }
    } catch (e) {
      setHistoryItems([]);
    }
  }, []);

  const handleClear = () => {
    localStorage.removeItem("viewHistory");
    setHistoryItems([]);
  };

  const styles = {
    page: {
      minHeight: "100vh",
      width: "100%",
      minWidth: 0,
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
      notifyDot: { marginLeft: 8, display: 'inline-block', minWidth: 18, height: 18, borderRadius: 18, background: 'linear-gradient(90deg,#6f3af2,#a746d1)', color: '#fff', fontSize: 11, lineHeight: '18px', textAlign: 'center', fontWeight: 800 },
    sidebarSection: { display: "flex", flexDirection: "column", gap: 6 },
    sidebarHeader: { color: 'rgba(173,182,204,0.7)', fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', margin: '2px 0 6px 0' },
    navButton: {
      width: "100%",
      border: "1px solid transparent",
      borderRadius: 999,
      padding: "10px 12px",
      color: "#c3c0ff",
      background: "transparent",
      fontSize: "0.95rem",
      fontWeight: 700,
      display: "flex",
      alignItems: "center",
      gap: 10,
      textAlign: "left",
      cursor: "pointer",
      transition: "all 180ms ease",
    },
    main: { marginLeft: 286, marginRight: 32, paddingTop: 28, paddingBottom: 32, minWidth: 0, boxSizing: "border-box" },
    mainInner: { width: "100%", maxWidth: 1400, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24, minWidth: 0 },
    headerTitle: { margin: 0, fontSize: "1.86rem", color: isDark ? "#ffffff" : "#152033", fontWeight: 800 },
    card: { padding: 20, borderRadius: 18, background: isDark ? "rgba(21,28,38,0.66)" : "rgba(255,255,255,0.9)", border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(18, 30, 52, 0.08)", boxSizing: "border-box" },
    listItem: { padding: 12, borderRadius: 12, background: isDark ? "rgba(8,15,24,0.72)" : "rgba(247,249,255,0.95)", border: isDark ? "1px solid rgba(255,255,255,0.04)" : "1px solid rgba(18, 30, 52, 0.06)", display: "flex", justifyContent: "space-between", gap: 12 },
    empty: { padding: 28, borderRadius: 14, textAlign: "center", color: isDark ? "#aab8cd" : "#5b6880" },
    actionsRow: { display: "flex", gap: 10, marginTop: 12 },
    primaryButton: { border: "none", borderRadius: 999, padding: "10px 14px", background: isDark ? "linear-gradient(135deg, #3626ce 0%, #5f0b7e 100%)" : "linear-gradient(135deg, #4e6bff 0%, #8a5cff 100%)", color: "#fff", cursor: "pointer" },
    ghostButton: { border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(18, 30, 52, 0.08)", borderRadius: 999, padding: "10px 14px", background: isDark ? "rgba(8,15,24,0.75)" : "rgba(255,255,255,0.85)", color: isDark ? "#c3c6d0" : "#425277", cursor: "pointer" },
  };

  return (
    <div style={styles.page}>
      <DashboardSidebar />

      <main style={styles.main} className="history-main">
        <div style={styles.mainInner}>
          <header>
            <h2 style={styles.headerTitle}>View History</h2>
            <p style={{ color: "#c3c6d0" }}>A history of your activity — generated avatars, tried-on garments, and recent interactions.</p>
          </header>

          <section style={styles.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, color: "#fff" }}>Recent Activity</h3>
              <div style={styles.actionsRow}>
                <button type="button" style={styles.ghostButton} onClick={() => navigate("/catalog")}>
                  Browse Garments
                </button>
                <button type="button" style={styles.primaryButton} onClick={handleClear}>
                  Clear History
                </button>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              {historyItems.length === 0 ? (
                <div style={styles.empty}>No history available yet.</div>
              ) : (
                <div style={{ display: "grid", gap: 12 }}>
                  {historyItems.map((it, idx) => (
                    <div key={idx} style={styles.listItem}>
                      <div>
                        <div style={{ fontWeight: 800, color: "#fff" }}>{it.title || "Untitled"}</div>
                        <div style={{ color: "#c3c6d0", fontSize: "0.86rem" }}>{it.subtitle || ""}</div>
                      </div>
                      <div style={{ color: "#8d9199", fontSize: "0.82rem" }}>{it.when || "—"}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default ViewHistory;
