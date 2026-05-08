const DEV_JWT_SECRET = "dev_secret_change_me";

function isProduction() {
  return process.env.NODE_ENV === "production";
}

function splitEnvList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getJwtSecret() {
  const secret = String(process.env.JWT_SECRET || "").trim();

  if (!secret) {
    if (isProduction()) {
      throw new Error("JWT_SECRET is required when NODE_ENV=production");
    }
    return DEV_JWT_SECRET;
  }

  if (isProduction() && secret === DEV_JWT_SECRET) {
    throw new Error("JWT_SECRET must be changed before running in production");
  }

  return secret;
}

function getCorsOptions() {
  const configuredOrigins = splitEnvList(
    process.env.FRONTEND_ORIGINS || process.env.FRONTEND_ORIGIN
  );
  const defaultOrigins = ["http://localhost:3000", "http://127.0.0.1:3000"];
  const allowedOrigins = configuredOrigins.length ? configuredOrigins : defaultOrigins;

  return {
    origin(origin, callback) {
      if (!origin) return callback(null, false);
      if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: false
  };
}

function validateRuntimeConfig() {
  getJwtSecret();
}

module.exports = {
  DEV_JWT_SECRET,
  getCorsOptions,
  getJwtSecret,
  isProduction,
  splitEnvList,
  validateRuntimeConfig
};
