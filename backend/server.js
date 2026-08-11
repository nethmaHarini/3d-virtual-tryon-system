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

// =====================================================
// CONFIGURATION
// =====================================================

const SECRET = process.env.JWT_SECRET || "your_secret_key";

const FRONTEND_URL =
  process.env.FRONTEND_URL || "http://localhost:5173";

const BACKEND_PUBLIC_URL =
  process.env.BACKEND_PUBLIC_URL || "http://localhost:3000";

const GENERATED_AVATAR_DIR = path.join(
  __dirname,
  "generated-avatars"
);

const TMP_UPLOAD_DIR = path.join(
  __dirname,
  "tmp-uploads"
);

// AWS Avatar Generation Server
const AWS_AVATAR_HOST = process.env.AWS_AVATAR_HOST;
const AWS_AVATAR_USER = process.env.AWS_AVATAR_USER;
const AWS_AVATAR_KEY_PATH = process.env.AWS_AVATAR_KEY_PATH;

const AWS_PARE_DIR =
  process.env.AWS_PARE_DIR ||
  process.env.AWS_AVATAR_PROJECT_DIR ||
  "/home/ubuntu/PARE";

// Create required local directories
fs.mkdirSync(GENERATED_AVATAR_DIR, {
  recursive: true,
});

fs.mkdirSync(TMP_UPLOAD_DIR, {
  recursive: true,
});

// =====================================================
// HELPER FUNCTIONS
// =====================================================

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

// Run command and wait for completion
const runCommand = (
  command,
  args,
  options = {}
) => {
  return new Promise(
    (resolve, reject) => {
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
    }
  );
};

// Upload a local file to AWS
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

// Remove temporary files from AWS
const removeAWSFiles = async (
  remoteFiles = []
) => {
  if (remoteFiles.length === 0) {
    return;
  }

  try {
    const command = `rm -f ${remoteFiles.join(
      " "
    )}`;

    await runCommand("ssh", [
      "-i",
      AWS_AVATAR_KEY_PATH,
      `${AWS_AVATAR_USER}@${AWS_AVATAR_HOST}`,
      command,
    ]);
  } catch (error) {
    console.error(
      "AWS temporary file cleanup failed:",
      error.message
    );
  }
};

// =====================================================
// EMAIL CONFIGURATION
// =====================================================

const transporter =
  nodemailer.createTransport({
    service: "gmail",

    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

// =====================================================
// EXPRESS MIDDLEWARE
// =====================================================

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());

// Serve generated OBJ avatars
app.use(
  "/generated-avatars",
  express.static(
    GENERATED_AVATAR_DIR
  )
);

// =====================================================
// FILE UPLOAD CONFIGURATION
// =====================================================

// Images initially stay in memory.
// They are written temporarily only while processing.
const storage = multer.memoryStorage();

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  // Photo upload format
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
    ];

    const allowedExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
    ];

    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    if (
      allowedMimeTypes.includes(file.mimetype) &&
      allowedExtensions.includes(extension)
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only JPG, JPEG and PNG image files are allowed."
        )
      );
    }
  },
});

// =====================================================
// ROOT TEST ROUTE
// =====================================================

app.get("/", (req, res) => {
  res.send(
    "Backend is running successfully 🚀"
  );
});

// =====================================================
// VALIDATION HELPERS
// =====================================================

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

