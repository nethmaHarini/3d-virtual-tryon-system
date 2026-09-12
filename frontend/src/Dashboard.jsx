import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API_URL from "./config";
import DashboardSidebar from "./components/DashboardSidebar";
import { useAppTheme } from "./theme";

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useAppTheme();
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [sideImage, setSideImage] = useState(null);
  const [height, setHeight] = useState("");
  const [gender, setGender] = useState("");
  const [loading, setLoading] = useState(false);
  const [frontPreview, setFrontPreview] = useState("");
  const [backPreview, setBackPreview] = useState("");
  const [sidePreview, setSidePreview] = useState("");
  const [hoveredTile, setHoveredTile] = useState("");
  const [isGenerateHovered, setIsGenerateHovered] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showPhotoGuide, setShowPhotoGuide] = useState(false);
  const frontInputRef = useRef(null);
  const backInputRef = useRef(null);
  const sideInputRef = useRef(null);
  const email = localStorage.getItem("userEmail");

  const _regenQuery = new URLSearchParams(location.search).get("regen");
  const regenRequested = _regenQuery === "true" || (location.state && location.state.regen === true);

  const hasGeneratedAvatar = !regenRequested && (
    Boolean(localStorage.getItem("avatar_file")) ||
    Boolean(localStorage.getItem("avatarUrl")) ||
    Boolean(localStorage.getItem("generatedAvatar"))
  );

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  // Clear generated avatar data and return to the photo upload portion of the dashboard
  const handleRegenerate = () => {
    try {
      localStorage.removeItem("avatar_file");
      localStorage.removeItem("avatarUrl");
      localStorage.removeItem("generatedAvatar");
      // If there are other avatar-related keys they can be cleared here as well
    } catch (e) {
      console.warn("Error clearing avatar data:", e);
    }
    // Navigate to dashboard and include a query param that forces the upload UI to show
    navigate("/dashboard?regen=true", { replace: true });
  };

  // Navigate to the try-on page
  const handleTryOn = () => {
    navigate("/try-on");
  };

  useEffect(() => {
    return () => {
      if (frontPreview) {
        URL.revokeObjectURL(frontPreview);
      }
      if (backPreview) {
        URL.revokeObjectURL(backPreview);
      }
      if (sidePreview) {
        URL.revokeObjectURL(sidePreview);
      }
    };
  }, [frontPreview, backPreview, sidePreview]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const updateImageState = (position, file) => {
  if (!file) {
    return;
  }

  // Only allow JPG, JPEG and PNG
  const allowedTypes = [
    "image/jpeg",
    "image/png",
  ];

  const allowedExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
  ];

  const fileName = file.name.toLowerCase();

  const extension = fileName.substring(
    fileName.lastIndexOf(".")
  );

  const validType = allowedTypes.includes(file.type);
  const validExtension =
    allowedExtensions.includes(extension);

  // Reject unsupported file formats
  if (!validType || !validExtension) {
    setError(
      "Invalid file format. Only JPG, JPEG, and PNG images are allowed."
    );

    setSuccess("");

    // Automatically remove error after 4 seconds
    return;
  }

  // Clear previous error
  setError("");

  const nextPreview = URL.createObjectURL(file);

  if (position === "front") {
    if (frontPreview) {
      URL.revokeObjectURL(frontPreview);
    }

    setFrontImage(file);
    setFrontPreview(nextPreview);
    return;
  }

  if (position === "back") {
    if (backPreview) {
      URL.revokeObjectURL(backPreview);
    }

    setBackImage(file);
    setBackPreview(nextPreview);
    return;
  }

  if (sidePreview) {
    URL.revokeObjectURL(sidePreview);
  }

  setSideImage(file);
  setSidePreview(nextPreview);
};

  const handleGenerateAvatar = async () => {
    if (!frontImage || !backImage || !sideImage) {
      setError("Please upload all images");
      return;
    }

    if (!height || height < 100 || height > 230) {
      setError("Please enter a valid height (100–230 cm)");
      return;
    }

    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const formData = new FormData();
      formData.append("frontImage", frontImage);
      formData.append("backImage", backImage);
      formData.append("sideImage", sideImage);
      formData.append("height", height);
      formData.append("gender", gender);

      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/generate-avatar`, {
        method: "POST",
        body: formData,
        headers: { Authorization: token ? "Bearer " + token : undefined },
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        console.log("Uploaded data:", data);
        const avatarUrl =
          data?.avatarUrl ||
          data?.avatar?.avatarUrl ||
          data?.avatar?.avatar_file ||
          data?.avatar_file ||
          "";

        if (avatarUrl) {
          localStorage.setItem("avatarUrl", avatarUrl);
          localStorage.setItem("avatar_file", avatarUrl);
          localStorage.setItem("generatedAvatar", avatarUrl);
        }

        navigate("/avatar-viewer", {
          replace: true,
          state: {
            avatarUrl,
            avatar: data.avatar,
            avatar_file: avatarUrl,
            avatarFile: avatarUrl,
          },
        });
      } else {
        setError(data.message);
      }
    } catch (fetchError) {
      console.error(fetchError);
      setError("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    page: {
      width: "100%",
      minWidth: 0,
      minHeight: "100vh",
      background:
        isDark
          ? "radial-gradient(circle at 12% 16%, rgba(54, 38, 206, 0.22) 0%, transparent 38%), radial-gradient(circle at 88% 84%, rgba(95, 11, 126, 0.24) 0%, transparent 48%), linear-gradient(155deg, #090f17 0%, #0d141d 48%, #111a27 100%)"
          : "radial-gradient(circle at 12% 16%, rgba(78, 107, 255, 0.16) 0%, transparent 38%), radial-gradient(circle at 88% 84%, rgba(138, 92, 255, 0.12) 0%, transparent 48%), linear-gradient(155deg, #f7f9ff 0%, #edf2ff 48%, #eaf0fb 100%)",
      color: isDark ? "#dce3f0" : "#152033",
      fontFamily: "'Manrope', 'Segoe UI', sans-serif",
      position: "relative",
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
    sidebarHeader: { color: isDark ? 'rgba(173,182,204,0.7)' : 'rgba(83, 96, 117, 0.72)', fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', margin: '2px 0 6px 0' },
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
      paddingLeft: 12,
      paddingRight: 12,
    },
    sidebarFooter: {
      marginTop: "auto",
      paddingTop: 12,
      borderTop: isDark ? "1px solid rgba(255, 255, 255, 0.03)" : "1px solid rgba(18, 30, 52, 0.06)",
      display: "flex",
      flexDirection: "column",
      gap: 8,
    },
    notifyDot: { marginLeft: 8, display: 'inline-block', minWidth: 18, height: 18, borderRadius: 18, background: 'linear-gradient(90deg,#6f3af2,#a746d1)', color: '#fff', fontSize: 11, lineHeight: '18px', textAlign: 'center', fontWeight: 800 },
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
      color: isDark ? "rgba(195, 198, 208, 0.78)" : "rgba(83, 96, 117, 0.78)",
      letterSpacing: "0.16em",
      textTransform: "uppercase",
      fontWeight: 700,
    },
    main: {
      marginLeft: 286,
      marginRight: 32,
      paddingTop: 28,
      paddingBottom: 32,
      minHeight: "100vh",
      minWidth: 0,
      boxSizing: "border-box",
    },
    mainInner: {
      width: "100%",
      maxWidth: 1220,
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      gap: 24,
      minWidth: 0,
    },
    pageHeader: {
      marginBottom: 0,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 22,
      flexWrap: "wrap",
      width: "100%",
      maxWidth: 1220,
      marginLeft: "auto",
      marginRight: "auto",
    },
    headerTitle: {
      margin: 0,
      fontSize: "2.25rem",
      color: "#ffffff",
      letterSpacing: "-0.02em",
      lineHeight: 1.1,
      fontWeight: 800,
      fontFamily: "'Plus Jakarta Sans', 'Manrope', sans-serif",
    },
    headerSub: {
      margin: "8px 0 0 0",
      fontSize: "0.97rem",
      color: "#c3c6d0",
      lineHeight: 1.5,
      maxWidth: 640,
    },
    statusBadge: {
      padding: "9px 14px",
      borderRadius: 999,
      border: "1px solid rgba(255, 255, 255, 0.08)",
      background: "rgba(21, 28, 38, 0.72)",
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      fontSize: "0.7rem",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.1em",
      color: "#c3c6d0",
      marginLeft: "auto",
      whiteSpace: "nowrap",
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: "999px",
      background: "#a4c9fc",
      boxShadow: "0 0 10px rgba(164, 201, 252, 0.8)",
      animation: "dashPulse 1.4s ease-in-out infinite",
    },
    newGrid: {
      width: "100%",
      maxWidth: 1040,
      margin: "0 auto",
      display: "grid",
      gridTemplateColumns: "minmax(0, 1fr)",
      gap: 22,
      alignItems: "stretch",
    },
    existingGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
      gap: 20,
      gridAutoRows: "208px",
    },
    glassCard: {
      background: "rgba(21, 28, 38, 0.65)",
      border: "1px solid rgba(255, 255, 255, 0.07)",
      borderRadius: 22,
      backdropFilter: "blur(24px)",
      boxShadow: "0 22px 44px rgba(5, 12, 22, 0.34)",
      boxSizing: "border-box",
    },
    creatorSection: {
      width: "100%",
      maxWidth: 1040,
      margin: "0 auto",
      padding: 30,
      position: "relative",
      overflow: "hidden",
    },
    sectionHeading: {
      margin: 0,
      fontSize: "1.52rem",
      fontWeight: 800,
      color: "#ffffff",
      fontFamily: "'Plus Jakarta Sans', 'Manrope', sans-serif",
      letterSpacing: "-0.01em",
    },
    sectionSub: {
      margin: "6px 0 0 0",
      color: "#c3c6d0",
      fontSize: "0.9rem",
      lineHeight: 1.45,
    },
    feedbackText: {
      margin: "12px 0 0 0",
      padding: "10px 12px",
      borderRadius: 12,
      fontSize: "0.9rem",
      fontWeight: 600,
      textAlign: "center",
    },
    uploadRow: {
      marginTop: 22,
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: 16,
    },
    uploadTile: {
      minHeight: 250,
      aspectRatio: "3 / 4",
      borderRadius: 18,
      background: "rgba(8, 15, 24, 0.9)",
      display: "flex",
      flexDirection: "column",
      alignItems: "stretch",
      justifyContent: "space-between",
      color: "#c3c6d0",
      fontWeight: 700,
      letterSpacing: "0.03em",
      padding: 12,
      boxSizing: "border-box",
      textAlign: "center",
      cursor: "pointer",
      overflow: "hidden",
      transition: "box-shadow 0.18s ease, transform 0.18s ease, border-color 0.18s ease, background 0.18s ease",
    },
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: 12,
      display: "grid",
      placeItems: "center",
      border: "1px solid rgba(141, 145, 153, 0.46)",
      background: "rgba(36, 42, 52, 0.75)",
    },
    hiddenInput: {
      display: "none",
    },
    previewImage: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      borderRadius: 12,
    },
    controlsRow: {
      marginTop: 24,
      paddingTop: 18,
      borderTop: "1px solid rgba(255, 255, 255, 0.1)",
      display: "grid",
      gridTemplateColumns: "minmax(0, 1fr) auto",
      gap: 20,
      alignItems: "end",
    },
    measurementFields: {
      display: "grid",
      gridTemplateColumns: "minmax(0, 1fr) minmax(170px, 0.8fr)",
      gap: 12,
      alignItems: "end",
    },
    measurementField: {
      minWidth: 0,
    },
    inputLabel: {
      display: "block",
      fontSize: "0.72rem",
      color: "#c3c6d0",
      letterSpacing: "0.12em",
      marginBottom: 8,
      textTransform: "uppercase",
      fontWeight: 700,
    },
    heightInput: {
      width: "100%",
      boxSizing: "border-box",
      padding: "13px 14px",
      borderRadius: 14,
      border: "1px solid rgba(141, 145, 153, 0.34)",
      background: "rgba(8, 15, 24, 0.9)",
      color: "#ffffff",
      outline: "none",
      fontSize: "0.96rem",
      transition: "all 220ms ease",
    },
    selectInput: {
      width: "100%",
      boxSizing: "border-box",
      padding: "13px 14px",
      borderRadius: 14,
      border: "1px solid rgba(141, 145, 153, 0.34)",
      background: "rgba(8, 15, 24, 0.9)",
      color: "#ffffff",
      outline: "none",
      fontSize: "0.96rem",
      transition: "all 220ms ease",
      appearance: "none",
      WebkitAppearance: "none",
      MozAppearance: "none",
      cursor: "pointer",
    },
    generateButton: {
      border: "none",
      borderRadius: 999,
      padding: "14px 26px",
      cursor: "pointer",
      background: "linear-gradient(135deg, #3626ce 0%, #5f0b7e 100%)",
      color: "#ffffff",
      fontWeight: 700,
      letterSpacing: "0.04em",
      fontSize: "0.9rem",
      boxShadow: "0 12px 26px rgba(40, 30, 104, 0.46)",
      transition: "all 250ms ease",
      minWidth: 190,
      minHeight: 50,
    },





    rightRail: {
      display: "flex",
      flexDirection: "column",
      gap: 18,
    },
    sideCard: {
      padding: 22,
      borderRadius: 22,
      border: "1px solid rgba(255, 255, 255, 0.07)",
      background: "rgba(21, 28, 38, 0.66)",
      backdropFilter: "blur(24px)",
      minHeight: 184,
      boxSizing: "border-box",
    },
    sideCardHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 14,
    },
    sideCardTitle: {
      margin: 0,
      fontSize: "1rem",
      color: "#ffffff",
      fontWeight: 800,
      fontFamily: "'Plus Jakarta Sans', 'Manrope', sans-serif",
    },
    emptyWrap: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      textAlign: "center",
      minHeight: 100,
      color: "#c3c6d0",
    },
    emptyIcon: {
      width: 52,
      height: 52,
      borderRadius: "999px",
      display: "grid",
      placeItems: "center",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      background: "rgba(8, 15, 24, 0.82)",
      color: "#8d9199",
      fontSize: "1.2rem",
      fontWeight: 700,
    },
    featureCard: {
      borderRadius: 22,
      minHeight: 184,
      padding: 20,
      display: "flex",
      alignItems: "end",
      border: "1px solid rgba(255, 255, 255, 0.07)",
      background:
        "linear-gradient(155deg, rgba(54, 38, 206, 0.28) 0%, rgba(95, 11, 126, 0.22) 40%, rgba(13, 20, 29, 0.9) 100%)",
      boxSizing: "border-box",
    },
    featureKicker: {
      margin: 0,
      fontSize: "0.62rem",
      letterSpacing: "0.16em",
      color: "#a4c9fc",
      textTransform: "uppercase",
      fontWeight: 700,
    },
    featureTitle: {
      margin: "6px 0 0 0",
      fontSize: "1.06rem",
      color: "#ffffff",
      fontWeight: 800,
    },
    existingAvatarCard: {
      gridColumn: "span 8",
      gridRow: "span 2",
      position: "relative",
      overflow: "hidden",
      padding: 24,
    },
    avatarPlaceholder: {
      position: "absolute",
      inset: 0,
      background:
        "radial-gradient(circle at 30% 20%, rgba(164, 201, 252, 0.18) 0%, transparent 34%), radial-gradient(circle at 70% 78%, rgba(237, 177, 255, 0.2) 0%, transparent 40%), linear-gradient(160deg, rgba(26, 35, 51, 0.95) 0%, rgba(12, 20, 32, 0.96) 100%)",
    },
    avatarGridLines: {
      position: "absolute",
      inset: 0,
      backgroundImage:
        "linear-gradient(rgba(164, 201, 252, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(164, 201, 252, 0.06) 1px, transparent 1px)",
      backgroundSize: "26px 26px",
      opacity: 0.45,
    },
    avatarContent: {
      position: "relative",
      zIndex: 2,
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    },
    avatarBadge: {
      width: "fit-content",
      padding: "7px 12px",
      borderRadius: 999,
      border: "1px solid rgba(164, 201, 252, 0.35)",
      background: "rgba(8, 15, 24, 0.65)",
      color: "#a4c9fc",
      fontSize: "0.62rem",
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      fontWeight: 800,
    },
    avatarTitle: {
      margin: 0,
      color: "#ffffff",
      fontSize: "1.86rem",
      fontWeight: 800,
      fontFamily: "'Plus Jakarta Sans', 'Manrope', sans-serif",
      lineHeight: 1.1,
      letterSpacing: "-0.02em",
    },
    avatarText: {
      margin: "8px 0 0 0",
      color: "#c3c6d0",
      fontSize: "0.92rem",
    },
    actionRow: {
      marginTop: 16,
      display: "flex",
      flexWrap: "wrap",
      gap: 10,
    },
    actionGhost: {
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: 999,
      background: "rgba(8, 15, 24, 0.65)",
      color: "#ffffff",
      fontSize: "0.78rem",
      fontWeight: 700,
      padding: "10px 16px",
      cursor: "pointer",
      transition: "all 220ms ease",
    },
    actionPrimary: {
      border: "none",
      borderRadius: 999,
      background: "linear-gradient(135deg, #3626ce 0%, #5f0b7e 100%)",
      color: "#ffffff",
      fontSize: "0.78rem",
      fontWeight: 700,
      padding: "10px 16px",
      cursor: "pointer",
      boxShadow: "0 12px 22px rgba(40, 30, 104, 0.42)",
      transition: "all 220ms ease",
    },
    statCard: {
      gridColumn: "span 4",
      borderRadius: 22,
      border: "1px solid rgba(255, 255, 255, 0.07)",
      background: "rgba(21, 28, 38, 0.66)",
      padding: 22,
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      backdropFilter: "blur(24px)",
    },
    statTitle: {
      margin: 0,
      color: "#ffffff",
      fontSize: "1rem",
      fontWeight: 800,
      fontFamily: "'Plus Jakarta Sans', 'Manrope', sans-serif",
    },
    statValue: {
      margin: "6px 0 0 0",
      color: "#a4c9fc",
      fontSize: "1.9rem",
      fontWeight: 800,
      lineHeight: 1,
    },
    statDesc: {
      margin: "8px 0 0 0",
      fontSize: "0.78rem",
      color: "#c3c6d0",
      lineHeight: 1.4,
    },
    historyCard: {
      gridColumn: "span 4",
      gridRow: "span 2",
      borderRadius: 22,
      border: "1px solid rgba(255, 255, 255, 0.07)",
      background: "rgba(21, 28, 38, 0.66)",
      padding: 22,
      boxSizing: "border-box",
      backdropFilter: "blur(24px)",
    },
    historyList: {
      marginTop: 14,
      display: "flex",
      flexDirection: "column",
      gap: 12,
    },
    historyItem: {
      borderRadius: 12,
      border: "1px solid rgba(255, 255, 255, 0.06)",
      padding: "10px 12px",
      background: "rgba(8, 15, 24, 0.72)",
    },
    historyMain: {
      margin: 0,
      color: "#ffffff",
      fontSize: "0.82rem",
      fontWeight: 700,
    },
    historySub: {
      margin: "4px 0 0 0",
      color: "#c3c6d0",
      fontSize: "0.72rem",
      lineHeight: 1.4,
    },
    catalogWrap: {
      gridColumn: "span 8",
      gridRow: "span 2",
      borderRadius: 22,
      border: "1px solid rgba(255, 255, 255, 0.07)",
      background: "rgba(21, 28, 38, 0.66)",
      padding: 22,
      boxSizing: "border-box",
      backdropFilter: "blur(24px)",
      display: "flex",
      flexDirection: "column",
      gap: 14,
    },
    catalogGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: 14,
      flex: 1,
    },
    garmentCard: {
      borderRadius: 14,
      border: "1px solid rgba(255, 255, 255, 0.07)",
      background: "rgba(8, 15, 24, 0.82)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      minHeight: 170,
    },
    garmentImage: {
      height: 88,
      background:
        "linear-gradient(145deg, rgba(54, 38, 206, 0.42) 0%, rgba(95, 11, 126, 0.36) 42%, rgba(13, 20, 29, 0.95) 100%)",
      position: "relative",
    },
    garmentDot: {
      position: "absolute",
      top: 8,
      right: 8,
      width: 10,
      height: 10,
      borderRadius: "999px",
      background: "#a4c9fc",
      boxShadow: "0 0 10px rgba(164, 201, 252, 0.9)",
    },
    garmentBody: {
      padding: 10,
      display: "flex",
      flexDirection: "column",
      gap: 6,
    },
    garmentKicker: {
      margin: 0,
      fontSize: "0.58rem",
      letterSpacing: "0.16em",
      color: "#8d9199",
      textTransform: "uppercase",
      fontWeight: 700,
    },
    garmentTitle: {
      margin: 0,
      fontSize: "0.78rem",
      color: "#ffffff",
      fontWeight: 700,
      lineHeight: 1.35,
    },
    garmentFit: {
      margin: 0,
      fontSize: "0.68rem",
      color: "#a4c9fc",
      fontWeight: 700,
    },
    disclaimer: {
      marginTop: "10px",
      fontSize: "0.7rem",
      color: "#8d9199",
      textAlign: "left",
      lineHeight: 1.5,
    },
  };

 const renderPoseImage = (type, large = false) => {
   const src = `/images/pose-${type}.png`;
   const imageStyle = {
     height: large ? "90%" : "90%",
     width: "auto",
     maxWidth: large ? "85%" : "85%",
     objectFit: "contain",
     objectPosition: "center",
     display: "block",
     background: "transparent",
   };

   return (
     <div
       style={{
         width: "100%",
         height: large ? 300 : 300,
         display: "flex",
         alignItems: "center",
         justifyContent: "center",
         overflow: "hidden",
         background: "transparent",
         borderRadius: 12,
         position: "relative",
       }}
       aria-label={`${type} pose placeholder`}
     >
       <img
         src={src}
         alt={`${type} pose placeholder`}
         style={imageStyle}
         onError={(event) => {
           const parent = event.currentTarget.parentElement;
           event.currentTarget.style.display = "none";
           if (parent) {
             parent.style.background = isDark ? "rgba(17,24,39,0.8)" : "rgba(248,250,252,0.8)";
             parent.style.border = isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(15,23,42,0.06)";
             parent.style.display = "flex";
             parent.style.alignItems = "center";
             parent.style.justifyContent = "center";
             parent.style.color = isDark ? "#c3c6d0" : "#475569";
             parent.style.fontSize = "0.72rem";
             parent.style.letterSpacing = "0.08em";
             parent.style.textTransform = "uppercase";
             parent.style.fontWeight = 700;
             parent.innerText = "Pose";
           }
         }}
       />
     </div>
   );
 };

 const renderUploadTile = (label, keyName, preview, inputRef) => {
   const isSelected = Boolean(preview);
   const isHovered = hoveredTile === keyName;

   return (
     <div
       role="button"
       tabIndex={0}
       key={keyName}
       onClick={() => inputRef.current?.click()}
       onMouseEnter={() => setHoveredTile(keyName)}
       onMouseLeave={() => setHoveredTile("")}
       onKeyDown={(event) => {
         if (event.key === "Enter" || event.key === " ") {
           event.preventDefault();
           inputRef.current?.click();
         }
       }}
       style={{
         ...styles.uploadTile,
         border: isSelected
           ? "1px solid rgba(164, 201, 252, 0.95)"
           : isHovered
             ? "1px solid rgba(164, 201, 252, 0.44)"
             : "1px solid rgba(133, 172, 255, 0.24)",
         boxShadow: isSelected
           ? "0 0 0 1px rgba(164, 201, 252, 0.32)"
           : isHovered
             ? "0 10px 20px rgba(24, 80, 182, 0.18)"
             : "none",
         transform: isHovered ? "translateY(-2px)" : "translateY(0)",
         background: isHovered ? "rgba(17, 25, 38, 0.95)" : styles.uploadTile.background,
       }}
     >
       <input
         ref={inputRef}
         type="file"
         accept=".jpg,.jpeg,.png,image/jpeg,image/png"
         style={styles.hiddenInput}
         onChange={(event) => {
           const file = event.target.files?.[0];

           updateImageState(keyName, file);

           event.target.value = "";
         }}
       />

       <div style={{
         width: "100%",
         height: "100%",
         display: "flex",
         flexDirection: "column",
         alignItems: "center",
         justifyContent: "space-between",
         gap: 10,
       }}>
         <div style={{
           width: "100%",
           flex: 1,
           minHeight: 0,
           display: "flex",
           alignItems: "center",
           justifyContent: "center",
           borderRadius: 12,
           background: isDark ? "rgba(17, 24, 39, 0.8)" : "rgba(248, 250, 252, 0.8)",
           border: isDark ? "1px solid rgba(255,255,255,0.04)" : "1px solid rgba(15,23,42,0.06)",
           overflow: "hidden",
           padding: 12,
           boxSizing: "border-box",
         }}>
           {preview ? (
             <img src={preview} alt={`${label} preview`} style={{ ...styles.previewImage, objectFit: "contain", objectPosition: "center", background: "transparent" }} />
           ) : (
             renderPoseImage(keyName, false)
           )}
         </div>

         <div style={{
           display: "flex",
           alignItems: "center",
           justifyContent: "center",
           gap: 8,
           width: "100%",
           paddingTop: 4,
         }}>
           <span style={{
             display: "inline-flex",
             alignItems: "center",
             justifyContent: "center",
             width: 28,
             height: 28,
             borderRadius: 999,
             background: isDark ? "rgba(124, 58, 237, 0.12)" : "rgba(124, 58, 237, 0.1)",
             border: isDark ? "1px solid rgba(124, 58, 237, 0.25)" : "1px solid rgba(124, 58, 237, 0.18)",
           }}>
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
               <path d="M7 8.5V7.5C7 5.84 8.34 4.5 10 4.5H14C15.66 4.5 17 5.84 17 7.5V8.5" stroke={isDark ? "#dfe7f8" : "#334155"} strokeWidth="1.7" strokeLinecap="round" />
               <rect x="4.5" y="8.5" width="15" height="11" rx="2.5" stroke={isDark ? "#dfe7f8" : "#334155"} strokeWidth="1.7" />
               <circle cx="12" cy="14" r="3" stroke={isDark ? "#dfe7f8" : "#334155"} strokeWidth="1.7" />
             </svg>
           </span>
           <span style={{ color: isDark ? "#dfe7f8" : "#1f2937", fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.01em" }}>{label}</span>
         </div>
       </div>
     </div>
   );
 };

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Manrope:wght@400;500;600;700&display=swap');

        .dash-nav-item:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(164, 201, 252, 0.24);
          transform: translateX(4px);
        }
        .dash-input-focus:hover {
          border-color: rgba(164, 201, 252, 0.46);
        }
        .dash-input-focus:focus {
          border-color: rgba(164, 201, 252, 0.76);
          box-shadow: 0 0 0 3px rgba(164, 201, 252, 0.16);
        }
        .dash-select-focus:hover {
          border-color: rgba(164, 201, 252, 0.46);
        }
        .dash-select-focus:focus {
          border-color: rgba(164, 201, 252, 0.76);
          box-shadow: 0 0 0 3px rgba(164, 201, 252, 0.16);
        }
        .dash-generate-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 18px 30px rgba(40, 30, 104, 0.55), 0 0 20px rgba(164, 201, 252, 0.18);
          filter: brightness(1.05);
        }
        .dash-generate-btn:active:not(:disabled) {
          transform: scale(0.985);
        }
        .dash-action-btn:hover {
          transform: translateY(-1px);
          background: rgba(255, 255, 255, 0.08);
        }
        .dash-action-primary:hover {
          transform: translateY(-1px);
          filter: brightness(1.05);
          box-shadow: 0 16px 28px rgba(40, 30, 104, 0.56);
        }
        .dash-card-lift {
          transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease;
        }
        .dash-card-lift:hover {
          transform: translateY(-2px);
          border-color: rgba(164, 201, 252, 0.24);
          box-shadow: 0 24px 44px rgba(5, 12, 22, 0.42);
        }
        .guidelines-inline {
          margin: 12px 0 0 0;
          font-size: 0.78rem;
          color: #aab8cd;
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .guidelines-inline .best-results-label {
          color: #dfe7f8;
          font-weight: 700;
        }
        .guidelines-inline .best-results-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #dfe7f8;
        }
        .guidelines-inline .best-results-dot {
          width: 7px;
          height: 7px;
          border-radius: 999px;
          display: inline-block;
          background: #4ade80;
          box-shadow: 0 0 0 3px rgba(74, 222, 128, 0.12);
        }
        .guidelines-link {
          color: #a4c9fc;
          text-decoration: none;
          font-weight: 700;
          letter-spacing: 0.01em;
          border-bottom: 1px solid rgba(164, 201, 252, 0.45);
          transition: color 200ms ease, border-color 200ms ease, text-shadow 200ms ease;
        }
        .guidelines-link:hover {
          color: #d9ebff;
          border-color: rgba(217, 235, 255, 0.85);
          text-shadow: 0 0 14px rgba(164, 201, 252, 0.45);
        }
        .photo-guide-modal {
          position: fixed;
          inset: 0;
          height: 100vh;
          overflow: hidden;
          background: rgba(4, 10, 18, 0.72);
          backdrop-filter: blur(8px);
          z-index: 110;
          display: grid;
          place-items: center;
          padding: 20px;
          box-sizing: border-box;
        }
        .photo-guide-dialog {
          width: min(860px, calc(100vw - 32px));
          max-height: calc(100vh - 48px);
          display: flex;
          flex-direction: column;
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: linear-gradient(160deg, rgba(17, 26, 39, 0.96) 0%, rgba(10, 18, 30, 0.96) 100%);
          box-shadow: 0 30px 60px rgba(5, 12, 22, 0.6), 0 0 0 1px rgba(164, 201, 252, 0.12) inset;
          box-sizing: border-box;
          overflow: hidden;
        }
        .photo-guide-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 14px;
          padding: 22px 22px 14px 22px;
          flex-shrink: 0;
        }
        .photo-guide-content {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 0 22px 18px 22px;
          overscroll-behavior: contain;
          scrollbar-width: thin;
          scrollbar-color: rgba(148, 163, 184, 0.5) transparent;
        }
        .photo-guide-content::-webkit-scrollbar {
          width: 8px;
        }
        .photo-guide-content::-webkit-scrollbar-track {
          background: transparent;
        }
        .photo-guide-content::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.45);
          border-radius: 999px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        .photo-guide-title {
          margin: 0;
          color: #ffffff;
          font-size: 1.26rem;
          font-weight: 800;
          letter-spacing: -0.01em;
          font-family: 'Plus Jakarta Sans', 'Manrope', sans-serif;
        }
        .photo-guide-sub {
          margin: 6px 0 0 0;
          color: #c3c6d0;
          font-size: 0.82rem;
          line-height: 1.45;
        }
        .photo-guide-close {
          flex-shrink: 0;
          width: 34px;
          height: 34px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          color: #dce3f0;
          background: rgba(255, 255, 255, 0.03);
          transition: all 200ms ease;
          cursor: pointer;
          font-size: 1.2rem;
        }
        .photo-guide-close:hover {
          background: rgba(255, 255, 255, 0.09);
          border-color: rgba(164, 201, 252, 0.42);
          color: #ffffff;
        }
        .photo-guide-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 18px;
        }
        .photo-guide-card {
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(17, 24, 39, 0.86);
          padding: 18px 16px 14px 16px;
          text-align: center;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.03);
        }
        .photo-guide-visual {
          display: grid;
          place-items: center;
          min-height: 118px;
          margin-bottom: 12px;
          border-radius: 14px;
          background: linear-gradient(180deg, rgba(124, 58, 237, 0.08), rgba(17, 24, 39, 0.8));
          border: 1px solid rgba(124, 58, 237, 0.14);
        }
        .photo-guide-card h5 {
          margin: 0;
          color: #ffffff;
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .photo-guide-card p {
          margin: 10px 0 0 0;
          color: #dfe7f8;
          line-height: 1.5;
          font-size: 0.8rem;
        }
        .photo-guide-checklist {
          border-radius: 18px;
          border: 1px solid rgba(116, 177, 255, 0.18);
          background: rgba(10, 18, 30, 0.7);
          padding: 14px 16px;
        }
        .photo-guide-checklist h5 {
          margin: 0;
          color: #e2e8f0;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .photo-guide-checklist-grid {
          margin-top: 12px;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px 18px;
        }
        .check-item {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #dfe7f8;
          font-size: 0.8rem;
          line-height: 1.4;
        }
        .check-bullet {
          width: 18px;
          height: 18px;
          border-radius: 999px;
          background: rgba(74, 222, 128, 0.12);
          border: 1px solid rgba(74, 222, 128, 0.5);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #7ef0a1;
          font-size: 0.78rem;
          font-weight: 800;
          flex-shrink: 0;
        }
        .photo-guide-warning {
          margin-top: 12px;
          border-radius: 14px;
          border: 1px solid rgba(251, 146, 60, 0.26);
          background: rgba(120, 53, 15, 0.14);
          color: #f8d7b3;
          font-size: 0.76rem;
          padding: 10px 12px;
          line-height: 1.45;
          letter-spacing: 0.01em;
        }
        .photo-guide-footer {
          display: flex;
          justify-content: flex-end;
          padding: 0 22px 18px 22px;
          flex-shrink: 0;
        }
        .photo-guide-button {
          border: none;
          border-radius: 999px;
          background: linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%);
          color: #ffffff;
          padding: 12px 18px;
          font-size: 0.82rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          box-shadow: 0 12px 24px rgba(124, 58, 237, 0.2);
          transition: transform 180ms ease, filter 180ms ease;
        }
        .photo-guide-button:hover {
          transform: translateY(-1px);
          filter: brightness(1.04);
        }
        @keyframes dashPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        @media (max-width: 1220px) {
          .dashboard-sidebar {
            position: static !important;
            width: auto !important;
            margin: 18px;
          }
          .dashboard-main {
            margin-left: 18px !important;
            margin-right: 18px !important;
            padding-top: 4px !important;
          }
          .dashboard-main-inner {
            max-width: none !important;
          }
        }
        @media (max-width: 1100px) {
          .new-grid {
            grid-template-columns: 1fr !important;
          }
          .existing-grid {
            grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
            grid-auto-rows: auto !important;
          }
          .existing-span,
          .existing-span-small,
          .existing-span-history,
          .existing-span-catalog {
            grid-column: span 1 !important;
            grid-row: span 1 !important;
          }
          .upload-grid {
            grid-template-columns: 1fr !important;
          }
          .controls-row {
            grid-template-columns: 1fr !important;
          }
          .catalog-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 780px) {
          .measurement-fields {
            grid-template-columns: 1fr !important;
          }
          .guidelines-grid {
            grid-template-columns: 1fr;
          }
          .guidelines-dialog {
            padding: 16px 16px 14px 16px;
          }
          .photo-guide-modal {
            padding: 12px;
          }
          .photo-guide-dialog {
            width: min(860px, calc(100vw - 24px));
            max-height: calc(100dvh - 24px);
          }
        }
        @media (max-width: 640px) {
          .photo-guide-header {
            padding: 18px 18px 12px 18px;
          }
          .photo-guide-content {
            padding: 0 18px 14px 18px;
          }
          .photo-guide-footer {
            padding: 0 18px 14px 18px;
          }
        }
      `}</style>

      <DashboardSidebar />

      <main style={styles.main} className="dashboard-main">
        <div style={styles.mainInner} className="dashboard-main-inner">
        <header style={styles.pageHeader}>
          <div>
            <h2 style={styles.headerTitle}>
              Hello !,  Welcome to VirtuFit 3D
            </h2>
            <p style={styles.headerSub}>
              {hasGeneratedAvatar
                ? "Your digital silhouette is ready for styling, fitting, and curated recommendations."
                : "Your digital wardrobe journey starts by generating a precise avatar profile."}
            </p>
          </div>
          <div style={styles.statusBadge}>
            <span style={styles.dot} />
            <span>AI Engine Online</span>
          </div>
        </header>

        {!hasGeneratedAvatar && (
          <div style={styles.newGrid} className="new-grid">
            <section style={{ ...styles.glassCard, ...styles.creatorSection }} className="dash-card-lift">
              <h3 style={styles.sectionHeading}>Create Your Avatar</h3>
              <p style={styles.sectionSub}>
                Upload front, side, and back images with your height to build your 3D fitting profile.
              </p>
              <p className="guidelines-inline">
                Need help before uploading?
                <button
                  type="button"
                  className="guidelines-link"
                  onClick={() => setShowPhotoGuide(true)}
                  style={{
                    background: "transparent",
                    border: "none",
                    padding: 0,
                    font: "inherit",
                    cursor: "pointer",
                    display: "inline",
                    textDecoration: "underline",
                    textUnderlineOffset: "2px",
                  }}
                >
                  View Photo Setup Guide
                </button>
              </p>

              {success && (
                <p
                  style={{
                    ...styles.feedbackText,
                    color: "#4ade80",
                    background: "rgba(74, 222, 128, 0.08)",
                    border: "1px solid rgba(74, 222, 128, 0.32)",
                  }}
                >
                  ✓ {success}
                </p>
              )}

              {error && (
                <p
                  style={{
                    ...styles.feedbackText,
                    color: "#ff9a9a",
                    background: "rgba(255, 107, 107, 0.08)",
                    border: "1px solid rgba(255, 107, 107, 0.32)",
                  }}
                >
                  ✗ {error}
                </p>
              )}

              <div style={styles.uploadRow} className="upload-grid">
                {renderUploadTile("Front View", "front", frontPreview, frontInputRef)}
                {renderUploadTile("Side View", "side", sidePreview, sideInputRef)}
                {renderUploadTile("Back View", "back", backPreview, backInputRef)}
              </div>

              <div className="guidelines-inline" style={{ marginTop: 16 }}>
                <span className="best-results-label">For best results</span>
                <span className="best-results-item"><span className="best-results-dot" />Full body visible</span>
                <span className="best-results-item"><span className="best-results-dot" />Fitted clothing</span>
                <span className="best-results-item"><span className="best-results-dot" />Plain background</span>
                <span className="best-results-item"><span className="best-results-dot" />Good lighting</span>
              </div>

              <div style={styles.controlsRow} className="controls-row">
                <div>
                  <div style={styles.measurementFields} className="measurement-fields">
                    <div style={styles.measurementField}>
                      <label htmlFor="height" style={styles.inputLabel}>Measurement: Height (cm)</label>
                      <input
                        id="height"
                        type="number"
                        value={height}
                        onChange={(event) => setHeight(event.target.value)}
                        min="100"
                        max="230"
                        placeholder="e.g. 175"
                        style={styles.heightInput}
                        className="dash-input-focus"
                      />
                    </div>
                    <div style={styles.measurementField}>
                      <label htmlFor="gender" style={styles.inputLabel}>Gender</label>
                      <select
                        id="gender"
                        value={gender}
                        onChange={(event) => setGender(event.target.value)}
                        style={styles.selectInput}
                        className="dash-select-focus"
                      >
                        <option value="" disabled>
                          Select gender
                        </option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                  </div>
                  <p style={styles.disclaimer}>
                    By clicking generate, you agree to our Terms of Service and Privacy Policy regarding biometric data processing.
                  </p>
                </div>

                <button
                  type="button"
                  style={{
                    ...styles.generateButton,
                    opacity: loading ? 0.68 : 1,
                    cursor: loading ? "not-allowed" : "pointer",
                    background: loading
                      ? "linear-gradient(135deg, #2a6ac4 0%, #2b8fba 100%)"
                      : isGenerateHovered
                        ? "linear-gradient(135deg, #4a36e1 0%, #70159a 100%)"
                        : styles.generateButton.background,
                  }}
                  className="dash-generate-btn"
                  onMouseEnter={() => setIsGenerateHovered(true)}
                  onMouseLeave={() => setIsGenerateHovered(false)}
                  onClick={handleGenerateAvatar}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Generate Avatar"}
                </button>
              </div>

            </section>

            {showPhotoGuide && (
              <div className="photo-guide-modal" onClick={() => setShowPhotoGuide(false)}>
                <div className="photo-guide-dialog" role="dialog" aria-modal="true" aria-labelledby="photo-guide-title" onClick={(event) => event.stopPropagation()}>
                  <div className="photo-guide-header">
                    <div>
                      <h4 id="photo-guide-title" className="photo-guide-title">Photo Setup Guide</h4>
                      <p className="photo-guide-sub">Follow these simple steps for the most accurate 3D avatar.</p>
                    </div>
                    <button type="button" className="photo-guide-close" aria-label="Close photo setup guide" onClick={() => setShowPhotoGuide(false)}>×</button>
                  </div>
 
                  <div className="photo-guide-content">
                    <div className="photo-guide-grid">
                      <article className="photo-guide-card">
                        <div className="photo-guide-visual">{renderPoseImage("front", true)}</div>
                        <h5>Front View</h5>
                        <p>Face the camera and stand straight.</p>
                      </article>
                      <article className="photo-guide-card">
                        <div className="photo-guide-visual">{renderPoseImage("side", true)}</div>
                        <h5>Side View</h5>
                        <p>Stand sideways with your full body visible.</p>
                      </article>
                      <article className="photo-guide-card">
                        <div className="photo-guide-visual">{renderPoseImage("back", true)}</div>
                        <h5>Back View</h5>
                        <p>Face away from the camera and stand straight.</p>
                      </article>
                    </div>
 
                    <div className="photo-guide-checklist">
                      <h5>Before you upload</h5>
                      <div className="photo-guide-checklist-grid">
                        {[
                          "Full body visible",
                          "Stand naturally and upright",
                          "Arms slightly away from body",
                          "Wear fitted clothing",
                          "Plain, uncluttered background",
                          "Bright, even lighting",
                        ].map((item) => (
                          <div key={item} className="check-item">
                            <span className="check-bullet">✓</span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
 
                    <div className="photo-guide-warning">
                      Avoid: Blurry photos • Cropped body • Baggy clothing • Dark lighting • Busy backgrounds
                    </div>
                  </div>
 
                  <div className="photo-guide-footer">
                    <button type="button" className="photo-guide-button" onClick={() => setShowPhotoGuide(false)}>
                      Got it, start uploading
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {hasGeneratedAvatar && (
          <div style={styles.existingGrid} className="existing-grid">
            <section style={{ ...styles.glassCard, ...styles.existingAvatarCard }} className="existing-span dash-card-lift">
              <div style={styles.avatarPlaceholder} />
              <div style={styles.avatarGridLines} />
              <div style={styles.avatarContent}>
                <div style={styles.avatarBadge}>Avatar Preview</div>
                <div>
                  <h3 style={styles.avatarTitle}>Digital Fitting Canvas</h3>
                  <p style={styles.avatarText}>SMPL preview is coming soon. This placeholder represents your personalized 3D avatar zone.</p>
                  <div style={styles.actionRow}>
                    <button type="button" style={styles.actionGhost} className="dash-action-btn" onClick={handleRegenerate}>Regenerate</button>
                    <button type="button" style={styles.actionPrimary} className="dash-action-primary" onClick={handleTryOn}>Try-On Now</button>
                  </div>
                </div>
              </div>
            </section>

            <section style={styles.statCard} className="existing-span-small dash-card-lift">
              <div>
                <p style={styles.statTitle}>Silhouette Accuracy</p>
                <p style={styles.statValue}>94%</p>
              </div>
              <p style={styles.statDesc}>Measurement sync remains stable across your latest fitting sessions.</p>
            </section>

            <section style={styles.statCard} className="existing-span-small dash-card-lift">
              <div>
                <p style={styles.statTitle}>New Alerts</p>
                <p style={styles.statValue}>2</p>
              </div>
              <p style={styles.statDesc}>Limited drops and AI texture updates are available for your profile.</p>
            </section>

            <section style={styles.historyCard} className="existing-span-history dash-card-lift">
              <h4 style={styles.sideCardTitle}>Process History</h4>
              <div style={styles.historyList}>
                <div style={styles.historyItem}>
                  <p style={styles.historyMain}>Avatar Recalibration</p>
                  <p style={styles.historySub}>Shoulder width updated. Today, 10:42 AM</p>
                </div>
                <div style={styles.historyItem}>
                  <p style={styles.historyMain}>Fabric Simulation</p>
                  <p style={styles.historySub}>Cyber-wool texture preview generated yesterday.</p>
                </div>
                <div style={styles.historyItem}>
                  <p style={styles.historyMain}>AR Export</p>
                  <p style={styles.historySub}>Preview package exported 3 days ago.</p>
                </div>
              </div>
            </section>

            <section style={styles.catalogWrap} className="existing-span-catalog dash-card-lift">
              <div style={styles.sideCardHeader}>
                <h4 style={styles.sideCardTitle}>Curated Selection</h4>
                <span style={{ color: "#a4c9fc", fontSize: "0.72rem", fontWeight: 700 }}>Explore All</span>
              </div>

              <div style={styles.catalogGrid} className="catalog-grid">
                <article style={styles.garmentCard}>
                  <div style={styles.garmentImage}><span style={styles.garmentDot} /></div>
                  <div style={styles.garmentBody}>
                    <p style={styles.garmentKicker}>Avant-Garde</p>
                    <p style={styles.garmentTitle}>Glass-Carbon Blazer</p>
                    <p style={styles.garmentFit}>Perfect Match • 98% Fit</p>
                  </div>
                </article>

                <article style={styles.garmentCard}>
                  <div style={styles.garmentImage}><span style={styles.garmentDot} /></div>
                  <div style={styles.garmentBody}>
                    <p style={styles.garmentKicker}>Urban Nomad</p>
                    <p style={styles.garmentTitle}>Fluid-Motion Trousers</p>
                    <p style={styles.garmentFit}>Adaptive Fabric • 92% Fit</p>
                  </div>
                </article>

                <article style={styles.garmentCard}>
                  <div style={styles.garmentImage}><span style={styles.garmentDot} /></div>
                  <div style={styles.garmentBody}>
                    <p style={styles.garmentKicker}>Essentials</p>
                    <p style={styles.garmentTitle}>Loom-AI Base Layer</p>
                    <p style={styles.garmentFit}>Recommended for Layering</p>
                  </div>
                </article>
              </div>
            </section>
          </div>
        )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
