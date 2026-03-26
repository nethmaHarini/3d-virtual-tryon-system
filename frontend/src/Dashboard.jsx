const styles = {
  disclaimer: {
    marginTop: "12px",
    fontSize: "12px",
    color: "#8fa3c7",
    textAlign: "center",
    lineHeight: "1.5",
  },
};
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

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

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
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
    if (!frontImage || !backImage || !sideImage || !height) {
      setError("Please upload all images and enter height");
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
      const response = await fetch(
        "https://stunning-space-fiesta-x5q4j49ww79qh9jw-3000.app.github.dev/generate-avatar",
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );

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
    } catch (error) {
      console.error(error);
      setError("Upload failed");
    } finally {
      setLoading(false);
    }
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
            ? "1px solid rgba(81, 190, 255, 0.95)"
            : "1px solid rgba(133, 172, 255, 0.24)",
          boxShadow: isSelected
            ? "0 0 0 1px rgba(71, 198, 255, 0.45), 0 0 22px rgba(41, 173, 255, 0.45)"
            : isHovered
              ? "0 12px 28px rgba(24, 80, 182, 0.4)"
              : "none",
          transform: isHovered ? "translateY(-2px)" : "translateY(0)",
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
      background: "radial-gradient(circle at 15% 20%, #16388f 0%, #071337 40%, #030a20 100%)",
      color: "#ffffff",
      fontFamily: "Segoe UI, sans-serif",
      padding: "24px",
      boxSizing: "border-box",
    },
    nav: {
      width: "100%",
      maxWidth: "1160px",
      margin: "0 auto",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "8px 4px 20px",
      boxSizing: "border-box",
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
    logoutButton: {
      border: "1px solid rgba(255,255,255,0.28)",
      borderRadius: "12px",
      padding: "10px 16px",
      cursor: "pointer",
      background: "rgba(5, 17, 52, 0.75)",
      color: "#f0f6ff",
      fontWeight: 600,
      fontSize: "0.95rem",
    },
    centerWrap: {
      minHeight: "calc(100vh - 120px)",
      display: "grid",
      placeItems: "center",
      padding: "8px 0 20px",
    },
    card: {
      width: "100%",
      maxWidth: "880px",
      background: "linear-gradient(180deg, rgba(10, 28, 76, 0.94) 0%, rgba(6, 18, 52, 0.96) 100%)",
      borderRadius: "24px",
      border: "1px solid rgba(120, 171, 255, 0.22)",
      boxShadow: "0 24px 70px rgba(0, 0, 0, 0.52)",
      padding: "30px",
      boxSizing: "border-box",
    },
    heading: {
      margin: 0,
      color: "#35bcff",
      fontSize: "2rem",
      letterSpacing: "0.08em",
      textAlign: "center",
      fontWeight: 700,
    },
    subtitle: {
      margin: "10px 0 24px",
      color: "#d7e8ff",
      textAlign: "center",
      fontSize: "1rem",
    },
    guidelinePanel: {
      background: "linear-gradient(135deg, #0c4b45 0%, #0b2f3f 100%)",
      borderRadius: "16px",
      padding: "18px 18px 16px",
      border: "1px solid rgba(115, 239, 213, 0.3)",
      marginBottom: "22px",
    },
    guidelineTitle: {
      margin: "0 0 10px",
      fontSize: "1.03rem",
      color: "#9dffe3",
      fontWeight: 700,
    },
    guidelineList: {
      margin: 0,
      paddingLeft: "20px",
      color: "#ddfff7",
      lineHeight: 1.55,
      fontSize: "0.95rem",
    },
    uploadRow: {
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: "14px",
      marginBottom: "22px",
    },
    uploadTile: {
      minHeight: "140px",
      borderRadius: "16px",
      background: "rgba(3, 14, 44, 0.86)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
      color: "#cfe0ff",
      fontWeight: 600,
      letterSpacing: "0.03em",
      padding: "10px",
      boxSizing: "border-box",
      textAlign: "center",
      cursor: "pointer",
      overflow: "hidden",
      transition: "box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease",
    },
    iconWrap: {
      width: "42px",
      height: "42px",
      borderRadius: "12px",
      display: "grid",
      placeItems: "center",
      border: "1px solid rgba(130, 177, 255, 0.35)",
      background: "rgba(13, 38, 100, 0.6)",
    },
    hiddenInput: {
      display: "none",
    },
    previewImage: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      borderRadius: "12px",
    },
    inputLabel: {
      display: "block",
      fontSize: "0.85rem",
      color: "#d3e3ff",
      letterSpacing: "0.06em",
      marginBottom: "10px",
      textTransform: "uppercase",
      fontWeight: 600,
    },
    heightInput: {
      width: "100%",
      boxSizing: "border-box",
      padding: "14px 15px",
      borderRadius: "14px",
      border: "1px solid rgba(146, 183, 255, 0.33)",
      background: "#04153f",
      color: "#ffffff",
      outline: "none",
      fontSize: "1rem",
      marginBottom: "22px",
    },
    generateButton: {
      width: "100%",
      border: "none",
      borderRadius: "14px",
      padding: "14px 18px",
      cursor: "pointer",
      background: "linear-gradient(90deg, #1c7dff 0%, #27b3ff 100%)",
      color: "#ffffff",
      fontWeight: 700,
      letterSpacing: "0.06em",
      fontSize: "1rem",
      boxShadow: "0 10px 24px rgba(30, 137, 255, 0.4)",
      transition: "background 0.2s ease, opacity 0.2s ease",
    },
  };

  return (
    <div style={styles.page}>
      {/* Fixed Logout Button at Screen Top Right */}
      <button type="button" onClick={handleLogout} style={styles.logoutFixed}>
        Logout
      </button>
      <h1 style={styles.appTitle}>VirtuFit3D Studio</h1>
      <div style={styles.nav}>
        {/* Navigation content remains here */}
      </div>

      <div style={styles.centerWrap}>
        <div style={styles.card}>
          <h2 style={styles.heading}>GENERATE AVATAR</h2>
          <p style={styles.subtitle}>Upload concepts to build your 3D digital duplicate</p>

          {success && (
            <p
              style={{
                color: "#4ade80",
                textAlign: "center",
                marginBottom: "14px",
                fontSize: "0.95rem",
              }}
            >
              ✓ {success}
            </p>
          )}

          {error && (
            <p
              style={{
                color: "#ff6b6b",
                textAlign: "center",
                marginBottom: "14px",
                fontSize: "0.95rem",
              }}
            >
              ✗ {error}
            </p>
          )}

          <div style={styles.guidelinePanel}>
            <h3 style={styles.guidelineTitle}>Photo Guidelines</h3>
            <ul style={styles.guidelineList}>
              <li>Please ensure you are standing straight up in the photos.</li>
              <li>Avoid uploading blurry images. Well-lit photos work best.</li>
              <li>Ensure your full body is visible in the frame.</li>
            </ul>
          </div>

          <div style={styles.uploadRow}>
            {renderUploadTile("Front", "front", frontPreview, frontInputRef)}
            {renderUploadTile("Back", "back", backPreview, backInputRef)}
            {renderUploadTile("Side", "side", sidePreview, sideInputRef)}
          </div>

          <label htmlFor="height" style={styles.inputLabel}>
            Height (cm)
          </label>
          <input
            id="height"
            type="number"
            value={height}
            onChange={(event) => setHeight(event.target.value)}
            min="100"
            max="250"
            placeholder="e.g. 175"
            style={styles.heightInput}
          />

          <button
            type="button"
            style={{
              ...styles.generateButton,
              opacity: loading ? 0.68 : 1,
              cursor: loading ? "not-allowed" : "pointer",
              background: loading
                ? "linear-gradient(90deg, #2a6ac4 0%, #2b8fba 100%)"
                : isGenerateHovered
                  ? "linear-gradient(90deg, #2a93ff 0%, #36c3ff 100%)"
                  : styles.generateButton.background,
            }}
            onMouseEnter={() => setIsGenerateHovered(true)}
            onMouseLeave={() => setIsGenerateHovered(false)}
            onClick={handleGenerateAvatar}
            disabled={loading}
          >
            {loading ? "Processing..." : "Generate 3D Avatar"}
          </button>
          <p style={styles.disclaimer}>
            By clicking generate, you agree to our Terms of Service and Privacy Policy regarding biometric data processing.
          </p>
        </div>
      </div>

    </div>
  );
}

export default Dashboard;
