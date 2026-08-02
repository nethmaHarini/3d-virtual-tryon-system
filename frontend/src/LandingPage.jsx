import { useNavigate } from "react-router-dom";
import heroImage from "./assets/heroL.png";

function LandingPage() {
  const navigate = useNavigate();

  const styles = {
    page: {
      minHeight: "100vh",
      width: "100%",
      background:
        "radial-gradient(circle at 12% 18%, rgba(93, 61, 255, 0.22) 0%, transparent 42%), radial-gradient(circle at 88% 82%, rgba(153, 74, 255, 0.22) 0%, transparent 48%), linear-gradient(150deg, #070d16 0%, #0d141d 45%, #101926 100%)",
      color: "#e7edf9",
      fontFamily: "'Plus Jakarta Sans', 'Manrope', sans-serif",
      position: "relative",
      overflow: "hidden",
    },
    shell: {
      maxWidth: 1200,
      margin: "0 auto",
      padding: "26px 22px 42px",
      position: "relative",
      zIndex: 2,
    },
    hero: {
      display: "grid",
      gridTemplateColumns: "1.1fr 1fr",
      gap: 34,
      alignItems: "center",
      // Added a slight top margin to account for the removed nav
      marginTop: "40px", 
    },
    title: {
      margin: "0 0 14px 0",
      fontSize: "clamp(2rem, 5.5vw, 4rem)",
      lineHeight: 1.05,
      letterSpacing: "-0.02em",
      fontWeight: 800,
      color: "#ffffff",
    },
    subtitle: {
      margin: "0 0 30px 0",
      fontSize: "1.02rem",
      color: "#c3cce1",
      lineHeight: 1.62,
      maxWidth: 560,
    },
    actionRow: {
      display: "flex",
      alignItems: "center",
      gap: 14,
      flexWrap: "wrap",
      marginBottom: 26,
    },
    primaryButton: {
      border: "none",
      borderRadius: 999,
      padding: "12px 24px",
      background: "linear-gradient(135deg, #3626ce 0%, #5f0b7e 100%)",
      color: "#ffffff",
      fontWeight: 700,
      cursor: "pointer",
      boxShadow: "0 14px 28px rgba(31, 22, 81, 0.45)",
      transition: "all 240ms ease",
    },
    secondaryButton: {
      border: "1px solid rgba(255, 255, 255, 0.18)",
      borderRadius: 999,
      padding: "11px 23px",
      background: "rgba(12, 19, 30, 0.65)",
      color: "#e7edf9",
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 240ms ease",
    },
    statsRow: {
      display: "flex",
      gap: 14,
      flexWrap: "wrap",
    },
    statCard: {
      minWidth: 136,
      borderRadius: 16,
      border: "1px solid rgba(255, 255, 255, 0.1)",
      background: "rgba(18, 26, 38, 0.66)",
      padding: "12px 14px",
      backdropFilter: "blur(10px)",
    },
    statValue: {
      margin: 0,
      color: "#ffffff",
      fontSize: "1.15rem",
      fontWeight: 800,
    },
    statLabel: {
      margin: "4px 0 0 0",
      color: "#9fb3d9",
      fontSize: "0.78rem",
      letterSpacing: "0.05em",
      textTransform: "uppercase",
    },
    visualWrap: {
      position: "relative",
      minHeight: 420,
      display: "grid",
      placeItems: "center",
    },
    glowRing: {
      position: "absolute",
      width: "min(70vw, 420px)",
      height: "min(70vw, 420px)",
      borderRadius: "999px",
      border: "16px solid rgba(188, 208, 255, 0.15)",
      boxShadow:
        "inset 0 0 34px rgba(164, 201, 252, 0.3), 0 0 70px rgba(164, 201, 252, 0.2), 0 0 120px rgba(128, 90, 213, 0.2)",
    },
    visualCard: {
      position: "relative",
      width: "min(88%, 440px)",
      borderRadius: 24,
      border: "1px solid rgba(255, 255, 255, 0.12)",
      background: "rgba(21, 28, 38, 0.7)",
      backdropFilter: "blur(16px)",
      overflow: "hidden",
      boxShadow: "0 20px 42px rgba(6, 12, 20, 0.45)",
    },
    visualImage: {
      width: "100%",
      height: 550,
      objectFit: "cover",
      display: "block",
    },
    visualMeta: {
      padding: "14px 16px 16px",
    },
    visualHeading: {
      margin: 0,
      color: "#ffffff",
      fontSize: "1.02rem",
      fontWeight: 700,
    },
    visualText: {
      margin: "5px 0 0 0",
      color: "#a6badb",
      fontSize: "0.88rem",
      lineHeight: 1.45,
    },
  };

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Manrope:wght@400;500;600;700&display=swap');
        .landing-ambient {
          position: absolute;
          border-radius: 999px;
          filter: blur(105px);
          pointer-events: none;
        }
        .landing-ambient-left {
          width: 44vw;
          height: 44vw;
          min-width: 260px;
          min-height: 260px;
          max-width: 620px;
          max-height: 620px;
          left: -16vw;
          top: -18vw;
          background: rgba(83, 61, 209, 0.24);
        }
        .landing-ambient-right {
          width: 42vw;
          height: 42vw;
          min-width: 260px;
          min-height: 260px;
          max-width: 580px;
          max-height: 580px;
          right: -16vw;
          bottom: -20vw;
          background: rgba(95, 11, 126, 0.24);
        }
        .landing-cta:hover {
          transform: translateY(-2px);
          filter: brightness(1.06);
        }
        .landing-ghost:hover {
          transform: translateY(-2px);
          border-color: rgba(164, 201, 252, 0.4);
        }
        @media (max-width: 980px) {
          .landing-hero {
            grid-template-columns: 1fr !important;
          }
          .landing-visual {
            min-height: 360px !important;
          }
        }
      `}</style>

      <div className="landing-ambient landing-ambient-left" />
      <div className="landing-ambient landing-ambient-right" />

      <div style={styles.shell}>
        <main style={styles.hero} className="landing-hero">
          <section>
            <h2 style={styles.title}> Experience the Future of Couture </h2>
            <p style={styles.subtitle}>
              Step into your digital wardrobe. Generate your personalized 3D avatar and try on garments with precision fit analysis.
            </p>

            <div style={styles.actionRow}>
              <button
                type="button"
                style={styles.primaryButton}
                className="landing-cta"
                onClick={() => navigate("/login")}
              >
                Get Started
              </button>
              <button
                type="button"
                style={styles.secondaryButton}
                className="landing-ghost"
                onClick={() => navigate("/login")}
              >
                Explore App
              </button>
            </div>

            <div style={styles.statsRow}>
              <div style={styles.statCard}>
                <p style={styles.statValue}>3D</p>
                <p style={styles.statLabel}>Avatar Engine</p>
              </div>
              <div style={styles.statCard}>
                <p style={styles.statValue}>360°</p>
                <p style={styles.statLabel}>Garment Preview</p>
              </div>
              <div style={styles.statCard}>
                <p style={styles.statValue}>AI Fit</p>
                <p style={styles.statLabel}>Size Insights</p>
              </div>
            </div>
          </section>

          <section style={styles.visualWrap} className="landing-visual">
            <div style={styles.glowRing} />
            <div style={styles.visualCard}>
              <img src={heroImage} alt="Virtual fitting room preview" style={styles.visualImage} />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default LandingPage;