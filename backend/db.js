const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on("error", (error) => {
  console.error("PostgreSQL pool idle client error:", error);
});

const TRANSIENT_CONNECTION_CODES = new Set([
  "ECONNRESET",
  "ECONNREFUSED",
  "EPIPE",
  "ETIMEDOUT",
  "08001",
  "08003",
  "08006",
  "57P01",
]);

const isTransientConnectionError = (error) => {
  return Boolean(
    error &&
      (TRANSIENT_CONNECTION_CODES.has(error.code) ||
        /connection terminated unexpectedly|connection reset/i.test(
          error.message || ""
        ))
  );
};

const sleep = (milliseconds) =>
  new Promise((resolve) =>
    setTimeout(resolve, milliseconds)
  );

const queryWithRetry = async (
  text,
  values = [],
  options = {}
) => {
  const maxRetries = options.maxRetries ?? 2;
  let attempt = 0;

  while (true) {
    try {
      return await pool.query(text, values);
    } catch (error) {
      if (
        !isTransientConnectionError(error) ||
        attempt >= maxRetries
      ) {
        throw error;
      }

      attempt += 1;
      await sleep(100 * 2 ** (attempt - 1));
    }
  }
};

module.exports = pool;
module.exports.queryWithRetry = queryWithRetry;
module.exports.isTransientConnectionError =
  isTransientConnectionError;
