import { useEffect, useMemo, useState } from "react";
import {
  useLocation,
  useNavigate,
  useOutletContext,
} from "react-router-dom";

import heroImage from "./assets/heroL.png";

import Features from "./Features";
import HowItWorks from "./HowItWorks";
import FAQ from "./FAQ";
import ContactUs from "./ContactUs";

function LandingPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { theme = "dark" } = useOutletContext() || {};
  const isDark = theme === "dark";

  const [showBackToTop, setShowBackToTop] = useState(false);

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!location.hash) {
      return;
    }

    const sectionId = location.hash.replace("#", "");

    const timer = window.setTimeout(() => {
      scrollToSection(sectionId);
    }, 100);

    return () => {
      window.clearTimeout(timer);
    };
  }, [location.hash]);

  const colors = useMemo(
    () =>
      isDark
        ? {
            pageBackground:
              "radial-gradient(circle at 12% 18%, rgba(93, 61, 255, 0.22) 0%, transparent 42%), radial-gradient(circle at 88% 82%, rgba(153, 74, 255, 0.22) 0%, transparent 48%), linear-gradient(150deg, #070d16 0%, #0d141d 45%, #101926 100%)",

            text: "#e7edf9",
            title: "#ffffff",
            subtitle: "#c3cce1",

            secondaryButtonBorder:
              "rgba(255, 255, 255, 0.18)",

            secondaryButtonBackground:
              "rgba(12, 19, 30, 0.65)",

            secondaryButtonText: "#e7edf9",

            ringBorder:
              "16px solid rgba(188, 208, 255, 0.15)",

            ringShadow:
              "inset 0 0 34px rgba(164, 201, 252, 0.3), 0 0 70px rgba(164, 201, 252, 0.2), 0 0 120px rgba(128, 90, 213, 0.2)",

            visualBorder:
              "1px solid rgba(255, 255, 255, 0.12)",

            visualBackground:
              "rgba(21, 28, 38, 0.7)",

            visualShadow:
              "0 20px 42px rgba(6, 12, 20, 0.45)",

            ambientLeft:
              "rgba(83, 61, 209, 0.24)",

            ambientRight:
              "rgba(95, 11, 126, 0.24)",

            footerBackground:
              "rgba(7, 13, 22, 0.9)",

            footerBorder:
              "rgba(255,255,255,0.08)",

            footerMuted:
              "rgba(195,204,225,0.62)",
          }
        : {
            pageBackground:
              "radial-gradient(circle at 12% 18%, rgba(122, 117, 255, 0.2) 0%, transparent 42%), radial-gradient(circle at 88% 82%, rgba(216, 121, 255, 0.16) 0%, transparent 48%), linear-gradient(150deg, #f6f8ff 0%, #edf2ff 45%, #f8fbff 100%)",

            text: "#20293a",
            title: "#101b31",
            subtitle: "#3f4f70",

            secondaryButtonBorder:
              "rgba(19, 32, 55, 0.15)",

            secondaryButtonBackground:
              "rgba(255, 255, 255, 0.9)",

            secondaryButtonText: "#1d2b47",

            ringBorder:
              "16px solid rgba(117, 141, 204, 0.2)",

            ringShadow:
              "inset 0 0 34px rgba(137, 159, 228, 0.25), 0 0 70px rgba(164, 183, 241, 0.2), 0 0 120px rgba(158, 107, 215, 0.18)",

            visualBorder:
              "1px solid rgba(17, 27, 45, 0.1)",

            visualBackground:
              "rgba(255, 255, 255, 0.78)",

            visualShadow:
              "0 20px 42px rgba(34, 57, 95, 0.18)",

            ambientLeft:
              "rgba(123, 106, 255, 0.2)",

            ambientRight:
              "rgba(183, 97, 234, 0.16)",

            footerBackground:
              "rgba(248, 250, 255, 0.95)",

            footerBorder:
              "rgba(18,30,52,0.10)",

            footerMuted:
              "#6b7487",
          },
    [isDark]
  );

  const styles = {
    page: {
      minHeight: "100vh",
      width: "100%",
      background: colors.pageBackground,
      color: colors.text,
      fontFamily:
        "'Plus Jakarta Sans', 'Manrope', sans-serif",
      position: "relative",
      overflowX: "clip",
      transition:
        "background 240ms ease, color 240ms ease",
    },

    heroShell: {
      maxWidth: 1200,
      margin: "0 auto",
      padding: "26px 22px 42px",
      position: "relative",
      zIndex: 2,
      boxSizing: "border-box",
    },

    hero: {
      display: "grid",
      gridTemplateColumns: "1.1fr 1fr",
      gap: 34,
      alignItems: "center",
      minHeight: "calc(100vh - 118px)",
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
      background:
        "linear-gradient(135deg, #3626ce 0%, #5f0b7e 100%)",
      color: "#ffffff",
      fontWeight: 700,
      cursor: "pointer",
      boxShadow:
        "0 14px 28px rgba(31, 22, 81, 0.45)",
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

    ambientLeft: {
      background: colors.ambientLeft,
    },

    ambientRight: {
      background: colors.ambientRight,
    },

    footer: {
      width: "100%",
      padding: "20px 6%",
      boxSizing: "border-box",
      borderTop: `1px solid ${colors.footerBorder}`,
      background: colors.footerBackground,
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
    },

    footerInner: {
      maxWidth: 1200,
      margin: "0 auto",
    },

    footerCopyright: {
      margin: 0,
      fontSize: "0.82rem",
      color: colors.footerMuted,
    },
  };

  return (
    <div
      style={styles.page}
      className={`landing-page landing-page-${theme}`}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Manrope:wght@400;500;600;700&display=swap');

        html {
          scroll-behavior: smooth;
        }

        .landing-section {
          width: 100%;
          scroll-margin-top: 76px;
          position: relative;
        }

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
          top: 420px;
        }

        .landing-cta:hover {
          transform: translateY(-2px);
          filter: brightness(1.06);
        }

        .landing-ghost:hover {
          transform: translateY(-2px);
          border-color: rgba(103, 121, 165, 0.55);
        }

        .back-to-top-btn:hover {
          transform: translateY(-3px);
          filter: brightness(1.08);
        }

        @media (max-width: 980px) {
          .landing-hero {
            grid-template-columns: 1fr !important;
            padding-top: 30px;
          }

          .landing-visual {
            min-height: 360px !important;
          }
        }

        @media (max-width: 640px) {
          .back-to-top-btn {
            right: 16px !important;
            bottom: 18px !important;
            width: 46px !important;
            height: 46px !important;
          }
        }
      `}</style>

      <div
        className="landing-ambient landing-ambient-left"
        style={styles.ambientLeft}
      />

      <div
        className="landing-ambient landing-ambient-right"
        style={styles.ambientRight}
      />

      <main>
        {/* HOME */}
        <section
          id="home"
          className="landing-section"
        >
          <div style={styles.heroShell}>
            <div
              style={styles.hero}
              className="landing-hero"
            >
              <div>
                <h1 style={styles.title}>
                  Experience the Future of Couture
                </h1>

                <p style={styles.subtitle}>
                  Step into your digital wardrobe.
                  Generate your personalized 3D avatar
                  and try on garments with precision
                  fit analysis.
                </p>

                <div style={styles.actionRow}>
                  <button
                    type="button"
                    style={styles.primaryButton}
                    className="landing-cta"
                    onClick={() =>
                      navigate("/login?mode=signup")
                    }
                  >
                    Get Started
                  </button>

                  <button
                    type="button"
                    style={styles.secondaryButton}
                    className="landing-ghost"
                    onClick={() =>
                      scrollToSection("features")
                    }
                  >
                    Explore Features
                  </button>
                </div>
              </div>

              <div
                style={styles.visualWrap}
                className="landing-visual"
              >
                <div style={styles.glowRing} />

                <div style={styles.visualCard}>
                  <img
                    src={heroImage}
                    alt="Virtual fitting room preview"
                    style={styles.visualImage}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section
          id="features"
          className="landing-section"
        >
          <Features />
        </section>

        {/* HOW IT WORKS */}
        <section
          id="how-it-works"
          className="landing-section"
        >
          <HowItWorks />
        </section>

        {/* FAQ */}
        <section
          id="faq"
          className="landing-section"
        >
          <FAQ />
        </section>

        {/* CONTACT */}
        <section
          id="contact"
          className="landing-section"
        >
          <ContactUs />
        </section>

        {/* MINIMAL FOOTER */}
        <footer style={styles.footer}>
          <div style={styles.footerInner}>
            <p style={styles.footerCopyright}>
              © {new Date().getFullYear()} VirtuFit 3D.
              All rights reserved.
            </p>
          </div>
        </footer>
      </main>

      {/* BACK TO TOP */}
      {showBackToTop && (
        <button
          type="button"
          aria-label="Back to top"
          title="Back to top"
          className="back-to-top-btn"
          onClick={() => scrollToSection("home")}
          style={{
            position: "fixed",
            right: 24,
            bottom: 24,
            width: 50,
            height: 50,
            borderRadius: "50%",

            border: isDark
              ? "1px solid rgba(255,255,255,0.16)"
              : "1px solid rgba(18,30,52,0.12)",

            background: isDark
              ? "rgba(18, 27, 42, 0.94)"
              : "rgba(255,255,255,0.94)",

            color: isDark
              ? "#ffffff"
              : "#152033",

            boxShadow: isDark
              ? "0 12px 30px rgba(0,0,0,0.32)"
              : "0 12px 30px rgba(31,47,86,0.18)",

            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            cursor: "pointer",

            fontSize: "1.4rem",
            fontWeight: 700,

            zIndex: 200,

            transition:
              "transform 180ms ease, filter 180ms ease",
          }}
        >
          ↑
        </button>
      )}
    </div>
  );
}

export default LandingPage;