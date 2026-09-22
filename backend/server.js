const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const pool = require("./db");

require("dotenv").config();

const app = express();

/* =========================================================
   CONFIGURATION
========================================================= */

const SECRET =
  process.env.JWT_SECRET || "your_secret_key";

const FRONTEND_URL =
  process.env.FRONTEND_URL || "http://localhost:5173";

const BACKEND_PUBLIC_URL =
  process.env.BACKEND_PUBLIC_URL || "http://localhost:3000";

const GENERATED_AVATAR_DIR = path.join(
  __dirname,
  "generated-avatars"
);

const PROFILE_UPLOAD_DIR = path.join(__dirname, "profile-uploads");

const TMP_UPLOAD_DIR = path.join(
  __dirname,
  "tmp-uploads"
);

/* =========================================================
   AWS CONFIGURATION
========================================================= */

const AWS_AVATAR_HOST =
  process.env.AWS_AVATAR_HOST;

const AWS_AVATAR_USER =
  process.env.AWS_AVATAR_USER;

const AWS_AVATAR_KEY_PATH =
  process.env.AWS_AVATAR_KEY_PATH;

const AWS_PARE_DIR =
  process.env.AWS_PARE_DIR || "/home/ubuntu/PARE";

/* =========================================================
   CREATE REQUIRED DIRECTORIES
========================================================= */

fs.mkdirSync(GENERATED_AVATAR_DIR, {
  recursive: true,
});

fs.mkdirSync(TMP_UPLOAD_DIR, {
  recursive: true,
});

fs.mkdirSync(PROFILE_UPLOAD_DIR, { recursive: true });

/* =========================================================
   TEMP FILE HELPERS
========================================================= */

const saveTempBufferToFile = (buffer, filename) => {
  const fullPath = path.join(
    TMP_UPLOAD_DIR,
    filename
  );

  fs.writeFileSync(fullPath, buffer);

  return fullPath;
};

const removeFileIfExists = (filePath) => {
  try {
    if (
      filePath &&
      fs.existsSync(filePath)
    ) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error(
      "Temp file cleanup failed:",
      error
    );
  }
};

/* =========================================================
   COMMAND RUNNER
========================================================= */

const runCommand = (
  command,
  args,
  options = {}
) => {
  return new Promise((resolve, reject) => {
    const child = spawn(
      command,
      args,
      options
    );

    let stdout = "";
    let stderr = "";

    child.stdout?.on(
      "data",
      (data) => {
        stdout += data.toString();
      }
    );

    child.stderr?.on(
      "data",
      (data) => {
        stderr += data.toString();
      }
    );

    child.on(
      "error",
      (error) => {
        reject(error);
      }
    );

    child.on(
      "close",
      (code) => {
        if (code !== 0) {
          return reject(
            new Error(
              stderr ||
                stdout ||
                `${command} exited with code ${code}`
            )
          );
        }

        resolve({
          stdout: stdout.trim(),
          stderr: stderr.trim(),
        });
      }
    );
  });
};

/* =========================================================
   AWS SCP UPLOAD HELPER
========================================================= */

const uploadFileToAWS = async (
  localPath,
  remotePath
) => {
  await runCommand("scp", [
    "-i",
    AWS_AVATAR_KEY_PATH,
    localPath,
    `${AWS_AVATAR_USER}@${AWS_AVATAR_HOST}:${remotePath}`,
  ]);
};

/* =========================================================
   EMAIL

const transporter =
  nodemailer.createTransport({
    service: "gmail",

    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

/* =========================================================
   EXPRESS MIDDLEWARE
========================================================= */

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());

app.use(
  "/generated-avatars",
  express.static(GENERATED_AVATAR_DIR)
);

// Serve profile uploads
app.use(
  "/profile-uploads",
  express.static(PROFILE_UPLOAD_DIR)
);

/* =========================================================
   MULTER IMAGE UPLOAD
========================================================= */

const storage = multer.memoryStorage();

const allowedImageTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
];

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (
    req,
    file,
    callback
  ) => {
    if (
      allowedImageTypes.includes(
        file.mimetype
      )
    ) {
      return callback(null, true);
    }

    callback(
      new Error(
        "Only JPG, JPEG and PNG images are allowed"
      )
    );
  },
});

/* =========================================================
   ROOT
========================================================= */

