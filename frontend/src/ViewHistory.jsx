import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ViewHistory() {
  const navigate = useNavigate();
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
      width: "100vw",
      background:
        "radial-gradient(circle at 12% 16%, rgba(54, 38, 206, 0.22) 0%, transparent 38%), radial-gradient(circle at 88% 84%, rgba(95, 11, 126, 0.24) 0%, transparent 48%), linear-gradient(155deg, #090f17 0%, #0d141d 48%, #111a27 100%)",
      color: "#dce3f0",
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
      width: 292,
      borderRadius: 28,
      border: "1px solid rgba(255, 255, 255, 0.1)",
      background: "rgba(21, 28, 38, 0.68)",
      backdropFilter: "blur(24px)",
      padding: 24,
      display: "flex",
      flexDirection: "column",
      gap: 14,
      zIndex: 20,
      boxShadow: "0 28px 56px rgba(5, 12, 22, 0.56)",
      boxSizing: "border-box",
    },
    sidebarSection: { display: "flex", flexDirection: "column", gap: 6 },
    navButton: {
      width: "100%",
      border: "1px solid transparent",
      borderRadius: 999,
      padding: "12px 14px",
      color: "#c3c0ff",
      background: "rgba(255, 255, 255, 0.01)",
      fontSize: "0.93rem",
      fontWeight: 600,
      display: "flex",
      alignItems: "center",
      gap: 10,
      textAlign: "left",
      cursor: "pointer",
      transition: "all 220ms ease",
    },
    main: { marginLeft: 346, marginRight: 26, paddingTop: 34, paddingBottom: 28, boxSizing: "border-box" },
    mainInner: { width: "100%", maxWidth: 1320, margin: "0 auto", display: "flex", flexDirection: "column", gap: 22 },
    headerTitle: { margin: 0, fontSize: "1.86rem", color: "#ffffff", fontWeight: 800 },
    card: { padding: 20, borderRadius: 18, background: "rgba(21,28,38,0.66)", border: "1px solid rgba(255,255,255,0.06)", boxSizing: "border-box" },
    listItem: { padding: 12, borderRadius: 12, background: "rgba(8,15,24,0.72)", border: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between", gap: 12 },
    empty: { padding: 28, borderRadius: 14, textAlign: "center", color: "#aab8cd" },
    actionsRow: { display: "flex", gap: 10, marginTop: 12 },
    primaryButton: { border: "none", borderRadius: 999, padding: "10px 14px", background: "linear-gradient(135deg, #3626ce 0%, #5f0b7e 100%)", color: "#fff", cursor: "pointer" },
    ghostButton: { border: "1px solid rgba(255,255,255,0.08)", borderRadius: 999, padding: "10px 14px", background: "rgba(8,15,24,0.75)", color: "#c3c6d0", cursor: "pointer" },
  };

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar} className="history-sidebar">
        <div>
          <h1 style={{ margin: 0, fontSize: "1.22rem", fontWeight: 800, color: "#fff" }}>VirtuFit 3D</h1>
          <p style={{ margin: "4px 0 18px 0", color: "rgba(195, 198, 208, 0.72)", fontSize: "0.66rem", fontWeight: 700 }}>VirtuFit 3D</p>
        </div>

        <nav style={styles.sidebarSection}>
          <button type="button" style={styles.navButton} onClick={() => navigate("/profile") }>
            <span>◈</span>
            <span>Dashboard</span>
          </button>
          <button type="button" style={styles.navButton} onClick={() => navigate("/avatar-viewer")}>
            <span>◌</span>
            <span>View Avatar</span>
          </button>
          <button type="button" style={styles.navButton} onClick={() => navigate("/catalog")}>
            <span>◍</span>
            <span>Garment Catalog</span>
          </button>
          <button type="button" style={{ ...styles.navButton, ...{ background: "linear-gradient(135deg, #3626ce 0%, #5f0b7e 100%)", color: "#fff" } }}>
            <span>◎</span>
            <span>View History</span>
          </button>
          <button type="button" style={styles.navButton} onClick={() => navigate("/dashboard")}>
            <span>◔</span>
            <span>Notifications</span>
          </button>
        </nav>

        <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button type="button" style={styles.navButton} onClick={() => navigate("/dashboard")}>
            <span>◉</span>
            <span>Profile</span>
          </button>
          <button type="button" style={styles.navButton} onClick={() => navigate("/dashboard")}>
            <span>◒</span>
            <span>Settings</span>
          </button>
          <button type="button" style={styles.navButton} onClick={() => { localStorage.removeItem("token"); navigate("/login"); }}>
            <span>⎋</span>
            <span>Logout</span>
          </button>

          <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: "999px", background: "linear-gradient(145deg, #3626ce 0%, #5f0b7e 100%)", display: "grid", placeItems: "center", color: "#fff" }}>AI</div>
            <div>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "#f3f6ff", fontWeight: 700 }}>{email || "VirtuFit 3D"}</p>
              <p style={{ margin: "2px 0 0 0", fontSize: "0.62rem", color: "rgba(195,198,208,0.78)", textTransform: "uppercase", fontWeight: 700 }}>History</p>
            </div>
          </div>
        </div>
      </aside>

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
