import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "./config";

function Dashboard() {
  const navigate = useNavigate();
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [sideImage, setSideImage] = useState(null);
  const [height, setHeight] = useState("");
  const [loading, setLoading] = useState(false);
  const [frontPreview, setFrontPreview] = useState("");
  const [backPreview, setBackPreview] = useState("");
  const [sidePreview, setSidePreview] = useState("");
  const [hoveredTile, setHoveredTile] = useState("");
  const [isGenerateHovered, setIsGenerateHovered] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const frontInputRef = useRef(null);
  const backInputRef = useRef(null);
  const sideInputRef = useRef(null);
  const username = localStorage.getItem("username");
  const email = localStorage.getItem("userEmail");

  const hasGeneratedAvatar =
    Boolean(localStorage.getItem("avatar_file")) ||
    Boolean(localStorage.getItem("avatarUrl")) ||
    Boolean(localStorage.getItem("generatedAvatar"));

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  localStorage.removeItem("userEmail");
  navigate("/login");
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

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file");
      return;
    }

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

    if (!height || height < 100 || height > 250) {
      setError("Please enter a valid height (100–250 cm)");
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

      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/generate-avatar`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        console.log("Uploaded data:", data);
        navigate("/avatar-viewer", {
          state: {
            avatarUrl: data.avatarUrl,
            avatar: data.avatar,
            avatar_file: data?.avatar?.avatar_file,
            avatarFile: data?.avatar?.avatar_file,
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
      minHeight: "100vh",
      background:
        "radial-gradient(circle at 12% 16%, rgba(54, 38, 206, 0.22) 0%, transparent 38%), radial-gradient(circle at 88% 84%, rgba(95, 11, 126, 0.24) 0%, transparent 48%), linear-gradient(155deg, #090f17 0%, #0d141d 48%, #111a27 100%)",
      color: "#dce3f0",
      fontFamily: "'Manrope', 'Segoe UI', sans-serif",
      position: "relative",
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
    sidebarBrand: {
      margin: 0,
      fontSize: "1.22rem",
      fontWeight: 800,
      color: "#ffffff",
      letterSpacing: "-0.01em",
    },
    sidebarTag: {
      margin: "4px 0 18px 0",
      fontSize: "0.66rem",
      color: "rgba(195, 198, 208, 0.72)",
      letterSpacing: "0.2em",
      textTransform: "uppercase",
      fontWeight: 700,
    },
    sidebarSection: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
    },
    sidebarButtonBase: {
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
    sidebarButtonActive: {
      background: "linear-gradient(135deg, #3626ce 0%, #5f0b7e 100%)",
      color: "#ffffff",
      boxShadow: "0 0 20px rgba(164, 201, 252, 0.24)",
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
      paddingTop: 30,
      paddingBottom: 30,
      minHeight: "100vh",
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
      marginBottom: 0,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "end",
      gap: 22,
      flexWrap: "wrap",
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
      display: "grid",
      gridTemplateColumns: "minmax(0, 1.95fr) minmax(320px, 1fr)",
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
      minHeight: 188,
      borderRadius: 18,
      background: "rgba(8, 15, 24, 0.9)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      color: "#c3c6d0",
      fontWeight: 700,
      letterSpacing: "0.03em",
      padding: 12,
      boxSizing: "border-box",
      textAlign: "center",
      cursor: "pointer",
      overflow: "hidden",
      transition: "box-shadow 0.24s ease, transform 0.24s ease, border-color 0.24s ease, background 0.24s ease",
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
      gridTemplateColumns: "1.1fr auto",
      gap: 20,
      alignItems: "end",
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
    helperTips: {
      marginTop: 22,
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      gap: 14,
    },
    tipCard: {
      padding: "14px 14px",
      borderRadius: 16,
      border: "1px solid rgba(255, 255, 255, 0.07)",
      background: "rgba(8, 15, 24, 0.75)",
      display: "flex",
      gap: 10,
      alignItems: "flex-start",
    },
    tipBadge: {
      width: 28,
      height: 28,
      borderRadius: "999px",
      flexShrink: 0,
      display: "grid",
      placeItems: "center",
      color: "#ffffff",
      fontSize: "0.72rem",
      fontWeight: 800,
      background: "linear-gradient(145deg, #3626ce 0%, #5f0b7e 100%)",
    },
    tipTitle: {
      margin: 0,
      color: "#ffffff",
      fontSize: "0.84rem",
      fontWeight: 700,
    },
    tipText: {
      margin: "4px 0 0 0",
      color: "#c3c6d0",
      fontSize: "0.74rem",
      lineHeight: 1.45,
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
            : "1px solid rgba(133, 172, 255, 0.24)",
          boxShadow: isSelected
            ? "0 0 0 1px rgba(164, 201, 252, 0.4), 0 0 22px rgba(164, 201, 252, 0.3)"
            : isHovered
              ? "0 12px 28px rgba(24, 80, 182, 0.4)"
              : "none",
          transform: isHovered ? "translateY(-2px)" : "translateY(0)",
          background: isHovered ? "rgba(17, 25, 38, 0.95)" : styles.uploadTile.background,
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={styles.hiddenInput}
          onChange={(event) => updateImageState(keyName, event.target.files?.[0])}
        />

        {preview ? (
          <img src={preview} alt={`${label} preview`} style={styles.previewImage} />
        ) : (
          <>
            <div style={styles.iconWrap}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M3 8.5C3 7.12 4.12 6 5.5 6H8L9.3 4.4C9.68 3.93 10.25 3.66 10.85 3.66H13.15C13.75 3.66 14.32 3.93 14.7 4.4L16 6H18.5C19.88 6 21 7.12 21 8.5V17.5C21 18.88 19.88 20 18.5 20H5.5C4.12 20 3 18.88 3 17.5V8.5Z"
                  stroke="#9fd2ff"
                  strokeWidth="1.6"
                />
                <circle cx="12" cy="13" r="3.5" stroke="#9fd2ff" strokeWidth="1.6" />
              </svg>
            </div>
            <span>{label}</span>
          </>
        )}
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
          margin: 8px 0 0 0;
          font-size: 0.78rem;
          color: #aab8cd;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
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
        .guidelines-modal {
          position: fixed;
          inset: 0;
          background: rgba(4, 10, 18, 0.72);
          backdrop-filter: blur(8px);
          opacity: 0;
          pointer-events: none;
          transition: opacity 220ms ease;
          z-index: 110;
          display: grid;
          place-items: center;
          padding: 20px;
          box-sizing: border-box;
        }
        .guidelines-modal:target {
          opacity: 1;
          pointer-events: auto;
        }
        .guidelines-dialog {
          width: min(760px, 100%);
          max-height: 86vh;
          overflow: auto;
          border-radius: 22px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: linear-gradient(160deg, rgba(17, 26, 39, 0.92) 0%, rgba(10, 18, 30, 0.95) 100%);
          box-shadow: 0 28px 56px rgba(5, 12, 22, 0.58), 0 0 0 1px rgba(164, 201, 252, 0.14) inset;
          padding: 22px 22px 18px 22px;
          box-sizing: border-box;
        }
        .guidelines-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 14px;
        }
        .guidelines-title {
          margin: 0;
          color: #ffffff;
          font-size: 1.16rem;
          font-weight: 800;
          letter-spacing: -0.01em;
          font-family: 'Plus Jakarta Sans', 'Manrope', sans-serif;
        }
        .guidelines-sub {
          margin: 6px 0 0 0;
          color: #c3c6d0;
          font-size: 0.82rem;
          line-height: 1.45;
        }
        .guidelines-close {
          flex-shrink: 0;
          width: 32px;
          height: 32px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          color: #dce3f0;
          text-decoration: none;
          display: grid;
          place-items: center;
          font-size: 1rem;
          background: rgba(255, 255, 255, 0.03);
          transition: all 200ms ease;
        }
        .guidelines-close:hover {
          background: rgba(255, 255, 255, 0.09);
          border-color: rgba(164, 201, 252, 0.42);
          color: #ffffff;
        }
        .guidelines-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }
        .guidelines-item {
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(8, 15, 24, 0.7);
          padding: 11px 12px;
        }
        .guidelines-item h5 {
          margin: 0;
          color: #ffffff;
          font-size: 0.82rem;
          font-weight: 700;
        }
        .guidelines-item p {
          margin: 6px 0 0 0;
          color: #c3c6d0;
          font-size: 0.72rem;
          line-height: 1.45;
        }
        .guidelines-avoid {
          margin-top: 10px;
          border-radius: 14px;
          border: 1px solid rgba(255, 154, 154, 0.26);
          background: rgba(60, 18, 24, 0.34);
          padding: 11px 12px;
        }
        .guidelines-avoid h5 {
          margin: 0;
          color: #ffd0d0;
          font-size: 0.82rem;
          font-weight: 700;
        }
        .guidelines-avoid ul {
          margin: 8px 0 0 0;
          padding-left: 16px;
          color: #f6c3c3;
          font-size: 0.72rem;
          line-height: 1.5;
        }
        .guidelines-protip {
          margin-top: 10px;
          border-radius: 14px;
          border: 1px solid rgba(164, 201, 252, 0.26);
          background: rgba(18, 30, 46, 0.46);
          padding: 10px 12px;
          color: #b8d7ff;
          font-size: 0.74rem;
          line-height: 1.45;
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
          .helper-grid,
          .catalog-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 780px) {
          .guidelines-grid {
            grid-template-columns: 1fr;
          }
          .guidelines-dialog {
            padding: 16px 16px 14px 16px;
          }
        }
      `}</style>

      <aside style={styles.sidebar} className="dashboard-sidebar">
        <div>
          <h1 style={styles.sidebarBrand}>VirtuFit 3D</h1>
          <p style={styles.sidebarTag}>VirtuFit 3D</p>
        </div>

        <nav style={styles.sidebarSection}>
          <button type="button" style={{ ...styles.sidebarButtonBase, ...styles.sidebarButtonActive }}>
            <span>◈</span>
            <span>Dashboard</span>
          </button>
          <button type="button" className="dash-nav-item" style={styles.sidebarButtonBase}>
            <span>◌</span>
            <span>View Avatar</span>
          </button>
          <button
            type="button"
            className="dash-nav-item"
            style={styles.sidebarButtonBase}
            onClick={() => navigate("/catalog")}
          >
            <span>◍</span>
            <span>Garment Catalog</span>
          </button>
          <button type="button" className="dash-nav-item" style={styles.sidebarButtonBase}>
            <span>◎</span>
            <span>View History</span>
          </button>
          <button type="button" className="dash-nav-item" style={styles.sidebarButtonBase}>
            <span>◔</span>
            <span>Notifications</span>
          </button>
        </nav>

        <div style={styles.sidebarFooter}>
          <button type="button" className="dash-nav-item" style={styles.sidebarButtonBase}>
            <span>◉</span>
            <span>Profile</span>
          </button>
          <button type="button" className="dash-nav-item" style={styles.sidebarButtonBase}>
            <span>◒</span>
            <span>Settings</span>
          </button>
          <button type="button" className="dash-nav-item" style={styles.sidebarButtonBase} onClick={handleLogout}>
            <span>⎋</span>
            <span>Logout</span>
          </button>

          <div style={styles.profilePill}>
            <div style={styles.avatarMini}>AI</div>
            <div>
              <p style={styles.profileTitle}>{email || "VirtuFit 3D"}</p>
              <p style={styles.profileSubtitle}>{hasGeneratedAvatar ? "Existing User" : "New Artisan"}</p>
            </div>
          </div>
        </div>
      </aside>

      <main style={styles.main} className="dashboard-main">
        <div style={styles.mainInner} className="dashboard-main-inner">
        <header style={styles.pageHeader}>
          <div>
            <h2 style={styles.headerTitle}>
              Hello {username || "User"} !,  Welcome to VirtuFit 3D
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
                <a href="#photo-upload-guidelines" className="guidelines-link">Photo Upload Guidelines</a>
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
                {renderUploadTile("Side Profile", "side", sidePreview, sideInputRef)}
                {renderUploadTile("Back View", "back", backPreview, backInputRef)}
              </div>

              <div style={styles.controlsRow} className="controls-row">
                <div>
                  <label htmlFor="height" style={styles.inputLabel}>Measurement: Height (cm)</label>
                  <input
                    id="height"
                    type="number"
                    value={height}
                    onChange={(event) => setHeight(event.target.value)}
                    min="100"
                    max="250"
                    placeholder="e.g. 175"
                    style={styles.heightInput}
                    className="dash-input-focus"
                  />
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

              <div style={styles.helperTips} className="helper-grid">
                <div style={styles.tipCard}>
                  <div style={styles.tipBadge}>L</div>
                  <div>
                    <p style={styles.tipTitle}>Lighting Matters</p>
                    <p style={styles.tipText}>Use bright, even light and keep your full body visible for better scanning quality.</p>
                  </div>
                </div>
                <div style={styles.tipCard}>
                  <div style={styles.tipBadge}>F</div>
                  <div>
                    <p style={styles.tipTitle}>Form-Fitting Outfit</p>
                    <p style={styles.tipText}>Wear closer-fit clothing so body edges are easier for the AI to measure accurately.</p>
                  </div>
                </div>
              </div>
            </section>

            <div id="photo-upload-guidelines" className="guidelines-modal" aria-hidden="true">
              <div className="guidelines-dialog" role="dialog" aria-modal="true" aria-labelledby="guidelines-title">
                <div className="guidelines-header">
                  <div>
                    <h4 id="guidelines-title" className="guidelines-title">Photo Upload Guidelines (For Best Avatar Accuracy)</h4>
                    <p className="guidelines-sub">Follow these quick capture rules before uploading front, side, and back images.</p>
                  </div>
                  <a href="#" className="guidelines-close" aria-label="Close guidelines">x</a>
                </div>

                <div className="guidelines-grid">
                  <article className="guidelines-item">
                    <h5>1. Body Position</h5>
                    <p>Stand straight and upright. Keep arms slightly away. Face the camera directly and avoid bending, leaning, or twisting.</p>
                  </article>
                  <article className="guidelines-item">
                    <h5>2. Required Photos</h5>
                    <p>Front view, side profile, and back view. Make sure your entire body is visible in all images.</p>
                  </article>
                  <article className="guidelines-item">
                    <h5>3. Clothing</h5>
                    <p>Wear tight or fitted clothes. Avoid loose, baggy, layered outfits, coats, jackets, and long dresses.</p>
                  </article>
                  <article className="guidelines-item">
                    <h5>4. Lighting</h5>
                    <p>Use bright, even lighting. Avoid shadows and backlighting. Natural daylight works best.</p>
                  </article>
                  <article className="guidelines-item">
                    <h5>5. Background</h5>
                    <p>Use a plain, uncluttered background. Avoid objects around you. A solid wall is ideal.</p>
                  </article>
                  <article className="guidelines-item">
                    <h5>6. Camera Setup</h5>
                    <p>Keep camera at waist or chest height. Keep full body in frame and use a stable camera to avoid blur.</p>
                  </article>
                </div>

                <section className="guidelines-avoid">
                  <h5>7. Avoid These Mistakes</h5>
                  <ul>
                    <li>Cropped body parts</li>
                    <li>Blurry or low-quality images</li>
                    <li>Dark lighting</li>
                    <li>Busy background</li>
                    <li>Wearing loose clothes</li>
                  </ul>
                </section>

                <p className="guidelines-protip">
                  Pro Tip: The better your photos, the more accurate your 3D avatar will be.
                </p>
              </div>
            </div>

            <aside style={styles.rightRail}>
              <div style={styles.sideCard} className="dash-card-lift">
                <div style={styles.sideCardHeader}>
                  <h4 style={styles.sideCardTitle}>Recent Activity</h4>
                  <span style={{ color: "#8d9199" }}>⋯</span>
                </div>
                <div style={styles.emptyWrap}>
                  <div style={styles.emptyIcon}>◴</div>
                  <p style={{ margin: 0, color: "#ffffff", fontWeight: 700, fontSize: "0.86rem" }}>No Activity Yet</p>
                  <p style={{ margin: 0, fontSize: "0.76rem", lineHeight: 1.45 }}>Your simulations and generated avatars will appear here.</p>
                </div>
              </div>

              <div style={styles.sideCard} className="dash-card-lift">
                <div style={styles.sideCardHeader}>
                  <h4 style={styles.sideCardTitle}>Saved Garments</h4>
                  <span style={{ color: "#a4c9fc", fontSize: "0.7rem", fontWeight: 700 }}>Browse</span>
                </div>
                <div style={styles.emptyWrap}>
                  <div style={styles.emptyIcon}>◍</div>
                  <p style={{ margin: 0, color: "#ffffff", fontWeight: 700, fontSize: "0.86rem" }}>Wardrobe is Empty</p>
                  <p style={{ margin: 0, fontSize: "0.76rem", lineHeight: 1.45 }}>Create your avatar first to start trying digital couture pieces.</p>
                </div>
              </div>

              <div style={styles.featureCard} className="dash-card-lift">
                <div>
                  <p style={styles.featureKicker}>New Collection</p>
                  <p style={styles.featureTitle}>Ethereal Silk 2024</p>
                </div>
              </div>
            </aside>
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
                    <button type="button" style={styles.actionGhost} className="dash-action-btn">Regenerate</button>
                    <button type="button" style={styles.actionPrimary} className="dash-action-primary">Try-On Now</button>
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
