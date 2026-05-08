const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { requireAuth } = require("../middleware/auth");
const { getJwtSecret } = require("../config");
const { getRepo } = require("../storage/repo");
const { logAndSendEmail, notifyUserRegistration } = require("../services/notifications");

const router = express.Router();

const PUBLIC_ROLES = new Set(["client", "freelancer"]);

function signToken(userId) {
  return jwt.sign(
    { sub: String(userId) },
    getJwtSecret(),
    { expiresIn: "7d" }
  );
}

function safePublicRole(role) {
  const cleanRole = String(role || "").trim().toLowerCase();
  return PUBLIC_ROLES.has(cleanRole) ? cleanRole : null;
}

function authPayload(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role || "client"
  };
}

router.post("/register", async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    if (!normalizedEmail.includes("@")) {
      return res.status(400).json({ error: "Invalid email" });
    }

    const passwordStr = String(password);
    if (passwordStr.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    const publicRole = safePublicRole(role);
    if (!publicRole) {
      return res.status(400).json({ error: "Please choose Hire Talent or Find Work" });
    }

    const hashed = await bcrypt.hash(passwordStr, 10);

    const repo = getRepo();
    const result = await repo.createUser({
      email: normalizedEmail,
      passwordHash: hashed,
      name: name ? String(name).trim() : "",
      role: publicRole
    });

    if (result.conflict) return res.status(409).json({ error: "Email already registered" });

    await notifyUserRegistration(result.user);

    const token = signToken(result.user.id);
    return res.status(201).json({
      token,
      user: authPayload(result.user)
    });
  } catch (err) {
    return next(err);
  }
});

async function loginWithEmailPassword(req, res, next, { adminOnly = false } = {}) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const repo = getRepo();
    const user = await repo.findUserByEmail(normalizedEmail);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    if (String(user.status || "active").toLowerCase() !== "active") {
      return res.status(403).json({ error: "Account is inactive" });
    }
    if (adminOnly && user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    if (typeof repo.touchUserLogin === "function") {
      await repo.touchUserLogin(user.id);
    }

    const token = signToken(user.id);
    return res.json({
      token,
      user: authPayload(user)
    });
  } catch (err) {
    return next(err);
  }
}

router.post("/login", (req, res, next) => {
  return loginWithEmailPassword(req, res, next);
});

router.post("/forgot-password", async (req, res, next) => {
  try {
    const normalizedEmail = String(req.body?.email || "").trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      return res.status(400).json({ error: "A valid email is required" });
    }

    const repo = getRepo();
    const user = await repo.findUserByEmail(normalizedEmail);

    if (user) {
      await repo.createNotification({
        title: "Password reset requested",
        message: `${user.email} requested help resetting their password.`,
        type: "password_reset",
        audience: "admin",
        userId: user.id
      });

      await logAndSendEmail({
        to: user.email,
        subject: "ArtisanBridge password help",
        type: "password_reset",
        userId: user.id,
        body: `Hi ${user.name || "there"},

We received a password help request for your ArtisanBridge account.

For this local project build, the admin team has been notified and can help verify your account and reset access safely.

If you did not request this, you can ignore this message.`
      });
    }

    return res.json({
      message: "If an account exists for this email, password help instructions have been sent."
    });
  } catch (err) {
    return next(err);
  }
});

router.post("/admin-login", (req, res, next) => {
  return loginWithEmailPassword(req, res, next, { adminOnly: true });
});

router.get("/me", requireAuth, (req, res) => {
  return res.json(authPayload(req.user));
});

module.exports = router;
