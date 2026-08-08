function Features() {
  const features = [
  {
    title: "Personalized 3D Avatar",
    description:
      "A personalized 3D representation designed for your virtual fitting experience.",
  },
  {
    title: "Garment Catalog",
    description:
      "Explore a collection of garments available for virtual try-on.",
  },
  {
    title: "Virtual Try-On",
    description:
      "Visualize selected garments on your personalized 3D avatar.",
  },
  {
    title: "Fit Feedback",
    description:
      "Get personalized insights about how well a garment fits your body.",
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
      padding: "80px 28px",
    },

    heading: {
      textAlign: "center",
      marginBottom: 16,
      fontSize: "clamp(2.2rem, 5vw, 4rem)",
      fontWeight: 800,
    },

    subtitle: {
      textAlign: "center",
      maxWidth: 720,
      margin: "0 auto 54px",
      color: "#bac4d8",
      lineHeight: 1.7,
    },

    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
      gap: 24,
    },

    card: {
      padding: 28,
      borderRadius: 22,
      background: "rgba(18, 27, 42, 0.75)",
      border: "1px solid rgba(255,255,255,0.1)",
      boxShadow: "0 18px 40px rgba(0,0,0,0.25)",
    },

    icon: {
      width: 48,
      height: 48,
      borderRadius: 14,
      display: "grid",
      placeItems: "center",
      marginBottom: 20,
      background: "linear-gradient(135deg, #4c2ee8, #7d1399)",
      fontSize: "1.2rem",
      fontWeight: 800,
    },

    cardTitle: {
      margin: "0 0 10px",
      fontSize: "1.2rem",
      fontWeight: 700,
    },

    cardText: {
      margin: 0,
      color: "#aeb9cf",
      lineHeight: 1.65,
    },
  };

  return (
    <div style={styles.page}>
      <main style={styles.content}>
        <h1 style={styles.heading}>Explore VirtuFit 3D Features</h1>

        <p style={styles.subtitle}>
          Discover the core features of the personalized 3D virtual try-on
          experience.
        </p>

        <div style={styles.grid}>
          {features.map((feature, index) => (
            <div key={feature.title} style={styles.card}>
              <div style={styles.icon}>{index + 1}</div>

              <h2 style={styles.cardTitle}>{feature.title}</h2>

              <p style={styles.cardText}>{feature.description}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Features;