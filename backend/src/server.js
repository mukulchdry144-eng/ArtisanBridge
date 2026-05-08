const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = require("./app");
const { validateRuntimeConfig } = require("./config");
const { initStorage } = require("./storage/repo");

const port = Number(process.env.PORT || 5000);

async function start() {
  validateRuntimeConfig();
  await initStorage();
  app.listen(port, () => {
    console.log(`Backend running on http://localhost:${port}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
