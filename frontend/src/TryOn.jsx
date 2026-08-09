
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AvatarCanvas from "./components/AvatarCanvas";
import "./TryOn.css";
import { useAppTheme } from "./theme";

const fitData = [
  { region: 'Chest', status: 'Tight', color: '#ff4d4f' },
  { region: 'Waist', status: 'Perfect', color: '#52c41a' },
  { region: 'Hip', status: 'Loose', color: '#1890ff' },
];

export default function TryOn() {
  const location = useLocation();
  const { isDark } = useAppTheme();
  const { garment, selectedSize, avatarUrl } = location.state || {};
  const navStyles = {
    nav: {
      width: "100%",
      background: isDark ? "rgba(10, 24, 51, 0.96)" : "rgba(247, 249, 255, 0.96)",
      position: "sticky",
      top: 0,
      left: 0,
      zIndex: 1200,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 14px",
      height: "54px",
      boxShadow: "none",
      borderBottom: "none", // ✅ removed line
      boxSizing: "border-box",
    },

    appTitle: {
      fontSize: "2.5rem",
      fontWeight: 800,
      color: isDark ? "#7fd4ff" : "#3b63ff",
      letterSpacing: "0.04em",
      fontFamily: "Segoe UI, Roboto, Arial, sans-serif",
      textShadow: "0 0 10px rgba(67, 193, 255, 0.5)",
      userSelect: "none",
      background: "none",
      border: "none",
      outline: "none",
      cursor: "pointer",
      margin: 0,
      padding: 0,
    },

    logout: {
      color: isDark ? "#eaf6ff" : "#152033",
      background: isDark ? "rgba(6, 18, 52, 0.7)" : "rgba(255,255,255,0.9)",
      border: isDark ? "1px solid rgba(127, 212, 255, 0.6)" : "1px solid rgba(18, 30, 52, 0.08)",
      borderRadius: 12,
      padding: "8px 18px",
      fontWeight: 700,
      fontSize: "0.95rem",
      fontFamily: "Segoe UI, Roboto, Arial, sans-serif",
      cursor: "pointer",
      boxShadow: isDark ? "0 2px 8px rgba(62, 166, 255, 0.14)" : "0 2px 12px rgba(83, 96, 117, 0.12)",
      letterSpacing: "0.02em",
      transition: "background 0.2s, border 0.2s, box-shadow 0.2s",
    },
  };
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };
  const handleSave = async () => {
    const API_URL =
      import.meta.env.VITE_API_URL || "http://localhost:3000";

    await fetch(`${API_URL}/save-fit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: 1,
        garmentName: garment?.title || garment?.name || "Unknown Garment",
        size: selectedSize || "Not selected",
        chest: "Tight",
        waist: "Perfect",
        hip: "Loose",
        recommendation: "AI recommendation...",
        avatarUrl,
      }),
    });

    alert("Saved successfully");
  };
  return (
    <>
      <div style={navStyles.nav}>
        <button
          type="button"
          style={navStyles.appTitle}
          onClick={() => navigate("/dashboard")}
        >
          VirtuFit3D Studio
        </button>

        <button
          type="button"
          style={navStyles.logout}
          onClick={handleLogout}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(18, 40, 88, 0.95)";
            e.currentTarget.style.boxShadow = "0 2px 12px rgba(62, 166, 255, 0.22)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(6, 18, 52, 0.7)";
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(62, 166, 255, 0.14)";
          }}
        >
          Logout
        </button>
      </div>
      <div className="tryon-container">
        <div className="tryon-left">
          <div className="avatar-section">
            <h2 className="avatar-main-title">Your Digital Twin</h2>
            <p className="avatar-main-subtitle">
              Experience precision fit with your personalized high-fidelity
              <br />
              3D avatar.
            </p>

            <div className="avatar-card">
              <div className="avatar-placeholder" style={{ padding: 0, overflow: "hidden" }}>
               <AvatarCanvas
                 modelPath={avatarUrl ||"/models/final_avatar.obj"
                }
                 backgroundMode={localStorage.getItem("viewer-background") || "dark"
        }
                />
              </div>

              <div className="avatar-preview-bar">
                <div className="avatar-preview-texts">
                  <span className="avatar-preview-title">
                    {garment ? `${garment.title || garment.name} Preview` : "3D Human Avatar Preview"}
                  </span>
                  <span className="avatar-preview-subtitle">
                    {selectedSize
                      ? `Selected size: ${selectedSize}`
                      : "Real-time photorealistic simulation enabled"}
                  </span>
                </div>

                <button
                  type="button"
                  className="view-360-btn"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                >
                  View in 360
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="tryon-right">
          <div className="fit-panel">
            <h2 className="fit-title">Fit Analysis</h2>
            <p className="fit-subtitle">Simulation complete based on your digital twin measurements</p>
            <div className="fit-table">
              {fitData.map(({ region, status, color }) => (
                <div className="fit-row" key={region}>
                  <span className="fit-region">{region}</span>
                  <span className="fit-status" style={{ color }}>{status}</span>
                </div>
              ))}
            </div>
            <div className="fit-recommendation">
              <p>
                <strong>Recommendation:</strong> Based on the fit analysis, the selected size may be slightly tight in the chest region. A larger size or stretch-fit style may provide a more balanced overall fit.
              </p>
            </div>
            <button className="save-fit-btn" onClick={handleSave}>Save Fit Analysis</button>
          </div>
        </div>
      </div>
    </>
  );
}