app.get("/", (req, res) => {
  res.send(
    "Backend is running successfully 🚀"
  );
});

/* =========================================================
   VALIDATION HELPERS
========================================================= */

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
};

const isStrongPassword = (password) => {
  return (
    typeof password === "string" &&
    password.length >= 6
  );
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
    const existing =
      await pool.query(
        "SELECT 1 FROM users WHERE username = $1",
        [candidate]
      );

    if (
      existing.rows.length === 0
    ) {
      return candidate;
    }

    const suffix = Math.floor(
      1000 + Math.random() * 9000
    ).toString();

    candidate =
      `${base.slice(
        0,
        Math.max(
          3,
          20 - suffix.length
        )
      )}${suffix}`;

    attempts += 1;
  }

  return `${base.slice(
    0,
    15
  )}${Date.now()
    .toString()
    .slice(-5)}`;
};

const createAuthToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    SECRET,
    {
      expiresIn: "1h",
    }
  );
};

// Ensure users table has a profile_image column (safe to run on startup)
(async function ensureProfileColumn() {
  try {
    await pool.query(
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image VARCHAR(500);`
    );
  } catch (err) {
    console.warn('Could not add profile_image column (it may already exist):', err.message || err);
  }
})();

// Middleware to authenticate requests using Bearer token
const authenticate = (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ message: 'Missing Authorization header' });
    const token = auth.replace(/^Bearer\s+/i, '');
    const payload = jwt.verify(token, SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

/* =========================================================
   REGISTER
========================================================= */

app.post(
  "/register",
  async (req, res) => {
    const {
      username,
      email,
      password,
    } = req.body;

    if (
      !username ||
      !email ||
      !password
    ) {
      return res
        .status(400)
        .json({
          message:
            "Username, email and password are required",
        });
    }

    if (
      username.trim().length < 3
    ) {
      return res
        .status(400)
        .json({
          message:
            "Username must be at least 3 characters",
        });
    }

    if (!isValidEmail(email)) {
      return res
        .status(400)
        .json({
          message:
            "Please provide a valid email address",
        });
    }

    if (
      !isStrongPassword(password)
    ) {
      return res
        .status(400)
        .json({
          message:
            "Password must be at least 6 characters",
        });
    }

    try {
      const existingUser =
        await pool.query(
          `
          SELECT *
          FROM users
          WHERE email = $1
             OR username = $2
          `,
          [email, username]
        );

      if (
        existingUser.rows.length > 0
      ) {
        return res
          .status(400)
          .json({
            message:
              "Email or username already exists",
          });
      }

      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );

      await pool.query(
        `
        INSERT INTO users
        (username, email, password)
        VALUES ($1, $2, $3)
        `,
        [
          username,
          email,
          hashedPassword,
        ]
      );

      return res.json({
        message:
          "Registration successful",
      });
    } catch (error) {
      console.error(
        "Register error:",
        error
      );

      return res
        .status(500)
        .json({
          message: "Server error",
        });
    }
  }
);

/* =========================================================
   LOGIN
========================================================= */

app.post(
  "/login",
  async (req, res) => {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({
          message:
            "Email and password are required",
        });
    }

    if (!isValidEmail(email)) {
      return res
        .status(400)
        .json({
          message:
            "Please provide a valid email address",
        });
    }

    try {
      const result =
        await pool.query(
          `
          SELECT *
          FROM users
          WHERE email = $1
          `,
          [email]
        );

      if (
        result.rows.length === 0
      ) {
        return res
          .status(401)
          .json({
            message:
              "Invalid email or password",
          });
      }

      const user = result.rows[0];

      const isMatch =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!isMatch) {
        return res
          .status(401)
          .json({
            message:
              "Invalid email or password",
          });
      }

      // Build profile image URL if stored in DB
      const profileImageUrl = user.profile_image
        ? (user.profile_image.startsWith('http') ? user.profile_image : `/profile-uploads/${user.profile_image}`)
        : null;

      const token =
        createAuthToken(user);

      return res.json({
        message: "Login successful",

        token,

        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          profile_image_url: profileImageUrl,
        },
      });
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      return res
        .status(500)
        .json({
          message: "Server error",
        });
    }
  }
);

/* =========================================================
   GOOGLE AUTH
========================================================= */

/* =========================================================
   PROFILE PHOTO UPLOAD
   - POST /profile/photo (authenticated)
   - saves file to PROFILE_UPLOAD_DIR, updates users.profile_image
========================================================= */
app.post('/profile/photo', authenticate, upload.single('photo'), async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Invalid user' });
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const ext = (req.file.originalname || '').split('.').pop() || '';
    const safeExt = ext ? `.${ext}` : '';
    const filename = `profile_${userId}_${Date.now()}${safeExt}`;
    const fullPath = path.join(PROFILE_UPLOAD_DIR, filename);

    fs.writeFileSync(fullPath, req.file.buffer);

    // Update DB
    await pool.query('UPDATE users SET profile_image = $1 WHERE id = $2', [filename, userId]);

    const profileImageUrl = `/profile-uploads/${filename}`;

    return res.json({ message: 'Profile photo uploaded', profile_image_url: profileImageUrl });
  } catch (err) {
    console.error('Profile upload error:', err);
    return res.status(500).json({ message: 'Upload failed' });
  }
});


// Update profile (username/email)
app.put('/profile', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Invalid user' });

    const { username, email } = req.body || {};

    const nameToSave = (username || '').trim();
    const emailToSave = (email || '').trim();

    if (!nameToSave || nameToSave.length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters' });
    }

    if (!isValidEmail(emailToSave)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    // Check duplicates excluding current user
    const dup = await pool.query(
      `SELECT id, username, email FROM users WHERE (username = $1 OR email = $2) AND id <> $3`,
      [nameToSave, emailToSave, userId]
    );

    if (dup.rows.length > 0) {
      const conflict = dup.rows[0];
      if (conflict.username === nameToSave) {
        return res.status(409).json({ field: 'username', message: 'Username already taken' });
      }
      if (conflict.email === emailToSave) {
        return res.status(409).json({ field: 'email', message: 'Email already in use' });
      }
      return res.status(409).json({ message: 'Conflict' });
    }

    const result = await pool.query(
      `UPDATE users SET username = $1, email = $2 WHERE id = $3 RETURNING id, username, email, profile_image`,
      [nameToSave, emailToSave, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updated = result.rows[0];
    const profileImageUrl = updated.profile_image
      ? (updated.profile_image.startsWith('http') ? updated.profile_image : `/profile-uploads/${updated.profile_image}`)
      : null;

    return res.json({ user: { id: updated.id, username: updated.username, email: updated.email, profile_image_url: profileImageUrl } });
  } catch (err) {
    console.error('Profile update error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});


app.post(
  "/auth/google",
  async (req, res) => {
    const { code } = req.body;

    if (!code) {
      return res
        .status(400)
        .json({
          message:
            "Google authorization code is required",
        });
    }

    try {
      const tokenResponse =
        await fetch(
          "https://oauth2.googleapis.com/token",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/x-www-form-urlencoded",
            },

            body:
              new URLSearchParams({
                client_id:
                  process.env
                    .GOOGLE_CLIENT_ID,

                client_secret:
                  process.env
                    .GOOGLE_CLIENT_SECRET,

                code,

                grant_type:
                  "authorization_code",

                redirect_uri:
                  process.env
                    .FRONTEND_URL,
              }),
          }
        );

      if (!tokenResponse.ok) {
        console.error(
          "Token exchange failed:",
          await tokenResponse.text()
        );

        return res
          .status(401)
          .json({
            message:
              "Failed to exchange Google authorization code",
          });
      }

      const tokenData =
        await tokenResponse.json();

      const accessToken =
        tokenData.access_token;

      if (!accessToken) {
        return res
          .status(401)
          .json({
            message:
              "No access token received from Google",
          });
      }

      const googleResponse =
        await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization:
                `Bearer ${accessToken}`,
            },
          }
        );

      if (!googleResponse.ok) {
        return res
          .status(401)
          .json({
            message:
              "Invalid Google token",
          });
      }

      const googleUser =
        await googleResponse.json();

      const googleEmail =
        googleUser?.email;

      if (
        !googleEmail ||
        !isValidEmail(
          googleEmail
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              "Google account email is not available",
          });
      }

      const existingUser =
        await pool.query(
          `
          SELECT *
          FROM users
          WHERE email = $1
          `,
          [googleEmail]
        );

      if (
        existingUser.rows.length > 0
      ) {
        const user =
          existingUser.rows[0];

        const token =
          createAuthToken(user);

        return res.json({
          message:
            "Google login successful",

          token,

          user: {
            id: user.id,
            username: user.username,
            email: user.email,
          },
        });
      }

      const generatedUsername =
        await createUniqueUsername(
          googleUser?.name ||
            googleEmail.split("@")[0]
        );

      const generatedPassword =
        `google_${Math.random()
          .toString(36)
          .slice(2, 14)}`;

      const hashedPassword =
        await bcrypt.hash(
          generatedPassword,
          10
        );

      const insertedUser =
        await pool.query(
          `
          INSERT INTO users
          (username, email, password)
          VALUES ($1, $2, $3)
        RETURNING id, username, email, profile_image
          `,
          [
            generatedUsername,
            googleEmail,
            hashedPassword,
          ]
        );

      const newUser =
        insertedUser.rows[0];

      // Construct profile image url if present
      const profileImageUrl = newUser.profile_image
        ? (newUser.profile_image.startsWith('http') ? newUser.profile_image : `/profile-uploads/${newUser.profile_image}`)
        : null;

      const token =
        createAuthToken(newUser);

      return res
        .status(201)
        .json({
          message:
            "Google account created and login successful",

          token,

          user: {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            profile_image_url: profileImageUrl,
          },
        });
    } catch (error) {
      console.error(
        "Google auth error:",
        error
      );

      return res
        .status(500)
        .json({
          message: "Server error",
        });
    }
  }
);

/* =========================================================
   FORGOT PASSWORD
========================================================= */

app.post(
  "/forgot-password",
  async (req, res) => {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({
          message:
            "Email is required",
        });
    }

    if (!isValidEmail(email)) {
      return res
        .status(400)
        .json({
          message:
            "Please provide a valid email address",
        });
    }

    try {
      const result =
        await pool.query(
          `
          SELECT *
          FROM users
          WHERE email = $1
          `,
          [email]
        );

      if (
        result.rows.length === 0
      ) {
        return res
          .status(404)
          .json({
            message:
              "User not found",
          });
      }

      const token =
        crypto
          .randomBytes(32)
          .toString("hex");

      await pool.query(
        `
        UPDATE users
        SET reset_token = $1
        WHERE email = $2
        `,
        [token, email]
      );

      // Get the frontend that sent this request.
      // This supports localhost, Codespaces and Vercel.
      const requestOrigin =
        req.get("origin");

      let frontendUrl =
        FRONTEND_URL;

      if (requestOrigin) {
        try {
          const originUrl =
            new URL(requestOrigin);

          const hostname =
            originUrl.hostname;

          const isLocalhost =
            hostname === "localhost" ||
            hostname === "127.0.0.1";

          const isCodespace =
            hostname.endsWith(
              ".app.github.dev"
            );

          const isVercel =
            hostname ===
            "3d-virtual-tryon-system.vercel.app";

          if (
            isLocalhost ||
            isCodespace ||
            isVercel
          ) {
            frontendUrl =
              requestOrigin;
          }
        } catch (error) {
          console.error(
            "Invalid frontend origin:",
            requestOrigin
          );
        }
      }

      frontendUrl =
        frontendUrl.replace(
          /\/$/,
          ""
        );

      const resetLink =
        `${frontendUrl}/reset-password/${token}`;

      console.log(
        "================================="
      );

      console.log(
        "Password reset requested"
      );

      console.log(
        "Request origin:",
        requestOrigin
      );

      console.log(
        "Frontend URL:",
        frontendUrl
      );

      console.log(
        "Reset URL:",
        resetLink
      );

      console.log(
        "================================="
      );

      await transporter.sendMail({
        from:
          process.env.GMAIL_USER,

        to: email,

        subject:
          "Reset your password",

        html: `
          <p>You requested to reset your password.</p>
          <p>Click the link below to continue:</p>
          <a href="${resetLink}">${resetLink}</a>
        `,
      });

      return res.json({
        message:
          "Password reset email sent",
      });
    } catch (error) {
      console.error(
        "Forgot password error:",
        error
      );

      return res
        .status(500)
        .json({
          message:
            "Server error",
        });
    }
  }
);

/* =========================================================
   RESET PASSWORD
========================================================= */

app.post(
  "/reset-password/:token",
  async (req, res) => {
    const { token } =
      req.params;

    const { password } =
      req.body;

    if (!token) {
      return res
        .status(400)
        .json({
          message:
            "Reset token is required",
        });
    }

    if (
      !isStrongPassword(password)
    ) {
      return res
        .status(400)
        .json({
          message:
            "Password must be at least 6 characters",
        });
    }

    try {
      const result =
        await pool.query(
          `
          SELECT id
          FROM users
          WHERE reset_token = $1
          `,
          [token]
        );

      if (
        result.rows.length === 0
      ) {
        return res
          .status(400)
          .json({
            message:
              "Invalid or expired reset token",
          });
      }

      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );

      await pool.query(
        `
        UPDATE users
        SET password = $1,
            reset_token = NULL
        WHERE id = $2
        `,
        [
          hashedPassword,
          result.rows[0].id,
        ]
      );

      return res.json({
        message:
          "Password reset successful",
      });
    } catch (error) {
      console.error(
        "Reset password error:",
        error
      );

      return res
        .status(500)
        .json({
          message:
            "Server error",
        });
    }
  }
);

/* =========================================================
   AWS SSH TEST
========================================================= */

app.get(
  "/test-aws-avatar",
  async (req, res) => {
    try {
      const result =
        await runCommand(
          "ssh",
          [
            "-i",
            AWS_AVATAR_KEY_PATH,

            `${AWS_AVATAR_USER}@${AWS_AVATAR_HOST}`,

            "echo AWS_CONNECTION_OK",
          ]
        );

      return res.json({
        success: true,
        output: result.stdout,
      });
    } catch (error) {
      return res
        .status(500)
        .json({
          success: false,

          message:
            "AWS connection failed",

          error:
            error.message,
        });
    }
  }
);

/* =========================================================
   AWS SCP TEST
========================================================= */

app.get(
  "/test-aws-scp",
  async (req, res) => {
    const testFile =
      path.join(
        TMP_UPLOAD_DIR,
        "aws_scp_test.txt"
      );

    try {
      fs.writeFileSync(
        testFile,
        `AWS SCP test successful - ${new Date().toISOString()}`
      );

      const remotePath =
        `${AWS_PARE_DIR}/aws_scp_test.txt`;

      await uploadFileToAWS(
        testFile,
        remotePath
      );

      const verifyResult =
        await runCommand(
          "ssh",
          [
            "-i",
            AWS_AVATAR_KEY_PATH,

            `${AWS_AVATAR_USER}@${AWS_AVATAR_HOST}`,

            `test -f "${remotePath}" && echo SCP_UPLOAD_OK`,
          ]
        );

      return res.json({
        success: true,
        output:
          verifyResult.stdout,
        remotePath,
      });
    } catch (error) {
      return res
        .status(500)
        .json({
          success: false,

          message:
            "SCP upload failed",

          error:
            error.message,
        });
    } finally {
      removeFileIfExists(
        testFile
      );
    }
  }
);

/* =========================================================
   GENERATE AVATAR
========================================================= */

app.post(
  "/generate-avatar",

  upload.fields([
    {
      name: "frontImage",
      maxCount: 1,
    },

    {
      name: "backImage",
      maxCount: 1,
    },

    {
      name: "sideImage",
      maxCount: 1,
    },
  ]),

  async (req, res) => {
    let frontPath = null;
    let backPath = null;
    let sidePath = null;

    let localMeasurementsPath =
      null;

    try {
      const {
        height,
        gender,
      } = req.body;

      console.log(
        "================================="
      );

      console.log(
        "Avatar generation request"
      );

      console.log(
        "Height received:",
        height
      );

      console.log(
        "Gender received:",
        gender
      );

      console.log(
        "================================="
      );

      const frontImage =
        req.files
          ?.frontImage?.[0];

      const backImage =
        req.files
          ?.backImage?.[0];

      const sideImage =
        req.files
          ?.sideImage?.[0];

      /* -------------------------------
         VALIDATE PHOTOS
      -------------------------------- */

      if (
        !frontImage ||
        !backImage ||
        !sideImage
      ) {
        return res
          .status(400)
          .json({
            message:
              "Front, back, and side images are required",
          });
      }

      /* -------------------------------
         VALIDATE HEIGHT
      -------------------------------- */

      if (!height) {
        return res
          .status(400)
          .json({
            message:
              "Height is required",
          });
      }

      const numericHeight =
        Number(height);

      if (
        Number.isNaN(
          numericHeight
        ) ||
        numericHeight < 100 ||
        numericHeight > 250
      ) {
        return res
          .status(400)
          .json({
            message:
              "Height must be between 100 and 250 cm",
          });
      }

      /* -------------------------------
         VALIDATE GENDER
      -------------------------------- */

      if (
        ![
          "male",
          "female",
        ].includes(gender)
      ) {
        return res
          .status(400)
          .json({
            message:
              "Gender must be male or female",
          });
      }

      /* -------------------------------
         CREATE OUTPUT FILE
      -------------------------------- */

      const timestamp =
        Date.now();

      const avatarFilename =
        `avatar_${timestamp}.obj`;

      const outputPath =
        path.join(
          GENERATED_AVATAR_DIR,
          avatarFilename
        );

      /* -------------------------------
         SAVE TEMP PHOTOS
      -------------------------------- */

      frontPath =
        saveTempBufferToFile(
          frontImage.buffer,
          `front_${timestamp}.jpg`
        );

      backPath =
        saveTempBufferToFile(
          backImage.buffer,
          `back_${timestamp}.jpg`
        );

      sidePath =
        saveTempBufferToFile(
          sideImage.buffer,
          `side_${timestamp}.jpg`
        );

      /* -------------------------------
         AWS FILE PATHS
      -------------------------------- */

      const remoteFront =
        `${AWS_PARE_DIR}/incoming_front_${timestamp}.jpg`;

      const remoteSide =
        `${AWS_PARE_DIR}/incoming_side_${timestamp}.jpg`;

      const remoteBack =
        `${AWS_PARE_DIR}/incoming_back_${timestamp}.jpg`;

      console.log(
        "Uploading avatar images to AWS..."
      );

      await uploadFileToAWS(
        frontPath,
        remoteFront
      );

      await uploadFileToAWS(
        sidePath,
        remoteSide
      );

      await uploadFileToAWS(
        backPath,
        remoteBack
      );

      console.log(
        "Uploaded avatar images to AWS successfully"
      );

      /* =====================================================
         IMPORTANT:
         Correct AWS command with && separators
         and gender support
      ===================================================== */

      const remoteCommand = [
        `source ~/pare-env/bin/activate`,

        `export PARE_ROOT=/home/ubuntu/PARE`,
        `export PARE_CHECKPOINT=/home/ubuntu/PARE/data/pare/checkpoints/pare_checkpoint.ckpt`,
        `export PARE_CONFIG=/home/ubuntu/PARE/data/pare/checkpoints/pare_config.yaml`,
        `export SMPL_MODEL_DIR=/home/ubuntu/PARE/data/body_models/smpl`,

        `cd "${AWS_PARE_DIR}"`,

        [
          `python scripts/generate_avatar_pipeline.py`,

          `--front "${remoteFront}"`,

          `--side "${remoteSide}"`,

          `--back "${remoteBack}"`,

          `--height ${numericHeight}`,

          `--gender ${gender}`,
        ].join(" "),
      ].join(" && ");

      console.log(
        "Gender being sent to AWS:",
        gender
      );

      console.log(
        "AWS command:",
        remoteCommand
      );

      console.log(
        "Running AWS avatar pipeline..."
      );

      const awsResult =
        await runCommand(
          "ssh",
          [
            "-i",
            AWS_AVATAR_KEY_PATH,

            `${AWS_AVATAR_USER}@${AWS_AVATAR_HOST}`,

            remoteCommand,
          ]
        );

      console.log(
        awsResult.stdout
      );

      console.log(
        "AWS avatar pipeline completed successfully"
      );

      /* -------------------------------
         REMOTE OUTPUT PATHS
      -------------------------------- */

      const remoteAvatarPath =
        `${AWS_PARE_DIR}/pipeline_final_output/avatar.obj`;

      const remoteMeasurementsPath =
        `${AWS_PARE_DIR}/pipeline_final_output/measurements.json`;

      /* -------------------------------
         DOWNLOAD AVATAR
      -------------------------------- */

      console.log(
        "Downloading generated avatar..."
      );

      await runCommand(
        "scp",
        [
          "-i",
          AWS_AVATAR_KEY_PATH,

          `${AWS_AVATAR_USER}@${AWS_AVATAR_HOST}:${remoteAvatarPath}`,

          outputPath,
        ]
      );

      console.log(
        "Avatar downloaded successfully"
      );

      /* -------------------------------
         DOWNLOAD MEASUREMENTS
      -------------------------------- */

      localMeasurementsPath =
        path.join(
          TMP_UPLOAD_DIR,
          `measurements_${timestamp}.json`
        );

      await runCommand(
        "scp",
        [
          "-i",
          AWS_AVATAR_KEY_PATH,

          `${AWS_AVATAR_USER}@${AWS_AVATAR_HOST}:${remoteMeasurementsPath}`,

          localMeasurementsPath,
        ]
      );

      const measurements =
        JSON.parse(
          fs.readFileSync(
            localMeasurementsPath,
            "utf8"
          )
        );

      console.log(
        "Measurements:",
        measurements
      );

      /* -------------------------------
         CLEAN TEMP LOCAL FILES
      -------------------------------- */

      removeFileIfExists(
        localMeasurementsPath
      );

      localMeasurementsPath =
        null;

      removeFileIfExists(
        frontPath
      );

      removeFileIfExists(
        backPath
      );

      removeFileIfExists(
        sidePath
      );

      frontPath = null;
      backPath = null;
      sidePath = null;

      /* -------------------------------
         BUILD AVATAR URL
      -------------------------------- */

      const avatarBaseUrl =
        BACKEND_PUBLIC_URL.replace(
          /\/$/,
          ""
        );

      const avatarUrl =
        `${avatarBaseUrl}/generated-avatars/${avatarFilename}`;

      /* -------------------------------
         SEND RESPONSE
      -------------------------------- */

      return res
        .status(200)
        .json({
          message:
            "Avatar generated successfully",

          avatarUrl,

          measurements,

          avatar: {
            avatar_file:
              avatarUrl,

            generated_at:
              new Date().toISOString(),

            height:
              numericHeight,

            gender,
          },
        });
    } catch (error) {
      console.error(
        "Generate avatar error:",
        error
      );

      removeFileIfExists(
        frontPath
      );

      removeFileIfExists(
        backPath
      );

      removeFileIfExists(
        sidePath
      );

      removeFileIfExists(
        localMeasurementsPath
      );

      return res
        .status(500)
        .json({
          message:
            "Server error during avatar generation",

          error:
            error.message,
        });
    }
  }
);

/* =========================================================
   FIT ANALYSIS

app.post(
  "/fit-analysis",
  (req, res) => {
    res.json({
      bodyRegions: [
        {
          name: "Chest",
          status: "Tight",
        },

        {
          name: "Waist",
          status: "Perfect",
        },

        {
          name: "Hip",
          status: "Loose",
        },
      ],

      recommendation:
        "Recommended size is based on AI analysis. Consider adjusting garment fit for better comfort.",
    });
  }
);

/* =========================================================
   SAVE FIT
========================================================= */

app.post(
  "/save-fit",
  async (req, res) => {
    const {
      userId,
      chest,
      waist,
      hip,
      recommendation,
    } = req.body;

    console.log({
      userId,
      chest,
      waist,
      hip,
      recommendation,
    });

    return res.json({
      message:
        "Fit analysis saved",
    });
  }
);

/* =========================================================
   MULTER ERROR HANDLER
========================================================= */

app.use(
  (
    error,
    req,
    res,
    next
  ) => {
    if (
      error instanceof
      multer.MulterError
    ) {
      if (
        error.code ===
        "LIMIT_FILE_SIZE"
      ) {
        return res
          .status(400)
          .json({
            message:
              "Each image must be 5 MB or smaller",
          });
      }

      return res
        .status(400)
        .json({
          message:
            error.message,
        });
    }

    if (
      error?.message ===
      "Only JPG, JPEG and PNG images are allowed"
    ) {
      return res
        .status(400)
        .json({
          message:
            error.message,
        });
    }

    next(error);
  }
);

/* =========================================================
   START SERVER
========================================================= */

const PORT =
  process.env.PORT || 3000;

app.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(
      `Server running on port ${PORT}`
    );
  }
);