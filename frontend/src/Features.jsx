import personalizedAvatarImg from "./assets/Personalized 3D avatar.png";
import garmentCatalogImg from "./assets/Garment Catalog.png";
import virtualTryOnImg from "./assets/Virtual Try-On.png";
import fitFeedbackImg from "./assets/Fit Feedback.png";

function Features() {
  const features = [
    {
      title: "Personalized 3D Avatar",
      description:
        "A personalized 3D avatar tailored to your body profile.",
      image: personalizedAvatarImg,
    },
    {
      title: "Garment Catalog",
      description:
        "Explore a curated collection of garments for virtual fitting.",
      image: garmentCatalogImg,
    },
    {
      title: "Virtual Try-On",
      description:
        "Experience garments virtually on your personalized 3D avatar.",
      image: virtualTryOnImg,
    },
    {
      title: "Fit Feedback",
      description:
        "Receive personalized insights into garment fit and comfort.",
      image: fitFeedbackImg,
    },
  ];

  const styles = {
    page: {
      minHeight: "100vh",
      width: "100%",
      background:
        "radial-gradient(circle at 15% 20%, rgba(92, 60, 255, 0.2), transparent 40%), linear-gradient(145deg, #080e18, #111827)",
      color: "#ffffff",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    },

    content: {
      maxWidth: "1180px",
      margin: "0 auto",
      padding: "52px 28px 70px",
      boxSizing: "border-box",
    },

    heading: {
      textAlign: "center",
      margin: "0 0 12px",
      fontSize: "clamp(2.3rem, 4vw, 3.4rem)",
      lineHeight: 1.08,
      fontWeight: 800,
      letterSpacing: "-0.02em",
      color: "#ffffff",
    },

    subtitle: {
      textAlign: "center",
      maxWidth: "720px",
      margin: "0 auto 30px",
      color: "#bac4d8",
      lineHeight: 1.65,
      fontSize: "0.98rem",
    },

    card: {
      padding: "18px 18px 24px",
      borderRadius: "20px",
      background: "rgba(18, 27, 42, 0.82)",
      border: "1px solid rgba(255,255,255,0.10)",
      boxShadow: "0 18px 40px rgba(0,0,0,0.22)",
      textAlign: "center",
      boxSizing: "border-box",
      height: "100%",
      minHeight: "100%",
      display: "flex",
      flexDirection: "column",
      transition:
        "transform 220ms ease, border-color 220ms ease, box-shadow 220ms ease",
    },

    cardTitle: {
      margin: "18px 0 8px",
      fontSize: "1.08rem",
      fontWeight: 700,
      color: "#ffffff",
    },

    cardText: {
      margin: "0 auto",
      color: "#aeb9cf",
      lineHeight: 1.55,
      fontSize: "0.92rem",
      maxWidth: "230px",
    },
  };

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');

        .features-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 24px;
          align-items: stretch;
        }

        .feature-card {
          height: 100%;
        }

        .feature-card:hover {
          transform: translateY(-4px);
          border-color: rgba(125, 85, 255, 0.28);
          box-shadow: 0 22px 44px rgba(0, 0, 0, 0.28);
        }

        .feature-image-container {
          width: 100%;
          aspect-ratio: 4 / 3.2;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-radius: 14px;
          background: #ffffff;
          flex-shrink: 0;
        }

        .feature-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }

        @media (max-width: 1024px) {
          .features-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .features-content {
            padding: 40px 18px 56px !important;
          }

          .features-grid {
            grid-template-columns: 1fr;
            gap: 18px;
          }

          .feature-card {
            max-width: 420px;
            width: 100%;
            margin: 0 auto;
          }

          .feature-image-container {
            aspect-ratio: 4 / 3;
          }
        }
      `}</style>

      <main
        style={styles.content}
        className="features-content"
      >
        <h1 style={styles.heading}>
          Explore VirtuFit 3D Features
        </h1>

        <p style={styles.subtitle}>
          Discover the core features of the personalized 3D virtual try-on
          experience.
        </p>

        <div className="features-grid">
          {features.map((feature) => (
            <div
              key={feature.title}
              style={styles.card}
              className="feature-card"
            >
              <div className="feature-image-container">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="feature-image"
                />
              </div>

              <h2 style={styles.cardTitle}>
                {feature.title}
              </h2>

              <p style={styles.cardText}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Features;