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
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #13245f 0%, #020b2b 100%)",
      fontFamily: "Segoe UI, sans-serif",
      padding: "110px 20px 20px",
      position: "relative",
    },
    card: {
      width: "100%",
      maxWidth: "470px",
      background: "#071a52",
      borderRadius: "24px",
      padding: "46px 38px 38px",
      boxShadow: "0 18px 45px rgba(0,0,0,0.45)",
    },
      appName: {
        textAlign: "center",
        color: "#7fd4ff",
        fontSize: "2rem",
        fontWeight: 800,
        letterSpacing: "0.05em",
        textShadow: "0 0 14px rgba(67, 193, 255, 0.65)",
        margin: "0 0 22px 0",
      },
        topHeader: {
          position: "absolute",
          top: "18px",
          left: "50%",
          transform: "translateX(-50%)",
          color: "#7fd4ff",
          fontSize: "1.9rem",
          fontWeight: 800,
          letterSpacing: "0.05em",
          textShadow: "0 0 14px rgba(67, 193, 255, 0.65)",
          zIndex: 10,
          whiteSpace: "nowrap",
        },
    subtitle: {
     color: "#9fb3c8",
     fontSize: "1.2rem",
     marginBottom: "25px",
     textAlign: "left",
       },
    title: {
      textAlign: "left",
      color: "#ffffff",
      fontSize: "2.2rem",
      fontWeight: "500",
      margin: "0 0 10px 0",
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
    forgotWrap: {
      textAlign: "right",
      marginBottom: "22px",
    },
    forgot: {
      color: "#bfcaff",
      fontSize: "0.95rem",
    },
    forgotButton: {
      color: "#bfcaff",
      fontSize: "0.95rem",
      background: "transparent",
      border: "none",
      padding: 0,
      cursor: "pointer",
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
      marginBottom: "28px",
    },
    buttonDisabled: {
      opacity: 0.65,
      cursor: "not-allowed",
    },
    dividerRow: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginBottom: "22px",
    },
    dividerLine: {
      flex: 1,
      height: "1px",
      background: "rgba(255,255,255,0.15)",
    },
    dividerText: {
      color: "#dbe4ff",
      fontSize: "0.78rem",
      letterSpacing: "0.04em",
      whiteSpace: "nowrap",
    },
    googleWrap: {
      display: "flex",
      justifyContent: "center",
      marginBottom: "28px",
    },
    googleBtn: {
      width: "100%",
      padding: "14px",
      borderRadius: "14px",
      border: "1px solid rgba(255,255,255,0.2)",
      background: "#0a0a0a",
      color: "#ffffff",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
      fontSize: "1rem",
    },
    googleBtnDisabled: {
      opacity: 0.6,
      cursor: "not-allowed",
    },
    footer: {
      textAlign: "center",
      color: "#d9e2ff",
      fontSize: "0.95rem",
    },
    signUp: {
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
      <h1 style={styles.topHeader}>VirtuFit3D Studio</h1>
      <div style={styles.card}>
        {view === "signup" ? (
          <>
            <h1 style={styles.title}>Create Your Account</h1>
            <p style={styles.subtitle}>
              Join the future of 3D virtual try-on
            </p>
          </>
        ) : view === "login" ? (
          <>
            <h1 style={styles.title}>Login to VirtuFit3D</h1>
            <p style={styles.subtitle}>
              Experience the future of 3D virtual try-on
            </p>
          </>
        ) : (
          <h1 style={styles.title}>Forgot Password</h1>
        )}

        {view === "signup" && (
          <>
            <label style={styles.label}>FULL NAME</label>
            <input
              type="text"
              style={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your full name"
              autoComplete="username"
            />
          </>
        )}

        <label style={styles.label}>EMAIL</label>
        <input
          type="email"
          style={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email"
          autoComplete="email"
          inputMode="email"
        />

        {view !== "forgot" && (
          <>
            <label style={styles.label}>PASSWORD</label>
            <div style={styles.passwordWrap}>
              <input
                type={showPassword ? "text" : "password"}
                style={{ ...styles.input, ...styles.passwordInput }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete={view === "signup" ? "new-password" : "current-password"}
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
          </>
        )}

        {view === "signup" && (
          <>
            <label style={styles.label}>CONFIRM PASSWORD</label>
            <div style={styles.passwordWrap}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                style={{ ...styles.input, ...styles.passwordInput }}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                autoComplete="new-password"
              />
              <button
                type="button"
                style={styles.passwordToggle}
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
          </>
        )}

        {view === "login" && (
          <div style={styles.forgotWrap}>
            <button
              type="button"
              style={styles.forgotButton}
              onClick={switchToForgot}
            >
              Forgot password?
            </button>
          </div>
        )}

        <button
          type="button"
          style={{
            ...styles.button,
            ...(isSubmitting ? styles.buttonDisabled : {}),
          }}
          disabled={isSubmitting}
          onClick={
            view === "login"
              ? handleLogin
              : view === "signup"
                ? handleRegister
                : handleForgotPassword
          }
        >
          {isSubmitting
            ? "PLEASE WAIT..."
            : view === "login"
              ? "LOGIN"
              : view === "signup"
                ? "SIGN UP"
                : "SEND RESET LINK"}
        </button>

        {view !== "forgot" && (
          <>
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
                disabled={!isGoogleConfigured || isGoogleLoading || isSubmitting}
                onClick={handleGoogleContinue}
              >
                <img
                  src='https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg'
                  alt="google"
                  style={{ width: "18px", height: "18px" }}
                />
                {isGoogleLoading ? "Please wait..." : "Google"}
              </button>
            </div>

            <p style={styles.footer}>
              {view === "login"
                ? "Don't have an account? "
                : "Already have an account? "}
              <button
                type="button"
                style={styles.signUp}
                onClick={view === "login" ? switchToSignup : switchToLogin}
              >
                {view === "login" ? "Sign Up" : "Log In"}
              </button>
            </p>
          </>
        )}

        {view === "forgot" && (
          <p style={styles.footer}>
            <button
              type="button"
              style={styles.signUp}
              onClick={switchToLogin}
            >
              Back to Log In
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

export default Login;
