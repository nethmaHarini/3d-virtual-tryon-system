import { useMemo } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import heroImage from "./assets/heroL.png";

function LandingPage() {
  const navigate = useNavigate();
  const { theme = "dark" } = useOutletContext() || {};
  const isDark = theme === "dark";

  const colors = useMemo(
    () =>
      isDark
        ? {
            pageBackground:
              "radial-gradient(circle at 12% 18%, rgba(93, 61, 255, 0.22) 0%, transparent 42%), radial-gradient(circle at 88% 82%, rgba(153, 74, 255, 0.22) 0%, transparent 48%), linear-gradient(150deg, #070d16 0%, #0d141d 45%, #101926 100%)",
            text: "#e7edf9",
            brand: "#ffffff",
            title: "#ffffff",
            subtitle: "#c3cce1",
            secondaryButtonBorder: "rgba(255, 255, 255, 0.18)",
            secondaryButtonBackground: "rgba(12, 19, 30, 0.65)",
            secondaryButtonText: "#e7edf9",
            statBorder: "rgba(255, 255, 255, 0.1)",
            statBackground: "rgba(18, 26, 38, 0.66)",
            statValue: "#ffffff",
            statLabel: "#9fb3d9",
            ringBorder: "16px solid rgba(188, 208, 255, 0.15)",
            ringShadow:
              "inset 0 0 34px rgba(164, 201, 252, 0.3), 0 0 70px rgba(164, 201, 252, 0.2), 0 0 120px rgba(128, 90, 213, 0.2)",
            visualBorder: "1px solid rgba(255, 255, 255, 0.12)",
            visualBackground: "rgba(21, 28, 38, 0.7)",
            visualShadow: "0 20px 42px rgba(6, 12, 20, 0.45)",
            visualHeading: "#ffffff",
            visualText: "#a6badb",
            ambientLeft: "rgba(83, 61, 209, 0.24)",
            ambientRight: "rgba(95, 11, 126, 0.24)",
          }
        : {
            pageBackground:
              "radial-gradient(circle at 12% 18%, rgba(122, 117, 255, 0.2) 0%, transparent 42%), radial-gradient(circle at 88% 82%, rgba(216, 121, 255, 0.16) 0%, transparent 48%), linear-gradient(150deg, #f6f8ff 0%, #edf2ff 45%, #f8fbff 100%)",
            text: "#20293a",
            brand: "#121a2a",
            title: "#101b31",
            subtitle: "#3f4f70",
            secondaryButtonBorder: "rgba(19, 32, 55, 0.15)",
            secondaryButtonBackground: "rgba(255, 255, 255, 0.9)",
            secondaryButtonText: "#1d2b47",
            statBorder: "rgba(17, 27, 45, 0.12)",
            statBackground: "rgba(255, 255, 255, 0.78)",
            statValue: "#131f36",
            statLabel: "#4f6185",
            ringBorder: "16px solid rgba(117, 141, 204, 0.2)",
            ringShadow:
              "inset 0 0 34px rgba(137, 159, 228, 0.25), 0 0 70px rgba(164, 183, 241, 0.2), 0 0 120px rgba(158, 107, 215, 0.18)",
            visualBorder: "1px solid rgba(17, 27, 45, 0.1)",
            visualBackground: "rgba(255, 255, 255, 0.78)",
            visualShadow: "0 20px 42px rgba(34, 57, 95, 0.18)",
            visualHeading: "#14203a",
            visualText: "#4f6288",
            ambientLeft: "rgba(123, 106, 255, 0.2)",
            ambientRight: "rgba(183, 97, 234, 0.16)",
          },
    [isDark]
  );

  const styles = {
    page: {
      minHeight: "100vh",
      width: "100%",
      background: colors.pageBackground,
      color: colors.text,
      fontFamily: "'Plus Jakarta Sans', 'Manrope', sans-serif",
      position: "relative",
      overflow: "hidden",
      transition: "background 240ms ease, color 240ms ease",
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
      marginTop: "40px",
    },
    title: {
      margin: "0 0 14px 0",
      fontSize: "clamp(2rem, 5.5vw, 4rem)",
      lineHeight: 1.05,
      letterSpacing: "-0.02em",
      fontWeight: 800,
      color: colors.title,
    },
    subtitle: {
      margin: "0 0 30px 0",
      fontSize: "1.02rem",
      color: colors.subtitle,
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
      border: `1px solid ${colors.secondaryButtonBorder}`,
      borderRadius: 999,
      padding: "11px 23px",
      background: colors.secondaryButtonBackground,
      color: colors.secondaryButtonText,
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
      border: `1px solid ${colors.statBorder}`,
      background: colors.statBackground,
      padding: "12px 14px",
      backdropFilter: "blur(10px)",
    },
    statValue: {
      margin: 0,
      color: colors.statValue,
      fontSize: "1.15rem",
      fontWeight: 800,
    },
    statLabel: {
      margin: "4px 0 0 0",
      color: colors.statLabel,
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
      border: colors.ringBorder,
      boxShadow: colors.ringShadow,
    },
    visualCard: {
      position: "relative",
      width: "min(88%, 440px)",
      borderRadius: 24,
      border: colors.visualBorder,
      background: colors.visualBackground,
      backdropFilter: "blur(16px)",
      overflow: "hidden",
      boxShadow: colors.visualShadow,
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
      color: colors.visualHeading,
      fontSize: "1.02rem",
      fontWeight: 700,
    },
    visualText: {
      margin: "5px 0 0 0",
      color: colors.visualText,
      fontSize: "0.88rem",
      lineHeight: 1.45,
    },
    ambientLeft: {
      background: colors.ambientLeft,
    },
    ambientRight: {
      background: colors.ambientRight,
    },
  };

  return (
    <div style={styles.page} className={`landing-page landing-page-${theme}`}>
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
        }
        .landing-cta:hover {
          transform: translateY(-2px);
          filter: brightness(1.06);
        }
        .landing-ghost:hover {
          transform: translateY(-2px);
          border-color: rgba(103, 121, 165, 0.55);
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

      <div className="landing-ambient landing-ambient-left" style={styles.ambientLeft} />
      <div className="landing-ambient landing-ambient-right" style={styles.ambientRight} />

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