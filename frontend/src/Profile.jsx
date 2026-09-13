import React, { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardSidebar from "./components/DashboardSidebar";
import { useAppTheme } from "./theme";
import API_URL, { resolveProfilePhotoUrl } from "./config";

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
  const [avatarUpdated, setAvatarUpdated] = useState(null);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(localStorage.getItem('profilePhoto') || null);
  const [saveProfileError, setSaveProfileError] = useState("");
  const location = useLocation();

  useEffect(() => {
    const onUpdate = (e) => {
      const v = e?.detail?.profilePhoto;
      if (v) setProfilePhoto(v);
    };
    window.addEventListener('profile-updated', onUpdate);
    return () => window.removeEventListener('profile-updated', onUpdate);
  }, []);

  const email = localStorage.getItem("userEmail");
  const username = localStorage.getItem("username");

  useEffect(() => {
    setGeneratedAvatar(
      localStorage.getItem("avatarUrl") ||
      localStorage.getItem("avatar_file") ||
      localStorage.getItem("generatedAvatar") ||
      ""
    );

    // Attempt to discover an avatar timestamp from several possible sources.
    (function discoverAvatarTimestamp() {
      // 1) Check navigation state (if someone came with avatar data)
      try {
        const fromLocation = location?.state?.avatar || location?.state;
        if (fromLocation && typeof fromLocation === 'object') {
          const cand = fromLocation.updatedAt || fromLocation.updated_at || fromLocation.createdAt || fromLocation.created_at || fromLocation.timestamp || fromLocation.ts;
          if (cand) {
            const parsed = Date.parse(cand);
            if (!Number.isNaN(parsed)) {
              setAvatarUpdated(parsed);
              return;
            }
          }
        }
      } catch (e) {
        // ignore
      }

      // 2) Check well-known localStorage keys that may contain timestamp metadata
      const keysToCheck = [
        'avatar_updated', 'avatarUpdated', 'avatarTimestamp', 'avatar_timestamp',
        'generatedAvatarMeta', 'avatar_meta', 'avatarInfo', 'avatar',
      ];

      for (const k of keysToCheck) {
        try {
          const raw = localStorage.getItem(k);
          if (!raw) continue;

          // If raw looks like JSON, try to parse and grab fields
          if ((raw.startsWith('{') && raw.endsWith('}')) || (raw.startsWith('[') && raw.endsWith(']'))) {
            try {
              const obj = JSON.parse(raw);
              const cand = obj.updatedAt || obj.updated_at || obj.createdAt || obj.created_at || obj.timestamp || obj.ts || obj.time;
              if (cand) {
                const parsed = Date.parse(cand);
                if (!Number.isNaN(parsed)) {
                  setAvatarUpdated(parsed);
                  return;
                }
              }
            } catch (e) {
              // fallthrough
            }
          }

          // raw may itself be an ISO timestamp string
          const parsedRaw = Date.parse(raw);
          if (!Number.isNaN(parsedRaw)) {
            setAvatarUpdated(parsedRaw);
            return;
          }

          // raw may be a URL with a query param timestamp e.g., ?t=163...
          try {
            const url = new URL(raw, window.location.origin);
            const t = url.searchParams.get('t') || url.searchParams.get('ts');
            if (t) {
              const parsedT = Date.parse(t) || Number(t);
              if (!Number.isNaN(parsedT)) {
                setAvatarUpdated(parsedT);
                return;
              }
            }
          } catch (e) {
            // ignore non-URLs
          }
        } catch (e) {
          // ignore
        }
      }

      // 3) If we find nothing, leave avatarUpdated as null (UI will hide Last updated)
    })();

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
  }, [location]);

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

  async function handleAvatarFileChange(e) {
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

    // If user is authenticated, upload to backend to persist in DB
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const form = new FormData();
        form.append('photo', file);

        const resp = await fetch(`${API_URL}/profile/photo`, {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + token,
          },
          body: form,
        });

        const data = await resp.json();
        if (!resp.ok) {
          setPhotoError(data.message || 'Upload failed');
          e.target.value = '';
          return;
        }

        const photoUrl = data.profile_image_url;
        if (photoUrl) {
          // persist for client-side immediate use
          try {
            localStorage.setItem('profilePhoto', photoUrl);
          } catch (err) {
            // ignore
          }

          // update header avatar display (store profile photo for header/sidebar)
          setProfilePhoto(photoUrl);

          // notify other components (sidebar) that profile changed
          window.dispatchEvent(new CustomEvent('profile-updated', { detail: { profilePhoto: photoUrl } }));
        }

        setPhotoError("");
        setShowPhotoModal(false);
      } catch (err) {
        console.error(err);
        setPhotoError('Upload failed');
        e.target.value = '';
      }

      return;
    }

    // Fallback for non-authenticated workflows — preserve existing behaviour
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
      maxWidth: 1280,
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      gap: 22,
      padding: '0 20px',
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
      padding: 24,
      minHeight: 112,
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
      width: 96,
      height: 96,
      borderRadius: 16,
      background: 'linear-gradient(145deg, #6f3af2 0%, #a746d1 100%)',
      display: 'grid',
      placeItems: 'center',
      color: '#fff',
      fontSize: 28,
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
    twoCol: { display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 22, alignItems: "start" },
    infoCard: { padding: 22, minHeight: 260, borderRadius: 14, background: "rgba(8,15,24,0.72)", border: "1px solid rgba(255,255,255,0.06)" },
    infoCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 12 },
    infoIcon: { width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(145deg, rgba(111,58,242,0.15), rgba(167,70,209,0.06))', display: 'grid', placeItems: 'center', color: '#dfe7ff', fontWeight: 800 },
    rowIcon: { width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.03)', display: 'grid', placeItems: 'center', color: '#c3c6d0' },
    infoRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" },
    infoLabel: { margin: 0, color: "#aab8cd", fontSize: "0.78rem", fontWeight: 700 },
    infoValue: { margin: 0, color: "#fff", fontWeight: 700, fontSize: "0.95rem" },
    avatarCard: { padding: 22, minHeight: 260, borderRadius: 14, background: "rgba(8,15,24,0.72)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: 12, alignItems: "center", justifyContent: "center" },
    createAvatarBtn: { background: "linear-gradient(135deg, #6f3af2 0%, #a746d1 100%)", color: "#fff", border: "none", padding: "10px 18px", borderRadius: 12, cursor: "pointer", fontWeight: 700 },
    accountActivity: { display: "flex", gap: 12, marginTop: 18 },
    activityCard: { flex: 1, padding: 18, borderRadius: 12, background: "rgba(8,15,24,0.72)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" },
    activityTitle: { margin: 0, color: "#aab8cd", fontWeight: 700, fontSize: "0.95rem" },
    activityValue: { margin: 0, color: "#fff", fontSize: "1.12rem", fontWeight: 800 },
    accountSummary: {
      width: 'auto',
      maxWidth: 420,
      padding: 16,
      borderRadius: 14,
      background: 'rgba(8,15,24,0.6)',
      border: '1px solid rgba(255,255,255,0.03)',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      boxShadow: '0 12px 24px rgba(5,8,20,0.28)',
      marginTop: 4,
    },
    activityItem: { flex: '0 0 360px', display: 'flex', gap: 14, alignItems: 'center', padding: '12px 6px', minWidth: 320, maxWidth: 420 },
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

  const avatarModelUrl = useMemo(() => {
    const candidates = [
      location.state?.avatarUrl,
      location.state?.avatar_file,
      location.state?.avatarFile,
      localStorage.getItem("avatarUrl"),
      localStorage.getItem("avatar_file"),
      localStorage.getItem("generatedAvatar"),
    ];

    const cleanApiUrl = API_URL.replace(/\/$/, "");

    for (const value of candidates) {
      if (typeof value !== "string" || !value.trim()) continue;
      const trimmed = value.trim();
      // Accept only avatars served by the current backend
      if (trimmed.startsWith(`${cleanApiUrl}/generated-avatars/`)) {
        return trimmed;
      }

      // Accept relative generated-avatar URLs
      if (trimmed.startsWith("/generated-avatars/")) {
        return `${cleanApiUrl}${trimmed}`;
      }
    }

    return null;
  }, [location.state]);

  function openEditModal() {
    setEditName(usernameState || username || "");
    setEditEmail(emailState || email || "");
    setShowEditModal(true);
  }

  function closeEditModal() {
    setShowEditModal(false);
  }

  async function saveProfile() {
    setSaveProfileError('');
    const nameToSave = (editName || "").trim();
    const emailToSave = (editEmail || "").trim();

    if (!nameToSave || nameToSave.length < 3) {
      setSaveProfileError('Username must be at least 3 characters');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailToSave)) {
      setSaveProfileError('Please provide a valid email address');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setSaveProfileError('You must be logged in to update your profile');
      return;
    }

    try {
      const resp = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({ username: nameToSave, email: emailToSave }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        setSaveProfileError(data.message || (data.field ? `${data.field} conflict` : 'Failed to update profile'));
        return;
      }

      const updatedUser = data.user;

      // persist locally after server confirms
      try { localStorage.setItem('username', updatedUser.username); } catch (e) {}
      try { localStorage.setItem('userEmail', updatedUser.email); } catch (e) {}

      setUsernameState(updatedUser.username);
      setEmailState(updatedUser.email);

      // notify other components (sidebar)
      window.dispatchEvent(new CustomEvent('profile-updated', { detail: { username: updatedUser.username, email: updatedUser.email } }));

      setShowEditModal(false);
    } catch (err) {
      console.error('Profile save error:', err);
      setSaveProfileError('Connection failed');
    }
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
            <div style={{ display: 'flex', gap: 18, alignItems: 'center', width: '100%' }}>
              <div style={styles.headerAvatarSquare}>
                {(profilePhoto || generatedAvatar) ? (
                  <img src={resolveProfilePhotoUrl(profilePhoto || generatedAvatar)} alt="avatar" onError={(e) => { setProfilePhoto(null); }} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 14 }} />
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
                <h3 style={styles.bannerName}>{usernameState || username || displayName}</h3>
                <p style={styles.bannerEmail}>{email || "No email saved"}</p>
                <div style={styles.bannerBadges}>
                  <div style={styles.avatarStatus}>
                    <span style={{ display: 'inline-block', width: 18, height: 18, borderRadius: 6, background: 'rgba(255,255,255,0.12)', display: 'grid', placeItems: 'center', color: '#fff', fontSize: 12 }}>
                      ⎔
                    </span>
                    <span>Avatar: {generatedAvatar ? 'Created' : 'Not Created'}</span>
                  </div>
                </div>
              </div>

              <div style={styles.headerRight}>
                <button style={styles.headerEditBtn} onClick={openEditModal} aria-label="Edit profile">Edit Profile</button>
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
                {saveProfileError && <p style={{ color: '#ffb4b4', marginTop: 10 }}>{saveProfileError}</p>}
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
              <div style={{ width: 120, height: 120, borderRadius: 14, background: 'linear-gradient(145deg, rgba(111,58,242,0.08), rgba(167,70,209,0.04))', display: 'grid', placeItems: 'center', color: '#fff', fontSize: 28, fontWeight: 800 }}>
                {/* Do NOT display profile photo here — this card must represent the 3D avatar state */}
                {avatarModelUrl ? (
                  // Simple 3D avatar thumbnail placeholder — the full viewer is available via 'Open Avatar'
                  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <rect width="64" height="64" rx="8" fill="rgba(255,255,255,0.02)" />
                    <path d="M32 36c6 0 10 3 10 6v2H22v-2c0-3 4-6 10-6z" fill="#bfc8dc" />
                    <circle cx="32" cy="22" r="8" fill="#dfe7f8" />
                  </svg>
                ) : (
                  // Neutral placeholder
                  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <rect width="64" height="64" rx="8" fill="rgba(255,255,255,0.02)" />
                    <path d="M32 36c6 0 10 3 10 6v2H22v-2c0-3 4-6 10-6z" fill="#9fb0c9" />
                    <circle cx="32" cy="22" r="8" fill="#cfe3ff" />
                  </svg>
                )}
              </div>

              {avatarModelUrl ? (
                <>
                  <h4 style={{ margin: '12px 0 0 0', color: '#fff', fontWeight: 800 }}>Your Avatar</h4>
                  <p style={{ margin: '6px 0 0 0', color: '#cfe3ff' }}>Your personalized 3D avatar is ready.</p>

                  {/* Optional metadata row: Last updated (only when a valid timestamp is available) */}
                  {avatarUpdated ? (
                    <div style={{ marginTop: 8, color: '#9fb0c9', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                        <path d="M12 6v6l4 2" stroke="#9fb0c9" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="12" r="9" stroke="#9fb0c9" strokeWidth="1.2"/>
                      </svg>
                      <span style={{ color: '#9fb0c9' }}>Last updated · {new Date(avatarUpdated).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  ) : null}

                  <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                    <button style={{ ...styles.createAvatarBtn, background: 'linear-gradient(90deg,#6f3af2,#a746d1)' }} onClick={() => navigate('/avatar-viewer')}>Open Avatar</button>
                  </div>
                </>
              ) : (
                <>
                  <h4 style={{ margin: '12px 0 0 0', color: '#fff', fontWeight: 800 }}>No avatar generated yet</h4>
                  <p style={{ margin: '6px 0 0 0', color: '#cfe3ff' }}>Generate your personalized 3D avatar to begin virtual try-on.</p>
                  <button style={{ ...styles.createAvatarBtn, background: 'linear-gradient(90deg,#6f3af2,#a746d1)' }} onClick={() => navigate('/dashboard')}>Generate Avatar</button>
                </>
              )}
            </aside>
          </div>
 

          {/* Lower two-column grid: Try-On Sessions + Privacy & Biometric Data */}
          <>
            <style>{`.profile-lower-grid { margin-top: 22px; display: grid; grid-template-columns: 0.8fr 1.2fr; gap: 22px; align-items: stretch; }
              @media (max-width: 900px) { .profile-lower-grid { grid-template-columns: 1fr; } }`}</style>

            <div className="profile-lower-grid">
              {/* Try-On Sessions card */}
              <div style={{ padding: 20, borderRadius: 14, background: 'rgba(8,15,24,0.72)', border: '1px solid rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', gap: 14, width: '100%', height: '100%' }}>
                <div style={styles.iconBubblePurple} aria-hidden>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 6v6l4 2" stroke="#bfb7ff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="9" stroke="#cdbdff" strokeWidth="1.2"/>
                  </svg>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <p style={styles.activityTitle}>Try-On Sessions</p>
                  <p style={styles.activityValue}>{viewHistoryCount}</p>
                  <p style={styles.activitySmall}>Total try-on sessions</p>
                </div>
              </div>

              {/* Privacy & Biometric Data card */}
              <div style={{ padding: 20, borderRadius: 14, background: 'rgba(8,15,24,0.6)', border: '1px solid rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', gap: 14, width: '100%', height: '100%' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, display: 'grid', placeItems: 'center', background: 'rgba(111,58,242,0.08)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2l6 3v5c0 5-3.58 9.74-6 12-2.42-2.26-6-7-6-12V5l6-3z" stroke="#cfc9ff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6 }}>
                  <strong style={{ color: '#fff', fontSize: 14 }}>Privacy & Biometric Data</strong>
                  <p style={{ margin: 0, color: '#9fb0c9', fontSize: 13 }}>Your uploaded photos and body-related data are used to create your personalized 3D avatar and support the virtual try-on experience.</p>
                  <div style={{ marginTop: 6 }}>
                    <button style={{ ...styles.secondaryButton, padding: '8px 10px', fontSize: 13 }} onClick={() => setShowPrivacyModal(true)}>Learn about your data</button>
                  </div>
                </div>
              </div>
            </div>
          </>
          {showPrivacyModal && (
            <div style={styles.editModalOverlay} onClick={(e) => { if (e.target === e.currentTarget) setShowPrivacyModal(false); }}>
              <div style={{ ...styles.editModal, width: 640 }} role="dialog" aria-modal="true" aria-label="Privacy & Biometric Data">
                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', fontWeight: 800 }}>Privacy & Biometric Data</h3>
                <p style={{ marginTop: 10, color: '#aab8cd' }}>Information about how photos, avatar models, and fit-related data are used within VirtuFit 3D.</p>

                <div style={{ marginTop: 14, display: 'grid', gap: 12 }}>
                  <div>
                    <h4 style={{ margin: '0 0 6px 0', color: '#fff', fontSize: 14 }}>Photo Data</h4>
                    <p style={{ margin: 0, color: '#cfe3ff' }}>Photos you upload are used to generate a personalized 3D avatar.</p>
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 6px 0', color: '#fff', fontSize: 14 }}>Avatar Data</h4>
                    <p style={{ margin: 0, color: '#cfe3ff' }}>The generated 3D avatar is used to power the virtual try-on experience in the app.</p>
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 6px 0', color: '#fff', fontSize: 14 }}>Fit Data</h4>
                    <p style={{ margin: 0, color: '#cfe3ff' }}>Body and fit-related information may be used to provide fit analysis and personalized recommendations.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
                  <button style={styles.modalBtnSecondary} onClick={() => setShowPrivacyModal(false)}>Close</button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
 
export default Profile;
