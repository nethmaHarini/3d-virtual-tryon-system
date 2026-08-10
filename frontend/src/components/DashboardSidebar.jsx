import { useLocation, useNavigate } from "react-router-dom";
import { useAppTheme } from "../theme";

function DashboardSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useAppTheme();

  const username = localStorage.getItem("username") || "";
  const displayName = username.trim().split(/\s+/)[0] || "VirtuFit 3D";
  const hasGeneratedAvatar = Boolean(
    localStorage.getItem("avatar_file") ||
      localStorage.getItem("avatarUrl") ||
      localStorage.getItem("generatedAvatar")
  );

  const styles = {
    sidebar: {
      position: "fixed",
      left: 26,
      top: 22,
      bottom: 22,
      width: 220,
      borderRadius: 20,
      border: isDark ? "1px solid rgba(255, 255, 255, 0.06)" : "1px solid rgba(18, 30, 52, 0.08)",
      background: isDark
        ? "linear-gradient(180deg, rgba(8,12,20,0.72), rgba(10,14,26,0.64))"
        : "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(239,243,250,0.92))",
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
    sidebarHeader: {
      color: isDark ? "rgba(173,182,204,0.7)" : "rgba(83, 96, 117, 0.72)",
      fontSize: "0.68rem",
      fontWeight: 800,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      margin: "2px 0 6px 0",
    },
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
      borderTop: isDark ? "1px solid rgba(255, 255, 255, 0.03)" : "1px solid rgba(18, 30, 52, 0.06)",
      display: "flex",
      flexDirection: "column",
      gap: 8,
    },
    notifyDot: {
      marginLeft: 8,
      display: "inline-block",
      minWidth: 18,
      height: 18,
      borderRadius: 18,
      background: "linear-gradient(90deg,#6f3af2,#a746d1)",
      color: "#fff",
      fontSize: 11,
      lineHeight: "18px",
      textAlign: "center",
      fontWeight: 800,
    },
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
      color: isDark ? "rgba(195,198,208,0.78)" : "rgba(83, 96, 117, 0.78)",
      letterSpacing: "0.16em",
      textTransform: "uppercase",
      fontWeight: 700,
    },
  };

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
  const confirmed = window.confirm("Are you sure you want to log out? Click on OK to confirm.");

  if (!confirmed) {
    return;
  }

  localStorage.removeItem("token");
  localStorage.removeItem("username");
  localStorage.removeItem("userEmail");

  navigate("/");
};

  return (
    <aside style={styles.sidebar} className="dashboard-sidebar">
      <div>
        <h1 style={styles.sidebarBrand}>VirtuFit 3D</h1>
        <p style={styles.sidebarTag}>VirtuFit 3D</p>
      </div>

      <div style={styles.sidebarHeader}>Main Menu</div>
      <nav style={styles.sidebarSection}>
        <button
          type="button"
          style={isActive("/dashboard") ? { ...styles.sidebarButtonBase, ...styles.sidebarButtonActive } : styles.sidebarButtonBase}
          onClick={() => navigate("/dashboard")}
        >
          <span>◈</span>
          <span>Dashboard</span>
        </button>
        <button
          type="button"
          style={isActive("/avatar-viewer") ? { ...styles.sidebarButtonBase, ...styles.sidebarButtonActive } : styles.sidebarButtonBase}
          onClick={() => navigate("/avatar-viewer", { state: { avatarUrl: localStorage.getItem("avatarUrl") } })}
        >
          <span>◌</span>
          <span>View Avatar</span>
        </button>
        <button
          type="button"
          style={isActive("/catalog") ? { ...styles.sidebarButtonBase, ...styles.sidebarButtonActive } : styles.sidebarButtonBase}
          onClick={() => navigate("/catalog")}
        >
          <span>◍</span>
          <span>Garment Catalog</span>
        </button>
        <button
          type="button"
          style={isActive("/history") ? { ...styles.sidebarButtonBase, ...styles.sidebarButtonActive } : styles.sidebarButtonBase}
          onClick={() => navigate("/history")}
        >
          <span>◎</span>
          <span>View History</span>
        </button>
        <button
          type="button"
          style={styles.sidebarButtonBase}
          onClick={() => navigate("/dashboard")}
        >
          <span>◔</span>
          <span>Notifications</span>
          <span style={styles.notifyDot}>2</span>
        </button>
      </nav>

      <div style={{ marginTop: 6, color: "rgba(173,182,204,0.62)", fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase" }}>Account</div>
      <div style={styles.sidebarFooter}>
        <button
          type="button"
          style={isActive("/profile") ? { ...styles.sidebarButtonBase, ...styles.sidebarButtonActive } : styles.sidebarButtonBase}
          onClick={() => navigate("/profile")}
        >
          <span>◉</span>
          <span>Profile</span>
        </button>
        <button
          type="button"
          style={isActive("/settings") ? { ...styles.sidebarButtonBase, ...styles.sidebarButtonActive } : styles.sidebarButtonBase}
          onClick={() => navigate("/settings")}
        >
          <span>◒</span>
          <span>Settings</span>
        </button>
        <button type="button" style={styles.sidebarButtonBase} onClick={handleLogout}>
          <span>⎋</span>
          <span>Logout</span>
        </button>

        <div style={styles.profilePill}>
          <div style={styles.avatarMini}>AI</div>
          <div>
            <p style={styles.profileTitle}>{displayName}</p>
            <p style={styles.profileSubtitle}>{hasGeneratedAvatar ? "Existing User" : "New Artisan"}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default DashboardSidebar;