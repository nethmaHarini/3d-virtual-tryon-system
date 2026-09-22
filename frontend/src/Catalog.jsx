import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import DashboardSidebar from "./components/DashboardSidebar";
import TryOnJourneyBar from "./components/TryOnJourneyBar";
import { useAppTheme } from "./theme";

function Catalog() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useAppTheme();

  const avatarUrl =
    location.state?.avatarUrl ||
    localStorage.getItem("avatarUrl") ||
    "/models/final_avatar.obj";

  const [tab, setTab] = useState("tshirts");

  const styles = {
    page: {
      minHeight: "100vh",
      width: "100%",
      minWidth: 0,
      background: isDark
        ? "radial-gradient(circle at 12% 14%, rgba(54, 38, 206, 0.22) 0%, transparent 34%), radial-gradient(circle at 86% 84%, rgba(95, 11, 126, 0.2) 0%, transparent 44%), linear-gradient(155deg, #090f17 0%, #0d141d 46%, #111a27 100%)"
        : "radial-gradient(circle at 12% 14%, rgba(78, 107, 255, 0.16) 0%, transparent 34%), radial-gradient(circle at 86% 84%, rgba(138, 92, 255, 0.12) 0%, transparent 44%), linear-gradient(155deg, #f7f9ff 0%, #edf2ff 46%, #eaf0fb 100%)",
      color: isDark ? "#dce3f0" : "#152033",
      fontFamily: "'Manrope', 'Segoe UI', sans-serif",
      padding: 0,
      margin: 0,
      boxSizing: "border-box",
      overflowX: "hidden",
    },

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

    headingWrap: {
      marginBottom: 4,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "end",
      flexWrap: "wrap",
      gap: 16,
    },

    heading: {
      margin: 0,
      fontSize: "2.28rem",
      letterSpacing: "-0.02em",
      fontWeight: 800,
      color: isDark ? "#ffffff" : "#152033",
      lineHeight: 1.1,
      fontFamily: "'Plus Jakarta Sans', 'Manrope', sans-serif",
    },

    subtitle: {
      color: isDark ? "#c3c6d0" : "#5f6b7c",
      fontWeight: 400,
      fontSize: "0.98rem",
      textAlign: "left",
      margin: "8px 0 0 0",
      maxWidth: 760,
      lineHeight: 1.55,
      letterSpacing: "0.01em",
    },

    statusChip: {
      padding: "9px 14px",
      borderRadius: 999,
      border: isDark
        ? "1px solid rgba(255, 255, 255, 0.08)"
        : "1px solid rgba(18, 30, 52, 0.1)",
      background: isDark
        ? "rgba(21, 28, 38, 0.72)"
        : "rgba(255, 255, 255, 0.86)",
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      fontSize: "0.7rem",
      fontWeight: 700,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: isDark ? "#c3c6d0" : "#526078",
    },

    chipDot: {
      width: 8,
      height: 8,
      borderRadius: "999px",
      background: "#a4c9fc",
      boxShadow: "0 0 10px rgba(164, 201, 252, 0.8)",
      animation: "catalogPulse 1.4s ease-in-out infinite",
    },

    searchFilterRow: {
      display: "flex",
      gap: 14,
      flexWrap: "wrap",
      alignItems: "center",
      marginBottom: 2,
    },

    searchWrap: {
      minWidth: 250,
      flex: "1 1 320px",
      display: "flex",
      alignItems: "center",
      gap: 8,
      borderRadius: 999,
      border: isDark
        ? "1px solid rgba(255,255,255,0.08)"
        : "1px solid rgba(18,30,52,0.08)",
      background: isDark
        ? "rgba(8, 15, 24, 0.74)"
        : "rgba(255,255,255,0.85)",
      padding: "10px 14px",
      boxSizing: "border-box",
      color: isDark ? "#8d9199" : "#65728a",
      fontSize: "0.86rem",
    },

    searchInput: {
      flex: 1,
      border: "none",
      background: "transparent",
      outline: "none",
      color: isDark ? "#dce3f0" : "#152033",
      fontSize: "0.86rem",
    },

    tabBar: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap",
    },

    tabButtonBase: {
      borderRadius: 999,
      padding: "10px 18px",
      fontSize: "0.84rem",
      fontWeight: 700,
      border: isDark
        ? "1px solid rgba(255,255,255,0.08)"
        : "1px solid rgba(18,30,52,0.08)",
      cursor: "pointer",
      transition: "all 220ms ease",
      letterSpacing: "0.02em",
    },

    tabButtonInactive: {
      background: isDark
        ? "rgba(36, 42, 52, 0.64)"
        : "#ffffff",
      color: isDark ? "#c3c6d0" : "#425277",
    },

    tabButtonActive: {
      background:
        "linear-gradient(135deg, #3626ce 0%, #5f0b7e 100%)",
      color: "#ffffff",
      boxShadow: "0 0 16px rgba(164, 201, 252, 0.22)",
      border: "1px solid rgba(164, 201, 252, 0.34)",
    },

    cardGrid: {
      display: "grid",
      gridTemplateColumns:
        "repeat(auto-fit, minmax(238px, 1fr))",
      gap: 20,
      width: "100%",
      marginTop: 6,
    },

    card: {
      borderRadius: 22,
      border: isDark
        ? "1px solid rgba(255, 255, 255, 0.07)"
        : "1px solid rgba(18,30,52,0.08)",
      background: isDark
        ? "rgba(21, 28, 38, 0.66)"
        : "rgba(255,255,255,0.9)",
      backdropFilter: "blur(20px)",
      overflow: "hidden",
      boxShadow: isDark
        ? "0 16px 34px rgba(5, 12, 22, 0.34)"
        : "0 16px 34px rgba(73,84,105,0.12)",
      cursor: "pointer",
      transition:
        "transform 260ms ease, box-shadow 260ms ease, border-color 260ms ease",
      display: "flex",
      flexDirection: "column",
      minHeight: 320,
    },

    imageWrap: {
      width: "100%",
      aspectRatio: "3 / 4",
      overflow: "hidden",
      position: "relative",
      background: isDark ? "#101824" : "#eef1f6",
    },

    cardImg: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      transition: "transform 420ms ease",
    },

    gradientOverlay: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: "42%",
      background:
        "linear-gradient(to top, rgba(13, 20, 29, 0.9) 0%, rgba(13, 20, 29, 0.2) 56%, transparent 100%)",
      pointerEvents: "none",
    },

    cardBody: {
      padding: "14px 14px 16px 14px",
      display: "flex",
      flexDirection: "column",
      gap: 10,
    },

    cardType: {
      margin: 0,
      fontSize: "0.64rem",
      color: "#a4c9fc",
      fontWeight: 800,
      letterSpacing: "0.16em",
      textTransform: "uppercase",
    },

    cardName: {
      margin: 0,
      fontSize: "1rem",
      color: isDark ? "#ffffff" : "#152033",
      fontWeight: 700,
      lineHeight: 1.32,
      fontFamily: "'Plus Jakarta Sans', 'Manrope', sans-serif",
    },

    sizePreview: {
      display: "flex",
      gap: 6,
      flexWrap: "wrap",
    },

    sizeChip: {
      padding: "5px 8px",
      borderRadius: 8,
      fontSize: "0.7rem",
      fontWeight: 700,
      background: isDark
        ? "rgba(255,255,255,0.08)"
        : "rgba(78,107,255,0.08)",
      color: isDark ? "#cdd4e2" : "#425277",
    },

    cardButton: {
      marginTop: 2,
      width: "100%",
      border: "none",
      borderRadius: 999,
      padding: "11px 14px",
      cursor: "pointer",
      background:
        "linear-gradient(135deg, #3626ce 0%, #5f0b7e 100%)",
      color: "#ffffff",
      fontWeight: 700,
      fontSize: "0.8rem",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      letterSpacing: "0.03em",
      transition: "all 220ms ease",
      boxShadow: "0 10px 22px rgba(40, 30, 104, 0.35)",
    },

    emptyText: {
      color: "#8eb6d6",
      opacity: 0.78,
      textAlign: "center",
      marginTop: 36,
      fontSize: "0.98rem",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 18,
      background: "rgba(21, 28, 38, 0.5)",
      padding: "18px 20px",
    },
  };

  // =========================================================
  // T-SHIRTS
  // =========================================================

  const tshirts = [
   
    {
  id: "t1",
  name: "Pink Female T-Shirt",
  category: "T-Shirts",

  image:
    "/images/T_shirts/Female/pink/female_pink_tshirt_front.png",

  thumbnails: [
    "/images/T_shirts/Female/pink/female_pink_tshirt_front.png",
    "/images/T_shirts/Female/pink/female_pink_tshirt_side.png",
    "/images/T_shirts/Female/pink/female_pink_tshirt_back.png",
  ],

  images: [
    "/images/T_shirts/Female/pink/female_pink_tshirt_front.png",
    "/images/T_shirts/Female/pink/female_pink_tshirt_side.png",
    "/images/T_shirts/Female/pink/female_pink_tshirt_back.png",
  ],

  breadcrumb: "Shop / Apparel / T-Shirts",

  sizes: ["S", "M", "L", "XL", "XXL"],

  modelBySize: {
    S: "/models/T_shirts/Female/pink_M/female_pink_tshirt_S.glb",
    M: "/models/T_shirts/Female/pink_M/female_pink_tshirt_M.glb",
    L: "/models/T_shirts/Female/pink_M/female_pink_tshirt_L.glb",
    XL: "/models/T_shirts/Female/pink_M/female_pink_tshirt_XL.glb",
    XXL: "/models/T_shirts/Female/pink_M/female_pink_tshirt_XXL.glb",
  },
},
  {
  id: "t2",
  name: "Orange Female T-Shirt",
  category: "T-Shirts",

  image:
    "/images/T_shirts/Female/OrangeIma/female_orange_tshirt_front.png",

  thumbnails: [
    "/images/T_shirts/Female/OrangeIma/female_orange_tshirt_front.png",
    "/images/T_shirts/Female/OrangeIma/female_orange_tshirt_side.png",
    "/images/T_shirts/Female/OrangeIma/female_orange_tshirt_back.png",
  ],

  images: [
    "/images/T_shirts/Female/OrangeIma/female_orange_tshirt_back.png",
    "/images/T_shirts/Female/OrangeIma/female_orange_tshirt_side.png",
    "/images/T_shirts/Female/OrangeIma/female_orange_tshirt_back.png",
  ],

  breadcrumb: "Shop / Apparel / T-Shirts",

  sizes: ["S", "M", "L", "XL", "XXL"],

  modelBySize: {
    S: "/models/T_shirts/Female/orange_M/female_orange_tshirt_S.glb",
    M: "/models/T_shirts/Female/orange_M/female_orange_tshirt_M.glb",
    L: "/models/T_shirts/Female/orange_M/female_orange_tshirt_L.glb",
    XL: "/models/T_shirts/Female/orange_M/female_orange_tshirt_XL.glb",
    XXL: "/models/T_shirts/Female/orange_M/female_orange_tshirt_XXL.glb",
  },
},
   {
  id: "t2",
  name: "black male T-Shirt",
  category: "T-Shirts",

  image:
    "/images/T_shirts/male/blackIma/male_black_tshirt_orginal.png",

  thumbnails: [
    "/images/T_shirts/male/blackIma/male_black_tshirt_front.png",
    "/images/T_shirts/male/blackIma/male_black_tshirt_side.png",
    "/images/T_shirts/male/blackIma/male_black_tshirt_back.png",
  ],

  images: [
    "/images/T_shirts/male/blackIma/male_black_tshirt_front.png",
    "/images/T_shirts/male/blackIma/male_black_tshirt_side.png",
    "/images/T_shirts/male/blackIma/male_black_tshirt_back.png",
  ],

  breadcrumb: "Shop / Apparel / T-Shirts",

  sizes: ["S", "M", "L", "XL", "XXL"],

  modelBySize: {
    S: "/models/T shirts/male/black_M/male_black_tshirt_S.glb.",
    M: "/models/T shirts/male/black_M/male_black_tshirt_M.glb",
    L: "/models/T shirts/male/black_M/male_black_tshirt_L.glb",
    XL: "/models/T shirts/male/black_M/male_black_tshirt_XL.glb",
    XXL: "/models/T shirts/male/black_M/male_black_tshirt_XXL.glb",
  },
},

    /*
    Keep your future catalog items here.

    {
      id: "t3",
      name: "Grey T-Shirt",
      ...
    }
    */
  ];

  // =========================================================
  // TROUSERS
  // =========================================================

  const trousers = [
    {
      id: "tr1",
      name: "purple female trouser",
      category: "Trousers",

      // Main image shown in the catalog card
      image:
        "/images/Trousers/purple_female_trouser_front.png",

      // Front / side / back preview images
      thumbnails: [
        "/images/Trousers/purple_female_trouser_front.png",
        "/images/Trousers/purple_female_trouser_side.png",
        "/images/Trousers/purple_female_trouser_back.png",
      ],

      // GarmentDetail.jsx reads this array
      images: [
        "/images/Trousers/purple_female_trouser_front.png",
        "/images/Trousers/purple_female_trouser_side.png",
        "/images/Trousers/purple_female_trouser_back.png",
      ],

      breadcrumb: "Shop / Apparel / Trousers",

      sizes: ["30", "32", "34", "36", "38"],

      modelBySize: {
        "30":
          "/models/trousers/Female/purple_M/female_purple_trouser_30.glb",


        "32":
          "/models/trousers/Female/purple_M/female_purple_trouser_32.glb",

        "34":
          "/models/trousers/Female/purple_M/female_purple_trouser_34.glb",

        "36":
          "/models/trousers/Female/purple_M/female_purple_trouser_36.glb",

        "38":
          "/models/trousers/Female/purple_M/female_purple_trouser_38.glb",
      },
    },

    {
      id: "tr2",
      name: "Orange Trouser",
      category: "Trousers",

      image: "/images/orange.jpg",

      thumbnails: [
        "/images/orange.jpg",
        "/images/orange.jpg",
        "/images/orange.jpg",
      ],

      breadcrumb: "Shop / Apparel / Trousers",

      sizes: ["30", "32", "34", "36", "38"],
    },

    {
      id: "tr3",
      name: "White Male Trouser",
      category: "Trousers",

      // Main image shown in the catalog card
      image:
        "/images/Trousers/white_male_trouser_front.png",

      // Front / side / back preview images
      thumbnails: [
        "/images/Trousers/white_male_trouser_front.png",
        "/images/Trousers/white_male_trouser_side.png",
        "/images/Trousers/white_male_trouser_back.png",
      ],

      // GarmentDetail.jsx reads this array
      images: [
        "/images/Trousers/white_male_trouser_front.png",
        "/images/Trousers/white_male_trouser_side.png",
        "/images/Trousers/white_male_trouser_back.png",
      ],

      breadcrumb: "Shop / Apparel / Trousers",

      sizes: ["30", "32", "34", "36", "38"],

      modelBySize: {
        "30":
          "/models/trousers/white/male_white_trouser_30.glb",

        "32":
          "/models/trousers/white/male_white_trouser_32.glb",

        "34":
          "/models/trousers/white/male_white_trouser_34.glb",

        "36":
          "/models/trousers/white/male_white_trouser_36.glb",

        "38":
          "/models/trousers/white/male_white_trouser_38.glb",
      },
    },
  ];

  // =========================================================
  // OPEN GARMENT DETAIL PAGE
  // =========================================================

  const openGarment = (item) => {
    navigate("/garment-detail", {
      state: {
        avatarUrl,

        garment: {
          ...item,

          title: item.name,

          breadcrumb:
            item.category === "Trousers"
              ? "Shop / Apparel / Trousers"
              : "Shop / Apparel / T-Shirts",

          /*
            Very important:
            Send ALL preview images to GarmentDetail.
          */
          images:
            item.images ||
            item.thumbnails ||
            [item.image],

          sizes:
            item.sizes ||
            (item.category === "Trousers"
              ? ["30", "32", "34", "36", "38"]
              : ["S", "M", "L"]),
        },
      },
    });
  };

  const products =
    tab === "tshirts"
      ? tshirts
      : trousers;

  return (
    <div style={styles.page}>
      <style>
        {`
          @import url(
            'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Manrope:wght@400;500;600;700&display=swap'
          );

          .catalog-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 24px 44px rgba(5, 12, 22, 0.46);
            border-color: rgba(164, 201, 252, 0.24);
          }

          .catalog-card:hover .catalog-card-image {
            transform: scale(1.06);
          }

          .catalog-tab:hover {
            border-color: rgba(164, 201, 252, 0.3);
          }

          .catalog-cta:hover {
            transform: translateY(-1px);
            filter: brightness(1.05);
          }

          @keyframes catalogPulse {
            0%,
            100% {
              opacity: 0.4;
            }

            50% {
              opacity: 1;
            }
          }

          @media (max-width: 1220px) {
            .catalog-main {
              margin-left: 18px !important;
              margin-right: 18px !important;
              padding-top: 4px !important;
            }
          }
        `}
      </style>

      <DashboardSidebar />

      <main
        style={styles.main}
        className="catalog-main"
      >
        <div style={styles.mainInner}>
          <TryOnJourneyBar
            currentStep={1}
          />

          <header style={styles.headingWrap}>
            <div>
              <h2 style={styles.heading}>
                Garment Catalog
              </h2>

              <p style={styles.subtitle}>
                Explore curated digital couture
                pieces engineered for precise
                virtual fitting and realistic
                drape behavior.
              </p>
            </div>

            <div style={styles.statusChip}>
              <span style={styles.chipDot} />

              <span>
                Catalog Online
              </span>
            </div>
          </header>

          <section
            style={styles.searchFilterRow}
          >
            <div style={styles.searchWrap}>
              <span>⌕</span>

              <input
                style={styles.searchInput}
                value=""
                readOnly
                placeholder="Search collection..."
                aria-label="Search collection"
              />
            </div>

            <div style={styles.tabBar}>
              <button
                type="button"
                style={{
                  ...styles.tabButtonBase,

                  ...(tab === "tshirts"
                    ? styles.tabButtonActive
                    : styles.tabButtonInactive),
                }}
                className={
                  tab === "tshirts"
                    ? ""
                    : "catalog-tab"
                }
                onClick={() =>
                  setTab("tshirts")
                }
              >
                T-Shirts
              </button>

              <button
                type="button"
                style={{
                  ...styles.tabButtonBase,

                  ...(tab === "trousers"
                    ? styles.tabButtonActive
                    : styles.tabButtonInactive),
                }}
                className={
                  tab === "trousers"
                    ? ""
                    : "catalog-tab"
                }
                onClick={() =>
                  setTab("trousers")
                }
              >
                Trousers
              </button>
            </div>
          </section>

          {/* Product Grid */}
          <section style={styles.cardGrid}>
            {products.map((item) => (
              <article
                key={item.id}
                style={styles.card}
                className="catalog-card"
                onClick={() =>
                  openGarment(item)
                }
              >
                <div style={styles.imageWrap}>
                  <img
                    src={item.image}
                    alt={item.name}
                    style={styles.cardImg}
                    className="catalog-card-image"
                  />

                  <div
                    style={
                      styles.gradientOverlay
                    }
                  />
                </div>

                <div style={styles.cardBody}>
                  <p style={styles.cardType}>
                    {item.category}
                  </p>

                  <h3 style={styles.cardName}>
                    {item.name}
                  </h3>

                  {/* Show sizes */}
                  <div style={styles.sizePreview}>
                    {item.sizes?.map(
                      (size) => (
                        <span
                          key={size}
                          style={styles.sizeChip}
                        >
                          {item.category ===
                          "Trousers"
                            ? `${size}"`
                            : size}
                        </span>
                      )
                    )}
                  </div>

                  <button
                    type="button"
                    style={styles.cardButton}
                    className="catalog-cta"
                    onClick={(event) => {
                      event.stopPropagation();

                      openGarment(item);
                    }}
                  >
                    <span>◉</span>

                    <span>
                      Try-On
                    </span>
                  </button>
                </div>
              </article>
            ))}
          </section>

          {tab === "trousers" &&
            trousers.length === 0 && (
              <div style={styles.emptyText}>
                No trousers available yet.
              </div>
            )}
        </div>
      </main>
    </div>
  );
}

export default Catalog;