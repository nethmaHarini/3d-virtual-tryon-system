import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "./components/DashboardSidebar";
import { useAppTheme } from "./theme";

function Profile() {
  const navigate = useNavigate();
  const { isDark } = useAppTheme();
  const [generatedAvatar, setGeneratedAvatar] = useState("");
  const [viewHistoryCount, setViewHistoryCount] = useState(0);
  const [usernameState, setUsernameState] = useState("");
  const [emailState, setEmailState] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const avatarInputRef = useRef(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [avatarHover, setAvatarHover] = useState(false);

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
    // initialize local state for editable fields
    setUsernameState(localStorage.getItem("username") || "");
    setEmailState(localStorage.getItem("userEmail") || "");
  }, []);

  // open the confirmation modal when pencil is clicked
  function openAvatarConfirm() {
    setPhotoError("");
    setShowPhotoModal(true);
  }

  // trigger actual native file picker (called from modal "Upload Photo" button)
  function triggerFileInput() {
    setPhotoError("");
    if (avatarInputRef.current) avatarInputRef.current.click();
  }

  function handleAvatarFileChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return; // user cancelled file picker

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5 MB

    if (!validTypes.includes(file.type) || file.size > maxSize) {
      setPhotoError('Please select a JPG, PNG, or WEBP image smaller than 5 MB.');
      // clear input to allow re-pick
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = function (ev) {
      const dataUrl = ev.target.result;
      setGeneratedAvatar(dataUrl);
      try {
        localStorage.setItem('avatarUrl', dataUrl);
      } catch (err) {
        console.warn('Could not save avatar to localStorage', err);
      }
      setPhotoError("");
      setShowPhotoModal(false);
    };
    reader.readAsDataURL(file);
    // clear input value so same file can be picked again
    e.target.value = '';
  }

  const styles = {
    page: {
      minHeight: "100vh",
      width: "100%",
      minWidth: 0,
      background:
        isDark
          ? "radial-gradient(circle at 14% 14%, rgba(54, 38, 206, 0.24) 0%, transparent 32%), radial-gradient(circle at 84% 16%, rgba(95, 11, 126, 0.18) 0%, transparent 30%), radial-gradient(circle at 78% 84%, rgba(76, 176, 255, 0.14) 0%, transparent 34%), linear-gradient(155deg, #090f17 0%, #0c1320 45%, #111a27 100%)"
          : "radial-gradient(circle at 14% 14%, rgba(78, 107, 255, 0.16) 0%, transparent 32%), radial-gradient(circle at 84% 16%, rgba(138, 92, 255, 0.12) 0%, transparent 30%), radial-gradient(circle at 78% 84%, rgba(76, 176, 255, 0.10) 0%, transparent 34%), linear-gradient(155deg, #f7f9ff 0%, #edf2ff 45%, #eaf0fb 100%)",
      color: isDark ? "#dce3f0" : "#152033",
      fontFamily: "'Manrope', 'Segoe UI', sans-serif",
      overflowX: "hidden",
      boxSizing: "border-box",
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
      boxShadow: isDark ? "0 28px 56px rgba(5, 12, 22, 0.56)" : "0 28px 56px rgba(83, 96, 117, 0.12)",
      boxSizing: "border-box",
    },
    sidebarSection: { display: "flex", flexDirection: "column", gap: 6 },
    sidebarHeader: { color: 'rgba(173,182,204,0.7)', fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', margin: '2px 0 6px 0' },
    navButton: {
      width: "100%",
      border: "1px solid transparent",
      borderRadius: 999,
      padding: "12px 14px",
      color: isDark ? "#c3c0ff" : "#425277",
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
      background: isDark ? "linear-gradient(135deg, #3626ce 0%, #5f0b7e 100%)" : "linear-gradient(135deg, #4e6bff 0%, #8a5cff 100%)",
      color: "#fff",
      boxShadow: "0 16px 30px rgba(31, 22, 81, 0.32)",
    },
    profileCard: {
      marginTop: "auto",
      paddingTop: 16,
      borderTop: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(18, 30, 52, 0.08)",
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
      width: 34,
      height: 34,
      borderRadius: 10,
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
    notifyDot: { marginLeft: 8, display: 'inline-block', minWidth: 18, height: 18, borderRadius: 18, background: 'linear-gradient(90deg,#6f3af2,#a746d1)', color: '#fff', fontSize: 11, lineHeight: '18px', textAlign: 'center', fontWeight: 800 },
    main: {
      marginLeft: 286,
      marginRight: 32,
      paddingTop: 28,
      paddingBottom: 32,
      minWidth: 0,
      boxSizing: "border-box",
    },
    mainInner: {
      width: "100%",
      maxWidth: 1400,
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      gap: 24,
      minWidth: 0,
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
    avatarInitials: { fontSize: "2.0rem", fontWeight: 800, letterSpacing: "-0.06em", color: "#fff" },
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
    detailLabel: { margin: 0, color: "#aab8cd", fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" },
    detailValue: { margin: "4px 0 0 0", color: "#fff", fontWeight: 700, wordBreak: "break-word", textAlign: "right", fontSize: "0.95rem" },
    footerNote: { marginTop: 16, color: "#aab8cd", fontSize: "0.88rem", lineHeight: 1.6 },
    banner: {
      padding: 28,
      borderRadius: 20,
      background: "linear-gradient(90deg, rgba(8,10,22,0.86) 0%, rgba(22,8,46,0.86) 50%, rgba(44,14,88,0.88) 100%)",
      border: "1px solid rgba(111,58,242,0.12)",
      color: "#fff",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 18,
      boxShadow: "0 24px 48px rgba(18,8,48,0.45)",
    },
    headerCard: {
      width: '100%',
      padding: 22,
      borderRadius: 14,
      background: 'linear-gradient(180deg, rgba(7,9,20,0.55), rgba(16,12,30,0.40))',
      border: '1px solid rgba(255,255,255,0.04)',
      boxShadow: '0 18px 40px rgba(5,8,20,0.45)',
      display: 'flex',
      alignItems: 'center',
      gap: 20,
      justifyContent: 'space-between',
      position: 'relative',
      overflow: 'hidden',
    },
    headerAvatarSquare: {
      width: 110,
      height: 110,
      borderRadius: 18,
      background: 'linear-gradient(145deg, #6f3af2 0%, #a746d1 100%)',
      display: 'grid',
      placeItems: 'center',
      color: '#fff',
      fontSize: 36,
      fontWeight: 900,
      boxShadow: '0 18px 40px rgba(101,47,183,0.28)',
      flex: '0 0 auto',
      position: 'relative',
    },
    avatarEditBtn: { position: 'absolute', top: 8, right: 8, width: 32, height: 32, borderRadius: 10, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.18)', border: '1px solid rgba(159,86,255,0.18)', color: '#efe6ff', cursor: 'pointer' },
    headerContent: { flex: 1, display: 'flex', flexDirection: 'column', gap: 6 },
    headerRight: { position: 'absolute', right: 28, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: 12 },
    headerEditBtn: { border: '1px solid rgba(111,58,242,0.9)', background: 'transparent', color: '#efe6ff', padding: '10px 18px', borderRadius: 16, fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 6px 18px rgba(111,58,242,0.06)' },
    bannerLeft: { display: "flex", gap: 18, alignItems: "center" },
    bannerAvatarBox: {
      width: 120,
      height: 120,
      borderRadius: 18,
      background: "linear-gradient(145deg, #6f3af2 0%, #a746d1 100%)",
      display: "grid",
      placeItems: "center",
      boxShadow: "0 18px 40px rgba(101,47,183,0.28)",
      border: "1px solid rgba(255,255,255,0.06)",
    },
    bannerName: { margin: 0, fontSize: "1.36rem", fontWeight: 800 },
    bannerEmail: { margin: "6px 0 0 0", color: "rgba(235,240,255,0.9)", fontSize: "0.92rem" },
    bannerBadges: { display: 'flex', gap: 12, marginTop: 12, alignItems: 'center' },
    activePill: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 12px',
      borderRadius: 999,
      background: 'rgba(6,20,12,0.7)',
      border: '1px solid rgba(74,222,128,0.14)',
      color: '#bbf7d0',
      fontWeight: 800,
    },
    avatarStatus: { display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(235,240,255,0.92)', fontWeight: 700 },
    editProfileBtn: {
      border: "1px solid rgba(111,58,242,0.9)",
      background: "transparent",
      color: "#efe6ff",
      padding: "10px 16px",
      borderRadius: 12,
      fontWeight: 800,
      cursor: "pointer",
      boxShadow: '0 6px 18px rgba(111,58,242,0.06)',
    },
    twoCol: { display: "grid", gridTemplateColumns: "1fr 420px", gap: 18, alignItems: "start" },
    infoCard: { padding: 20, borderRadius: 14, background: "rgba(8,15,24,0.72)", border: "1px solid rgba(255,255,255,0.06)" },
    infoCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 12 },
    infoIcon: { width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(145deg, rgba(111,58,242,0.15), rgba(167,70,209,0.06))', display: 'grid', placeItems: 'center', color: '#dfe7ff', fontWeight: 800 },
    rowIcon: { width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.03)', display: 'grid', placeItems: 'center', color: '#c3c6d0' },
    infoRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" },
    infoLabel: { margin: 0, color: "#aab8cd", fontSize: "0.78rem", fontWeight: 700 },
    infoValue: { margin: 0, color: "#fff", fontWeight: 700, fontSize: "0.95rem" },
    avatarCard: { padding: 20, borderRadius: 14, background: "rgba(8,15,24,0.72)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: 12, alignItems: "center", justifyContent: "center" },
    createAvatarBtn: { background: "linear-gradient(135deg, #6f3af2 0%, #a746d1 100%)", color: "#fff", border: "none", padding: "10px 18px", borderRadius: 12, cursor: "pointer", fontWeight: 700 },
    accountActivity: { display: "flex", gap: 12, marginTop: 18 },
    activityCard: { flex: 1, padding: 18, borderRadius: 12, background: "rgba(8,15,24,0.72)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" },
    activityTitle: { margin: 0, color: "#aab8cd", fontWeight: 700, fontSize: "0.95rem" },
    activityValue: { margin: 0, color: "#fff", fontSize: "1.12rem", fontWeight: 800 },
    accountSummary: {
      width: '100%',
      padding: 20,
      borderRadius: 14,
      background: 'rgba(8,15,24,0.6)',
      border: '1px solid rgba(255,255,255,0.03)',
      display: 'flex',
      alignItems: 'center',
      gap: 20,
      boxShadow: '0 18px 36px rgba(5,8,20,0.4)'
    },
    activityItem: { flex: 1, display: 'flex', gap: 14, alignItems: 'center', padding: '12px 6px' },
    activityDivider: { width: 1, height: 64, background: 'rgba(255,255,255,0.03)' },
    iconBubblePurple: { width: 56, height: 56, borderRadius: 999, display: 'grid', placeItems: 'center', background: 'radial-gradient(circle at 30% 30%, rgba(111,58,242,0.2), rgba(167,70,209,0.06))', boxShadow: '0 10px 22px rgba(101,47,183,0.14)' },
    iconBubbleGreen: { width: 56, height: 56, borderRadius: 999, display: 'grid', placeItems: 'center', background: 'radial-gradient(circle at 30% 30%, rgba(34,197,94,0.12), rgba(74,222,128,0.04))', boxShadow: '0 10px 22px rgba(34,197,94,0.08)' },
    activityLabel: { margin: 0, color: '#aab8cd', fontSize: '0.86rem', fontWeight: 700 },
    activitySmall: { margin: '6px 0 0 0', color: '#9fb0c9', fontSize: '0.85rem' },
    editModalOverlay: { position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.6)', display: 'grid', placeItems: 'center', zIndex: 1200 },
    editModal: { width: 520, padding: 20, borderRadius: 12, background: 'linear-gradient(180deg, #0c1118, #0b0e14)', border: '1px solid rgba(255,255,255,0.04)', boxShadow: '0 24px 48px rgba(2,6,23,0.6)' },
    editInput: { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', color: '#fff', marginTop: 8, boxSizing: 'border-box' },
    modalActions: { display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 },
    modalBtnPrimary: { background: 'linear-gradient(90deg,#6f3af2,#a746d1)', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: 10, cursor: 'pointer', fontWeight: 700 },
    modalBtnSecondary: { background: 'transparent', color: '#d1d7e6', border: '1px solid rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: 10, cursor: 'pointer', fontWeight: 700 },
  };

  const displayName = usernameState || emailState || username || email || "VirtuFit 3D Member";
  const initials = (displayName || "V").trim().slice(0, 2).toUpperCase();
  const avatarLabel = generatedAvatar ? "Avatar linked" : "No avatar yet";

  function openEditModal() {
    setEditName(usernameState || username || "");
    setEditEmail(emailState || email || "");
    setShowEditModal(true);
  }

  function closeEditModal() {
    setShowEditModal(false);
  }

  function saveProfile() {
    const nameToSave = (editName || "").trim();
    const emailToSave = (editEmail || "").trim();
    localStorage.setItem('username', nameToSave);
    localStorage.setItem('userEmail', emailToSave);
    setUsernameState(nameToSave);
    setEmailState(emailToSave);
    setShowEditModal(false);
  }

  // close modals on Escape
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') {
        if (showPhotoModal) {
          setShowPhotoModal(false);
          setPhotoError('');
        }
        if (showEditModal) setShowEditModal(false);
      }
    }
    if (showPhotoModal || showEditModal) {
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }
    return undefined;
  }, [showPhotoModal, showEditModal]);

  return (
    <div style={styles.page}>
      <DashboardSidebar />

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

          <section style={styles.headerCard}>
            <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
              <div style={styles.headerAvatarSquare}>
                {generatedAvatar ? (
                  <img src={generatedAvatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 14 }} />
                ) : (
                  <span style={{ fontSize: 36, fontWeight: 800 }}>{initials}</span>
                )}
                <button
                  style={{
                    ...styles.avatarEditBtn,
                    background: avatarHover ? 'rgba(111,58,242,0.18)' : styles.avatarEditBtn.background,
                    transform: avatarHover ? 'translateY(-1px)' : 'none',
                  }}
                  onClick={openAvatarConfirm}
                  aria-label="Change avatar"
                  title="Change profile photo"
                  onMouseEnter={() => setAvatarHover(true)}
                  onMouseLeave={() => setAvatarHover(false)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="#efe6ff"/>
                    <path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="#efe6ff"/>
                  </svg>
                </button>
              </div>
              <div style={styles.headerContent}>
                <h3 style={styles.bannerName}>{displayName}</h3>
                <p style={styles.bannerEmail}>{email || "No email saved"}</p>
                <div style={styles.bannerBadges}>
                  <div style={styles.activePill}>
                    <span style={{ width: 10, height: 10, borderRadius: 999, background: '#4ade80', boxShadow: '0 0 10px rgba(74,222,128,0.55)' }} />
                    <span>Active Account</span>
                  </div>

                  <div style={styles.avatarStatus}>
                    <span style={{ display: 'inline-block', width: 18, height: 18, borderRadius: 6, background: 'rgba(255,255,255,0.12)', display: 'grid', placeItems: 'center', color: '#fff', fontSize: 12 }}>
                      ⎔
                    </span>
                    <span>Avatar: {generatedAvatar ? 'Created' : 'Not Created'}</span>
                  </div>
                </div>
              </div>
            </div>

            
          </section>
          {showEditModal && (
            <div style={styles.editModalOverlay}>
              <div style={styles.editModal} role="dialog" aria-modal="true">
                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', fontWeight: 800 }}>Edit Profile</h3>
                <label style={{ marginTop: 12, color: '#aab8cd', fontWeight: 700 }}>Full name</label>
                <input style={styles.editInput} value={editName} onChange={(e) => setEditName(e.target.value)} />
                <label style={{ marginTop: 12, color: '#aab8cd', fontWeight: 700 }}>Email address</label>
                <input style={styles.editInput} value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
                <div style={styles.modalActions}>
                  <button style={styles.modalBtnSecondary} onClick={closeEditModal}>Cancel</button>
                  <button style={styles.modalBtnPrimary} onClick={saveProfile}>Save</button>
                </div>
              </div>
            </div>
          )}
          {showPhotoModal && (
            <div
              style={styles.editModalOverlay}
              onClick={(e) => { if (e.target === e.currentTarget) setShowPhotoModal(false); }}
            >
              <div style={styles.editModal} role="dialog" aria-modal="true" aria-label="Update Profile Photo">
                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', fontWeight: 800 }}>Update Profile Photo</h3>
                <p style={{ color: '#aab8cd', marginTop: 12 }}>Do you want to upload a profile photo?</p>
                {photoError && <p style={{ color: '#ffb4b4', marginTop: 10 }}>{photoError}</p>}
                <div style={styles.modalActions}>
                  <button style={styles.modalBtnSecondary} onClick={() => { setShowPhotoModal(false); setPhotoError(''); }}>Cancel</button>
                  <button style={styles.modalBtnPrimary} onClick={triggerFileInput}>Upload Photo</button>
                </div>
              </div>
            </div>
          )}
          <input ref={avatarInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" style={{ display: 'none' }} onChange={handleAvatarFileChange} />

          <div style={styles.twoCol}>
            <div style={styles.infoCard}>
                <div style={styles.infoCardHeader}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={styles.infoIcon}>👤</div>
                    <h3 style={{ margin: 0, fontSize: '1.06rem', fontWeight: 800, color: '#fff' }}>Personal Information</h3>
                  </div>
                  <button style={{ ...styles.headerEditBtn, fontSize: 14 }} onClick={openEditModal}>✎ Edit</button>
                </div>

              <div style={{ marginTop: 12 }}>
                <div style={styles.infoRow}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={styles.rowIcon}>🧾</div>
                    <p style={styles.infoLabel}>Full Name</p>
                  </div>
                  <p style={styles.infoValue}>{displayName}</p>
                </div>
                <div style={styles.infoRow}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={styles.rowIcon}>✉️</div>
                    <p style={styles.infoLabel}>Email Address</p>
                  </div>
                  <p style={styles.infoValue}>{email || 'Not provided'}</p>
                </div>
                <div style={styles.infoRow}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={styles.rowIcon}>@</div>
                    <p style={styles.infoLabel}>Username</p>
                  </div>
                  <p style={styles.infoValue}>{username || 'Not set'}</p>
                </div>
              </div>
            </div>

            <aside style={styles.avatarCard}>
              <div style={{ width: 120, height: 120, borderRadius: 999, background: 'radial-gradient(circle at 30% 30%, rgba(111,58,242,0.35), rgba(167,70,209,0.12))', display: 'grid', placeItems: 'center', color: '#fff', fontSize: 28, fontWeight: 800 }}>
                {generatedAvatar ? (
                  <img src={generatedAvatar} alt="avatar" style={{ width: 120, height: 120, borderRadius: 999, objectFit: 'cover' }} />
                ) : (
                  initials
                )}
              </div>
              <h4 style={{ margin: 0, color: '#fff', fontWeight: 800 }}>No avatar created yet</h4>
              <p style={{ margin: 0, color: '#cfe3ff' }}>Create your personalized 3D avatar to begin your virtual try-on experience.</p>
              <button style={{ ...styles.createAvatarBtn, background: 'linear-gradient(90deg,#6f3af2,#a746d1)' }} onClick={() => navigate('/dashboard')}>Create Avatar</button>
            </aside>
          </div>

          <div style={styles.accountSummary}>
            <div style={styles.activityItem}>
              <div style={styles.iconBubblePurple} aria-hidden>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 6v6l4 2" stroke="#bfb7ff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="9" stroke="#cdbdff" strokeWidth="1.2"/>
                </svg>
              </div>
              <div>
                <p style={styles.activityTitle}>Try-On Sessions</p>
                <p style={styles.activityValue}>0</p>
                <p style={styles.activitySmall}>Total try-on sessions</p>
              </div>
            </div>

            <div style={styles.activityDivider} />

            <div style={styles.activityItem}>
              <div style={styles.iconBubblePurple} aria-hidden>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" stroke="#d9cffb" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4 20c0-3.31 2.69-6 6-6h4c3.31 0 6 2.69 6 6" stroke="#d9cffb" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <p style={styles.activityTitle}>Saved Avatar</p>
                <p style={styles.activityValue}>{generatedAvatar ? 'Available' : 'Not Available'}</p>
                <p style={styles.activitySmall}>{generatedAvatar ? 'Your avatar is ready' : 'No avatar created yet'}</p>
              </div>
            </div>

            <div style={styles.activityDivider} />

            <div style={styles.activityItem}>
              <div style={styles.iconBubbleGreen} aria-hidden>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2l3 5 6 .9-4.5 4 1.1 6L12 16l-5.6 3.9 1.1-6L3 7.9 9 7 12 2z" stroke="#aff8d1" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9.5 12.5l1.8 1.8L15 10" stroke="#1ee38a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <p style={styles.activityTitle}>Account Status</p>
                <p style={styles.activityValue}>Active</p>
                <p style={styles.activitySmall}>Your account is active</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Profile;