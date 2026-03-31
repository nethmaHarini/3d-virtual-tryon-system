import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const NAVY_GRADIENT =
  "linear-gradient(135deg, #0a183d 0%, #142a5c 100%)";
const CARD_BG = "rgba(20, 34, 70, 0.95)";
const LIGHT_CARD_BG = "rgba(30, 48, 90, 0.85)";
const BRIGHT_BLUE = "#3ea6ff";
const DISABLED_BLUE = "#2a4a7a";
const TEXT_COLOR = "#eaf1fb";
const SUBTLE_TEXT = "#7ea0d6";
const BREADCRUMB = "#b0c4e7";
const SIZE_BG = "#1a2c4d";
const SIZE_SELECTED = "#3ea6ff";
const SIZE_TEXT = "#eaf1fb";
const SIZE_UNSELECTED = "#2a406b";
const ERROR_BG = "#1a223a";
const ERROR_TEXT = "#eaf1fb";

const styles = {
  backButton: {
    position: "absolute",
    top: "20px",
    left: "20px",
    background: "transparent",
    border: "none",
    color: "#3da5ff",
    fontSize: "14px",
    cursor: "pointer",
    zIndex: 2000,
  },
};

export default function GarmentDetail() {
  const location = useLocation();
  const navigate = useNavigate();

  const garment = location.state?.garment;
  const avatarUrl = location.state?.avatarUrl || "/models/final_avatar.obj";

  // Fallback if no garment data
  if (!garment) {
    return (
      <div
        style={{
          minHeight: "100vh",
          width: "100vw",
          background: NAVY_GRADIENT,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            background: ERROR_BG,
            color: ERROR_TEXT,
            padding: 32,
            borderRadius: 18,
            boxShadow: "0 4px 24px 0 #000a",
            textAlign: "center",
            marginBottom: 24,
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: 0.5,
          }}
        >
          Garment details not found.
        </div>
        <button
          style={{
            background: BRIGHT_BLUE,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "12px 32px",
            fontSize: 18,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 2px 8px 0 #0006",
            transition: "background 0.2s",
          }}
          onClick={() => navigate("/dashboard")}
        >
          Back to Catalog
        </button>
      </div>
    );
  }

  // Images: main + thumbnails
  const images = garment.images && garment.images.length
    ? garment.images
    : [
        "/src/assets/front-example.png",
        "/src/assets/front-example.png",
        "/src/assets/front-example.png",
      ];
  const [mainImg, setMainImg] = useState(images[0]);
  const [selectedSize, setSelectedSize] = useState(null);





  // Breadcrumbs
  const breadcrumb = garment.breadcrumb || "Shop / Apparel / Essentials";
  const garmentTitle = garment.title || "Classic White Tee";
  const sizes = garment.sizes || ["S", "M", "L"];

  // Responsive: scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: NAVY_GRADIENT,
        fontFamily: "Inter, 'Segoe UI', Arial, sans-serif",
        color: TEXT_COLOR,
        display: "flex",
        flexDirection: "column",
      }}
    >



      {/* Header */}
      <div
        style={{
          width: "100%",
          padding: "28px 48px 18px 48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          background: "transparent",
        }}
      >
        <div
          style={{
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
            fontFamily: "'Segoe UI', 'Roboto', 'Arial', sans-serif",
          }}
        >
          VirtuFit3D Studio
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 0",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 56,
            width: "100%",
            maxWidth: 1100,
            alignItems: "flex-start",
            justifyContent: "center",
          }}
        >
          {/* Left: Image Section */}
          <div
            style={{
              background: CARD_BG,
              borderRadius: 24,
              padding: "36px 32px 28px 32px",
              boxShadow: "0 6px 32px 0 #000a",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              minWidth: 340,
              maxWidth: 400,
              width: "36vw",
            }}
          >
            {/* Main Image */}
            <div
              style={{
                width: 260,
                height: 340,
                borderRadius: 18,
                background: LIGHT_CARD_BG,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 28,
                boxShadow: "0 2px 16px 0 #0006",
                overflow: "hidden",
              }}
            >
              <img
                src={mainImg}
                alt="Garment"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: 16,
                  background: "#1a2c4d",
                }}
              />
            </div>
            {/* Thumbnails */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                gap: 16,
                marginTop: 4,
              }}
            >
              {images.map((img, idx) => (
                <div
                  key={idx}
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 10,
                    overflow: "hidden",
                    border:
                      mainImg === img
                        ? `2.5px solid ${BRIGHT_BLUE}`
                        : "2.5px solid transparent",
                    boxShadow:
                      mainImg === img
                        ? "0 0 12px 0 #3ea6ff55"
                        : "0 1px 6px 0 #0005",
                    cursor: "pointer",
                    background: "#1a2c4d",
                    transition: "border 0.2s, box-shadow 0.2s",
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
              ))}
            </div>
          </div>

          {/* Right: Info Section */}
          <div
            style={{
              flex: 1,
              minWidth: 320,
              maxWidth: 480,
              display: "flex",
              flexDirection: "column",
              gap: 18,
              background: "none",
            }}
          >
            {/* Breadcrumb */}
            <div
              style={{
                fontSize: 15,
                color: BREADCRUMB,
                marginBottom: 2,
                letterSpacing: 0.2,
                fontWeight: 500,
                userSelect: "none",
              }}
            >
              {breadcrumb}
            </div>
            {/* Title */}
            <div
              style={{
                fontSize: 32,
                fontWeight: 800,
                color: TEXT_COLOR,
                marginBottom: 8,
                letterSpacing: 0.5,
                textShadow: "0 2px 12px #0a183d44",
              }}
            >
              {garmentTitle}
            </div>
            {/* Size Selection */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginTop: 18,
                marginBottom: 6,
                // justifyContent: "space-between", // Remove if not needed
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#eaf1fb",
                  letterSpacing: 0.2,
                }}
              >
                Select Size
              </div>
            </div>
            {/* Size Buttons */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                gap: 18,
                marginBottom: 18,
              }}
            >
              {sizes.map(size => (
                <button
                  key={size}
                  style={{
                    background:
                      selectedSize === size ? SIZE_SELECTED : SIZE_BG,
                    color:
                      selectedSize === size ? "#fff" : SIZE_TEXT,
                    border: "none",
                    borderRadius: 8,
                    padding: "12px 28px",
                    fontSize: 18,
                    fontWeight: 700,
                    letterSpacing: 0.5,
                    boxShadow:
                      selectedSize === size
                        ? "0 2px 12px 0 #3ea6ff55"
                        : "0 1px 6px 0 #0005",
                    cursor: "pointer",
                    outline: "none",
                    transition: "background 0.2s, color 0.2s, box-shadow 0.2s",
                  }}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
            {/* Main Action Button */}
            <button
              style={{
                background: selectedSize ? BRIGHT_BLUE : DISABLED_BLUE,
                color: TEXT_COLOR,
                fontSize: 22,
                fontWeight: 800,
                letterSpacing: 1.2,
                border: "none",
                borderRadius: 14,
                padding: "18px 0",
                width: "100%",
                marginTop: 18,
                marginBottom: 8,
                boxShadow: selectedSize
                  ? "0 4px 24px 0 #3ea6ff55"
                  : "0 2px 8px 0 #0006",
                cursor: selectedSize ? "pointer" : "not-allowed",
                opacity: selectedSize ? 1 : 0.7,
                transition: "background 0.2s, box-shadow 0.2s, opacity 0.2s",
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
            {/* Back to Catalog Button (below main action) */}
            <button
              onClick={() =>
                navigate("/catalog", {
                  state: {
                    avatarUrl,
                  },
                })
              }
              style={{
                background: "#142a5c",
                border: `2px solid ${BRIGHT_BLUE}`,
                color: BRIGHT_BLUE,
                fontSize: 20,
                fontWeight: 700,
                borderRadius: 10,
                padding: "14px 0",
                width: "100%",
                marginTop: 10,
                marginBottom: 0,
                boxShadow: "0 2px 12px 0 #3ea6ff22",
                cursor: "pointer",
                letterSpacing: 0.8,
                transition: "background 0.2s, color 0.2s, box-shadow 0.2s",
              }}
            >
              ← Back to Catalog
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
