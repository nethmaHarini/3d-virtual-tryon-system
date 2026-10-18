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
const { queryWithRetry } = pool;

const {
  uploadToS3,
  getSignedFileUrl,
  deleteFromS3,
} = require("./s3");

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
   GARMENT CATALOG
========================================================= */

const getSignedGarmentAssetUrl = async (key) => {
  if (!key) {
    return null;
  }

  return getSignedFileUrl(key);
};

const mapGarmentRows = async (garmentRows, variantRows) => {
  const variantsByGarmentId = new Map();

  for (const variant of variantRows) {
    const variants =
      variantsByGarmentId.get(variant.garment_id) || [];

    variants.push({
      recordId: variant.record_id,
      size: variant.size,
      modelUrl: await getSignedGarmentAssetUrl(
        variant.model_s3_key
      ),
    });

    variantsByGarmentId.set(
      variant.garment_id,
      variants
    );
  }

  return Promise.all(
    garmentRows.map(async (garment) => {
      const variants =
        variantsByGarmentId.get(garment.garment_id) || [];

      const imageUrls = await Promise.all([
        getSignedGarmentAssetUrl(garment.image_front_s3_key),
        getSignedGarmentAssetUrl(garment.image_side_s3_key),
        getSignedGarmentAssetUrl(garment.image_back_s3_key),
      ]);

      const images = imageUrls.filter(Boolean);
      const modelBySize = Object.fromEntries(
        variants
          .filter((variant) => variant.modelUrl)
          .map((variant) => [
            String(variant.size),
            variant.modelUrl,
          ])
      );

      return {
        id: garment.garment_id,
        garmentId: garment.garment_id,
        name: garment.name,
        title: garment.name,
        category: garment.category,
        gender: garment.gender,
        description: garment.description,
        price: garment.price,
        image: images[0] || null,
        images,
        thumbnails: images,
        sizes: variants.map((variant) =>
          String(variant.size)
        ),
        variants,
        modelBySize,
        breadcrumb:
          garment.category?.toLowerCase() === "trousers"
            ? "Shop / Apparel / Trousers"
            : "Shop / Apparel / T-Shirts",
      };
    })
  );
};

const getActiveGarments = async (garmentId = null) => {
  const garmentResult = await queryWithRetry(
    `
      SELECT
        garment_id,
        name,
        category,
        gender,
        description,
        price,
        image_front_s3_key,
        image_side_s3_key,
        image_back_s3_key
      FROM public.garments_new
      WHERE is_active = TRUE
        AND ($1::text IS NULL OR garment_id = $1)
      ORDER BY garment_id
    `,
    [garmentId]
  );

  if (garmentResult.rows.length === 0) {
    return [];
  }

  const variantResult = await queryWithRetry(
    `
      SELECT
        record_id,
        garment_id,
        size,
        model_s3_key
      FROM public.garment_variants_new
      WHERE is_active = TRUE
        AND garment_id = ANY($1::text[])
      ORDER BY garment_id, record_id
    `,
    [garmentResult.rows.map((garment) => garment.garment_id)]
  );

  return mapGarmentRows(
    garmentResult.rows,
    variantResult.rows
  );
};

app.get("/garments", async (req, res) => {
  try {
    const garments = await getActiveGarments();

    return res.status(200).json({
      garments,
    });
  } catch (error) {
    console.error("GET GARMENTS ERROR:", error);

    return res.status(500).json({
      message: "Failed to load garment catalog",
    });
  }
});

