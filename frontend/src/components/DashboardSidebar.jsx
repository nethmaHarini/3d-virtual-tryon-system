import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppTheme } from "../theme";

function DashboardSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useAppTheme();
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const loadNotificationCount = () => {
    try {
      const stored = localStorage.getItem("notifications");
      const parsed = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed)
        ? parsed.filter((item) => item?.unread).length
        : 0;
    } catch (e) {
      return 0;
    }
  };

  useEffect(() => {
    setUnreadNotifications(loadNotificationCount());

    const handleNotificationUpdate = () => {
      setUnreadNotifications(loadNotificationCount());
    };

    window.addEventListener("notifications-updated", handleNotificationUpdate);

    return () => {
      window.removeEventListener("notifications-updated", handleNotificationUpdate);
    };
  }, []);

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
      border: isDark ? "1px solid rgba(148, 163, 184, 0.18)" : "1px solid rgba(148, 163, 184, 0.18)",
      background: isDark ? "rgba(13, 18, 32, 0.94)" : "rgba(255, 255, 255, 0.9)",
      backdropFilter: "blur(18px)",
      padding: 20,
      display: "flex",
      flexDirection: "column",
      gap: 12,
      zIndex: 20,
      boxShadow: isDark ? "0 32px 64px rgba(2, 6, 23, 0.45)" : "0 32px 64px rgba(15, 23, 42, 0.08)",
      boxSizing: "border-box",
    },
    sidebarBrand: {
      margin: 0,
      fontSize: "1.22rem",
      fontWeight: 800,
      color: isDark ? "#F8FAFC" : "#0F172A",
      letterSpacing: "-0.01em",
    },
    sidebarTag: {
      margin: "4px 0 18px 0",
      fontSize: "0.66rem",
      color: isDark ? "rgba(167, 176, 192, 0.78)" : "rgba(71, 85, 105, 0.78)",
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
      color: isDark ? "rgba(167, 176, 192, 0.75)" : "rgba(71, 85, 105, 0.78)",
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
      color: isDark ? "#DDE7FF" : "#475569",
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
      background: "linear-gradient(90deg, #7C3AED 0%, #8B5CF6 100%)",
      color: "#ffffff",
      boxShadow: "0 10px 30px rgba(124, 58, 237, 0.28)",
    },
    sidebarFooter: {
      marginTop: "auto",
      paddingTop: 12,
      borderTop: isDark ? "1px solid rgba(148, 163, 184, 0.12)" : "1px solid rgba(148, 163, 184, 0.18)",
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
      background: "linear-gradient(90deg, #7C3AED 0%, #8B5CF6 100%)",
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
      background: isDark ? "rgba(15, 23, 42, 0.94)" : "rgba(248, 250, 252, 0.96)",
      borderRadius: 16,
      padding: "10px 12px",
      border: isDark ? "1px solid rgba(148, 163, 184, 0.12)" : "1px solid rgba(148, 163, 184, 0.16)",
      boxSizing: "border-box",
    },
    avatarMini: {
      width: 34,
      height: 34,
      borderRadius: "999px",
      background: "linear-gradient(145deg, #6D28D9 0%, #8B5CF6 100%)",
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
      color: isDark ? "#F8FAFC" : "#0F172A",
      fontWeight: 700,
    },
    profileSubtitle: {
      margin: "2px 0 0 0",
      fontSize: "0.62rem",
      color: isDark ? "rgba(167,176,192,0.8)" : "rgba(71, 85, 105, 0.78)",
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
          style={isActive("/notifications") ? { ...styles.sidebarButtonBase, ...styles.sidebarButtonActive } : styles.sidebarButtonBase}
          onClick={() => navigate("/notifications")}
        >
          <span>◔</span>
          <span>Notifications</span>
          {unreadNotifications > 0 ? (
            <span style={styles.notifyDot}>{unreadNotifications}</span>
          ) : null}
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