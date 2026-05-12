const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const { getCorsOptions, isProduction } = require("./config");
const { initStorage } = require("./storage/repo");
const authRoutes = require("./routes/auth");
const todosRoutes = require("./routes/todos");
const adminRoutes = require("./routes/admin");
const inquiryRoutes = require("./routes/inquiries");
const dashboardRoutes = require("./routes/dashboard");

const app = express();

app.use(morgan(isProduction() ? "combined" : "dev"));
app.use(express.json({ limit: "1mb" }));

app.use(cors(getCorsOptions()));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.use("/api", async (_req, _res, next) => {
  try {
    await initStorage();
    next();
  } catch (err) {
    next(err);
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/todos", todosRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);

const buildDir = path.join(__dirname, "..", "..", "frontend", "build");
const indexHtml = path.join(buildDir, "index.html");
if (fs.existsSync(indexHtml)) {
  app.use(express.static(buildDir));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) return next();
    res.sendFile(indexHtml, (err) => {
      if (err) next(err);
    });
  });
}

// Error handler (last)
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

module.exports = app;
