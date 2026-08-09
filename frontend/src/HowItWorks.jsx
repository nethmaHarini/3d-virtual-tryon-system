import { useOutletContext } from "react-router-dom";

function HowItWorks() {
  const { theme = "dark" } = useOutletContext() || {};
  const isDark = theme === "dark";

  const steps = [
    {
      number: "01",
      title: "Start With Your Body Profile",
      description:
        "Front, side and back body photos and your height are all you need to get started",
    },
    {
      number: "02",
      title: "Meet your 3D avatar",
      description:
        "Generate your personalized 3D avatar based on your body profile.",
    },
    {
      number: "03",
      title: "Choose Your Style",
      description:
        "Pick a garment that matches your style from the catalog.",
    },
    {
      number: "04",
      title: "Try It Virtually",
      description:
        "View the selected garment on your personalized avatar in an interactive 3D experience.",
    },
    {
      number: "05",
      title: "Know Your Fit",
      description:
        "Receive clear fit insights to understand how the selected garment fits your body.",
    },
  ];

  const colors = isDark
    ? {
        page:
          "radial-gradient(circle at 15% 20%, rgba(92, 60, 255, 0.20), transparent 40%), linear-gradient(145deg, #080e18, #111827)",
        title: "#ffffff",
        text: "#aeb9cf",
        card: "rgba(18, 27, 42, 0.82)",
        border: "rgba(255,255,255,0.10)",
        numberBg:
          "linear-gradient(135deg, #4c2ee8 0%, #7d1399 100%)",
        line: "rgba(126, 87, 255, 0.30)",
      }
    : {
        page:
          "radial-gradient(circle at 15% 20%, rgba(122, 117, 255, 0.16), transparent 40%), linear-gradient(145deg, #f6f8ff, #edf2ff)",
        title: "#101b31",
        text: "#4f6185",
        card: "rgba(255,255,255,0.88)",
        border: "rgba(17,27,45,0.10)",
        numberBg:
          "linear-gradient(135deg, #4c2ee8 0%, #7d1399 100%)",
        line: "rgba(92, 60, 255, 0.22)",
      };

  const styles = {
    page: {
      minHeight: "100vh",
      width: "100%",
      background: colors.page,
      color: colors.title,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    },

    content: {
      maxWidth: "1050px",
      margin: "0 auto",
      padding: "56px 28px 80px",
      boxSizing: "border-box",
    },

    heading: {
      textAlign: "center",
      margin: "0 0 12px",
      fontSize: "clamp(2.3rem, 4vw, 3.4rem)",
      fontWeight: 800,
      letterSpacing: "-0.02em",
    },

    subtitle: {
      textAlign: "center",
      maxWidth: "700px",
      margin: "0 auto 52px",
      color: colors.text,
      lineHeight: 1.7,
    },

    timeline: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      gap: "24px",
    },

    step: {
      display: "grid",
      gridTemplateColumns: "90px 1fr",
      gap: "22px",
      alignItems: "stretch",
      position: "relative",
    },

    numberWrap: {
      display: "flex",
      justifyContent: "center",
      position: "relative",
    },

    number: {
      width: "58px",
      height: "58px",
      borderRadius: "18px",
      display: "grid",
      placeItems: "center",
      background: colors.numberBg,
      color: "#ffffff",
      fontSize: "1rem",
      fontWeight: 800,
      boxShadow: "0 12px 28px rgba(76, 46, 232, 0.25)",
      zIndex: 2,
    },

    card: {
      padding: "24px 26px",
      borderRadius: "20px",
      background: colors.card,
      border: `1px solid ${colors.border}`,
      boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
    },

    stepTitle: {
      margin: "0 0 8px",
      fontSize: "1.18rem",
      fontWeight: 700,
      color: colors.title,
    },

    stepText: {
      margin: 0,
      color: colors.text,
      lineHeight: 1.65,
      fontSize: "0.95rem",
    },
  };

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');

        .how-step {
          transition:
            transform 220ms ease,
            border-color 220ms ease,
            box-shadow 220ms ease;
        }

        .how-step:hover {
          transform: translateY(-3px);
        }

        .timeline-line {
          position: absolute;
          left: 44px;
          top: 58px;
          bottom: 58px;
          width: 2px;
          background: ${colors.line};
          z-index: 0;
        }

        @media (max-width: 700px) {
          .how-content {
            padding: 40px 18px 56px !important;
          }

          .how-step-row {
            grid-template-columns: 64px 1fr !important;
            gap: 14px !important;
          }

          .timeline-line {
            left: 31px;
          }
        }
      `}</style>

      <main style={styles.content} className="how-content">
        <h1 style={styles.heading}>How VirtuFit 3D Works</h1>

        <p style={styles.subtitle}>
          From your body profile to personalized fit insights, VirtuFit 3D
          guides you through a simple virtual fitting experience.
        </p>

        <div style={styles.timeline}>
          <div className="timeline-line" />

          {steps.map((step) => (
            <div
              key={step.number}
              style={styles.step}
              className="how-step-row"
            >
              <div style={styles.numberWrap}>
                <div style={styles.number}>
                  {step.number}
                </div>
              </div>

              <div
                style={styles.card}
                className="how-step"
              >
                <h2 style={styles.stepTitle}>
                  {step.title}
                </h2>

                <p style={styles.stepText}>
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default HowItWorks;