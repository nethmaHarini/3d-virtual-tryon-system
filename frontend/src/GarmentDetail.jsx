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
  const avatarUrl =
    location.state?.avatarUrl || "/models/final_avatar.obj";

  const colors = isDark
    ? {
        pageBackground:
          "radial-gradient(circle at 12% 14%, rgba(124, 58, 237, 0.14) 0%, transparent 34%), radial-gradient(circle at 88% 88%, rgba(95, 11, 126, 0.12) 0%, transparent 40%), linear-gradient(155deg, #090d16 0%, #0d1320 38%, #101827 100%)",
        cardBackground: "#111827",
        mediaBackground: "#161e2e",
        mediaBorder: "1px solid #2a3447",
        panelBorder: "1px solid #2a3447",
        text: "#f8fafc",
        heading: "#f8fafc",
        muted: "#a7b0c0",
        breadcrumb: "#a7b0c0",
        cardShadow: "0 18px 32px rgba(2, 6, 23, 0.34)",
        sizeBg: "#111827",
        sizeText: "#f8fafc",
        sizeBorder: "1px solid #37445a",
        secondaryBg: "#111827",
        secondaryText: "#f8fafc",
        secondaryBorder: "1px solid #37445a",
        fallbackCard: "#111827",
        fallbackText: "#f8fafc",
        disabledBg: "#1b2435",
        disabledText: "#727c8e",
      }
    : {
        pageBackground:
          "radial-gradient(circle at 12% 14%, rgba(124, 58, 237, 0.1) 0%, transparent 34%), radial-gradient(circle at 88% 88%, rgba(139, 92, 246, 0.08) 0%, transparent 40%), linear-gradient(155deg, #f8fafc 0%, #eef3ff 100%)",
        cardBackground: "rgba(255, 255, 255, 0.9)",
        mediaBackground: "rgba(255, 255, 255, 0.93)",
        mediaBorder: "1px solid rgba(18, 30, 52, 0.08)",
        panelBorder: "1px solid rgba(18, 30, 52, 0.08)",
        text: "#0f172a",
        heading: "#0f172a",
        muted: "#475569",
        breadcrumb: "#53607d",
        cardShadow: "0 16px 30px rgba(15, 23, 42, 0.08)",
        sizeBg: "rgba(255, 255, 255, 0.96)",
        sizeText: "#0f172a",
        sizeBorder: "1px solid rgba(18, 30, 52, 0.1)",
        secondaryBg: "rgba(255, 255, 255, 0.96)",
        secondaryText: "#0f172a",
        secondaryBorder: "1px solid rgba(18, 30, 52, 0.1)",
        fallbackCard: "rgba(255, 255, 255, 0.92)",
        fallbackText: "#0f172a",
        disabledBg: "#e2e8f0",
        disabledText: "#475569",
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
      gridTemplateColumns:
        "minmax(0, 1.05fr) minmax(320px, 0.95fr)",
      gap: 28,
      background: colors.cardBackground,
      border: colors.panelBorder,
      borderRadius: 24,
      boxShadow: colors.cardShadow,
      backdropFilter: "blur(24px)",
      padding: 28,
      boxSizing: "border-box",
      alignItems: "stretch",
      transition:
        "box-shadow 180ms ease, border-color 180ms ease, transform 180ms ease",
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
      minHeight: 650,
      boxShadow: isDark
        ? "inset 0 1px 0 rgba(255,255,255,0.04)"
        : "inset 0 1px 0 rgba(15,23,42,0.02)",
    },

    /*
      IMPORTANT:
      Taller preview frame for portrait garment images.
    */
    previewFrame: {
      width: "100%",
      maxWidth: 420,
      height: 560,
      borderRadius: 18,

      background: isDark
        ? "rgba(10, 15, 24, 0.9)"
        : "rgba(226, 232, 240, 0.9)",

      display: "flex",
      alignItems: "center",
      justifyContent: "center",

      boxShadow: isDark
        ? "inset 0 1px 0 rgba(255,255,255,0.06), 0 12px 24px rgba(2, 6, 23, 0.25)"
        : "inset 0 1px 0 rgba(255,255,255,0.9), 0 12px 24px rgba(15, 23, 42, 0.08)",

      overflow: "hidden",
      marginBottom: 22,

      border: isDark
        ? "1px solid rgba(255,255,255,0.05)"
        : "1px solid rgba(15, 23, 42, 0.05)",
    },

    /*
      Main image uses contain instead of cover.
      This prevents the waistband and trouser legs
      from being cropped.
    */
    mainImage: {
      width: "100%",
      height: "100%",
      objectFit: "contain",
      objectPosition: "center center",
      display: "block",
      borderRadius: 16,

      background: isDark
        ? "#0b0b0d"
        : "#dfe7f8",
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

      background: isDark
        ? "rgba(22, 30, 39, 0.9)"
        : "rgba(229, 236, 250, 0.9)",

      cursor: "pointer",

      transition:
        "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",

      display: "block",
      border: "2.5px solid transparent",

      boxShadow: isDark
        ? "0 2px 10px rgba(0,0,0,0.2)"
        : "0 2px 10px rgba(34,57,95,0.08)",
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
      fontFamily:
        "'Plus Jakarta Sans', 'Manrope', sans-serif",
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

      transition:
        "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, background 180ms ease",
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

      transition:
        "transform 180ms ease, box-shadow 180ms ease, opacity 180ms ease, filter 180ms ease",
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

      transition:
        "background 180ms ease, color 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
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

      border: isDark
        ? "1px solid rgba(255,255,255,0.08)"
        : "1px solid rgba(18,30,52,0.08)",

      boxShadow: isDark
        ? "0 20px 40px rgba(5,12,22,0.35)"
        : "0 20px 40px rgba(34,57,95,0.12)",

      textAlign: "center",
      marginBottom: 24,
      fontSize: 22,
      fontWeight: 600,
      letterSpacing: 0.5,
    },

    fallbackButton: {
      background:
        "linear-gradient(135deg, #3626ce 0%, #5f0b7e 100%)",

      color: "#fff",
      border: "none",
      borderRadius: 999,
      padding: "12px 28px",
      fontSize: "0.9rem",
      fontWeight: 700,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      cursor: "pointer",

      boxShadow:
        "0 12px 24px rgba(98, 78, 205, 0.3)",

      transition:
        "transform 0.2s ease, box-shadow 0.2s ease",
    },
  };

  /*
    Hooks must always run before any conditional return.
  */
  const images =
    garment?.images && garment.images.length
      ? garment.images
      : garment?.image
      ? [garment.image]
      : [
          "/src/assets/front-example.png",
          "/src/assets/front-example.png",
          "/src/assets/front-example.png",
        ];

  const [mainImg, setMainImg] = useState(
    images[0]
  );

  const [selectedSize, setSelectedSize] =
    useState(null);

  const breadcrumb =
    garment?.breadcrumb ||
    "Shop / Apparel / Essentials";

  const garmentTitle =
    garment?.title ||
    garment?.name ||
    "Classic White Tee";

  const sizes =
    garment?.sizes ||
    (garment?.category === "Trousers"
      ? ["30", "32", "34", "36", "38"]
      : ["S", "M", "L"]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  /*
    No garment selected.
  */
  if (!garment) {
    return (
      <div style={styles.page}>
        <DashboardSidebar />

        <main style={styles.main}>
          <div style={styles.mainInner}>
            <div style={styles.fallbackWrap}>
              <div>
                <div style={styles.fallbackCard}>
                  Garment details not found.
                </div>

                <button
                  style={styles.fallbackButton}
                  onClick={() =>
                    navigate("/catalog")
                  }
                >
                  Back to Catalog
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <DashboardSidebar />

      <main style={styles.main}>
        <div style={styles.mainInner}>
          <TryOnJourneyBar
            currentStep={2}
          />

          <div style={styles.detailCard}>
            {/* LEFT SIDE - GARMENT IMAGES */}
            <div style={styles.mediaPanel}>
              <div style={styles.previewFrame}>
                <img
                  src={mainImg}
                  alt={garmentTitle}
                  style={styles.mainImage}
                />
              </div>

              {/* FRONT / SIDE / BACK THUMBNAILS */}
              <div style={styles.thumbnailRow}>
                {images.map((img, idx) => {
                  const isSelected =
                    mainImg === img;

                  return (
                    <div
                      key={idx}
                      style={{
                        ...styles.thumbnail,

                        border: isSelected
                          ? "2.5px solid rgba(111, 58, 242, 0.78)"
                          : "2.5px solid transparent",

                        boxShadow: isSelected
                          ? "0 0 0 1px rgba(111, 58, 242, 0.32), 0 10px 22px rgba(111, 58, 242, 0.18)"
                          : isDark
                          ? "0 2px 10px rgba(0,0,0,0.2)"
                          : "0 2px 10px rgba(34,57,95,0.08)",

                        transform: isSelected
                          ? "translateY(-1px)"
                          : "none",
                      }}
                      onClick={() =>
                        setMainImg(img)
                      }
                    >
                      <img
                        src={img}
                        alt={`Garment view ${
                          idx + 1
                        }`}
                        style={{
                          width: "100%",
                          height: "100%",

                          /*
                            Keep cover here.
                            Small thumbnails look
                            better when they fill
                            their boxes.
                          */
                          objectFit: "cover",

                          borderRadius: 8,
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT SIDE - GARMENT INFORMATION */}
            <div style={styles.infoPanel}>
              <div style={styles.breadcrumb}>
                {breadcrumb}
              </div>

              <h1 style={styles.title}>
                {garmentTitle}
              </h1>

              <div style={styles.sectionLabel}>
                Select Size
              </div>

              <div style={styles.sizeRow}>
                {sizes.map((size) => {
                  const selected =
                    selectedSize === size;

                  return (
                    <button
                      key={size}
                      type="button"
                      style={{
                        ...styles.sizeButton,

                        background: selected
                          ? "linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)"
                          : colors.sizeBg,

                        color: selected
                          ? "#ffffff"
                          : colors.sizeText,

                        border: selected
                          ? "1px solid rgba(124, 58, 237, 0.65)"
                          : colors.sizeBorder,

                        boxShadow: selected
                          ? "0 12px 20px rgba(124, 58, 237, 0.22)"
                          : isDark
                          ? "0 1px 6px rgba(2,6,23,0.24)"
                          : "0 1px 6px rgba(15,23,42,0.06)",
                      }}
                      onClick={() =>
                        setSelectedSize(size)
                      }
                    >
                      {garment.category ===
                      "Trousers"
                        ? `${size}"`
                        : size}
                    </button>
                  );
                })}
              </div>

              {/* TRY-ON BUTTON */}
              <button
                type="button"
                style={{
                  ...styles.primaryAction,

                  background: selectedSize
                    ? "linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)"
                    : colors.disabledBg,

                  color: selectedSize
                    ? "#ffffff"
                    : colors.disabledText,

                  boxShadow: selectedSize
                    ? "0 12px 24px rgba(124, 58, 237, 0.22)"
                    : "none",

                  opacity: selectedSize
                    ? 1
                    : 0.8,
                }}
                disabled={!selectedSize}
                onClick={() => {
                  const garmentModelUrl =
                    garment?.modelBySize?.[
                      selectedSize
                    ] || null;

                  /*
                    Existing catalog items stay
                    in the catalog even if their
                    GLB models are not available yet.
                  */
                  if (!garmentModelUrl) {
                    alert(
                      "3D model for this garment/size has not been uploaded yet."
                    );

                    return;
                  }

                  navigate("/try-on", {
                    state: {
                      avatarUrl,
                      garment,
                      selectedSize,
                      garmentModelUrl,
                    },
                  });
                }}
              >
                Proceed to Try-On
              </button>

              {/* BACK BUTTON */}
              <button
                type="button"
                onClick={() =>
                  navigate("/catalog", {
                    state: {
                      avatarUrl,
                    },
                  })
                }
                style={
                  styles.secondaryAction
                }
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