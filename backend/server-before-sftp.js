const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const multer = require("multer");
const sharp = require("sharp");
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
  process.env.FRONTEND_URL || "http://localhost:5174";

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
const AWS_AVATAR_HOST =
  process.env.AWS_AVATAR_HOST;

const AWS_AVATAR_USER =
  process.env.AWS_AVATAR_USER;

const AWS_AVATAR_KEY_PATH =
  process.env.AWS_AVATAR_KEY_PATH;

const AWS_PARE_DIR =
  process.env.AWS_PARE_DIR ||
  process.env.AWS_AVATAR_PROJECT_DIR ||
  "/home/ubuntu/PARE";

// Create required local directories
fs.mkdirSync(
  GENERATED_AVATAR_DIR,
  {
    recursive: true,
  }
);

fs.mkdirSync(
  TMP_UPLOAD_DIR,
  {
    recursive: true,
  }
);

// =====================================================
// HELPER FUNCTIONS
// =====================================================

const saveTempBufferToFile = (
  buffer,
  filename
) => {
  const fullPath = path.join(
    TMP_UPLOAD_DIR,
    filename
  );

  fs.writeFileSync(
    fullPath,
    buffer
  );

  return fullPath;
};

const removeFileIfExists = (
  filePath
) => {
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

// =====================================================
// RUN EXTERNAL COMMAND
// =====================================================

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
          stdout +=
            data.toString();
        }
      );

      child.stderr?.on(
        "data",
        (data) => {
          stderr +=
            data.toString();
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
            stdout:
              stdout.trim(),

            stderr:
              stderr.trim(),
          });
        }
      );
    }
  );
};

// =====================================================
// AWS FILE UPLOAD
// =====================================================

const uploadFileToAWS = async (
  localPath,
  remotePath
) => {
  await runCommand(
    "scp",
    [
      "-i",
      AWS_AVATAR_KEY_PATH,

      localPath,

      `${AWS_AVATAR_USER}@${AWS_AVATAR_HOST}:${remotePath}`,
    ]
  );
};

// =====================================================
// AWS FILE CLEANUP
// =====================================================

const removeAWSFiles = async (
  remoteFiles = []
) => {
  if (
    remoteFiles.length === 0
  ) {
    return;
  }

  try {
    const command =
      `rm -f ${remoteFiles.join(
        " "
      )}`;

    await runCommand(
      "ssh",
      [
        "-i",
        AWS_AVATAR_KEY_PATH,

        `${AWS_AVATAR_USER}@${AWS_AVATAR_HOST}`,

        command,
      ]
    );
  } catch (error) {
    console.error(
      "AWS temporary file cleanup failed:",
      error.message
    );
  }
};

// =====================================================
// FR19 - PHOTO RESOLUTION PREPARATION
// =====================================================

const prepareImageResolution =
  async (buffer) => {
    const metadata =
      await sharp(
        buffer
      ).metadata();

    const width =
      metadata.width || 0;

    const height =
      metadata.height || 0;

    // Recommended target resolution
    const targetWidth = 720;
    const targetHeight = 1280;

    // Minimum size accepted for automatic adjustment
    const minimumAcceptedWidth =
      480;

    const minimumAcceptedHeight =
      854;

    // -----------------------------------------------
    // Image is too small
    // -----------------------------------------------

    if (
      width <
        minimumAcceptedWidth ||
      height <
        minimumAcceptedHeight
    ) {
      return {
        passed: false,

        adjusted: false,

        width,

        height,

        buffer: null,

        message:
          "Image resolution is too low. Please upload a higher-quality full-body photo.",
      };
    }

    // -----------------------------------------------
    // Image already satisfies target
    // -----------------------------------------------

    if (
      width >= targetWidth &&
      height >= targetHeight
    ) {
      return {
        passed: true,

        adjusted: false,

        width,

        height,

        buffer,
      };
    }

    // -----------------------------------------------
    // Slightly low resolution
    // Automatically prepare image
    // -----------------------------------------------

    const resizedBuffer =
      await sharp(buffer)
        .resize({
          width:
            targetWidth,

          height:
            targetHeight,

          fit:
            "inside",

          withoutEnlargement:
            false,
        })
        .jpeg({
          quality: 92,
        })
        .toBuffer();

    const resizedMetadata =
      await sharp(
        resizedBuffer
      ).metadata();

    return {
      passed: true,

      adjusted: true,

      width:
        resizedMetadata.width ||
        width,

      height:
        resizedMetadata.height ||
        height,

      buffer:
        resizedBuffer,
    };
  };

