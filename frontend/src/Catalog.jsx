import React from "react";
import { useNavigate } from "react-router-dom";

import { useState } from "react";

function Catalog() {
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
    heading: {
      color: "#1ce1ff",
      fontWeight: 900,
      fontSize: 34,
      letterSpacing: "0.13em",
      textTransform: "uppercase",
      textAlign: "left",
      margin: "0 0 10px 0",
      textShadow: "0 0 18px #1ce1ff, 0 0 2px #1ce1ff",
    },
    subtitle: {
      color: "#b6d8ff",
      fontWeight: 400,
      fontSize: 18,
      textAlign: "left",
      margin: "0 0 38px 0",
      letterSpacing: "0.01em",
      textShadow: "0 0 8px #1ce1ff33",
    },
    catalogWrap: {
      width: "100%",
      maxWidth: 1280,
      margin: "0 auto",
      padding: "0 32px",
      boxSizing: "border-box",
    },
  };

  const navigate = useNavigate();
  const [tab, setTab] = useState("tshirts");
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Demo product data (static)
  const tshirts = [
    { name: "White Cotton", img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80" },
    { name: "Black Cotton", img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80&sat=0" },
    { name: "Gray Buttoned", img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80&sat=-50" },
    { name: "Highneck T Shirt", img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80&sat=-80" },
    { name: "Red Polo", img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80&sat=100&hue=90" },
  ];
  const trousers = [];

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
      <div className="catalog-content" style={styles.catalogWrap}>
        <div style={styles.heading}>CATALOG</div>
        <div style={styles.subtitle}>Select T-Shirts or Trousers for Try-On Simulation</div>
        {/* Tab Bar */}
        <div style={{ display: "flex", gap: 32, margin: "32px 0 18px 0", borderBottom: "2px solid #232b3a", width: "100%", maxWidth: 900 }}>
          <button
            style={{
              background: "none",
              border: "none",
              color: tab === "tshirts" ? "#eaf6ff" : "#b6d8ff",
              fontWeight: tab === "tshirts" ? 700 : 500,
              fontSize: 20,
              borderBottom: tab === "tshirts" ? "3px solid #1ce1ff" : "none",
              padding: "0 0 8px 0",
              cursor: "pointer",
              outline: "none",
              transition: "color 0.18s, border 0.18s"
            }}
            onClick={() => setTab("tshirts")}
          >
            T-Shirts
          </button>
          <button
            style={{
              background: "none",
              border: "none",
              color: tab === "trousers" ? "#eaf6ff" : "#b6d8ff",
              fontWeight: tab === "trousers" ? 700 : 500,
              fontSize: 20,
              borderBottom: tab === "trousers" ? "3px solid #1ce1ff" : "none",
              padding: "0 0 8px 0",
              cursor: "pointer",
              outline: "none",
              transition: "color 0.18s, border 0.18s"
            }}
            onClick={() => setTab("trousers")}
          >
            Trousers
          </button>
        </div>
        {/* Product Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 32,
          width: "100%",
          maxWidth: 1200,
          margin: "0 auto",
          marginTop: 8,
        }}>
          {(tab === "tshirts" ? tshirts : trousers).map((item, idx) => (
            <div key={item.name + idx} style={{
              background: "#181f2b",
              borderRadius: 16,
              boxShadow: "0 2px 16px #1ce1ff11",
              border: "1.5px solid #232b3a",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-start",
              minHeight: 240,
            }}>
              <img src={item.img} alt={item.name} style={{ width: "100%", height: 180, objectFit: "cover", background: "#222", borderRadius: "16px 16px 0 0" }} />
              <div style={{ width: "100%", padding: "12px 16px 10px 16px", color: "#b6d8ff", fontWeight: 500, fontSize: 15, borderTop: "1px solid #232b3a", background: "#181f2b" }}>{item.name}</div>
            </div>
          ))}
        </div>
        {tab === "trousers" && trousers.length === 0 && (
          <div style={{ color: "#8eb6d6", opacity: 0.7, textAlign: "center", marginTop: 48, fontSize: 18 }}>
            No trousers available yet.
          </div>
        )}
      </div>
    </div>
  );
}

export default Catalog;
