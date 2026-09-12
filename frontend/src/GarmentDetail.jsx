import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardSidebar from "./components/DashboardSidebar";
import TryOnJourneyBar from "./components/TryOnJourneyBar";
import { useAppTheme } from "./theme";

export default function GarmentDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark } = useAppTheme();

  const garment = location.state?.garment;
  const avatarUrl = location.state?.avatarUrl || "/models/final_avatar.obj";

  const colors = isDark
    ? {
        pageBackground:
          "radial-gradient(circle at 12% 14%, rgba(54, 38, 206, 0.22) 0%, transparent 34%), radial-gradient(circle at 86% 84%, rgba(95, 11, 126, 0.2) 0%, transparent 44%), linear-gradient(155deg, #090f17 0%, #0d141d 46%, #111a27 100%)",
        cardBackground: "rgba(21, 28, 38, 0.68)",
        mediaBackground: "rgba(8, 15, 24, 0.9)",
        mediaBorder: "1px solid rgba(255, 255, 255, 0.06)",
        panelBorder: "1px solid rgba(255, 255, 255, 0.07)",
        text: "#dce3f0",
        heading: "#ffffff",
        muted: "#c3c6d0",
        breadcrumb: "#b0c4e7",
        cardShadow: "0 22px 44px rgba(5, 12, 22, 0.34)",
        sizeBg: "rgba(12, 18, 30, 0.8)",
        sizeText: "#dce3f0",
        sizeBorder: "1px solid rgba(255, 255, 255, 0.08)",
        secondaryBg: "rgba(12, 18, 30, 0.9)",
        secondaryText: "#dce3f0",
        secondaryBorder: "1px solid rgba(255, 255, 255, 0.08)",
        fallbackCard: "rgba(21, 28, 38, 0.8)",
        fallbackText: "#edf3ff",
        disabledBg: "rgba(47, 58, 75, 0.8)",
        disabledText: "#b9bfd0",
      }
    : {
        pageBackground:
          "radial-gradient(circle at 12% 14%, rgba(78, 107, 255, 0.16) 0%, transparent 34%), radial-gradient(circle at 86% 84%, rgba(138, 92, 255, 0.12) 0%, transparent 44%), linear-gradient(155deg, #f7f9ff 0%, #edf2ff 46%, #eaf0fb 100%)",
        cardBackground: "rgba(255, 255, 255, 0.75)",
        mediaBackground: "rgba(248, 250, 255, 0.92)",
        mediaBorder: "1px solid rgba(18, 30, 52, 0.08)",
        panelBorder: "1px solid rgba(18, 30, 52, 0.08)",
        text: "#152033",
        heading: "#101b31",
        muted: "#53607d",
        breadcrumb: "#546684",
        cardShadow: "0 20px 42px rgba(34, 57, 95, 0.18)",
        sizeBg: "rgba(255, 255, 255, 0.9)",
        sizeText: "#24344d",
        sizeBorder: "1px solid rgba(18, 30, 52, 0.08)",
        secondaryBg: "rgba(255, 255, 255, 0.9)",
        secondaryText: "#152033",
        secondaryBorder: "1px solid rgba(18, 30, 52, 0.08)",
        fallbackCard: "rgba(255, 255, 255, 0.82)",
        fallbackText: "#16263c",
        disabledBg: "rgba(204, 213, 234, 0.8)",
        disabledText: "#53607d",
      };

  const styles = {
    page: {
      minHeight: "100vh",
      width: "100%",
      minWidth: 0,
      background: colors.pageBackground,
      color: colors.text,
      fontFamily: "'Manrope', 'Segoe UI', sans-serif",
      position: "relative",
      overflowX: "hidden",
      boxSizing: "border-box",
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
      maxWidth: 1400,
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      gap: 24,
      minWidth: 0,
    },
    detailCard: {
      width: "100%",
      display: "grid",
      gridTemplateColumns: "minmax(0, 1.05fr) minmax(320px, 0.95fr)",
      gap: 28,
      background: colors.cardBackground,
      border: colors.panelBorder,
      borderRadius: 24,
      boxShadow: colors.cardShadow,
      backdropFilter: "blur(24px)",
      padding: 28,
      boxSizing: "border-box",
      alignItems: "stretch",
    },
    mediaPanel: {
      background: colors.mediaBackground,
      border: colors.mediaBorder,
      borderRadius: 22,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "32px 24px 20px",
      boxSizing: "border-box",
      minHeight: 520,
    },
    previewFrame: {
      width: "100%",
      maxWidth: 400,
      height: 460,
      borderRadius: 18,
      background: isDark ? "rgba(163, 174, 188, 0.18)" : "rgba(127, 145, 175, 0.12)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: isDark
        ? "inset 0 1px 0 rgba(255,255,255,0.18)"
        : "inset 0 1px 0 rgba(18,30,52,0.06)",
      overflow: "hidden",
      marginBottom: 22,
    },
    thumbnailRow: {
      display: "flex",
      flexDirection: "row",
      gap: 14,
      alignItems: "center",
      justifyContent: "center",
      flexWrap: "wrap",
    },
    thumbnail: {
      width: 54,
      height: 54,
      borderRadius: 10,
      overflow: "hidden",
      background: isDark ? "rgba(22, 30, 39, 0.9)" : "rgba(229, 236, 250, 0.9)",
      cursor: "pointer",
      transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
      display: "block",
      border: "2.5px solid transparent",
      boxShadow: isDark ? "0 2px 10px rgba(0,0,0,0.2)" : "0 2px 10px rgba(34,57,95,0.08)",
    },
    infoPanel: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      gap: 18,
      padding: "18px 12px 8px 8px",
      boxSizing: "border-box",
    },
    breadcrumb: {
      fontSize: 15,
      color: colors.breadcrumb,
      letterSpacing: "0.2em",
      fontWeight: 600,
      userSelect: "none",
      textTransform: "uppercase",
    },
    title: {
      fontSize: "2.28rem",
      fontWeight: 800,
      color: colors.heading,
      letterSpacing: "-0.02em",
      lineHeight: 1.12,
      margin: 0,
      fontFamily: "'Plus Jakarta Sans', 'Manrope', sans-serif",
    },
    sectionLabel: {
      fontSize: "0.95rem",
      fontWeight: 800,
      color: colors.heading,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      marginTop: 8,
    },
    sizeRow: {
      display: "flex",
      flexDirection: "row",
      gap: 12,
      marginTop: 4,
      marginBottom: 5,
      flexWrap: "wrap",
    },
    sizeButton: {
      border: colors.sizeBorder,
      borderRadius: 12,
      padding: "12px 18px",
      minWidth: 72,
      fontSize: "1rem",
      fontWeight: 700,
      letterSpacing: "0.04em",
      cursor: "pointer",
      outline: "none",
      transition: "transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease",
    },
    primaryAction: {
      border: "none",
      borderRadius: 16,
      padding: "18px 0",
      width: "100%",
      marginTop: 12,
      marginBottom: 10,
      fontSize: "1.02rem",
      fontWeight: 800,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      cursor: "pointer",
      transition: "transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease",
    },
    secondaryAction: {
      background: colors.secondaryBg,
      border: colors.secondaryBorder,
      color: colors.secondaryText,
      fontSize: "0.92rem",
      fontWeight: 700,
      borderRadius: 12,
      padding: "14px 18px",
      width: "100%",
      boxShadow: isDark
        ? "0 8px 20px rgba(10, 14, 24, 0.22)"
        : "0 8px 20px rgba(52, 76, 109, 0.12)",
      cursor: "pointer",
      letterSpacing: "0.04em",
      transition: "background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease",
    },
    fallbackWrap: {
      minHeight: "100vh",
      width: "100%",
      minWidth: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: colors.pageBackground,
      color: colors.fallbackText,
    },
    fallbackCard: {
      background: colors.fallbackCard,
      color: colors.fallbackText,
      padding: 32,
      borderRadius: 18,
      border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(18,30,52,0.08)",
      boxShadow: isDark ? "0 20px 40px rgba(5,12,22,0.35)" : "0 20px 40px rgba(34,57,95,0.12)",
      textAlign: "center",
      marginBottom: 24,
      fontSize: 22,
      fontWeight: 600,
      letterSpacing: 0.5,
    },
    fallbackButton: {
      background: "linear-gradient(135deg, #3626ce 0%, #5f0b7e 100%)",
      color: "#fff",
      border: "none",
      borderRadius: 999,
      padding: "12px 28px",
      fontSize: "0.9rem",
      fontWeight: 700,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      cursor: "pointer",
      boxShadow: "0 12px 24px rgba(98, 78, 205, 0.3)",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
    },
  };

  if (!garment) {
    return (
      <div style={styles.page}>
        <DashboardSidebar />
        <main style={styles.main}>
          <div style={styles.mainInner}>
            <div style={styles.fallbackWrap}>
              <div>
                <div style={styles.fallbackCard}>Garment details not found.</div>
                <button style={styles.fallbackButton} onClick={() => navigate("/dashboard")}>
                  Back to Catalog
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const images = garment.images && garment.images.length
    ? garment.images
    : [
        "/src/assets/front-example.png",
        "/src/assets/front-example.png",
        "/src/assets/front-example.png",
      ];
  const [mainImg, setMainImg] = useState(images[0]);
  const [selectedSize, setSelectedSize] = useState(null);

  const breadcrumb = garment.breadcrumb || "Shop / Apparel / Essentials";
  const garmentTitle = garment.title || "Classic White Tee";
  const sizes = garment.sizes || ["S", "M", "L"];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={styles.page}>
      <DashboardSidebar />

      <main style={styles.main}>
        <div style={styles.mainInner}>
          <TryOnJourneyBar currentStep={2} />

          <div style={styles.detailCard}>
            <div style={styles.mediaPanel}>
              <div style={styles.previewFrame}>
                <img
                  src={mainImg}
                  alt="Garment"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: 16,
                    background: isDark ? "#141b2a" : "#dfe7f8",
                  }}
                />
              </div>

              <div style={styles.thumbnailRow}>
                {images.map((img, idx) => {
                  const isSelected = mainImg === img;

                  return (
                    <div
                      key={idx}
                      style={{
                        ...styles.thumbnail,
                        border: isSelected ? "2.5px solid rgba(111, 58, 242, 0.78)" : "2.5px solid transparent",
                        boxShadow: isSelected
                          ? "0 0 0 1px rgba(111, 58, 242, 0.32), 0 10px 22px rgba(111, 58, 242, 0.18)"
                          : isDark
                            ? "0 2px 10px rgba(0,0,0,0.2)"
                            : "0 2px 10px rgba(34,57,95,0.08)",
                        transform: isSelected ? "translateY(-1px)" : "none",
                      }}
                      onClick={() => setMainImg(img)}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: 8,
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={styles.infoPanel}>
              <div style={styles.breadcrumb}>{breadcrumb}</div>
              <h1 style={styles.title}>{garmentTitle}</h1>

              <div style={styles.sectionLabel}>Select Size</div>

              <div style={styles.sizeRow}>
                {sizes.map((size) => {
                  const selected = selectedSize === size;

                  return (
                    <button
                      key={size}
                      type="button"
                      style={{
                        ...styles.sizeButton,
                        background: selected ? "linear-gradient(135deg, #3626ce 0%, #5f0b7e 100%)" : colors.sizeBg,
                        color: selected ? "#ffffff" : colors.sizeText,
                        border: selected ? "1px solid rgba(164, 201, 252, 0.38)" : colors.sizeBorder,
                        boxShadow: selected
                          ? "0 10px 20px rgba(111, 58, 242, 0.22)"
                          : isDark
                            ? "0 1px 6px rgba(0,0,0,0.18)"
                            : "0 1px 6px rgba(34,57,95,0.06)",
                      }}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                style={{
                  ...styles.primaryAction,
                  background: selectedSize
                    ? "linear-gradient(135deg, #3626ce 0%, #5f0b7e 100%)"
                    : colors.disabledBg,
                  color: selectedSize ? "#ffffff" : colors.disabledText,
                  boxShadow: selectedSize ? "0 12px 24px rgba(98, 78, 205, 0.3)" : "none",
                  opacity: selectedSize ? 1 : 0.78,
                }}
                disabled={!selectedSize}
                onClick={() =>
                  navigate("/try-on", {
                    state: {
                      avatarUrl,
                      garment,
                      selectedSize,
                    },
                  })
                }
              >
                Proceed to Try-On
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/catalog", {
                    state: {
                      avatarUrl,
                    },
                  })
                }
                style={styles.secondaryAction}
              >
                ← Back to Catalog
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