// =====================================================
// EMAIL CONFIGURATION
// =====================================================

const transporter =
  nodemailer.createTransport({
    service: "gmail",

    auth: {
      user:
        process.env.GMAIL_USER,

      pass:
        process.env
          .GMAIL_APP_PASSWORD,
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

app.use(
  express.json()
);

// Serve generated avatars
app.use(
  "/generated-avatars",

  express.static(
    GENERATED_AVATAR_DIR
  )
);

// =====================================================
// MULTER CONFIGURATION
// =====================================================

const storage =
  multer.memoryStorage();

const upload =
  multer({
    storage,

    limits: {
      fileSize:
        5 *
        1024 *
        1024,
    },
  });

// =====================================================
// ROOT ROUTE
// =====================================================

app.get(
  "/",
  (req, res) => {
    res.send(
      "Backend is running successfully 🚀"
    );
  }
);

// =====================================================
// VALIDATION HELPERS
// =====================================================

const isValidEmail = (
  email
) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
};

const isStrongPassword = (
  password
) => {
  return (
    typeof password ===
      "string" &&
    password.length >= 6
  );
};

const normalizeUsername = (
  value
) => {
  const base = (
    value || "user"
  )
    .toLowerCase()
    .replace(
      /[^a-z0-9_]/g,
      ""
    )
    .slice(0, 20);

  if (
    base.length >= 3
  ) {
    return base;
  }

  return `${base}user`.slice(
    0,
    20
  );
};

const createUniqueUsername =
  async (seed) => {
    const base =
      normalizeUsername(
        seed
      );

    let candidate =
      base;

    let attempts = 0;

    while (
      attempts < 20
    ) {
      const existing =
        await pool.query(
          `
          SELECT 1
          FROM users
          WHERE username = $1
          `,
          [candidate]
        );

      if (
        existing.rows
          .length === 0
      ) {
        return candidate;
      }

      const suffix =
        Math.floor(
          1000 +
            Math.random() *
              9000
        ).toString();

      candidate =
        `${base.slice(
          0,
          Math.max(
            3,
            20 -
              suffix.length
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

const createAuthToken = (
  user
) => {
  return jwt.sign(
    {
      id:
        user.id,

      email:
        user.email,
    },

    SECRET,

    {
      expiresIn:
        "1h",
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
      username.trim()
        .length < 3
    ) {
      return res
        .status(400)
        .json({
          message:
            "Username must be at least 3 characters",
        });
    }

    if (
      !isValidEmail(
        email
      )
    ) {
      return res
        .status(400)
        .json({
          message:
            "Please provide a valid email address",
        });
    }

    if (
      !isStrongPassword(
        password
      )
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
          [
            email,
            username,
          ]
        );

      if (
        existingUser.rows
          .length > 0
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
          message:
            "Server error",
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

    if (
      !email ||
      !password
    ) {
      return res
        .status(400)
        .json({
          message:
            "Email and password are required",
        });
    }

    if (
      !isValidEmail(
        email
      )
    ) {
      return res
        .status(400)
        .json({
          message:
            "Please provide a valid email address",
        });
    }

    if (
      !isStrongPassword(
        password
      )
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
        result.rows
          .length === 0
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
        createAuthToken(
          user
        );

      return res.json({
        message:
          "Login successful",

        token,

        user: {
          id:
            user.id,

          username:
            user.username,

          email:
            user.email,
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
          message:
            "Server error",
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
    const {
      code,
    } = req.body;

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
            method:
              "POST",

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

      if (
        !tokenResponse.ok
      ) {
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
          [
            googleEmail,
          ]
        );

      if (
        existingUser.rows
          .length > 0
      ) {
        const user =
          existingUser
            .rows[0];

        const token =
          createAuthToken(
            user
          );

        return res.json({
          message:
            "Google login successful",

          token,

          user: {
            id:
              user.id,

            username:
              user.username,

            email:
              user.email,
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
        insertedUser
          .rows[0];

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

          user:
            newUser,
        });
    } catch (error) {
      console.error(
        "Google auth error:",
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
// FORGOT PASSWORD
// =====================================================

app.post(
  "/forgot-password",

  async (req, res) => {
    const {
      email,
    } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({
          message:
            "Email is required",
        });
    }

    if (
      !isValidEmail(
        email
      )
    ) {
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
        result.rows
          .length === 0
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
        [
          token,
          email,
        ]
      );

      const resetLink =
        `${FRONTEND_URL}/reset-password/${token}`;

      await transporter.sendMail(
        {
          from:
            process.env
              .GMAIL_USER,

          to:
            email,

          subject:
            "Reset your password",

          html: `
            <p>You requested to reset your password.</p>
            <p>Click the link below to continue:</p>
            <a href="${resetLink}">
              ${resetLink}
            </a>
          `,
        }
      );

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
    const {
      token,
    } = req.params;

    const {
      password,
    } = req.body;

    if (!token) {
      return res
        .status(400)
        .json({
          message:
            "Reset token is required",
        });
    }

    if (
      !isStrongPassword(
        password
      )
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
        result.rows
          .length === 0
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
// AWS SSH TEST
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
        success:
          true,

        output:
          result.stdout,
      });
    } catch (error) {
      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "AWS connection failed",

          error:
            error.message,
        });
    }
  }
);

// =====================================================
// AWS SCP TEST
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
        success:
          true,

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
          success:
            false,

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
      name:
        "frontImage",

      maxCount:
        1,
    },

    {
      name:
        "backImage",

      maxCount:
        1,
    },

    {
      name:
        "sideImage",

      maxCount:
        1,
    },
  ]),

  async (req, res) => {
    let frontPath =
      null;

    let backPath =
      null;

    let sidePath =
      null;

    let localMeasurementsPath =
      null;

    let remoteFront =
      null;

    let remoteBack =
      null;

    let remoteSide =
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

      // -----------------------------------------------
      // Validate all images exist
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

      // =================================================
      // TIMER 1
      // FR19 PHOTO PREPARATION
      // =================================================

      console.time(
        "1. Photo preparation"
      );

      const frontPrepared =
        await prepareImageResolution(
          frontImage.buffer
        );

      const sidePrepared =
        await prepareImageResolution(
          sideImage.buffer
        );

      const backPrepared =
        await prepareImageResolution(
          backImage.buffer
        );

      console.timeEnd(
        "1. Photo preparation"
      );

      // -----------------------------------------------
      // Find failed images
      // -----------------------------------------------

      const failedImages =
        [];

      if (
        !frontPrepared.passed
      ) {
        failedImages.push(
          {
            image:
              "Front",

            width:
              frontPrepared.width,

            height:
              frontPrepared.height,
          }
        );
      }

      if (
        !sidePrepared.passed
      ) {
        failedImages.push(
          {
            image:
              "Side",

            width:
              sidePrepared.width,

            height:
              sidePrepared.height,
          }
        );
      }

      if (
        !backPrepared.passed
      ) {
        failedImages.push(
          {
            image:
              "Back",

            width:
              backPrepared.width,

            height:
              backPrepared.height,
          }
        );
      }

      if (
        failedImages.length >
        0
      ) {
        return res
          .status(400)
          .json({
            message:
              "One or more photos are too low-resolution to process reliably.",

            minimumRecommendedResolution:
              "480 × 854 pixels",

            failedImages,
          });
      }

      console.log(
        "Photo resolution validation passed"
      );

      console.log(
        "Front adjusted:",
        frontPrepared.adjusted
      );

      console.log(
        "Side adjusted:",
        sidePrepared.adjusted
      );

      console.log(
        "Back adjusted:",
        backPrepared.adjusted
      );

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
        ].includes(
          gender
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              "Gender must be male or female",
          });
      }

      // -----------------------------------------------
      // Unique output names
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
      // Save prepared files locally
      // -----------------------------------------------

      frontPath =
        saveTempBufferToFile(
          frontPrepared.buffer,

          `front_${timestamp}.jpg`
        );

      sidePath =
        saveTempBufferToFile(
          sidePrepared.buffer,

          `side_${timestamp}.jpg`
        );

      backPath =
        saveTempBufferToFile(
          backPrepared.buffer,

          `back_${timestamp}.jpg`
        );

      // -----------------------------------------------
      // AWS temporary paths
      // -----------------------------------------------

      remoteFront =
        `${AWS_PARE_DIR}/incoming_front_${timestamp}.jpg`;

      remoteSide =
        `${AWS_PARE_DIR}/incoming_side_${timestamp}.jpg`;

      remoteBack =
        `${AWS_PARE_DIR}/incoming_back_${timestamp}.jpg`;

      // =================================================
      // TIMER 2
      // AWS UPLOAD
      // =================================================

      console.time(
        "2. AWS upload"
      );

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

      console.timeEnd(
        "2. AWS upload"
      );

      console.log(
        "Uploaded avatar images to AWS successfully"
      );

      // -----------------------------------------------
      // AWS PARE command
      // -----------------------------------------------

      const remoteCommand =
        [
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
        ].join(
          " && "
        );

      console.log(
        "Gender being sent to AWS:",
        gender
      );

      console.log(
        "AWS command:",
        remoteCommand
      );

      // =================================================
      // TIMER 3
      // PARE + SMPL PIPELINE
      // =================================================

      console.time(
        "3. PARE pipeline"
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

      console.timeEnd(
        "3. PARE pipeline"
      );

      console.log(
        "AWS avatar pipeline completed successfully"
      );

      console.log(
        awsResult.stdout
      );

      // -----------------------------------------------
      // Remote result paths
      // -----------------------------------------------

      const remoteAvatarPath =
        `${AWS_PARE_DIR}/pipeline_final_output/avatar.obj`;

      const remoteMeasurementsPath =
        `${AWS_PARE_DIR}/pipeline_final_output/measurements.json`;

      // =================================================
      // TIMER 4
      // DOWNLOAD RESULTS
      // =================================================

      console.time(
        "4. Result download"
      );

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

      console.timeEnd(
        "4. Result download"
      );

      // -----------------------------------------------
      // Read measurements
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
        sidePath
      );

      removeFileIfExists(
        backPath
      );

      frontPath =
        null;

      sidePath =
        null;

      backPath =
        null;

      // -----------------------------------------------
      // AWS cleanup
      // -----------------------------------------------

      await removeAWSFiles(
        [
          remoteFront,
          remoteSide,
          remoteBack,
        ]
      );

      // -----------------------------------------------
      // Build avatar URL
      // -----------------------------------------------

      const avatarBaseUrl =
        BACKEND_PUBLIC_URL.replace(
          /\/$/,
          ""
        );

      const avatarUrl =
        `${avatarBaseUrl}/generated-avatars/${avatarFilename}`;

      // -----------------------------------------------
      // Return result
      // -----------------------------------------------

      return res
        .status(200)
        .json({
          message:
            "Avatar generated successfully",

          avatarUrl,

          measurements,

          photoQuality: {
            resolutionPassed:
              true,

            frontAdjusted:
              frontPrepared.adjusted,

            sideAdjusted:
              sidePrepared.adjusted,

            backAdjusted:
              backPrepared.adjusted,
          },

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
      // Cleanup after error
      // -----------------------------------------------

      removeFileIfExists(
        frontPath
      );

      removeFileIfExists(
        sidePath
      );

      removeFileIfExists(
        backPath
      );

      removeFileIfExists(
        localMeasurementsPath
      );

      await removeAWSFiles(
        [
          remoteFront,
          remoteSide,
          remoteBack,
        ].filter(
          Boolean
        )
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
// MOCK FIT ANALYSIS
// =====================================================

app.post(
  "/fit-analysis",

  (req, res) => {
    res.json({
      bodyRegions: [
        {
          name:
            "Chest",

          status:
            "Tight",
        },

        {
          name:
            "Waist",

          status:
            "Perfect",
        },

        {
          name:
            "Hip",

          status:
            "Loose",
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
  process.env.PORT ||
  3000;

app.listen(
  PORT,

  "0.0.0.0",

  () => {
    console.log(
      `Server running on port ${PORT}`
    );
  }
);