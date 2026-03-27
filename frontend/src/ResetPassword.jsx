import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API_URL from "./config";

function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    if (!token) {
      alert("Invalid reset link");
      return;
    }

    if (!password || !confirmPassword) {
      alert("Please enter and confirm your new password");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      alert("Password and confirm password do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${API_URL}/reset-password/${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("SUCCESS: " + data.message);
        navigate("/", { replace: true });
      } else {
        alert("ERROR: " + data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Connection failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles = {
    page: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #13245f 0%, #020b2b 100%)",
      fontFamily: "Segoe UI, sans-serif",
      padding: "20px",
    },
    card: {
      width: "100%",
      maxWidth: "470px",
      background: "#071a52",
      borderRadius: "24px",
      padding: "46px 38px 38px",
      boxShadow: "0 18px 45px rgba(0,0,0,0.45)",
    },
    title: {
      textAlign: "center",
      color: "#ffffff",
      fontSize: "2.2rem",
      fontWeight: "500",
      margin: "0 0 34px 0",
    },
    label: {
      display: "block",
      textAlign: "left",
      color: "#dbe4ff",
      fontSize: "0.78rem",
      letterSpacing: "0.08em",
      marginBottom: "10px",
      textTransform: "uppercase",
    },
    input: {
      width: "100%",
      boxSizing: "border-box",
      padding: "15px 16px",
      borderRadius: "14px",
      border: "1px solid rgba(255,255,255,0.22)",
      background: "#03133f",
      color: "#ffffff",
      outline: "none",
      marginBottom: "22px",
      fontSize: "1rem",
    },
    passwordWrap: {
      position: "relative",
      marginBottom: "22px",
    },
    passwordInput: {
      marginBottom: 0,
      paddingRight: "52px",
    },
    passwordToggle: {
      position: "absolute",
      right: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      border: "none",
      background: "transparent",
      color: "#bfcaff",
      cursor: "pointer",
      padding: "4px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    button: {
      width: "100%",
      padding: "15px",
      borderRadius: "14px",
      border: "none",
      background: "linear-gradient(90deg, #1b8fff, #35a7ff)",
      color: "#ffffff",
      fontWeight: "600",
      fontSize: "1rem",
      cursor: "pointer",
      marginTop: "2px",
      marginBottom: "20px",
    },
    buttonDisabled: {
      opacity: 0.65,
      cursor: "not-allowed",
    },
    footer: {
      textAlign: "center",
      color: "#d9e2ff",
      fontSize: "0.95rem",
    },
    linkButton: {
      color: "#2b9cff",
      fontWeight: "600",
      cursor: "pointer",
      background: "transparent",
      border: "none",
      padding: 0,
      fontSize: "0.95rem",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Reset Password</h1>

        <label style={styles.label}>NEW PASSWORD</label>
        <div style={styles.passwordWrap}>
          <input
            type={showPassword ? "text" : "password"}
            style={{ ...styles.input, ...styles.passwordInput }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            autoComplete="new-password"
          />
          <button
            type="button"
            style={styles.passwordToggle}
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            title={showPassword ? "Hide password" : "Show password"}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M2 12C3.8 8.5 7.3 6 12 6C16.7 6 20.2 8.5 22 12C20.2 15.5 16.7 18 12 18C7.3 18 3.8 15.5 2 12Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
              {!showPassword && (
                <line
                  x1="4"
                  y1="20"
                  x2="20"
                  y2="4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>

        <label style={styles.label}>CONFIRM PASSWORD</label>
        <input
          type={showPassword ? "text" : "password"}
          style={styles.input}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
          autoComplete="new-password"
        />

        <button
          type="button"
          style={{
            ...styles.button,
            ...(isSubmitting ? styles.buttonDisabled : {}),
          }}
          disabled={isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? "PLEASE WAIT..." : "RESET PASSWORD"}
        </button>

        <p style={styles.footer}>
          <button
            type="button"
            style={styles.linkButton}
            onClick={() => navigate("/")}
          >
            Back to Log In
          </button>
        </p>
      </div>
    </div>
  );
}

export default ResetPassword;
