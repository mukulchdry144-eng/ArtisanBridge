const jwt = require("jsonwebtoken");
const { getJwtSecret } = require("../config");
const { getRepo } = require("../storage/repo");

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [, token] = header.split(" ");
  if (!token) return res.status(401).json({ error: "Missing Bearer token" });

  let payload;
  try {
    payload = jwt.verify(token, getJwtSecret());
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  try {
    const repo = getRepo();
    const user = await repo.findUserById(payload.sub);
    if (!user) return res.status(401).json({ error: "User not found" });
    if (String(user.status || "active").toLowerCase() !== "active") {
      return res.status(403).json({ error: "Account is inactive" });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role || "client",
      status: user.status || "active"
    };
    return next();
  } catch (err) {
    return next(err);
  }
}

async function requireAdmin(req, res, next) {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Admin access required" });
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = { requireAuth, requireAdmin };
