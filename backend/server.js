const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const multer = require("multer");
const pool = require("./db");

require("dotenv").config();

const app = express();
const SECRET = process.env.JWT_SECRET || "your_secret_key";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

app.use(cors({ origin: "*" }));
app.use(express.json());

// Privacy-safe upload handling: keep files in memory only for temporary processing.
// Raw photos are not written to disk or permanently stored by this backend flow.
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB each
  },
});

app.get("/", (req, res) => {
  res.send("Backend is running successfully 🚀");
});

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isStrongPassword = (password) => {
  return typeof password === "string" && password.length >= 6;
};

const normalizeUsername = (value) => {
  const base = (value || "user")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 20);

  if (base.length >= 3) {
    return base;
  }

  return `${base}user`.slice(0, 20);
};

const createUniqueUsername = async (seed) => {
  const base = normalizeUsername(seed);
  let candidate = base;
  let attempts = 0;

  while (attempts < 20) {
    const existing = await pool.query("SELECT 1 FROM users WHERE username = $1", [candidate]);

    if (existing.rows.length === 0) {
      return candidate;
    }

    const suffix = Math.floor(1000 + Math.random() * 9000).toString();
    candidate = `${base.slice(0, Math.max(3, 20 - suffix.length))}${suffix}`;
    attempts += 1;
  }

  return `${base.slice(0, 15)}${Date.now().toString().slice(-5)}`;
};

const createAuthToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    SECRET,
    { expiresIn: "1h" }
  );
};

app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      message: "Username, email and password are required",
    });
  }

  if (username.trim().length < 3) {
    return res.status(400).json({
      message: "Username must be at least 3 characters",
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      message: "Please provide a valid email address",
    });
  }

  if (!isStrongPassword(password)) {
    return res.status(400).json({
      message: "Password must be at least 6 characters",
    });
  }

  try {
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1 OR username = $2",
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        message: "Email or username already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)",
      [username, email, hashedPassword]
    );

    res.json({ message: "Registration successful" });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      message: "Please provide a valid email address",
    });
  }

  if (!isStrongPassword(password)) {
    return res.status(400).json({
      message: "Password must be at least 6 characters",
    });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = createAuthToken(user);

    res.json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/auth/google", async (req, res) => {
  const { accessToken } = req.body;

  if (!accessToken) {
    return res.status(400).json({
      message: "Google access token is required",
    });
  }

  try {
    const googleResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!googleResponse.ok) {
      return res.status(401).json({
        message: "Invalid Google token",
      });
    }

    const googleUser = await googleResponse.json();
    const googleEmail = googleUser?.email;

    if (!googleEmail || !isValidEmail(googleEmail)) {
      return res.status(400).json({
        message: "Google account email is not available",
      });
    }

    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [googleEmail]);

    if (existingUser.rows.length > 0) {
      const token = createAuthToken(existingUser.rows[0]);

      return res.json({
        message: "Google login successful",
        token,
        user: {
          username: existingUser.rows[0].username,
          email: existingUser.rows[0].email,
        },
      });
    }

    const generatedUsername = await createUniqueUsername(
      googleUser?.name || googleEmail.split("@")[0]
    );
    const generatedPassword = `google_${Math.random().toString(36).slice(2, 14)}`;
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    const insertedUser = await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email",
      [generatedUsername, googleEmail, hashedPassword]
    );

    const token = createAuthToken(insertedUser.rows[0]);

    return res.status(201).json({
      message: "Google account created and login successful",
      token,
      user: insertedUser.rows[0],
    });
  } catch (error) {
    console.error("Google auth error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Please provide a valid email address" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");

    // Save token in DB
    await pool.query(
      "UPDATE users SET reset_token = $1 WHERE email = $2",
      [token, email]
    );

    const resetLink = `${FRONTEND_URL}/reset-password/${token}`;

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Reset your password",
      html: `
        <p>You requested to reset your password.</p>
        <p>Click the link below to continue:</p>
        <a href="${resetLink}">${resetLink}</a>
      `,
    });

    return res.json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

app.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Reset token is required" });
  }

  if (!isStrongPassword(password)) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  try {
    const result = await pool.query(
      "SELECT id FROM users WHERE reset_token = $1",
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "UPDATE users SET password = $1, reset_token = NULL WHERE id = $2",
      [hashedPassword, result.rows[0].id]
    );

    return res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

app.post(
  "/generate-avatar",
  upload.fields([
    { name: "frontImage", maxCount: 1 },
    { name: "backImage", maxCount: 1 },
    { name: "sideImage", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { height } = req.body;

      // Uploaded images are treated as temporary processing inputs only.
      // This endpoint validates inputs and returns a response without persisting raw photos.
      const frontImage = req.files?.frontImage?.[0];
      const backImage = req.files?.backImage?.[0];
      const sideImage = req.files?.sideImage?.[0];

      if (!frontImage || !backImage || !sideImage) {
        return res.status(400).json({
          message: "Front, back, and side images are required",
        });
      }

      if (!height) {
        return res.status(400).json({
          message: "Height is required",
        });
      }

      const numericHeight = Number(height);

      if (Number.isNaN(numericHeight)) {
        return res.status(400).json({
          message: "Height must be numeric",
        });
      }

      // Privacy-safe behavior: raw uploaded photos are processed in-memory only.
      // They are not persisted to disk or database in this placeholder flow.

      // Simulate avatar generation work. Later this section will be replaced with
      // the real 3D avatar generation pipeline/service integration.
      await new Promise((resolve) => setTimeout(resolve, 1200));
      const avatarId = `avatar_${Date.now()}`;
      const avatarUrl = `${FRONTEND_URL}/generated-avatars/${avatarId}.glb`;

      // If an authenticated token is provided, use that user id for avatar ownership.
      // Placeholder for future middleware: centralize auth and set req.user.id.
      let userId = null;
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.slice(7);
        try {
          const decoded = jwt.verify(token, SECRET);
          userId = decoded?.id || null;
        } catch (_error) {
          userId = null;
        }
      }

      // Ensure userId is present before DB insert (fix for NOT NULL constraint)
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Save only generated avatar metadata. Never store raw uploaded photo binaries.
      const avatarColumnResult = await pool.query(
        `SELECT column_name
         FROM information_schema.columns
         WHERE table_name = 'avatars'
           AND column_name IN ('avatar_url', 'avatar_file')
         ORDER BY CASE WHEN column_name = 'avatar_url' THEN 1 ELSE 2 END
         LIMIT 1`
      );

      if (avatarColumnResult.rows.length === 0) {
        return res.status(500).json({
          message: "Avatars table is missing avatar_url/avatar_file column",
        });
      }

      const avatarColumn = avatarColumnResult.rows[0].column_name;
      const insertAvatarResult = await pool.query(
        `INSERT INTO avatars (user_id, ${avatarColumn}) VALUES ($1, $2) RETURNING *`,
        [userId, avatarUrl]
      );

      const savedAvatar = insertAvatarResult.rows[0];

      return res.json({
        message: "Avatar generated successfully",
        avatarUrl,
        avatar: {
          id: savedAvatar.id,
          user_id: savedAvatar.user_id,
          [avatarColumn]: savedAvatar[avatarColumn],
        },
      });
    } catch (error) {
      console.error("Generate avatar error:", error);
      return res.status(500).json({
        message: "Server error",
      });
    }
  }
);

// Serve generated avatars statically
app.use("/generated-avatars", express.static("generated-avatars"));

app.listen(3000, "0.0.0.0", () => {
  console.log("Server running on port 3000");
});