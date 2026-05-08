const express = require("express");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const { getRepo } = require("../storage/repo");

const router = express.Router();
const ROLES = new Set(["client", "freelancer", "admin"]);
const STATUSES = new Set(["active", "inactive"]);
const INQUIRY_STATUSES = new Set(["new", "contacted", "qualified", "closed"]);

router.use(requireAuth, requireAdmin);

router.get("/overview", async (req, res, next) => {
  try {
    const repo = getRepo();
    const overview = await repo.getAdminOverview();
    return res.json(overview);
  } catch (err) {
    return next(err);
  }
});

router.get("/users", async (req, res, next) => {
  try {
    const repo = getRepo();
    const users = await repo.listUsers({
      search: req.query.search,
      role: req.query.role,
      status: req.query.status
    });
    return res.json(users);
  } catch (err) {
    return next(err);
  }
});

router.get("/inquiries", async (req, res, next) => {
  try {
    const repo = getRepo();
    const inquiries = await repo.listInquiries({
      search: req.query.search,
      status: req.query.status
    });
    return res.json(inquiries);
  } catch (err) {
    return next(err);
  }
});

router.patch("/inquiries/:id", async (req, res, next) => {
  try {
    const nextStatus = req.body?.status;
    if (nextStatus !== undefined) {
      const status = String(nextStatus).trim().toLowerCase();
      if (!INQUIRY_STATUSES.has(status)) return res.status(400).json({ error: "Invalid status" });
    }

    const repo = getRepo();
    const result = await repo.updateInquiryAdmin(req.params.id, { status: nextStatus });
    if (result.notFound) return res.status(404).json({ error: "Inquiry not found" });
    return res.json(result.inquiry);
  } catch (err) {
    return next(err);
  }
});

router.get("/emails", async (req, res, next) => {
  try {
    const repo = getRepo();
    const emails = await repo.listEmailLogs({ status: req.query.status });
    return res.json(emails);
  } catch (err) {
    return next(err);
  }
});

router.get("/notifications", async (req, res, next) => {
  try {
    const repo = getRepo();
    const notifications = await repo.listNotifications();
    return res.json(notifications);
  } catch (err) {
    return next(err);
  }
});

router.patch("/users/:id", async (req, res, next) => {
  try {
    const nextRole = req.body?.role;
    const nextStatus = req.body?.status;
    const updates = {};

    if (nextRole !== undefined) {
      const role = String(nextRole).trim().toLowerCase();
      if (!ROLES.has(role)) return res.status(400).json({ error: "Invalid role" });
      updates.role = role;
    }

    if (nextStatus !== undefined) {
      const status = String(nextStatus).trim().toLowerCase();
      if (!STATUSES.has(status)) return res.status(400).json({ error: "Invalid status" });
      updates.status = status;
    }

    if (String(req.params.id) === String(req.user.id)) {
      if (updates.role && updates.role !== "admin") {
        return res.status(400).json({ error: "You cannot remove your own admin role" });
      }
      if (updates.status && updates.status !== "active") {
        return res.status(400).json({ error: "You cannot deactivate your own admin account" });
      }
    }

    const repo = getRepo();
    const result = await repo.updateUserAdmin(req.params.id, updates);
    if (result.notFound) return res.status(404).json({ error: "User not found" });
    return res.json(result.user);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
