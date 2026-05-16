const fileRepo = require("./fileRepo");
const mongoRepo = require("./mongoRepo");

let selected = null;
let initPromise = null;

function getMongoTarget() {
  const dbName = process.env.MONGO_DB_NAME || "finalproject";
  try {
    const parsed = new URL(process.env.MONGO_URI || "");
    return {
      host: parsed.host || "",
      dbName,
      uriDbName: parsed.pathname.replace(/^\/+/, "") || ""
    };
  } catch {
    return { host: "", dbName, uriDbName: "" };
  }
}

function chooseRepo() {
  if (selected) return selected;
  const forcedDriver = String(process.env.STORAGE_DRIVER || "").trim().toLowerCase();
  if (forcedDriver && !["file", "mongo"].includes(forcedDriver)) {
    throw new Error("STORAGE_DRIVER must be either file or mongo");
  }

  if (forcedDriver === "file") {
    selected = { kind: "file", repo: fileRepo, reason: "STORAGE_DRIVER=file" };
  } else if (forcedDriver === "mongo" || process.env.MONGO_URI) {
    selected = {
      kind: "mongo",
      repo: mongoRepo,
      reason: forcedDriver === "mongo" ? "STORAGE_DRIVER=mongo" : "MONGO_URI set"
    };
  } else {
    selected = { kind: "file", repo: fileRepo, reason: "no MONGO_URI set" };
  }
  return selected;
}

async function initStorage() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const chosen = chooseRepo();
    if (chosen.kind === "mongo") {
      const { dbName, host } = getMongoTarget();
      await mongoRepo.connect(process.env.MONGO_URI, dbName);
      console.log(`Database: MongoDB connected (host=${host || "unknown"}, db=${dbName})`);
    } else {
      console.log(`Database: file db.json (${chosen.reason})`);
      if (process.env.MONGO_URI) {
        console.warn("Database: MONGO_URI is set but ignored because STORAGE_DRIVER=file");
      }
    }
  })().catch((err) => {
    initPromise = null;
    throw err;
  });

  return initPromise;
}

function getRepo() {
  return chooseRepo().repo;
}

function getStorageInfo() {
  const chosen = chooseRepo();
  const info = {
    kind: chosen.kind,
    reason: chosen.reason
  };

  if (chosen.kind === "mongo") {
    const { host, dbName, uriDbName } = getMongoTarget();
    info.host = host;
    info.dbName = dbName;
    if (uriDbName && uriDbName !== dbName) info.uriDbName = uriDbName;
  }

  return info;
}

module.exports = { getRepo, getStorageInfo, initStorage };
