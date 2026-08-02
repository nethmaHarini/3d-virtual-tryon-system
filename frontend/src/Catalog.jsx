
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { useState } from "react";

function Catalog() {
  const location = useLocation();
  const avatarUrl = location.state?.avatarUrl || "/models/final_avatar.obj";
  // --- Styles ---
  const styles = {
    page: {
      minHeight: "100vh",
      width: "100vw",
      background:
        "radial-gradient(circle at 12% 14%, rgba(54, 38, 206, 0.22) 0%, transparent 34%), radial-gradient(circle at 86% 84%, rgba(95, 11, 126, 0.2) 0%, transparent 44%), linear-gradient(155deg, #090f17 0%, #0d141d 46%, #111a27 100%)",
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
      boxShadow: "0 28px 56px rgba(5, 12, 22, 0.56)",
      padding: 24,
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      gap: 14,
      zIndex: 70,
    },
    brand: {
      margin: 0,
      fontSize: "1.2rem",
      color: "#ffffff",
      fontWeight: 800,
      fontFamily: "'Plus Jakarta Sans', 'Manrope', sans-serif",
      letterSpacing: "-0.01em",
    },
    brandTag: {
      margin: "4px 0 18px 0",
      fontSize: "0.66rem",
      color: "rgba(195, 198, 208, 0.72)",
      letterSpacing: "0.2em",
      textTransform: "uppercase",
      fontWeight: 700,
    },
    navPillBase: {
      width: "100%",
      border: "1px solid transparent",
      borderRadius: 999,
      padding: "12px 14px",
      background: "rgba(255,255,255,0.01)",
      color: "#c3c0ff",
      fontSize: "0.92rem",
      fontWeight: 600,
      textAlign: "left",
      display: "flex",
      alignItems: "center",
      gap: 10,
      transition: "all 220ms ease",
    },
    navPillActive: {
      background: "linear-gradient(135deg, #3626ce 0%, #5f0b7e 100%)",
      color: "#ffffff",
      boxShadow: "0 0 20px rgba(164, 201, 252, 0.24)",
    },
    sidebarSection: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
    },
    sidebarFooter: {
      marginTop: "auto",
      paddingTop: 16,
      borderTop: "1px solid rgba(255, 255, 255, 0.06)",
      display: "flex",
      flexDirection: "column",
      gap: 10,
    },
    profilePill: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      background: "rgba(8, 15, 24, 0.9)",
      borderRadius: 16,
      padding: "10px 12px",
      border: "1px solid rgba(255, 255, 255, 0.06)",
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
      color: "#f3f6ff",
      fontWeight: 700,
    },
    profileSubtitle: {
      margin: "2px 0 0 0",
      fontSize: "0.62rem",
      color: "rgba(195, 198, 208, 0.78)",
      letterSpacing: "0.16em",
      textTransform: "uppercase",
      fontWeight: 700,
    },
    main: {
      marginLeft: 346,
      marginRight: 26,
      paddingTop: 34,
      paddingBottom: 28,
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
      marginBottom: 4,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "end",
      flexWrap: "wrap",
      gap: 16,
    },
    heading: {
      margin: 0,
      fontSize: "2.28rem",
      letterSpacing: "-0.02em",
      fontWeight: 800,
      color: "#ffffff",
      lineHeight: 1.1,
      fontFamily: "'Plus Jakarta Sans', 'Manrope', sans-serif",
    },
    subtitle: {
      color: "#c3c6d0",
      fontWeight: 400,
      fontSize: "0.98rem",
      textAlign: "left",
      margin: "8px 0 0 0",
      maxWidth: 760,
      lineHeight: 1.55,
      letterSpacing: "0.01em",
    },
    statusChip: {
      padding: "9px 14px",
      borderRadius: 999,
      border: "1px solid rgba(255, 255, 255, 0.08)",
      background: "rgba(21, 28, 38, 0.72)",
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      fontSize: "0.7rem",
      fontWeight: 700,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: "#c3c6d0",
    },
    chipDot: {
      width: 8,
      height: 8,
      borderRadius: "999px",
      background: "#a4c9fc",
      boxShadow: "0 0 10px rgba(164, 201, 252, 0.8)",
      animation: "catalogPulse 1.4s ease-in-out infinite",
    },
    searchFilterRow: {
      display: "flex",
      gap: 14,
      flexWrap: "wrap",
      alignItems: "center",
      marginBottom: 2,
    },
    searchWrap: {
      minWidth: 250,
      flex: "1 1 320px",
      display: "flex",
      alignItems: "center",
      gap: 8,
      borderRadius: 999,
      border: "1px solid rgba(255,255,255,0.08)",
      background: "rgba(8, 15, 24, 0.74)",
      padding: "10px 14px",
      boxSizing: "border-box",
      color: "#8d9199",
      fontSize: "0.86rem",
    },
    searchInput: {
      flex: 1,
      border: "none",
      background: "transparent",
      outline: "none",
      color: "#dce3f0",
      fontSize: "0.86rem",
    },
    tabBar: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap",
    },
    tabButtonBase: {
      borderRadius: 999,
      padding: "10px 18px",
      fontSize: "0.84rem",
      fontWeight: 700,
      border: "1px solid rgba(255,255,255,0.08)",
      cursor: "pointer",
      transition: "all 220ms ease",
      letterSpacing: "0.02em",
    },
    tabButtonInactive: {
      background: "rgba(36, 42, 52, 0.64)",
      color: "#c3c6d0",
    },
    tabButtonActive: {
      background: "linear-gradient(135deg, #3626ce 0%, #5f0b7e 100%)",
      color: "#ffffff",
      boxShadow: "0 0 16px rgba(164, 201, 252, 0.22)",
      border: "1px solid rgba(164, 201, 252, 0.34)",
    },
    cardGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(238px, 1fr))",
      gap: 20,
      width: "100%",
      marginTop: 6,
    },
    card: {
      borderRadius: 22,
      border: "1px solid rgba(255, 255, 255, 0.07)",
      background: "rgba(21, 28, 38, 0.66)",
      backdropFilter: "blur(20px)",
      overflow: "hidden",
      boxShadow: "0 16px 34px rgba(5, 12, 22, 0.34)",
      cursor: "pointer",
      transition: "transform 260ms ease, box-shadow 260ms ease, border-color 260ms ease",
      display: "flex",
      flexDirection: "column",
      minHeight: 320,
    },
    imageWrap: {
      width: "100%",
      aspectRatio: "3 / 4",
      overflow: "hidden",
      position: "relative",
      background: "#101824",
    },
    cardImg: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      transition: "transform 420ms ease",
    },
    gradientOverlay: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: "42%",
      background: "linear-gradient(to top, rgba(13, 20, 29, 0.9) 0%, rgba(13, 20, 29, 0.2) 56%, transparent 100%)",
      pointerEvents: "none",
    },
    cardBody: {
      padding: "14px 14px 16px 14px",
      display: "flex",
      flexDirection: "column",
      gap: 10,
    },
    cardType: {
      margin: 0,
      fontSize: "0.64rem",
      color: "#a4c9fc",
      fontWeight: 800,
      letterSpacing: "0.16em",
      textTransform: "uppercase",
    },
    cardName: {
      margin: 0,
      fontSize: "1rem",
      color: "#ffffff",
      fontWeight: 700,
      lineHeight: 1.32,
      fontFamily: "'Plus Jakarta Sans', 'Manrope', sans-serif",
    },
    cardButton: {
      marginTop: 2,
      width: "100%",
      border: "none",
      borderRadius: 999,
      padding: "11px 14px",
      cursor: "pointer",
      background: "linear-gradient(135deg, #3626ce 0%, #5f0b7e 100%)",
      color: "#ffffff",
      fontWeight: 700,
      fontSize: "0.8rem",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      letterSpacing: "0.03em",
      transition: "all 220ms ease",
      boxShadow: "0 10px 22px rgba(40, 30, 104, 0.35)",
    },
    emptyText: {
      color: "#8eb6d6",
      opacity: 0.78,
      textAlign: "center",
      marginTop: 36,
      fontSize: "0.98rem",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 18,
      background: "rgba(21, 28, 38, 0.5)",
      padding: "18px 20px",
    },
  };

  const navigate = useNavigate();
  const [tab, setTab] = useState("tshirts");
  const email = localStorage.getItem("userEmail");
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Demo product data (static)
  const tshirts = [
    {
      id: "t1",
      name: "White Cotton",
      category: "T-Shirts",
      image: "/images/three-shirts.png",
      thumbnails: [
        "/images/three-shirts.png",
        "/images/three-shirts.png",
        "/images/three-shirts.png"
      ],
      breadcrumb: "Shop / Apparel / T-Shirts"
    },
    {
      id: "t2",
      name: "Black Cotton",
      category: "T-Shirts",
      image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80&sat=0",
      thumbnails: [
        "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80&sat=0",
        "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80&sat=0",
        "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80&sat=0"
      ],
      breadcrumb: "Shop / Apparel / T-Shirts"
    },
    {
      id: "t3",
      name: "Gray Buttoned",
      category: "T-Shirts",
      image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80&sat=-50",
      thumbnails: [
        "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80&sat=-50",
        "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80&sat=-50",
        "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80&sat=-50"
      ],
      breadcrumb: "Shop / Apparel / T-Shirts"
    },
    {
      id: "t4",
      name: "Highneck T Shirt",
      category: "T-Shirts",
      image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80&sat=-80",
      thumbnails: [
        "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80&sat=-80",
        "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80&sat=-80",
        "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80&sat=-80"
      ],
      breadcrumb: "Shop / Apparel / T-Shirts"
    },
    {
      id: "t5",
      name: "Red Polo",
      category: "T-Shirts",
      image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80&sat=100&hue=90",
      thumbnails: [
        "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80&sat=100&hue=90",
        "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80&sat=100&hue=90",
        "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80&sat=100&hue=90"
      ],
      breadcrumb: "Shop / Apparel / T-Shirts"
    },
  ];
  const trousers = [];

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Manrope:wght@400;500;600;700&display=swap');

        .catalog-nav-item:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(164, 201, 252, 0.24);
          transform: translateX(4px);
        }
        .catalog-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 24px 44px rgba(5, 12, 22, 0.46);
          border-color: rgba(164, 201, 252, 0.24);
        }
        .catalog-card:hover .catalog-card-image {
          transform: scale(1.06);
        }
        .catalog-tab:hover {
          border-color: rgba(164, 201, 252, 0.3);
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
        }
        .catalog-cta:hover {
          transform: translateY(-1px);
          filter: brightness(1.05);
          box-shadow: 0 15px 28px rgba(40, 30, 104, 0.48);
        }
        @keyframes catalogPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        @media (max-width: 1220px) {
          .catalog-sidebar {
            position: static !important;
            width: auto !important;
            margin: 18px;
          }
          .catalog-main {
            margin-left: 18px !important;
            margin-right: 18px !important;
            padding-top: 4px !important;
          }
        }
      `}</style>

      <aside style={styles.sidebar} className="catalog-sidebar">
        <div>
          <h1 style={styles.brand}>VirtuFit 3D</h1>
          <p style={styles.brandTag}>VirtuFit 3D</p>
        </div>

        <nav style={styles.sidebarSection}>
          <button
            type="button"
            style={{ ...styles.navPillBase }}
            className="catalog-nav-item"
            onClick={() => navigate("/dashboard")}
          >
            <span>◈</span><span>Dashboard</span>
          </button>
          <button
            type="button"
            style={{ ...styles.navPillBase }}
            className="catalog-nav-item"
            onClick={() => navigate("/avatar-viewer", { state: { avatarUrl } })}
          >
            <span>◌</span><span>View Avatar</span>
          </button>
          <button
            type="button"
            style={{ ...styles.navPillBase, ...styles.navPillActive }}
            onClick={() => navigate("/catalog", { state: { avatarUrl } })}
          >
            <span>◍</span><span>Garment Catalog</span>
          </button>
          <button
            type="button"
            style={{ ...styles.navPillBase }}
            className="catalog-nav-item"
            onClick={() => navigate("/history")}
          >
            <span>◎</span><span>View History</span>
          </button>
          <button
            type="button"
            style={{ ...styles.navPillBase }}
            className="catalog-nav-item"
            onClick={() => navigate("/dashboard")}
          >
            <span>◔</span><span>Notifications</span>
          </button>
        </nav>

        <div style={styles.sidebarFooter}>
          <button
            type="button"
            style={{ ...styles.navPillBase }}
            className="catalog-nav-item"
            onClick={() => navigate("/dashboard")}
          >
            <span>◉</span><span>Profile</span>
          </button>
          <button
            type="button"
            style={{ ...styles.navPillBase }}
            className="catalog-nav-item"
            onClick={() => navigate("/dashboard")}
          >
            <span>◒</span><span>Settings</span>
          </button>
          <button type="button" style={{ ...styles.navPillBase }} className="catalog-nav-item" onClick={handleLogout}>
            <span>⎋</span><span>Logout</span>
          </button>

          <div style={styles.profilePill}>
            <div style={styles.avatarMini}>AI</div>
            <div>
              <p style={styles.profileTitle}>{email || "VirtuFit 3D"}</p>
              <p style={styles.profileSubtitle}>Catalog User</p>
            </div>
          </div>
        </div>
      </aside>

      <main style={styles.main} className="catalog-main">
        <div style={styles.mainInner}>
          <header style={styles.headingWrap}>
            <div>
              <h2 style={styles.heading}>Garment Catalog</h2>
              <p style={styles.subtitle}>
                Explore curated digital couture pieces engineered for precise virtual fitting and realistic drape behavior.
              </p>
            </div>
            <div style={styles.statusChip}>
              <span style={styles.chipDot} />
              <span>Catalog Online</span>
            </div>
          </header>

          <section style={styles.searchFilterRow}>
            <div style={styles.searchWrap}>
              <span>⌕</span>
              <input
                style={styles.searchInput}
                value=""
                readOnly
                placeholder="Search collection..."
                aria-label="Search collection"
              />
            </div>

            <div style={styles.tabBar}>
          <button
            style={{
              ...styles.tabButtonBase,
              ...(tab === "tshirts" ? styles.tabButtonActive : styles.tabButtonInactive),
            }}
            className={tab === "tshirts" ? "" : "catalog-tab"}
            onClick={() => setTab("tshirts")}
          >
            T-Shirts
          </button>
          <button
            style={{
              ...styles.tabButtonBase,
              ...(tab === "trousers" ? styles.tabButtonActive : styles.tabButtonInactive),
            }}
            className={tab === "trousers" ? "" : "catalog-tab"}
            onClick={() => setTab("trousers")}
          >
            Trousers
          </button>
            </div>
          </section>

          {/* Product Grid */}
          <section style={styles.cardGrid}>
            {(tab === "tshirts" ? tshirts : trousers).map((item, idx) => (
              <article
                key={item.name + idx}
                style={styles.card}
                className="catalog-card"
                onClick={() =>
                  navigate("/garment-detail", {
                    state: {
                      avatarUrl,
                      garment: {
                        ...item,
                        breadcrumb: tab === "tshirts"
                          ? "Shop / Apparel / T-Shirts"
                          : "Shop / Apparel / Trousers",
                        title: item.name,
                        images: [item.image],
                        sizes: ["S", "M", "L"],
                      },
                    },
                  })
                }
              >
                <div style={styles.imageWrap}>
                  <img src={item.image} alt={item.name} style={styles.cardImg} className="catalog-card-image" />
                  <div style={styles.gradientOverlay} />
                </div>

                <div style={styles.cardBody}>
                  <p style={styles.cardType}>{tab === "tshirts" ? "T-Shirts" : "Trousers"}</p>
                  <h3 style={styles.cardName}>{item.name}</h3>
                  <button type="button" style={styles.cardButton} className="catalog-cta">
                    <span>◉</span>
                    <span>Try-On</span>
                  </button>
                </div>
              </article>
            ))}
          </section>

          {tab === "trousers" && trousers.length === 0 && (
            <div style={styles.emptyText}>
              No trousers available yet.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Catalog;
