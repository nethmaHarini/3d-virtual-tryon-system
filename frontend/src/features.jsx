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
      background:
        "radial-gradient(circle at 15% 20%, rgba(92, 60, 255, 0.2), transparent 40%), linear-gradient(145deg, #080e18, #111827)",
      color: "#ffffff",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    },

    content: {
      maxWidth: 1180,
      margin: "0 auto",
      padding: "70px 28px",
    },

    heading: {
      textAlign: "center",
      marginBottom: 14,
      fontSize: "clamp(2.2rem, 5vw, 4rem)",
      fontWeight: 800,
    },

    subtitle: {
      textAlign: "center",
      maxWidth: 720,
      margin: "0 auto 48px",
      color: "#bac4d8",
      lineHeight: 1.7,
    },

    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: 24,
    },

    card: {
      padding: "22px 22px 26px",
      borderRadius: 20,
      background: "rgba(18, 27, 42, 0.85)",
      border: "1px solid rgba(255,255,255,0.1)",
      boxShadow: "0 18px 40px rgba(0,0,0,0.25)",
      textAlign: "center",
    },

    imageContainer: {
      width: "100%",
      height: 180,
      marginBottom: 20,
      borderRadius: 14,
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },

    featureImage: {
      width: "100%",
      height: "100%",
      objectFit: "contain",
      display: "block",
    },

    cardTitle: {
      margin: "0 0 10px",
      fontSize: "1.15rem",
      fontWeight: 700,
    },

    cardText: {
      margin: 0,
      color: "#aeb9cf",
      lineHeight: 1.6,
      fontSize: "0.94rem",
    },
  };

  return (
    <div style={styles.page}>
      <style>{`
        @media (max-width: 980px) {
          .features-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        @media (max-width: 620px) {
          .features-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <main style={styles.content}>
        <h1 style={styles.heading}>Explore VirtuFit 3D Features</h1>

        <p style={styles.subtitle}>
          Discover the core features of the personalized 3D virtual try-on
          experience.
        </p>

        <div style={styles.grid} className="features-grid">
          {features.map((feature) => (
            <div key={feature.title} style={styles.card}>
              <div style={styles.imageContainer}>
                <img
                  src={feature.image}
                  alt={feature.title}
                  style={styles.featureImage}
                />
              </div>

              <h2 style={styles.cardTitle}>{feature.title}</h2>

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