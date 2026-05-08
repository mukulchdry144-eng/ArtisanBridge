const express = require("express");
const { getRepo } = require("../storage/repo");
const { notifyInquiry } = require("../services/notifications");

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const { name, email, phone, role, category, budget, timeline, message } = req.body || {};
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const cleanMessage = String(message || "").trim();

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      return res.status(400).json({ error: "A valid email is required" });
    }
    if (!cleanMessage) {
      return res.status(400).json({ error: "Please add a short message" });
    }

    const repo = getRepo();
    const inquiry = await repo.createInquiry({
      name,
      email: normalizedEmail,
      phone,
      role,
      category,
      budget,
      timeline,
      message: cleanMessage
    });

    await notifyInquiry(inquiry);
    return res.status(201).json(inquiry);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