app.get("/garments/:garmentId", async (req, res) => {
  try {
    const garments = await getActiveGarments(
      req.params.garmentId
    );

    if (garments.length === 0) {
      return res.status(404).json({
        message: "Garment not found",
      });
    }

    return res.status(200).json({
      garment: garments[0],
    });
  } catch (error) {
    console.error("GET GARMENT ERROR:", error);

    return res.status(500).json({
      message: "Failed to load garment",
    });
  }
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

const getProfileImageUrl = (profileImage) => {
  if (!profileImage) {
    return null;
  }

  if (profileImage.startsWith("http://") || profileImage.startsWith("https://")) {
    return profileImage;
  }

  return `/profile-uploads/${profileImage}`;
};

const getAccountStatus = (loginCount) => {
  return Number(loginCount || 0) <= 1 ? "New User" : "Returning User";
};

const mapUserSession = (user) => {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    profile_image_url: getProfileImageUrl(user.profile_image),
    account_status: getAccountStatus(user.login_count),
    first_login_at: user.first_login_at,
    last_login_at: user.last_login_at,
  };
};

const recordSuccessfulLogin = async (userId) => {
  const result = await pool.query(
    `
      UPDATE users
      SET login_count = COALESCE(login_count, 0) + 1,
          first_login_at = COALESCE(first_login_at, NOW()),
          last_login_at = NOW()
      WHERE id = $1
      RETURNING id, username, email, profile_image, login_count, first_login_at, last_login_at
    `,
    [userId]
  );

  return result.rows[0] || null;
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
(async function ensureLoginTrackingColumns() {
  try {
    await pool.query(
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS login_count INTEGER NOT NULL DEFAULT 0;`
    );

    await pool.query(
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS first_login_at TIMESTAMP;`
    );

    await pool.query(
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;`
    );

    await pool.query(`
      CREATE TABLE IF NOT EXISTS app_meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const migrationMarker = await pool.query(
      `SELECT value FROM app_meta WHERE key = 'login_status_backfill_complete'`
    );

    if (migrationMarker.rows.length === 0) {
      await pool.query(
        `
          UPDATE users
          SET login_count = 1,
              first_login_at = COALESCE(first_login_at, NOW()),
              last_login_at = COALESCE(last_login_at, NOW())
          WHERE login_count = 0 OR login_count IS NULL
        `
      );

      await pool.query(
        `
          INSERT INTO app_meta (key, value)
          VALUES ('login_status_backfill_complete', 'true')
        `
      );
    }
  } catch (error) {
    console.error(
      "Could not ensure login tracking columns:",
      error.message || error
    );
  }
})();
(async function ensureFitAnalysesTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS fit_analyses (
        id SERIAL PRIMARY KEY,

        user_id INTEGER NOT NULL
          REFERENCES users(id)
          ON DELETE CASCADE,

        garment_name VARCHAR(255) NOT NULL,
        garment_size VARCHAR(20),

        chest_status VARCHAR(50),
        chest_distance DOUBLE PRECISION,

        waist_status VARCHAR(50),
        waist_distance DOUBLE PRECISION,

        hip_status VARCHAR(50),
        hip_distance DOUBLE PRECISION,

        recommendation TEXT,
        avatar_url TEXT,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log(
      "fit_analyses table ready"
    );
  } catch (error) {
    console.error(
      "Could not create fit_analyses table:",
      error.message || error
    );
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

      const updatedUser = await recordSuccessfulLogin(user.id);
      const sessionUser = updatedUser || user;
      const token = createAuthToken(sessionUser);

      return res.json({
        message: "Login successful",

        token,

        user: mapUserSession(sessionUser),
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

    return res.json({ user: mapUserSession(updated) });
  } catch (err) {
    console.error('Profile update error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

app.get('/profile/me', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Invalid user' });
    }

    const result = await queryWithRetry(
      `
        SELECT id, username, email, profile_image, login_count, first_login_at, last_login_at
        FROM users
        WHERE id = $1
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ user: mapUserSession(result.rows[0]) });
  } catch (error) {
    console.error('Load profile error:', error);
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
        const user = await recordSuccessfulLogin(existingUser.rows[0].id);
        const sessionUser = user || existingUser.rows[0];
        const token = createAuthToken(sessionUser);

        return res.json({
          message:
            "Google login successful",

          token,

          user: mapUserSession(sessionUser),
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
          (username, email, password, login_count, first_login_at, last_login_at)
          VALUES ($1, $2, $3, 1, NOW(), NOW())
        RETURNING id, username, email, profile_image, login_count, first_login_at, last_login_at
          `,
          [
            generatedUsername,
            googleEmail,
            hashedPassword,
          ]
        );

      const newUser =
        insertedUser.rows[0];

      const token =
        createAuthToken(newUser);

      return res
        .status(201)
        .json({
          message:
            "Google account created and login successful",

          token,

          user: mapUserSession(newUser),
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

  authenticate,

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

    let localMeasurementsPath = null;
    let localGlbPath = null;

    try {
      const userId = req.user.id;

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
        "User ID:",
        userId
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
        req.files?.frontImage?.[0];

      const backImage =
        req.files?.backImage?.[0];

      const sideImage =
        req.files?.sideImage?.[0];

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
         RUN AVATAR PIPELINE ON EC2
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

      const remoteGlbPath =
        `${AWS_PARE_DIR}/pipeline_final_output/avatar.glb`;

      const remoteMeasurementsPath =
        `${AWS_PARE_DIR}/pipeline_final_output/measurements.json`;

      /* -------------------------------
         DOWNLOAD OBJ
         Keep for current frontend
      -------------------------------- */

      console.log(
        "Downloading generated avatar OBJ..."
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
        "Avatar OBJ downloaded successfully"
      );

      /* -------------------------------
         DOWNLOAD GLB
         This will be stored in S3
      -------------------------------- */

      localGlbPath =
        path.join(
          TMP_UPLOAD_DIR,
          `avatar_${timestamp}.glb`
        );

      console.log(
        "Downloading avatar GLB..."
      );

      await runCommand(
        "scp",
        [
          "-i",
          AWS_AVATAR_KEY_PATH,

          `${AWS_AVATAR_USER}@${AWS_AVATAR_HOST}:${remoteGlbPath}`,

          localGlbPath,
        ]
      );

      console.log(
        "Avatar GLB downloaded successfully"
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

      /* =====================================================
         UPLOAD BASE AVATAR TO S3
      ===================================================== */

      const avatarS3Key =
  `avatars/user-${userId}/avatar.obj`;

const objBuffer =
  fs.readFileSync(
    outputPath
  );

console.log(
  "Uploading avatar OBJ to S3..."
);

await uploadToS3(
  objBuffer,
  avatarS3Key,
  "text/plain"
);

console.log(
  "Avatar OBJ uploaded to S3:",
  avatarS3Key
);

      /* =====================================================
         SAVE AVATAR DETAILS TO NEON POSTGRESQL
      ===================================================== */

      await pool.query(
        `
          INSERT INTO avatars (
            user_id,
            s3_key,
            gender,
            height_cm,
            chest_cm,
            waist_cm,
            hip_cm,
            created_at,
            updated_at
          )

          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            NOW(),
            NOW()
          )

          ON CONFLICT (user_id)

          DO UPDATE SET
            s3_key =
              EXCLUDED.s3_key,

            gender =
              EXCLUDED.gender,

            height_cm =
              EXCLUDED.height_cm,

            chest_cm =
              EXCLUDED.chest_cm,

            waist_cm =
              EXCLUDED.waist_cm,

            hip_cm =
              EXCLUDED.hip_cm,

            updated_at =
              NOW()
        `,
        [
          userId,
          avatarS3Key,
          gender,
          measurements.height_cm,
          measurements.chest_cm,
          measurements.waist_cm,
          measurements.hip_cm,
        ]
      );

      console.log(
        "Avatar metadata saved to Neon"
      );

      /* =====================================================
         CREATE TEMPORARY PRIVATE S3 URL
      ===================================================== */

      const s3AvatarUrl =
        await getSignedFileUrl(
          avatarS3Key,
          3600
        );

      console.log(
        "Signed S3 avatar URL generated"
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
        localGlbPath
      );

      localGlbPath =
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
         BUILD CURRENT LOCAL OBJ URL
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

          /*
           * Existing OBJ URL.
           * Keep temporarily so your
           * current AvatarViewer works.
           */
          avatarUrl,

          /*
           * New temporary private S3 GLB URL.
           */
          s3AvatarUrl,

          /*
           * Permanent S3 location stored in DB.
           */
          s3Key:
            avatarS3Key,

          measurements,

          avatar: {
            avatar_file:
              avatarUrl,

            s3_avatar_url:
              s3AvatarUrl,

            s3_key:
              avatarS3Key,

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

      removeFileIfExists(
        localGlbPath
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
   GET CURRENT USER AVATAR
========================================================= */

app.get(
  "/avatar/current",
  authenticate,
  async (req, res) => {
    try {
      const userId = req.user.id;

      const result = await pool.query(
        `
          SELECT
            id,
            user_id,
            s3_key,
            gender,
            height_cm,
            chest_cm,
            waist_cm,
            hip_cm,
            created_at,
            updated_at
          FROM avatars
          WHERE user_id = $1
          LIMIT 1
        `,
        [userId]
      );

      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({
            message:
              "No generated avatar found",
          });
      }

      const avatar =
        result.rows[0];

      if (!avatar.s3_key) {
        return res
          .status(404)
          .json({
            message:
              "Avatar file is not available",
          });
      }

      const signedUrl =
        await getSignedFileUrl(
          avatar.s3_key,
          3600
        );

      return res.json({
        message:
          "Avatar retrieved successfully",

        avatar: {
          id:
            avatar.id,

          user_id:
            avatar.user_id,

          s3_key:
            avatar.s3_key,

          avatarUrl:
            signedUrl,

          gender:
            avatar.gender,

          height_cm:
            avatar.height_cm,

          chest_cm:
            avatar.chest_cm,

          waist_cm:
            avatar.waist_cm,

          hip_cm:
            avatar.hip_cm,

          created_at:
            avatar.created_at,

          updated_at:
            avatar.updated_at,
        },
      });
    } catch (error) {
      console.error(
        "Get current avatar error:",
        error
      );

      return res
        .status(500)
        .json({
          message:
            "Failed to load avatar",
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
    try {
      const {
        userId,
        garmentName,
        size,
        chest,
        waist,
        hip,
        chestDistance,
        waistDistance,
        hipDistance,
        recommendation,
        avatarUrl,
      } = req.body;

      const fitAnalysis = {
        userId,
        garmentName,
        size,

        fit: {
          chest: {
            status: chest,
            distance: chestDistance,
          },

          waist: {
            status: waist,
            distance: waistDistance,
          },

          hip: {
            status: hip,
            distance: hipDistance,
          },
        },

        recommendation,
        avatarUrl,
        savedAt: new Date().toISOString(),
      };

      const result = await pool.query(
        `
        INSERT INTO fit_analyses (
          user_id,
          garment_name,
          garment_size,
          chest_status,
          chest_distance,
          waist_status,
          waist_distance,
          hip_status,
          hip_distance,
          recommendation,
          avatar_url
        )
        VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9, $10, $11
        )
        RETURNING *
        `,
        [
          userId,
          garmentName,
          size,
          chest,
          chestDistance,
          waist,
          waistDistance,
          hip,
          hipDistance,
          recommendation,
          avatarUrl,
        ]
      );

      console.log(
        "========== FIT ANALYSIS SAVED TO DATABASE =========="
      );

      console.log(result.rows[0]);

      return res.status(201).json({
        message: "Fit analysis saved successfully",
        fitAnalysis: result.rows[0],
      });
    } catch (error) {
      console.error(
        "SAVE FIT ERROR:",
        error
      );

      return res.status(500).json({
        message: "Failed to save fit analysis",
      });
    }
  }
);

/* =========================================================
   GET SAVED FIT ANALYSES
========================================================= */

app.get(
  "/fit-history/:userId",
  async (req, res) => {
    try {
      const userId = Number(req.params.userId);

      if (!userId) {
        return res.status(400).json({
          message: "Invalid user ID",
        });
      }

      const result = await pool.query(
        `
        SELECT
          id,
          user_id,
          garment_name,
          garment_size,
          chest_status,
          chest_distance,
          waist_status,
          waist_distance,
          hip_status,
          hip_distance,
          recommendation,
          avatar_url,
          created_at
        FROM fit_analyses
        WHERE user_id = $1
        ORDER BY created_at DESC
        `,
        [userId]
      );

      return res.status(200).json({
        fitAnalyses: result.rows,
      });
    } catch (error) {
      console.error(
        "GET FIT HISTORY ERROR:",
        error
      );

      return res.status(500).json({
        message: "Failed to retrieve fit history",
      });
    }
  }
);

/* =========================================================
   CLEAR FIT HISTORY
========================================================= */

app.delete(
  "/fit-history/:userId",
  async (req, res) => {
    try {
      const userId = Number(req.params.userId);

      if (!userId) {
        return res.status(400).json({
          message: "Invalid user ID",
        });
      }

      const result = await pool.query(
        `
        DELETE FROM fit_analyses
        WHERE user_id = $1
        RETURNING id
        `,
        [userId]
      );

      return res.status(200).json({
        message: "Fit history cleared successfully",
        deletedCount: result.rowCount,
      });
    } catch (error) {
      console.error(
        "CLEAR FIT HISTORY ERROR:",
        error
      );

      return res.status(500).json({
        message: "Failed to clear fit history",
      });
    }
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