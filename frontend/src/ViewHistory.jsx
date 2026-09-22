import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "./components/DashboardSidebar";
import { useAppTheme } from "./theme";

function ViewHistory() {
  const navigate = useNavigate();
  const { isDark } = useAppTheme();
  const email = localStorage.getItem("userEmail");

  const [historyItems, setHistoryItems] = useState([]);

  useEffect(() => {
    const loadFitHistory = async () => {
      try {
        const userId = localStorage.getItem("userId");

        if (!userId) {
          setHistoryItems([]);
          return;
        }

        const API_URL =
          import.meta.env.VITE_API_URL ||
          "http://localhost:3000";

        const response = await fetch(
          `${API_URL}/fit-history/${userId}`
        );

        if (!response.ok) {
          throw new Error(
            `Failed to load history: ${response.status}`
          );
        }

        const data = await response.json();

        console.log(
          "FIT HISTORY RECEIVED:",
          data.fitAnalyses
        );

        setHistoryItems(
          data.fitAnalyses || []
        );
      } catch (error) {
        console.error(
          "LOAD FIT HISTORY ERROR:",
          error
        );

        setHistoryItems([]);
      }
    };

    loadFitHistory();
  }, []);

  const handleClear = async () => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      alert("User information not found.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to clear all saved fit analyses?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const API_URL =
        import.meta.env.VITE_API_URL ||
        "http://localhost:3000";

      const response = await fetch(
        `${API_URL}/fit-history/${userId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to clear history: ${response.status}`
        );
      }

      const data = await response.json();

      console.log(
        "FIT HISTORY CLEARED:",
        data
      );

      setHistoryItems([]);

      alert("Fit history cleared successfully.");
    } catch (error) {
      console.error(
        "CLEAR FIT HISTORY ERROR:",
        error
      );

      alert("Could not clear fit history.");
    }
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
                  {historyItems.map((it) => (
                    <div
                      key={it.id}
                      style={{
                        ...styles.listItem,
                        flexDirection: "column",
                        gap: 14,
                        padding: 18,
                      }}
                    >
                      {/* Garment + saved date */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: 16,
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontWeight: 800,
                              color: isDark ? "#ffffff" : "#152033",
                              fontSize: "1rem",
                            }}
                          >
                            {it.garment_name || "Unknown Garment"}
                          </div>

                          <div
                            style={{
                              color: isDark ? "#aeb8ca" : "#667085",
                              fontSize: "0.84rem",
                              marginTop: 4,
                            }}
                          >
                            Selected Size: {it.garment_size || "Not selected"}
                          </div>
                        </div>

                        <div
                          style={{
                            color: isDark ? "#8d96a8" : "#778197",
                            fontSize: "0.8rem",
                            textAlign: "right",
                          }}
                        >
                          {it.created_at
                            ? new Date(it.created_at).toLocaleString()
                            : "—"}
                        </div>
                      </div>

                      {/* Fit regions */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(3, minmax(0, 1fr))",
                          gap: 10,
                        }}
                      >
                        {[
                          {
                            name: "Chest",
                            status: it.chest_status,
                            distance: it.chest_distance,
                          },
                          {
                            name: "Waist",
                            status: it.waist_status,
                            distance: it.waist_distance,
                          },
                          {
                            name: "Hip",
                            status: it.hip_status,
                            distance: it.hip_distance,
                          },
                        ].map((region) => (
                          <div
                            key={region.name}
                            style={{
                              padding: "12px 14px",
                              borderRadius: 12,
                              background: isDark
                                ? "rgba(255,255,255,0.035)"
                                : "rgba(18,30,52,0.035)",
                              border: isDark
                                ? "1px solid rgba(255,255,255,0.06)"
                                : "1px solid rgba(18,30,52,0.07)",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "0.76rem",
                                color: isDark
                                  ? "#8f9bad"
                                  : "#667085",
                                marginBottom: 5,
                              }}
                            >
                              {region.name}
                            </div>

                            <div
                              style={{
                                fontWeight: 800,
                                color:
                                  region.status === "Tight"
                                    ? "#ff6b7a"
                                    : region.status === "Loose"
                                    ? "#67b7ff"
                                    : "#5ad989",
                              }}
                            >
                              {region.status || "Unknown"}
                            </div>

                            {region.distance != null && (
                              <div
                                style={{
                                  marginTop: 4,
                                  fontSize: "0.72rem",
                                  color: isDark
                                    ? "#7f899a"
                                    : "#7a8497",
                                }}
                              >
                                Distance: {Number(region.distance).toFixed(4)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Recommendation */}
                      {it.recommendation && (
                        <div
                          style={{
                            paddingTop: 12,
                            borderTop: isDark
                              ? "1px solid rgba(255,255,255,0.06)"
                              : "1px solid rgba(18,30,52,0.07)",
                            color: isDark ? "#bac4d4" : "#536078",
                            fontSize: "0.86rem",
                            lineHeight: 1.6,
                          }}
                        >
                          <strong
                            style={{
                              color: isDark ? "#ffffff" : "#152033",
                            }}
                          >
                            Recommendation:
                          </strong>{" "}
                          {it.recommendation}
                        </div>
                      )}
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
