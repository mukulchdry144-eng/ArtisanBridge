const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { getRepo } = require("../storage/repo");

const router = express.Router();
const ORDER_STATUSES = new Set(["requested", "in_progress", "delivered", "completed", "cancelled"]);
const USER_ROLES = new Set(["client", "freelancer", "admin"]);

router.use(requireAuth);

async function loadUser(req, res, next) {
  try {
    const repo = getRepo();
    const user = await repo.findUserById(req.user.id);
    if (!user) return res.status(401).json({ error: "User not found" });
    const role = USER_ROLES.has(user.role) ? user.role : "client";
    req.authUser = { ...user, role };
    return next();
  } catch (err) {
    return next(err);
  }
}

function requireClient(req, res, next) {
  if (req.authUser.role !== "client") {
    return res.status(403).json({ error: "Client dashboard access required" });
  }
  return next();
}

function requireFreelancer(req, res, next) {
  if (req.authUser.role !== "freelancer") {
    return res.status(403).json({ error: "Freelancer dashboard access required" });
  }
  return next();
}

router.use(loadUser);

router.get("/overview", async (req, res, next) => {
  try {
    const repo = getRepo();
    const dashboard =
      req.authUser.role === "freelancer"
        ? await repo.getFreelancerDashboard(req.authUser.id)
        : await repo.getClientDashboard(req.authUser.id);

    return res.json({
      user: {
        id: req.authUser.id,
        email: req.authUser.email,
        name: req.authUser.name || "",
        role: req.authUser.role || "client"
      },
      ...dashboard
    });
  } catch (err) {
    return next(err);
  }
});

router.get("/artists", async (req, res, next) => {
  try {
    const repo = getRepo();
    const artists = await repo.listArtists();
    return res.json(artists);
  } catch (err) {
    return next(err);
  }
});

router.post("/contact", requireClient, async (req, res, next) => {
  try {
    const { artistId, subject, message, projectTitle, budget, timeline } = req.body || {};
    if (!artistId) return res.status(400).json({ error: "artistId is required" });
    if (!String(message || "").trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const repo = getRepo();
    const result = await repo.createContactMessage(req.authUser.id, {
      artistId,
      subject,
      message,
      projectTitle,
      budget,
      timeline
    });

    if (result.notFound) return res.status(404).json({ error: "Artist not found" });
    return res.status(201).json(result.message);
  } catch (err) {
    return next(err);
  }
});

router.post("/orders", requireClient, async (req, res, next) => {
  try {
    const { artistId, title, description, category, price, deliveryDate } = req.body || {};
    const cleanTitle = String(title || "").trim();
    const cleanPrice = Number(price || 0);

    if (!artistId) return res.status(400).json({ error: "artistId is required" });
    if (!cleanTitle) return res.status(400).json({ error: "Order title is required" });
    if (Number.isNaN(cleanPrice) || cleanPrice < 0) {
      return res.status(400).json({ error: "Order price must be valid" });
    }

    const repo = getRepo();
    const result = await repo.createMarketOrder(req.authUser.id, {
      artistId,
      title: cleanTitle,
      description,
      category,
      price: cleanPrice,
      deliveryDate
    });

    if (result.notFound) return res.status(404).json({ error: "Artist not found" });
    return res.status(201).json(result.order);
  } catch (err) {
    return next(err);
  }
});

router.patch("/orders/:id", async (req, res, next) => {
  try {
    const status = req.body?.status;
    if (status !== undefined && !ORDER_STATUSES.has(String(status).trim().toLowerCase())) {
      return res.status(400).json({ error: "Invalid order status" });
    }

    const repo = getRepo();
    const result = await repo.updateMarketOrder(req.authUser.id, req.params.id, { status });
    if (result.notFound) return res.status(404).json({ error: "Order not found" });
    return res.json(result.order);
  } catch (err) {
    return next(err);
  }
});

router.patch("/messages/:id/read", requireFreelancer, async (req, res, next) => {
  try {
    const repo = getRepo();
    const result = await repo.markContactMessageRead(req.authUser.id, req.params.id);
    if (result.notFound) return res.status(404).json({ error: "Message not found" });
    return res.json(result.message);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
