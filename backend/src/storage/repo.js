const fileRepo = require("./fileRepo");
const mongoRepo = require("./mongoRepo");

let selected = null;

function chooseRepo() {
  if (selected) return selected;
  const forcedDriver = String(process.env.STORAGE_DRIVER || "").trim().toLowerCase();
  if (forcedDriver === "file") {
    selected = { kind: "file", repo: fileRepo };
  } else if (forcedDriver === "mongo" || process.env.MONGO_URI) {
    selected = { kind: "mongo", repo: mongoRepo };
  } else {
    selected = { kind: "file", repo: fileRepo };
  }
  return selected;
}

async function initStorage() {
  const chosen = chooseRepo();
  if (chosen.kind === "mongo") {
    const dbName = process.env.MONGO_DB_NAME || "finalproject";
    await mongoRepo.connect(process.env.MONGO_URI, dbName);
    console.log(`Database: MongoDB connected (db=${dbName})`);
  } else {
    console.log("Database: file db.json (no MONGO_URI set)");
  }
}

function getRepo() {
  return chooseRepo().repo;
}

module.exports = { initStorage, getRepo };