const createUniqueUsername = async (
  seed
) => {
  const base =
    normalizeUsername(seed);

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

    candidate = `${base.slice(
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

// =====================================================
// REGISTER
// =====================================================

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

// =====================================================
// LOGIN
// =====================================================

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

      const user =
        result.rows[0];

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

      const token =
        createAuthToken(user);

      return res.json({
        message:
          "Login successful",

        token,

        user: {
          id: user.id,
          username:
            user.username,
          email: user.email,
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

// =====================================================
// GOOGLE LOGIN
// =====================================================

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
              new URLSearchParams(
                {
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
                    `${process.env.FRONTEND_URL}`,
                }
              ),
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

      if (
        !googleResponse.ok
      ) {
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
        existingUser.rows.length >
        0
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
            username:
              user.username,
            email: user.email,
          },
        });
      }

      const generatedUsername =
        await createUniqueUsername(
          googleUser?.name ||
            googleEmail.split(
              "@"
            )[0]
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
          RETURNING
            id,
            username,
            email
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
        createAuthToken(
          newUser
        );

      return res
        .status(201)
        .json({
          message:
            "Google account created and login successful",

          token,

          user: newUser,
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

// =====================================================
// FORGOT PASSWORD
// =====================================================

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
          <p>
            You requested to reset your password.
          </p>

          <p>
            Click the link below to continue:
          </p>

          <a href="${resetLink}">
            ${resetLink}
          </a>
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

// =====================================================
// RESET PASSWORD
// =====================================================

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
        SET
          password = $1,
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

// =====================================================
// TEMPORARY AWS SSH TEST
// =====================================================

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
        output:
          result.stdout,
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

// =====================================================
// TEMPORARY AWS SCP TEST
// =====================================================

app.get(
  "/test-aws-scp",
  async (req, res) => {
    const testFile =
      path.join(
        TMP_UPLOAD_DIR,
        "aws_scp_test.txt"
      );

    const remotePath =
      `${AWS_PARE_DIR}/aws_scp_test.txt`;

    try {
      fs.writeFileSync(
        testFile,
        `AWS SCP test successful - ${new Date().toISOString()}`
      );

      await uploadFileToAWS(
        testFile,
        remotePath
      );

      const result =
        await runCommand(
          "ssh",
          [
            "-i",
            AWS_AVATAR_KEY_PATH,

            `${AWS_AVATAR_USER}@${AWS_AVATAR_HOST}`,

            `test -f ${remotePath} && echo SCP_UPLOAD_OK`,
          ]
        );

      removeFileIfExists(
        testFile
      );

      return res.json({
        success: true,
        output:
          result.stdout,
        remotePath,
      });
    } catch (error) {
      removeFileIfExists(
        testFile
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "AWS SCP test failed",
          error:
            error.message,
        });
    }
  }
);

// =====================================================
// GENERATE AVATAR
// =====================================================

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

    let remoteFront = null;
    let remoteBack = null;
    let remoteSide = null;

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

      // -----------------------------------------------
      // Validate images
      // -----------------------------------------------

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

      // -----------------------------------------------
      // Validate height
      // -----------------------------------------------

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

      // -----------------------------------------------
      // Validate gender
      // -----------------------------------------------

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

      // NOTE:
      // The current AWS SMPL pipeline uses gender="neutral".
      // Gender is still validated because your frontend
      // currently sends it.

      // -----------------------------------------------
      // Create unique filenames
      // -----------------------------------------------

      const timestamp =
        Date.now();

      const avatarFilename =
        `avatar_${timestamp}.obj`;

      const outputPath =
        path.join(
          GENERATED_AVATAR_DIR,
          avatarFilename
        );

      // -----------------------------------------------
      // Save temporary local images
      // -----------------------------------------------

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

      // -----------------------------------------------
      // AWS temporary image paths
      // -----------------------------------------------

      remoteFront =
        `${AWS_PARE_DIR}/incoming_front_${timestamp}.jpg`;

      remoteBack =
        `${AWS_PARE_DIR}/incoming_back_${timestamp}.jpg`;

      remoteSide =
        `${AWS_PARE_DIR}/incoming_side_${timestamp}.jpg`;

      // -----------------------------------------------
      // Upload images to AWS
      // -----------------------------------------------

      console.log(
        "Uploading avatar images to AWS..."
      );

      await uploadFileToAWS(
        frontPath,
        remoteFront
      );

      await uploadFileToAWS(
        backPath,
        remoteBack
      );

      await uploadFileToAWS(
        sidePath,
        remoteSide
      );

      console.log(
        "Uploaded avatar images to AWS successfully"
      );

      // -----------------------------------------------
      // Run PARE + multi-view fusion + SMPL pipeline
      // -----------------------------------------------

      const remoteCommand = [
        `source ~/virtufit-env/bin/activate`,
        `cd ${AWS_PARE_DIR}`,
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
        "AWS avatar pipeline completed successfully"
      );

      console.log(
        awsResult.stdout
      );

      // -----------------------------------------------
      // AWS generated output paths
      // -----------------------------------------------

      const remoteAvatarPath =
        `${AWS_PARE_DIR}/pipeline_final_output/avatar.obj`;

      const remoteMeasurementsPath =
        `${AWS_PARE_DIR}/pipeline_final_output/measurements.json`;

      // -----------------------------------------------
      // Download avatar.obj
      // -----------------------------------------------

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

      // -----------------------------------------------
      // Download measurements.json
      // -----------------------------------------------

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

      // -----------------------------------------------
      // Read body measurements
      // -----------------------------------------------

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

      // -----------------------------------------------
      // Local cleanup
      // -----------------------------------------------

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

      // -----------------------------------------------
      // AWS temporary cleanup
      // -----------------------------------------------

      await removeAWSFiles([
        remoteFront,
        remoteBack,
        remoteSide,
      ]);

      // -----------------------------------------------
      // Build public avatar URL
      // -----------------------------------------------

      const avatarBaseUrl =
        BACKEND_PUBLIC_URL.replace(
          /\/$/,
          ""
        );

      const avatarUrl =
        `${avatarBaseUrl}/generated-avatars/${avatarFilename}`;

      // -----------------------------------------------
      // Return generated avatar + measurements
      // -----------------------------------------------

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
      // -----------------------------------------------
      // Local cleanup after error
      // -----------------------------------------------

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

      // -----------------------------------------------
      // AWS cleanup after error
      // -----------------------------------------------

      await removeAWSFiles(
        [
          remoteFront,
          remoteBack,
          remoteSide,
        ].filter(Boolean)
      );

      console.error(
        "Generate avatar error:",
        error
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

// =====================================================
// MULTER / IMAGE UPLOAD ERROR HANDLER
// =====================================================

app.use(
  (err, req, res, next) => {
    if (
      err instanceof
      multer.MulterError
    ) {
      if (
        err.code ===
        "LIMIT_FILE_SIZE"
      ) {
        return res
          .status(400)
          .json({
            message:
              "Image size must be less than 5 MB.",
          });
      }

      return res
        .status(400)
        .json({
          message:
            err.message,
        });
    }

    if (err) {
      return res
        .status(400)
        .json({
          message:
            err.message ||
            "Invalid image file.",
        });
    }

    next();
  }
);

// =====================================================
// MOCK FIT ANALYSIS
// =====================================================

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

// =====================================================
// SAVE FIT ANALYSIS
// =====================================================

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

    // Temporary log.
    // Later this can be stored in PostgreSQL.
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

// =====================================================
// START SERVER
// =====================================================

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