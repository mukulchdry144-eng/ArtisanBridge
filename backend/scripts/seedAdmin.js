const path = require("path");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const { initStorage, getRepo } = require("../src/storage/repo");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const DEFAULT_EMAIL = "admin@artisanbridge.com";
const DEFAULT_PASSWORD = "";

async function closeConnections() {
  try {
    const mongoose = require("mongoose");
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  } catch {
    // No Mongo connection to close.
  }
}

async function main() {
  const email = String(process.env.ADMIN_EMAIL || DEFAULT_EMAIL).trim().toLowerCase();
  const password = String(process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD);
  const name = String(process.env.ADMIN_NAME || "ArtisanBridge Admin").trim();

  if (!email.includes("@")) {
    throw new Error("ADMIN_EMAIL must be a valid email address");
  }
  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters");
  }

  await initStorage();
  const repo = getRepo();
  const passwordHash = await bcrypt.hash(password, 10);
  const result = await repo.upsertAdminUser({ email, passwordHash, name });

  console.log(`${result.created ? "Created" : "Updated"} admin user: ${result.user.email}`);
  console.log(`Login at /admin/login with ${result.user.email}`);
  await closeConnections();
}

main().catch((err) => {
  console.error("Admin seed failed:", err.message);
  closeConnections().finally(() => {
    process.exit(1);
  });
});
