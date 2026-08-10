import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API_URL from "./config";
import "./Dashboard.css";

function Icon({ name, size = 20 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };

  const icons = {
    dashboard: (
      <svg {...common}>
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </svg>
    ),
    avatar: (
      <svg {...common}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4.5 21c.7-4.2 3.2-6.4 7.5-6.4s6.8 2.2 7.5 6.4" />
      </svg>
    ),
    catalog: (
      <svg {...common}>
        <path d="M9 5.5 12 3l3 2.5" />
        <path d="M12 3v4.2" />
        <path d="M5 10.5 12 7l7 3.5-7 3.5-7-3.5Z" />
        <path d="M5 10.5V17l7 4 7-4v-6.5" />
      </svg>
    ),
    history: (
      <svg {...common}>
        <path d="M3 12a9 9 0 1 0 3-6.7" />
        <path d="M3 4v5h5" />
        <path d="M12 7v5l3 2" />
      </svg>
    ),
    bell: (
      <svg {...common}>
        <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </svg>
    ),
    profile: (
      <svg {...common}>
        <circle cx="12" cy="8" r="3.4" />
        <path d="M5.5 20c.8-3.6 3-5.4 6.5-5.4s5.7 1.8 6.5 5.4" />
      </svg>
    ),
    settings: (
      <svg {...common}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.8 1.8 0 0 0 .4 2l.1.1-2.8 2.8-.1-.1a1.8 1.8 0 0 0-2-.4 1.8 1.8 0 0 0-1.1 1.6V21H10v-.1A1.8 1.8 0 0 0 8.9 19a1.8 1.8 0 0 0-2 .4l-.1.1L4 16.7l.1-.1a1.8 1.8 0 0 0 .4-2A1.8 1.8 0 0 0 3 13.5H3v-4h.1A1.8 1.8 0 0 0 4.7 8a1.8 1.8 0 0 0-.4-2l-.1-.1L7 3.1l.1.1a1.8 1.8 0 0 0 2 .4A1.8 1.8 0 0 0 10.2 2H14v.1a1.8 1.8 0 0 0 1.1 1.6 1.8 1.8 0 0 0 2-.4l.1-.1L20 6l-.1.1a1.8 1.8 0 0 0-.4 2A1.8 1.8 0 0 0 21 9.5h.1v4H21a1.8 1.8 0 0 0-1.6 1.5Z" />
      </svg>
    ),
    logout: (
      <svg {...common}>
        <path d="M10 17l5-5-5-5" />
        <path d="M15 12H3" />
        <path d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5" />
      </svg>
    ),
    camera: (
      <svg {...common}>
        <path d="M3 8.5A2.5 2.5 0 0 1 5.5 6H8l1.3-1.6c.4-.5.9-.7 1.6-.7h2.2c.7 0 1.2.2 1.6.7L16 6h2.5A2.5 2.5 0 0 1 21 8.5v9a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5v-9Z" />
        <circle cx="12" cy="13" r="3.5" />
      </svg>
    ),
    help: (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.8 9a2.3 2.3 0 1 1 3.4 2c-.8.5-1.2.9-1.2 1.9" />
        <path d="M12 17h.01" />
      </svg>
    ),
    sun: (
      <svg {...common}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    ),
    arrow: (
      <svg {...common}>
        <path d="M5 12h14" />
        <path d="m14 7 5 5-5 5" />
      </svg>
    ),
    shield: (
      <svg {...common}>
        <path d="M12 3 5 6v5c0 4.6 2.8 8 7 10 4.2-2 7-5.4 7-10V6l-7-3Z" />
        <path d="m9.5 12 1.7 1.7 3.6-4" />
      </svg>
    ),
  };

  return icons[name] || null;
}

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [sideImage, setSideImage] = useState(null);
  const [height, setHeight] = useState("");
  const [gender, setGender] = useState("");
  const [loading, setLoading] = useState(false);

  const [frontPreview, setFrontPreview] = useState("");
  const [backPreview, setBackPreview] = useState("");
  const [sidePreview, setSidePreview] = useState("");

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const frontInputRef = useRef(null);
  const backInputRef = useRef(null);
  const sideInputRef = useRef(null);

  const username = localStorage.getItem("username");
  const email = localStorage.getItem("userEmail");

  const regenQuery = new URLSearchParams(location.search).get("regen");
  const regenRequested =
    regenQuery === "true" || (location.state && location.state.regen === true);

  const hasGeneratedAvatar =
    !regenRequested &&
    (Boolean(localStorage.getItem("avatar_file")) ||
      Boolean(localStorage.getItem("avatarUrl")) ||
      Boolean(localStorage.getItem("generatedAvatar")));

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    return () => {
      if (frontPreview) URL.revokeObjectURL(frontPreview);
      if (backPreview) URL.revokeObjectURL(backPreview);
      if (sidePreview) URL.revokeObjectURL(sidePreview);
    };
  }, [frontPreview, backPreview, sidePreview]);

  useEffect(() => {
    if (!success) return undefined;
    const timer = setTimeout(() => setSuccess(""), 4000);
    return () => clearTimeout(timer);
  }, [success]);

  useEffect(() => {
    if (!error) return undefined;
    const timer = setTimeout(() => setError(""), 4000);
    return () => clearTimeout(timer);
  }, [error]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  const handleRegenerate = () => {
    try {
      localStorage.removeItem("avatar_file");
      localStorage.removeItem("avatarUrl");
      localStorage.removeItem("generatedAvatar");
    } catch (e) {
      console.warn("Error clearing avatar data:", e);
    }

    navigate("/dashboard?regen=true", { replace: true });
  };

  const handleTryOn = () => {
    navigate("/try-on");
  };

  const updateImageState = (position, file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }

    const nextPreview = URL.createObjectURL(file);

    if (position === "front") {
      if (frontPreview) URL.revokeObjectURL(frontPreview);
      setFrontImage(file);
      setFrontPreview(nextPreview);
      return;
    }

    if (position === "back") {
      if (backPreview) URL.revokeObjectURL(backPreview);
      setBackImage(file);
      setBackPreview(nextPreview);
      return;
    }

    if (sidePreview) URL.revokeObjectURL(sidePreview);
    setSideImage(file);
    setSidePreview(nextPreview);
  };

  const handleGenerateAvatar = async () => {
    if (!frontImage || !backImage || !sideImage) {
      setError("Please upload all images");
      return;
    }

    if (!height || height < 100 || height > 230) {
      setError("Please enter a valid height (100–230 cm)");
      return;
    }

    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const formData = new FormData();

      formData.append("frontImage", frontImage);
      formData.append("backImage", backImage);
      formData.append("sideImage", sideImage);
      formData.append("height", height);
      formData.append("gender", gender);

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/generate-avatar`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: token ? "Bearer " + token : undefined,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || "Avatar generated successfully");

        const avatarUrl =
          data?.avatarUrl ||
          data?.avatar?.avatarUrl ||
          data?.avatar?.avatar_file ||
          data?.avatar_file ||
          "";

        if (avatarUrl) {
          localStorage.setItem("avatarUrl", avatarUrl);
          localStorage.setItem("avatar_file", avatarUrl);
          localStorage.setItem("generatedAvatar", avatarUrl);
        }

        navigate("/avatar-viewer", {
          replace: true,
          state: {
            avatarUrl,
            avatar: data.avatar,
            avatar_file: avatarUrl,
            avatarFile: avatarUrl,
          },
        });
      } else {
        setError(data.message || "Avatar generation failed");
      }
    } catch (fetchError) {
      console.error(fetchError);
      setError("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const initials = (() => {
    const value = username || email || "AI";
    const parts = value
      .replace(/@.*/, "")
      .split(/[._\-\s]+/)
      .filter(Boolean);

    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }

    return value.slice(0, 2).toUpperCase();
  })();

  const renderUploadCard = ({
    label,
    description,
    position,
    preview,
    inputRef,
    tone,
  }) => (
    <button
      type="button"
      className={`vf-upload-card vf-upload-${tone} ${preview ? "has-image" : ""}`}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="vf-hidden-input"
        onChange={(event) =>
          updateImageState(position, event.target.files?.[0])
        }
      />

      {preview ? (
        <>
          <img
            src={preview}
            alt={`${label} preview`}
            className="vf-upload-preview"
          />
          <div className="vf-upload-preview-overlay">
            <span className="vf-replace-icon">
              <Icon name="camera" size={22} />
            </span>
            <strong>{label}</strong>
            <small>Click to replace image</small>
          </div>
        </>
      ) : (
        <>
          <div className="vf-upload-orbit">
            <div className="vf-upload-camera">
              <Icon name="camera" size={30} />
            </div>
          </div>

          <div className="vf-upload-copy">
            <h3>{label}</h3>
            <p>{description}</p>
          </div>

          <span className="vf-wave vf-wave-one" />
          <span className="vf-wave vf-wave-two" />
        </>
      )}
    </button>
  );

  return (
    <div className="vf-dashboard">
      <aside className="vf-sidebar">
        <div>
          <div className="vf-brand">
            <div className="vf-logo-mark" aria-hidden="true">
              <span />
              <span />
            </div>

            <div>
              <h1>VirtuFit 3D</h1>
              <p>3D VIRTUAL TRY-ON</p>
            </div>
          </div>

          <div className="vf-menu-label">MAIN MENU</div>

          <nav className="vf-nav">
            <button
              type="button"
              className="vf-nav-button active"
              onClick={() => navigate("/dashboard")}
            >
              <Icon name="dashboard" />
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              className="vf-nav-button"
              onClick={() =>
                navigate("/avatar-viewer", {
                  state: { avatarUrl: localStorage.getItem("avatarUrl") },
                })
              }
            >
              <Icon name="avatar" />
              <span>View Avatar</span>
            </button>

            <button
              type="button"
              className="vf-nav-button"
              onClick={() => navigate("/catalog")}
            >
              <Icon name="catalog" />
              <span>Garment Catalog</span>
            </button>

            <button
              type="button"
              className="vf-nav-button"
              onClick={() => navigate("/history")}
            >
                          <Icon name="history" />
              <span>View History</span>
            </button>

            <button
              type="button"
              className="vf-nav-button"
              onClick={() => navigate("/dashboard")}
            >
              <Icon name="bell" />
              <span>Notifications</span>
              <span className="vf-notification-badge">2</span>
            </button>
          </nav>

          <div className="vf-menu-label vf-account-label">ACCOUNT</div>

          <nav className="vf-nav">
            <button
              type="button"
              className="vf-nav-button"
              onClick={() => navigate("/dashboard")}
            >
              <Icon name="profile" />
              <span>Profile</span>
            </button>

            <button
              type="button"
              className="vf-nav-button"
              onClick={() => navigate("/dashboard")}
            >
              <Icon name="settings" />
              <span>Settings</span>
            </button>

            <button
              type="button"
              className="vf-nav-button"
              onClick={handleLogout}
            >
              <Icon name="logout" />
              <span>Logout</span>
            </button>
          </nav>
        </div>

        <div className="vf-profile-card">
          <div className="vf-profile-avatar">
            {initials}
            <span />
          </div>

          <div className="vf-profile-info">
            <strong>{username || email || "VirtuFit User"}</strong>
            <small>{hasGeneratedAvatar ? "EXISTING USER" : "NEW ARTISAN"}</small>
          </div>
        </div>
      </aside>

      <main className="vf-main">
        {!hasGeneratedAvatar ? (
          <section className="vf-create-shell">
            <div className="vf-top-actions">
              <a
                href="#photo-upload-guidelines"
                className="vf-round-action"
                aria-label="Help"
              >
                <Icon name="help" size={21} />
              </a>

              <span className="vf-action-divider" />

              <button
                type="button"
                className="vf-round-action"
                aria-label="Theme"
              >
                <Icon name="sun" size={21} />
              </button>

              <div className="vf-header-avatar">{initials}</div>
            </div>

            <div className="vf-create-hero">
              <div className="vf-create-copy">
                <div className="vf-welcome-chip">WELCOME BACK</div>

                <h2>
                  Create Your <span>Avatar</span>
                </h2>

                <p>
                  Upload front, side, and back images with your height to
                  build your 3D fitting profile.
                </p>

                <div className="vf-guideline-inline">
                  <span>Need help before uploading?</span>
                  <a href="#photo-upload-guidelines">
                    Photo Upload Guidelines
                    <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </div>

              <div className="vf-hologram" aria-hidden="true">
                <span className="vf-orbit vf-orbit-one" />
                <span className="vf-orbit vf-orbit-two" />
                <span className="vf-orbit-dot vf-dot-one" />
                <span className="vf-orbit-dot vf-dot-two" />

                <img
                 src="images/dashboard_avatar.png"
                 alt=""
                className="vf-hologram-avatar"
               />
              </div>
            </div>

            {(success || error) && (
              <div
                className={`vf-message ${success ? "success" : "error"}`}
              >
                {success ? `✓ ${success}` : `✕ ${error}`}
              </div>
            )}

            <div className="vf-upload-grid">
              {renderUploadCard({
                label: "Front View",
                description: "Upload a clear front view image",
                position: "front",
                preview: frontPreview,
                inputRef: frontInputRef,
                tone: "purple",
              })}

              {renderUploadCard({
                label: "Side Profile",
                description: "Upload a clear side profile image",
                position: "side",
                preview: sidePreview,
                inputRef: sideInputRef,
                tone: "blue",
              })}

              {renderUploadCard({
                label: "Back View",
                description: "Upload a clear back view image",
                position: "back",
                preview: backPreview,
                inputRef: backInputRef,
                tone: "pink",
              })}
            </div>

            <div className="vf-form-panel">
              <div className="vf-form-grid">
                <div className="vf-field">
                  <label htmlFor="height">MEASUREMENT: HEIGHT (CM)</label>

                  <div className="vf-input-wrap">
                    <input
                      id="height"
                      type="number"
                      value={height}
                      onChange={(event) => setHeight(event.target.value)}
                      min="100"
                      max="230"
                      placeholder="e.g. 175"
                    />
                    <span className="vf-input-icon">⌁</span>
                  </div>
                </div>

                <div className="vf-field">
                  <label htmlFor="gender">GENDER</label>

                  <div className="vf-select-wrap">
                    <select
                      id="gender"
                      value={gender}
                      onChange={(event) => setGender(event.target.value)}
                    >
                      <option value="" disabled>
                        Select gender
                      </option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>

                    <span>⌄</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="vf-generate-button"
                  onClick={handleGenerateAvatar}
                  disabled={loading}
                >
                  <span>
                    {loading ? "Processing..." : "Generate Avatar"}
                  </span>
                  {!loading && <Icon name="arrow" size={24} />}
                </button>
              </div>

              <div className="vf-privacy-line">
                <Icon name="shield" size={18} />
                <p>
                  By clicking generate, you agree to our{" "}
                  <span>Terms of Service</span> and{" "}
                  <span>Privacy Policy</span> regarding biometric data
                  processing.
                </p>
              </div>
            </div>

            <div className="vf-tips-panel">
              <article className="vf-tip">
                <div className="vf-tip-badge purple">L</div>
                <div>
                  <h3>Lighting Matters</h3>
                  <p>
                    Use bright, even light and keep your full body visible
                    for better scanning quality.
                  </p>
                </div>
              </article>

              <span className="vf-tip-divider" />

              <article className="vf-tip">
                <div className="vf-tip-badge pink">F</div>
                <div>
                  <h3>Form-Fitting Outfit</h3>
                  <p>
                    Wear closer-fit clothing so body edges are easier for
                    the AI to measure accurately.
                  </p>
                </div>
              </article>
            </div>
          </section>
        ) : (
          <section className="vf-existing-shell">
            <div className="vf-existing-header">
              <div>
                <div className="vf-welcome-chip">AVATAR READY</div>
                <h2>
                  Your Digital <span>Fitting Profile</span>
                </h2>
                <p>
                  Your avatar is ready for styling, fitting, and virtual
                  try-on.
                </p>
              </div>

              <div className="vf-engine-badge">
                <span />
                AI ENGINE ONLINE
              </div>
            </div>

            <div className="vf-existing-grid">
              <article className="vf-avatar-stage">
                <div className="vf-stage-grid" />
                <div className="vf-stage-glow" />

                <div className="vf-stage-top">
                  <span>AVATAR PREVIEW</span>
                </div>

                <div className="vf-stage-human" aria-hidden="true">
                  <span className="vf-stage-head" />
                  <span className="vf-stage-neck" />
                  <span className="vf-stage-body" />
                </div>

                <div className="vf-stage-copy">
                  <h3>Digital Fitting Canvas</h3>
                  <p>
                    Your personalized avatar is ready for the next fitting
                    experience.
                  </p>

                  <div className="vf-stage-actions">
                    <button
                      type="button"
                      className="vf-secondary-button"
                      onClick={handleRegenerate}
                    >
                      Regenerate
                    </button>

                    <button
                      type="button"
                      className="vf-primary-button"
                      onClick={handleTryOn}
                    >
                      Try-On Now
                      <Icon name="arrow" size={20} />
                    </button>
                  </div>
                </div>
              </article>

              <div className="vf-existing-side">
                <article className="vf-info-card">
                  <span className="vf-info-kicker">STATUS</span>
                  <h3>Avatar Generated</h3>
                  <p>
                    Your saved avatar is available from the View Avatar
                    section.
                  </p>
                </article>

                <article className="vf-info-card highlight">
                  <span className="vf-info-kicker">NEXT STEP</span>
                  <h3>Start Virtual Try-On</h3>
                  <p>
                    Choose garments from the catalog and continue to your
                    fitting experience.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/catalog")}
                  >
                    Browse Catalog
                    <Icon name="arrow" size={18} />
                  </button>
                </article>
              </div>
            </div>
          </section>
        )}
      </main>

      <div
        id="photo-upload-guidelines"
        className="vf-guidelines-modal"
        aria-hidden="true"
      >
        <div
          className="vf-guidelines-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="guidelines-title"
        >
          <div className="vf-guidelines-header">
            <div>
              <h3 id="guidelines-title">Photo Upload Guidelines</h3>
              <p>
                Follow these capture rules for better avatar generation
                accuracy.
              </p>
            </div>

            <a href="#" aria-label="Close guidelines">
              ×
            </a>
          </div>

          <div className="vf-guidelines-grid">
            <article>
              <strong>1. Body Position</strong>
              <p>
                Stand straight and upright. Keep arms slightly away from
                your body and avoid leaning or twisting.
              </p>
            </article>

            <article>
              <strong>2. Required Photos</strong>
              <p>
                Upload front, side, and back views with your entire body
                visible in every image.
              </p>
            </article>

            <article>
              <strong>3. Clothing</strong>
              <p>
                Wear fitted clothing. Avoid loose, layered, oversized
                clothing, coats, and long dresses.
              </p>
            </article>

            <article>
              <strong>4. Lighting</strong>
              <p>
                Use bright and even lighting. Avoid strong shadows and
                backlighting.
              </p>
            </article>

            <article>
              <strong>5. Background</strong>
              <p>
                Use a plain and uncluttered background. A clean solid wall
                works best.
              </p>
            </article>

            <article>
              <strong>6. Camera Setup</strong>
              <p>
                Keep the camera stable around waist or chest height and
                avoid blurry images.
              </p>
            </article>
          </div>

          <div className="vf-guidelines-warning">
            <strong>Avoid</strong>
            <p>
              Cropped body parts, blurry images, dark lighting, busy
              backgrounds, and loose clothing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;