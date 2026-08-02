import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import API_URL from "./config";
console.log("API_URL =", API_URL);

function Login() {
  const navigate = useNavigate();
  const [view, setView] = useState("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const isGoogleConfigured =
    typeof googleClientId === "string" &&
    googleClientId.trim().length > 0 &&
    !googleClientId.includes("YOUR_GOOGLE_CLIENT_ID");

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const googleSignIn = useGoogleLogin({
    flow: "auth-code",
    scope: "openid email profile",
    // redirect_uri: window.location.origin, // Let library handle this automatically
    prompt: "select_account",
    onSuccess: async (codeResponse) => {
      setIsGoogleLoading(true);
      try {
        const response = await fetch(
          `${API_URL}/auth/google`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ code: codeResponse.code }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          alert("ERROR: " + (data.message || "Google sign-in failed"));
          return;
        }

        if (data?.token) {
          localStorage.setItem("token", data.token);
          alert("SUCCESS: " + (data.message || "Google login successful"));
          navigate("/dashboard");
          return;
        }

        alert("ERROR: Missing auth token from server");
      } catch (error) {
        console.error(error);
        alert("Google sign-in failed");
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: (error) => {
      console.error("Google OAuth error:", error);
      setIsGoogleLoading(false);
      alert("Google sign-in failed");
    },
  });

  const handleGoogleContinue = () => {
    if (isGoogleLoading || isSubmitting) {
      return;
    }

    if (!isGoogleConfigured) {
      alert("Google sign-in is not configured. Add VITE_GOOGLE_CLIENT_ID in frontend/.env and restart frontend.");
      return;
    }

    setIsGoogleLoading(true);
    googleSignIn();
  };

  const switchToLogin = () => {
    setView("login");
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
  };

  const switchToSignup = () => {
    setView("signup");
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
  };

  const switchToForgot = () => {
    setView("forgot");
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
  };

  const handleLogin = async () => {
    if (isSubmitting) {
      return;
    }

    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    if (!isValidEmail(email)) {
      alert("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${API_URL}/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
  if (data?.token) {
    localStorage.setItem("token", data.token);
  }

  if (data?.user) {
    localStorage.setItem("username", data.user.username);
    localStorage.setItem("userEmail", data.user.email);
  }

  alert("SUCCESS: " + data.message);
  navigate("/dashboard");
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

  const handleRegister = async () => {
    if (isSubmitting) {
      return;
    }

    if (!username || !email || !password || !confirmPassword) {
      alert("Please enter username, email, password and confirm password");
      return;
    }

    if (username.trim().length < 3) {
      alert("Username must be at least 3 characters");
      return;
    }

    if (!isValidEmail(email)) {
      alert("Please enter a valid email address");
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
        `${API_URL}/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, email, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("SUCCESS: " + data.message);
        setView("login");
        setUsername("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setShowPassword(false);
      } else {
        alert("ERROR: " + data.message);
      }
    } catch (error) {
      console.error("Register fetch error:", error);
      alert("Registration failed: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (isSubmitting) return;

    if (!email) {
      alert("Please enter your email");
      return;
    }

    if (!isValidEmail(email)) {
      alert("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${API_URL}/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("SUCCESS: " + data.message);
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
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background:
        "radial-gradient(circle at 12% 18%, rgba(93, 61, 255, 0.22) 0%, transparent 42%), radial-gradient(circle at 88% 82%, rgba(153, 74, 255, 0.22) 0%, transparent 48%), linear-gradient(150deg, #070d16 0%, #0d141d 45%, #101926 100%)",
      fontFamily: "'Plus Jakarta Sans', 'Manrope', sans-serif",
      padding: "42px 20px 48px",
      position: "relative",
      overflow: "hidden",
    },
    card: {
      width: "100%",
      maxWidth: "560px",
      borderRadius: "30px",
      padding: "40px 36px",
      border: "1px solid rgba(170, 188, 214, 0.16)",
      background: "rgba(34, 42, 54, 0.52)",
      backdropFilter: "blur(24px)",
      boxShadow: "0 22px 60px rgba(0, 0, 0, 0.45)",
      position: "relative",
      zIndex: 2,
      minHeight: "min(78vh, 720px)",
      display: "flex",
      justifyContent: "center",
      alignItems: "stretch",
      boxSizing: "border-box",
    },
    cardFlow: {
      width: "100%",
      display: "flex",
      flexDirection: "column",
      gap: "28px",
    },
    headingStack: {
      display: "flex",
      flexDirection: "column",
      gap: "12px",
    },
    contentStack: {
      display: "flex",
      flexDirection: "column",
      gap: "20px",
    },
    passwordSection: {
      width: "100%",
      display: "flex",
      flexDirection: "column",
      gap: "10px",
    },
    actionGroup: {
      width: "100%",
      display: "flex",
      flexDirection: "column",
      gap: "22px",
    },
    socialStack: {
      width: "100%",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    },
    subtitle: {
      color: "#c3c6d0",
      fontSize: "0.98rem",
      margin: 0,
      textAlign: "center",
      lineHeight: 1.55,
      letterSpacing: "0.012em",
    },
    title: {
      textAlign: "center",
      color: "#ffffff",
      fontSize: "2.2rem",
      fontWeight: 800,
      fontFamily: "'Poppins', 'Plus Jakarta Sans', sans-serif",
      margin: "0",
      lineHeight: 1.08,
      letterSpacing: "-0.02em",
    },
    label: {
      display: "block",
      textAlign: "left",
      color: "#c3c6d0",
      fontSize: "0.8rem",
      letterSpacing: "0.03em",
      marginBottom: "9px",
      fontWeight: 600,
    },
    input: {
      width: "100%",
      boxSizing: "border-box",
      padding: "14px 16px",
      borderRadius: "16px",
      border: "1px solid rgba(141, 145, 153, 0.32)",
      background: "rgba(8, 15, 24, 0.9)",
      color: "#dce3f0",
      outline: "none",
      marginBottom: "0",
      fontSize: "1rem",
      transition: "all 260ms ease",
    },
    passwordWrap: {
      position: "relative",
      marginBottom: "0",
    },
    passwordInput: {
      marginBottom: 0,
      paddingRight: "54px",
    },
    passwordToggle: {
      position: "absolute",
      right: "10px",
      top: "50%",
      transform: "translateY(-50%)",
      border: "none",
      background: "transparent",
      color: "#a4c9fc",
      cursor: "pointer",
      padding: "8px",
      borderRadius: "10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 200ms ease",
    },
    forgotWrap: {
      width: "100%",
      display: "flex",
      justifyContent: "flex-end",
    },
    forgotButton: {
      color: "#a4c9fc",
      fontSize: "0.8rem",
      background: "transparent",
      border: "none",
      padding: 0,
      cursor: "pointer",
      fontWeight: 600,
      transition: "all 200ms ease",
    },
    button: {
      width: "100%",
      padding: "14px 18px",
      borderRadius: "999px",
      border: "none",
      background: "linear-gradient(135deg, #3626ce 0%, #5f0b7e 100%)",
      color: "#ffffff",
      fontWeight: 700,
      fontSize: "1rem",
      cursor: "pointer",
      marginTop: "0",
      marginBottom: "0",
      boxShadow: "0 0 0 rgba(164, 201, 252, 0), 0 18px 30px rgba(27, 21, 70, 0.45)",
      transition: "all 300ms ease",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "52px",
    },
    buttonDisabled: {
      opacity: 0.65,
      cursor: "not-allowed",
      transform: "none",
      boxShadow: "0 8px 18px rgba(15, 15, 30, 0.35)",
    },
    dividerRow: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      margin: 0,
    },
    dividerLine: {
      flex: 1,
      height: "1px",
      background: "rgba(66, 71, 79, 0.42)",
    },
    dividerText: {
      color: "#8d9199",
      fontSize: "0.7rem",
      letterSpacing: "0.14em",
      whiteSpace: "nowrap",
      textTransform: "uppercase",
    },
    googleWrap: {
      display: "flex",
      justifyContent: "center",
      marginBottom: "0",
    },
    googleBtn: {
      width: "100%",
      padding: "13px 16px",
      borderRadius: "999px",
      border: "1px solid rgba(66, 71, 79, 0.45)",
      background: "rgba(21, 28, 38, 0.92)",
      color: "#dce3f0",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
      fontSize: "0.95rem",
      fontWeight: 600,
      minHeight: "50px",
      transition: "all 280ms ease",
    },
    googleBtnDisabled: {
      opacity: 0.6,
      cursor: "not-allowed",
      transform: "none",
    },
    footer: {
      textAlign: "center",
      color: "#c3c6d0",
      fontSize: "0.93rem",
      margin: 0,
    },
    signUp: {
      color: "#a4c9fc",
      fontWeight: 700,
      cursor: "pointer",
      background: "transparent",
      border: "none",
      padding: 0,
      fontSize: "0.93rem",
      transition: "all 220ms ease",
    },
  };

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&display=swap');

        .login-card-surface {
          transition: transform 220ms ease, box-shadow 260ms ease, border-color 260ms ease, background 260ms ease;
        }
        .login-card-surface:hover {
          transform: translateY(-3px) scale(1.005);
          box-shadow: 0 0 28px rgba(164, 201, 252, 0.22), 0 20px 40px rgba(4, 10, 18, 0.42);
        }
        .login-field {
          display: flex;
          flex-direction: column;
          gap: 9px;
          width: 100%;
        }
        .login-input::placeholder {
          color: #8d9199;
        }
        .login-input:hover {
          border-color: rgba(164, 201, 252, 0.42);
          box-shadow: 0 8px 22px rgba(10, 18, 32, 0.35);
        }
        .login-input:focus {
          border-color: rgba(164, 201, 252, 0.76);
          box-shadow: 0 0 0 3px rgba(164, 201, 252, 0.18), 0 14px 28px rgba(6, 13, 24, 0.46);
          background: rgba(13, 20, 29, 0.96);
        }
        .password-toggle:hover {
          color: #f9d8ff;
          background: rgba(255, 255, 255, 0.06);
        }
        .forgot-link:hover {
          color: #ffffff;
        }
        .primary-btn:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.01);
          filter: saturate(1.08) brightness(1.05);
          box-shadow: 0 0 24px rgba(164, 201, 252, 0.22), 0 20px 35px rgba(31, 22, 81, 0.55);
        }
        .primary-btn:active:not(:disabled) {
          transform: scale(0.985);
        }
        .google-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          border-color: rgba(164, 201, 252, 0.5);
          background: rgba(30, 39, 53, 0.95);
        }
        .switch-link:hover {
          color: #ffffff;
          text-decoration: underline;
        }
        .btn-stack {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
        }
        .btn-spinner {
          width: 16px;
          height: 16px;
          border-radius: 999px;
          border: 2px solid rgba(255, 255, 255, 0.35);
          border-top-color: #ffffff;
          animation: spin 0.8s linear infinite;
        }
        .ambient-blob {
          position: absolute;
          border-radius: 999px;
          filter: blur(110px);
          pointer-events: none;
        }
        .ambient-blob-left {
          width: 42vw;
          height: 42vw;
          min-width: 260px;
          min-height: 260px;
          max-width: 580px;
          max-height: 580px;
          left: -18vw;
          top: -18vw;
          background: rgba(83, 61, 209, 0.26);
        }
        .ambient-blob-right {
          width: 44vw;
          height: 44vw;
          min-width: 280px;
          min-height: 280px;
          max-width: 620px;
          max-height: 620px;
          right: -18vw;
          bottom: -20vw;
          background: rgba(95, 11, 126, 0.22);
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        @media (max-width: 640px) {
          .login-card-surface {
            border-radius: 24px !important;
          }
          .login-card-body {
            gap: 24px !important;
          }
        }
      `}</style>

      <div className="ambient-blob ambient-blob-left" />
      <div className="ambient-blob ambient-blob-right" />

      <div style={styles.card} className="login-card-surface">
        <div style={styles.cardFlow} className="login-card-body">
        <div style={styles.headingStack}>
        {view === "signup" ? (
          <>
            <h1 style={styles.title}>Create Your Account</h1>
            <p style={styles.subtitle}>
              Join your couture identity and unlock personalized 3D virtual fitting.
            </p>
          </>
        ) : view === "login" ? (
          <>
            <h1 style={styles.title}>Welcome Back</h1>
            <p style={styles.subtitle}>
              Enter your credentials to access your digital wardrobe and couture engine.
            </p>
          </>
        ) : (
          <>
            <h1 style={styles.title}>Forgot Password</h1>
            <p style={styles.subtitle}>Enter your email to receive a secure reset link.</p>
          </>
        )}
        </div>

        <div style={styles.contentStack}>
        {view === "signup" && (
          <div className="login-field">
            <label style={styles.label}>FULL NAME</label>
            <input
              className="login-input"
              type="text"
              style={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your full name"
              autoComplete="username"
            />
          </div>
        )}

        <div className="login-field">
          <label style={styles.label}>EMAIL ADDRESS</label>
          <input
            className="login-input"
            type="email"
            style={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="couturier@atelier.com"
            autoComplete="email"
            inputMode="email"
          />
        </div>

        {view !== "forgot" && (
          <div style={styles.passwordSection}>
            <div className="login-field">
              <label style={styles.label}>PASSWORD</label>
              <div style={styles.passwordWrap}>
              <input
                className="login-input"
                type={showPassword ? "text" : "password"}
                style={{ ...styles.input, ...styles.passwordInput }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={view === "signup" ? "new-password" : "current-password"}
              />
              <button
                type="button"
                style={styles.passwordToggle}
                className="password-toggle"
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
            </div>
            {view === "login" && (
              <div style={styles.forgotWrap}>
                <button
                  type="button"
                  style={styles.forgotButton}
                  className="forgot-link"
                  onClick={switchToForgot}
                >
                  Forgot password?
                </button>
              </div>
            )}
          </div>
        )}

        {view === "signup" && (
          <div className="login-field">
            <label style={styles.label}>CONFIRM PASSWORD</label>
            <div style={styles.passwordWrap}>
              <input
                className="login-input"
                type={showConfirmPassword ? "text" : "password"}
                style={{ ...styles.input, ...styles.passwordInput }}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <button
                type="button"
                style={styles.passwordToggle}
                className="password-toggle"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                title={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
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
                  {!showConfirmPassword && (
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
          </div>
        )}

        <div style={styles.actionGroup}>
        <button
          type="button"
          style={{
            ...styles.button,
            ...(isSubmitting ? styles.buttonDisabled : {}),
          }}
          className="primary-btn"
          disabled={isSubmitting}
          onClick={
            view === "login"
              ? handleLogin
              : view === "signup"
                ? handleRegister
                : handleForgotPassword
          }
        >
          {isSubmitting ? (
            <span className="btn-stack">
              <span className="btn-spinner" aria-hidden="true"></span>
              PLEASE WAIT...
            </span>
          ) : view === "login" ? (
            "LOGIN"
          ) : view === "signup" ? (
            "SIGN UP"
          ) : (
            "SEND RESET LINK"
          )}
        </button>

        {view !== "forgot" && (
          <div style={styles.socialStack}>
            <div style={styles.dividerRow}>
              <div style={styles.dividerLine}></div>
              <div style={styles.dividerText}>OR CONTINUE WITH</div>
              <div style={styles.dividerLine}></div>
            </div>

            <div style={styles.googleWrap}>
              <button
                type="button"
                style={{
                  ...styles.googleBtn,
                  ...((isGoogleConfigured && !isGoogleLoading && !isSubmitting)
                    ? {}
                    : styles.googleBtnDisabled),
                }}
                className="google-btn"
                disabled={!isGoogleConfigured || isGoogleLoading || isSubmitting}
                onClick={handleGoogleContinue}
              >
                <img
                  src='https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg'
                  alt="google"
                  style={{ width: "18px", height: "18px" }}
                />
                {isGoogleLoading ? (
                  <span className="btn-stack">
                    <span className="btn-spinner" aria-hidden="true"></span>
                    Please wait...
                  </span>
                ) : (
                  "Sign in with Google"
                )}
              </button>
            </div>

            <p style={styles.footer}>
              {view === "login"
                ? "Don't have an account? "
                : "Already have an account? "}
              <button
                type="button"
                style={styles.signUp}
                className="switch-link"
                onClick={view === "login" ? switchToSignup : switchToLogin}
              >
                {view === "login" ? "Sign Up" : "Log In"}
              </button>
            </p>
          </div>
        )}

        {view === "forgot" && (
          <p style={styles.footer}>
            <button
              type="button"
              style={styles.signUp}
              className="switch-link"
              onClick={switchToLogin}
            >
              Back to Log In
            </button>
          </p>
        )}
        </div>
        </div>
        </div>
      </div>

    </div>
  );
}

export default Login;
