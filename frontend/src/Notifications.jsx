import React, { useEffect, useMemo, useState } from "react";
import DashboardSidebar from "./components/DashboardSidebar";
import { useAppTheme } from "./theme";

const defaultNotifications = [
  {
    id: "n-1",
    icon: "✔",
    title: "Avatar generated successfully",
    message: "Your new VirtuFit 3D avatar is ready to preview.",
    timestamp: "Just now",
    unread: true,
  },
  {
    id: "n-2",
    icon: "👗",
    title: "Virtual try-on completed",
    message: "Your selected garment fit report is available.",
    timestamp: "19 min ago",
    unread: true,
  },
  {
    id: "n-3",
    icon: "⚠",
    title: "Avatar generation issue",
    message: "One of your upload images could not be processed. Try again.",
    timestamp: "1 hr ago",
    unread: false,
  },
  {
    id: "n-4",
    icon: "🔔",
    title: "Account update complete",
    message: "Your profile details were saved successfully.",
    timestamp: "Yesterday",
    unread: false,
  },
];

function Notifications() {
  const { isDark } = useAppTheme();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [hoveredId, setHoveredId] = useState(null);

  const loadNotifications = () => {
    try {
      const stored = localStorage.getItem("notifications");
      if (!stored) {
        localStorage.setItem("notifications", JSON.stringify(defaultNotifications));
        return defaultNotifications;
      }
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : defaultNotifications;
    } catch (error) {
      return defaultNotifications;
    }
  };

  const persistNotifications = (nextNotifications) => {
    localStorage.setItem("notifications", JSON.stringify(nextNotifications));
    window.dispatchEvent(new Event("notifications-updated"));
  };

  useEffect(() => {
    setNotifications(loadNotifications());
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((item) => item.unread).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    if (filter === "unread") {
      return notifications.filter((item) => item.unread);
    }
    return notifications;
  }, [filter, notifications]);

  const handleMarkAllRead = () => {
    const nextNotifications = notifications.map((item) => ({ ...item, unread: false }));
    setNotifications(nextNotifications);
    persistNotifications(nextNotifications);
  };

  const handleNotificationClick = (id) => {
    const nextNotifications = notifications.map((item) =>
      item.id === id ? { ...item, unread: false } : item
    );
    setNotifications(nextNotifications);
    persistNotifications(nextNotifications);
  };

  const formatTimestamp = (value) => {
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
      const now = Date.now();
      const diff = Math.floor((now - parsed.getTime()) / 1000);
      if (diff < 60) return "Just now";
      if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
      if (diff < 172800) return "Yesterday";
      return `${Math.floor(diff / 86400)} days ago`;
    }
    return value;
  };

  const styles = {
    page: {
      minHeight: "100vh",
      width: "100vw",
      background: isDark
        ? "radial-gradient(circle at 12% 16%, rgba(54, 38, 206, 0.22) 0%, transparent 38%), radial-gradient(circle at 88% 84%, rgba(95, 11, 126, 0.24) 0%, transparent 48%), linear-gradient(155deg, #090f17 0%, #0d141d 48%, #111a27 100%)"
        : "radial-gradient(circle at 12% 16%, rgba(78, 107, 255, 0.16) 0%, transparent 38%), radial-gradient(circle at 88% 84%, rgba(138, 92, 255, 0.12) 0%, transparent 48%), linear-gradient(155deg, #f7f9ff 0%, #edf2ff 48%, #eaf0fb 100%)",
      color: isDark ? "#dce3f0" : "#152033",
      fontFamily: "'Manrope', 'Segoe UI', sans-serif",
      overflowX: "hidden",
      boxSizing: "border-box",
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
    header: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
    },
    headerTitle: {
      margin: 0,
      fontSize: "2rem",
      color: "#ffffff",
      lineHeight: 1.05,
      fontWeight: 800,
      fontFamily: "'Plus Jakarta Sans', 'Manrope', sans-serif",
    },
    headerSub: {
      margin: 0,
      color: "#c3c6d0",
      fontSize: "0.98rem",
      lineHeight: 1.6,
      maxWidth: 680,
    },
    toolbar: {
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
      padding: "18px 0",
    },
    summaryBlock: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      minWidth: 220,
    },
    summaryText: {
      margin: 0,
      color: "#d1d7e4",
      fontSize: "0.96rem",
      lineHeight: 1.5,
    },
    summaryTextHighlight: {
      color: "#ffffff",
      fontWeight: 700,
    },
    actionsRow: {
      display: "flex",
      flexWrap: "wrap",
      gap: 10,
      alignItems: "center",
    },
    filterButton: {
      border: "1px solid rgba(255, 255, 255, 0.14)",
      borderRadius: 999,
      padding: "10px 18px",
      background: "rgba(255,255,255,0.06)",
      color: "#c3c6d0",
      cursor: "pointer",
      fontSize: "0.92rem",
      fontWeight: 700,
      transition: "all 180ms ease",
    },
    filterButtonActive: {
      background: "linear-gradient(90deg, rgba(111, 58, 242, 0.96), rgba(167, 70, 209, 0.96))",
      color: "#ffffff",
      borderColor: "transparent",
      boxShadow: "0 10px 26px rgba(111, 58, 242, 0.22)",
    },
    markReadButton: {
      border: "1px solid rgba(255, 255, 255, 0.08)",
      borderRadius: 999,
      padding: "10px 18px",
      background: "rgba(255,255,255,0.04)",
      color: "#c3c6d0",
      cursor: "pointer",
      fontSize: "0.88rem",
      fontWeight: 700,
      transition: "all 180ms ease",
    },
    markReadButtonDisabled: {
      opacity: 0.55,
      cursor: "not-allowed",
    },
    notificationsList: {
      display: "grid",
      gap: 12,
    },
    notificationCard: {
      width: "100%",
      padding: "14px 16px",
      borderRadius: 22,
      background: isDark ? "rgba(255,255,255,0.06)" : "#f8fafc",
      border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(226, 232, 240, 0.9)",
      display: "grid",
      gridTemplateColumns: "52px 1fr",
      gap: 14,
      alignItems: "center",
      textAlign: "left",
      cursor: "pointer",
      transition: "transform 180ms ease, box-shadow 180ms ease, background 180ms ease",
      boxShadow: isDark ? "0 12px 28px rgba(0, 0, 0, 0.14)" : "0 10px 22px rgba(15, 23, 42, 0.08)",
    },
    notificationCardHover: {
      transform: "translateY(-1px)",
      background: isDark ? "rgba(255,255,255,0.1)" : "#eef2ff",
      borderColor: isDark ? "rgba(140, 92, 255, 0.28)" : "rgba(139, 92, 246, 0.24)",
      boxShadow: isDark ? "0 16px 32px rgba(0, 0, 0, 0.18)" : "0 12px 28px rgba(15, 23, 42, 0.12)",
    },
    notificationCardUnread: {
      borderLeft: "3px solid #8b5cf6",
      background: isDark ? "rgba(255,255,255,0.08)" : "rgba(237, 233, 254, 0.7)",
    },
    notificationIcon: {
      width: 48,
      height: 48,
      borderRadius: 16,
      background: isDark ? "rgba(111,58,242,0.2)" : "rgba(111,58,242,0.12)",
      color: "#ffffff",
      display: "grid",
      placeItems: "center",
      fontSize: "1.2rem",
      flexShrink: 0,
    },
    notificationContent: {
      display: "flex",
      flexDirection: "column",
      gap: 10,
    },
    notificationHeading: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 12,
      flexWrap: "wrap",
    },
    notificationTitle: {
      margin: 0,
      color: isDark ? "#f6f7ff" : "#111827",
      fontSize: "1rem",
      fontWeight: 800,
    },
    notificationMessage: {
      margin: 0,
      color: isDark ? "#d1d6e1" : "#475569",
      fontSize: "0.92rem",
      lineHeight: 1.5,
    },
    notificationMeta: {
      margin: 0,
      color: isDark ? "#9ba6c8" : "#64748b",
      fontSize: "0.82rem",
      letterSpacing: "0.01em",
      marginTop: 4,
    },
    unreadIndicator: {
      width: 8,
      height: 8,
      borderRadius: 999,
      background: "#8b5cf6",
      marginTop: 6,
      flexShrink: 0,
    },
    emptyState: {
      padding: 42,
      borderRadius: 22,
      border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(203, 213, 225, 0.8)",
      background: isDark ? "rgba(255,255,255,0.04)" : "rgba(248, 250, 252, 0.95)",
      color: isDark ? "#c3c6d0" : "#475569",
      display: "flex",
      flexDirection: "column",
      gap: 10,
      alignItems: "center",
      textAlign: "center",
    },
    emptyTitle: {
      margin: 0,
      color: isDark ? "#ffffff" : "#0f172a",
      fontSize: "1.45rem",
      fontWeight: 700,
    },
    emptyCopy: {
      margin: 0,
      maxWidth: 560,
      color: isDark ? "#d1d7e4" : "#475569",
      lineHeight: 1.7,
      fontSize: "0.97rem",
    },
  };

  return (
    <div style={styles.page}>
      <DashboardSidebar />

      <main style={styles.main}>
        <div style={styles.mainInner}>
          <header style={styles.header}>
            <h1 style={styles.headerTitle}>Notifications</h1>
            <p style={styles.headerSub}>Stay updated with your VirtuFit 3D activity.</p>
          </header>

          <section style={styles.toolbar}>
            <div style={styles.summaryBlock}>
              <p style={styles.summaryText}>
                <span style={styles.summaryTextHighlight}>{notifications.length} total</span>
                {` · `}
                <span style={styles.summaryTextHighlight}>{unreadCount} unread</span>
              </p>
            </div>

            <div style={styles.actionsRow}>
              <button
                type="button"
                style={filter === "all" ? { ...styles.filterButton, ...styles.filterButtonActive } : styles.filterButton}
                onClick={() => setFilter("all")}
              >
                All
              </button>
              <button
                type="button"
                style={filter === "unread" ? { ...styles.filterButton, ...styles.filterButtonActive } : styles.filterButton}
                onClick={() => setFilter("unread")}
              >
                Unread
              </button>
              <button
                type="button"
                style={unreadCount === 0 ? { ...styles.markReadButton, ...styles.markReadButtonDisabled } : styles.markReadButton}
                onClick={handleMarkAllRead}
                disabled={unreadCount === 0}
              >
                Mark all as read
              </button>
            </div>
          </section>

          <section style={styles.notificationsList}>
            {filteredNotifications.length === 0 ? (
              <div style={styles.emptyState}>
                <h2 style={styles.emptyTitle}>You're all caught up</h2>
                <p style={styles.emptyCopy}>
                  {filter === "unread"
                    ? "You have no unread notifications."
                    : "New updates about your avatar, virtual try-ons, and fit feedback will appear here."}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <button
                  type="button"
                  key={notification.id}
                  style={
                    notification.unread
                      ? {
                          ...styles.notificationCard,
                          ...styles.notificationCardUnread,
                          ...(hoveredId === notification.id ? styles.notificationCardHover : {}),
                        }
                      : {
                          ...styles.notificationCard,
                          ...(hoveredId === notification.id ? styles.notificationCardHover : {}),
                        }
                  }
                  onClick={() => handleNotificationClick(notification.id)}
                  onMouseEnter={() => setHoveredId(notification.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div style={styles.notificationIcon}>{notification.icon}</div>
                  <div style={styles.notificationContent}>
                    <div style={styles.notificationHeading}>
                      <h2 style={styles.notificationTitle}>{notification.title}</h2>
                      {notification.unread && <div style={styles.unreadIndicator} />}
                    </div>
                    <p style={styles.notificationMessage}>{notification.message}</p>
                    <p style={styles.notificationMeta}>{formatTimestamp(notification.timestamp)}</p>
                  </div>
                </button>
              ))
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default Notifications;
