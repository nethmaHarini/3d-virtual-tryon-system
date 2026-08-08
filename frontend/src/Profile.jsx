import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();
  const [generatedAvatar, setGeneratedAvatar] = useState("");
  const [viewHistoryCount, setViewHistoryCount] = useState(0);

  const email = localStorage.getItem("userEmail");
  const username = localStorage.getItem("username");

  useEffect(() => {
    setGeneratedAvatar(
      localStorage.getItem("avatarUrl") ||
      localStorage.getItem("avatar_file") ||
      localStorage.getItem("generatedAvatar") ||
      ""
    );

    try {
      const storedHistory = localStorage.getItem("viewHistory");
      const parsedHistory = storedHistory ? JSON.parse(storedHistory) : [];
      setViewHistoryCount(Array.isArray(parsedHistory) ? parsedHistory.length : 0);
    } catch (error) {
      setViewHistoryCount(0);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  const styles = {
    page: {
      minHeight: "100vh",
      width: "100vw",
      background:
        "radial-gradient(circle at 14% 14%, rgba(54, 38, 206, 0.24) 0%, transparent 32%), radial-gradient(circle at 84% 16%, rgba(95, 11, 126, 0.18) 0%, transparent 30%), radial-gradient(circle at 78% 84%, rgba(76, 176, 255, 0.14) 0%, transparent 34%), linear-gradient(155deg, #090f17 0%, #0c1320 45%, #111a27 100%)",
      color: "#dce3f0",
      fontFamily: "'Manrope', 'Segoe UI', sans-serif",
      overflowX: "hidden",
      boxSizing: "border-box",
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
    activeButton: {
      background: "linear-gradient(135deg, #3626ce 0%, #5f0b7e 100%)",
      color: "#fff",
      boxShadow: "0 16px 30px rgba(31, 22, 81, 0.32)",
    },
    profileCard: {
      marginTop: "auto",
      paddingTop: 16,
      borderTop: "1px solid rgba(255,255,255,0.06)",
    },
    profilePill: {
      display: "flex",
      gap: 12,
      alignItems: "center",
      marginTop: 12,
      padding: 14,
      borderRadius: 18,
      background: "rgba(8,15,24,0.72)",
      border: "1px solid rgba(255,255,255,0.06)",
    },
    avatarMini: {
      width: 42,
      height: 42,
      borderRadius: 14,
      display: "grid",
      placeItems: "center",
      background: "linear-gradient(145deg, #3626ce 0%, #5f0b7e 100%)",
      color: "#fff",
      fontWeight: 800,
      letterSpacing: "-0.03em",
      boxShadow: "0 10px 22px rgba(48, 30, 148, 0.45)",
    },
    profileTitle: { margin: 0, fontSize: "0.88rem", color: "#f5f7ff", fontWeight: 700 },
    profileSubtitle: {
      margin: "3px 0 0 0",
      fontSize: "0.68rem",
      color: "rgba(195,198,208,0.78)",
      textTransform: "uppercase",
      fontWeight: 700,
      letterSpacing: "0.06em",
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
    pageHeader: {
      display: "flex",
      justifyContent: "space-between",
      gap: 18,
      alignItems: "flex-start",
      flexWrap: "wrap",
    },
    headerTitle: { margin: 0, fontSize: "1.9rem", color: "#fff", fontWeight: 800 },
    headerSub: { margin: "8px 0 0 0", color: "#c3c6d0", lineHeight: 1.6, maxWidth: 760 },
    statusBadge: {
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 14px",
      borderRadius: 999,
      background: "rgba(8,15,24,0.72)",
      border: "1px solid rgba(255,255,255,0.06)",
      color: "#d6def4",
      fontSize: "0.86rem",
      fontWeight: 700,
      whiteSpace: "nowrap",
    },
    dot: { width: 10, height: 10, borderRadius: 999, background: "#4ade80", boxShadow: "0 0 18px rgba(74,222,128,0.8)" },
    grid: {
      display: "grid",
      gridTemplateColumns: "minmax(0, 1.3fr) minmax(0, 0.9fr)",
      gap: 18,
    },
    card: {
      padding: 22,
      borderRadius: 24,
      background: "rgba(21,28,38,0.66)",
      border: "1px solid rgba(255,255,255,0.06)",
      boxShadow: "0 24px 48px rgba(5, 12, 22, 0.28)",
      boxSizing: "border-box",
    },
    heroCard: {
      position: "relative",
      overflow: "hidden",
      minHeight: 320,
    },
    heroGlow: {
      position: "absolute",
      inset: "auto -10% -35% auto",
      width: 320,
      height: 320,
      borderRadius: "50%",
      background: "radial-gradient(circle, rgba(95,11,126,0.45) 0%, rgba(95,11,126,0.08) 45%, transparent 72%)",
      filter: "blur(10px)",
      pointerEvents: "none",
    },
    heroContent: {
      position: "relative",
      display: "grid",
      gridTemplateColumns: "auto 1fr",
      gap: 18,
      alignItems: "center",
    },
    avatarFrame: {
      width: 124,
      height: 124,
      borderRadius: 30,
      background: "linear-gradient(145deg, rgba(54,38,206,0.9) 0%, rgba(95,11,126,0.9) 100%)",
      display: "grid",
      placeItems: "center",
      boxShadow: "0 22px 48px rgba(31,22,81,0.42)",
      border: "1px solid rgba(255,255,255,0.12)",
      overflow: "hidden",
    },
    avatarInitials: { fontSize: "2.2rem", fontWeight: 800, letterSpacing: "-0.06em", color: "#fff" },
    heroName: { margin: 0, fontSize: "1.46rem", color: "#fff", fontWeight: 800 },
    heroEmail: { margin: "6px 0 0 0", color: "#aab8cd", fontSize: "0.95rem" },
    heroMetaRow: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 },
    metaChip: {
      padding: "8px 12px",
      borderRadius: 999,
      background: "rgba(8,15,24,0.72)",
      border: "1px solid rgba(255,255,255,0.06)",
      color: "#dce3f0",
      fontSize: "0.84rem",
      fontWeight: 700,
    },
    actionRow: { display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 },
    primaryButton: {
      border: "none",
      borderRadius: 999,
      padding: "12px 18px",
      background: "linear-gradient(135deg, #3626ce 0%, #5f0b7e 100%)",
      color: "#fff",
      cursor: "pointer",
      fontWeight: 700,
      boxShadow: "0 12px 26px rgba(31,22,81,0.34)",
    },
    secondaryButton: {
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 999,
      padding: "12px 18px",
      background: "rgba(8,15,24,0.75)",
      color: "#d4daeb",
      cursor: "pointer",
      fontWeight: 700,
    },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: 14,
    },
    statCard: {
      padding: 18,
      borderRadius: 20,
      background: "rgba(8,15,24,0.72)",
      border: "1px solid rgba(255,255,255,0.06)",
    },
    statLabel: { margin: 0, color: "#aab8cd", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 },
    statValue: { margin: "10px 0 0 0", color: "#fff", fontSize: "1.55rem", fontWeight: 800 },
    statCopy: { margin: "8px 0 0 0", color: "#c3c6d0", fontSize: "0.88rem", lineHeight: 1.55 },
    sectionTitle: { margin: 0, color: "#fff", fontSize: "1.06rem", fontWeight: 800 },
    sectionSub: { margin: "6px 0 0 0", color: "#aab8cd", lineHeight: 1.55 },
    detailsList: { display: "grid", gap: 12, marginTop: 18 },
    detailItem: {
      display: "flex",
      justifyContent: "space-between",
      gap: 16,
      padding: "14px 16px",
      borderRadius: 16,
      background: "rgba(8,15,24,0.72)",
      border: "1px solid rgba(255,255,255,0.06)",
    },
    detailLabel: { margin: 0, color: "#aab8cd", fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" },
    detailValue: { margin: "4px 0 0 0", color: "#fff", fontWeight: 700, wordBreak: "break-word", textAlign: "right" },
    footerNote: { marginTop: 16, color: "#aab8cd", fontSize: "0.88rem", lineHeight: 1.6 },
    banner: {
      padding: 28,
      borderRadius: 20,
      background: "linear-gradient(90deg, rgba(54,38,206,0.95) 0%, rgba(95,11,126,0.95) 100%)",
      color: "#fff",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 18,
      boxShadow: "0 24px 48px rgba(18,8,48,0.45)",
    },
    bannerLeft: { display: "flex", gap: 18, alignItems: "center" },
    bannerAvatarBox: {
      width: 120,
      height: 120,
      borderRadius: 16,
      background: "linear-gradient(145deg, rgba(164,201,252,0.08) 0%, rgba(237,177,255,0.06) 100%)",
      display: "grid",
      placeItems: "center",
      boxShadow: "0 18px 40px rgba(31,22,81,0.36)",
      border: "1px solid rgba(255,255,255,0.06)",
    },
    bannerName: { margin: 0, fontSize: "1.6rem", fontWeight: 800 },
    bannerEmail: { margin: "6px 0 0 0", color: "rgba(235,240,255,0.9)" },
    editProfileBtn: {
      border: "1px solid rgba(255,255,255,0.12)",
      background: "transparent",
      color: "#fff",
      padding: "10px 16px",
      borderRadius: 12,
      fontWeight: 700,
      cursor: "pointer",
    },
    twoCol: { display: "grid", gridTemplateColumns: "1fr 420px", gap: 18, alignItems: "start" },
    infoCard: { padding: 20, borderRadius: 14, background: "rgba(8,15,24,0.72)", border: "1px solid rgba(255,255,255,0.06)" },
    infoRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" },
    infoLabel: { margin: 0, color: "#aab8cd", fontSize: "0.82rem", fontWeight: 700 },
    infoValue: { margin: 0, color: "#fff", fontWeight: 700 },
    avatarCard: { padding: 20, borderRadius: 14, background: "rgba(8,15,24,0.72)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: 12, alignItems: "center", justifyContent: "center" },
    createAvatarBtn: { background: "linear-gradient(135deg, #6f3af2 0%, #a746d1 100%)", color: "#fff", border: "none", padding: "10px 18px", borderRadius: 12, cursor: "pointer", fontWeight: 700 },
    accountActivity: { display: "flex", gap: 12, marginTop: 18 },
    activityCard: { flex: 1, padding: 18, borderRadius: 12, background: "rgba(8,15,24,0.72)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" },
    activityTitle: { margin: 0, color: "#aab8cd", fontWeight: 700 },
    activityValue: { margin: 0, color: "#fff", fontSize: "1.5rem", fontWeight: 800 },
  };

  const displayName = username || email || "VirtuFit 3D Member";
  const initials = (displayName || "V").trim().slice(0, 2).toUpperCase();
  const avatarLabel = generatedAvatar ? "Avatar linked" : "No avatar yet";

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.22rem", fontWeight: 800, color: "#fff" }}>VirtuFit 3D</h1>
          <p style={{ margin: "4px 0 18px 0", color: "rgba(195, 198, 208, 0.72)", fontSize: "0.66rem", fontWeight: 700 }}>Account Center</p>
        </div>

        <nav style={styles.sidebarSection}>
          <button type="button" style={styles.navButton} onClick={() => navigate("/dashboard")}>
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
          <button type="button" style={styles.navButton} onClick={() => navigate("/history")}>
            <span>◎</span>
            <span>View History</span>
          </button>
          <button type="button" style={styles.navButton} onClick={() => navigate("/dashboard")}>
            <span>◔</span>
            <span>Notifications</span>
          </button>
        </nav>

        <div style={styles.profileCard}>
          <button type="button" style={{ ...styles.navButton, ...styles.activeButton }}>
            <span>◉</span>
            <span>Profile</span>
          </button>
          <button type="button" style={styles.navButton} onClick={() => navigate("/profile")}>
            <span>◒</span>
            <span>Settings</span>
          </button>
          <button type="button" style={styles.navButton} onClick={handleLogout}>
            <span>⎋</span>
            <span>Logout</span>
          </button>

          <div style={styles.profilePill}>
            <div style={styles.avatarMini}>{initials}</div>
            <div>
              <p style={styles.profileTitle}>{displayName}</p>
              <p style={styles.profileSubtitle}>{avatarLabel}</p>
            </div>
          </div>
        </div>
      </aside>

      <main style={styles.main}>
        <div style={styles.mainInner}>
          <header style={styles.pageHeader}>
            <div>
              <h2 style={styles.headerTitle}>Profile</h2>
              <p style={styles.headerSub}>
                Manage your account identity, check avatar links, and jump back into the fitting flow without losing context.
              </p>
            </div>
            <div style={styles.statusBadge}>
              <span style={styles.dot} />
              <span>Account Synced</span>
            </div>
          </header>

          <section style={styles.banner}>
            <div style={styles.bannerLeft}>
              <div style={styles.bannerAvatarBox}>
                <span style={{ fontSize: 36, fontWeight: 800 }}>{initials}</span>
              </div>
              <div>
                <h3 style={styles.bannerName}>{displayName}</h3>
                <p style={styles.bannerEmail}>{email || "No email saved"}</p>
              </div>
            </div>

            <div>
              <button style={styles.editProfileBtn} onClick={() => navigate('/profile')}>Edit Profile</button>
            </div>
          </section>

          <div style={styles.twoCol}>
            <div style={styles.infoCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.06rem', fontWeight: 800, color: '#fff' }}>Personal Information</h3>
                <button style={{ ...styles.editProfileBtn, background: 'transparent', color: '#cfe3ff' }} onClick={() => navigate('/profile')}>Edit</button>
              </div>

              <div style={{ marginTop: 12 }}>
                <div style={styles.infoRow}>
                  <p style={styles.infoLabel}>Full Name</p>
                  <p style={styles.infoValue}>{displayName}</p>
                </div>
                <div style={styles.infoRow}>
                  <p style={styles.infoLabel}>Email Address</p>
                  <p style={styles.infoValue}>{email || 'Not provided'}</p>
                </div>
                <div style={styles.infoRow}>
                  <p style={styles.infoLabel}>Username</p>
                  <p style={styles.infoValue}>{username || 'Not set'}</p>
                </div>
              </div>
            </div>

            <aside style={styles.avatarCard}>
              <div style={{ width: 100, height: 100, borderRadius: 999, background: 'linear-gradient(145deg, #3626ce 0%, #5f0b7e 100%)', display: 'grid', placeItems: 'center', color: '#fff', fontSize: 28, fontWeight: 800 }}>{initials}</div>
              <h4 style={{ margin: 0, color: '#fff', fontWeight: 800 }}>No avatar created yet</h4>
              <p style={{ margin: 0, color: '#cfe3ff' }}>Create your personalized 3D avatar to begin your virtual try-on experience.</p>
              <button style={styles.createAvatarBtn} onClick={() => navigate('/dashboard')}>Create Avatar</button>
            </aside>
          </div>

          <div style={styles.accountActivity}>
            <div style={styles.activityCard}>
              <div>
                <p style={styles.activityTitle}>Try-On Sessions</p>
                <p style={styles.activityValue}>0</p>
              </div>
              <div style={{ color: '#aab8cd' }}>Total try-on sessions</div>
            </div>

            <div style={styles.activityCard}>
              <div>
                <p style={styles.activityTitle}>Saved Avatar</p>
                <p style={styles.activityValue}>{generatedAvatar ? 'Available' : 'Not Available'}</p>
              </div>
              <div style={{ color: '#aab8cd' }}>No avatar created yet</div>
            </div>

            <div style={styles.activityCard}>
              <div>
                <p style={styles.activityTitle}>Account Status</p>
                <p style={styles.activityValue}>Active</p>
              </div>
              <div style={{ color: '#aab8cd' }}>Your account is active</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Profile;