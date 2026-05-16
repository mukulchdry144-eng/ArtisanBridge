const app = require("./app");
const { validateRuntimeConfig } = require("./config");
const { initStorage } = require("./storage/repo");

const port = Number(process.env.PORT || 5000);

function listen(appInstance, requestedPort) {
  return new Promise((resolve, reject) => {
    const server = appInstance.listen(requestedPort, () => {
      resolve(server);
    });

    server.once("error", (err) => {
      if (err.code === "EADDRINUSE") {
        err.message = `Port ${requestedPort} is already in use. Stop the existing backend process or set PORT to another value.`;
      }
      reject(err);
    });
  });
}

async function start() {
  validateRuntimeConfig();
  await initStorage();
  await listen(app, port);
  console.log(`Backend running on http://localhost:${port}`);
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
