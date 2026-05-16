const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const { getRepo, getStorageInfo, initStorage } = require("../src/storage/repo");

const COLLECTIONS = [
  "users",
  "todos",
  "inquiries",
  "emaillogs",
  "notifications",
  "marketorders",
  "contactmessages"
];

async function closeConnections() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

async function countCollections() {
  const counts = {};
  for (const name of COLLECTIONS) {
    counts[name] = await mongoose.connection.db.collection(name).countDocuments();
  }
  return counts;
}

async function main() {
  await initStorage();
  const storage = getStorageInfo();

  if (storage.kind !== "mongo") {
    throw new Error(
      `Backend is using ${storage.kind} storage (${storage.reason}). Set STORAGE_DRIVER=mongo or remove STORAGE_DRIVER when MONGO_URI is set.`
    );
  }

  const repo = getRepo();
  const marker = `mongo-check-${Date.now()}-${process.pid}`;
  let notificationId = "";

  try {
    const before = await countCollections();
    const notification = await repo.createNotification({
      title: marker,
      message: "Temporary MongoDB write check. This record should be deleted by the check script.",
      type: "health_check",
      audience: "admin"
    });
    notificationId = notification.id;

    const found = await mongoose.connection.db
      .collection("notifications")
      .findOne({ _id: new mongoose.Types.ObjectId(notificationId), title: marker });
    if (!found) throw new Error("MongoDB write check failed: inserted notification was not found");

    await mongoose.connection.db
      .collection("notifications")
      .deleteOne({ _id: new mongoose.Types.ObjectId(notificationId) });
    notificationId = "";

    const after = await countCollections();
    console.log(JSON.stringify({ ok: true, storage, counts: { before, after } }, null, 2));
  } finally {
    if (notificationId) {
      await mongoose.connection.db
        .collection("notifications")
        .deleteOne({ _id: new mongoose.Types.ObjectId(notificationId) })
        .catch(() => {});
    }
    await mongoose.connection.db
      .collection("notifications")
      .deleteMany({ title: marker })
      .catch(() => {});
    await closeConnections();
  }
}

main().catch((err) => {
  console.error(`Mongo check failed: ${err.message}`);
  closeConnections().finally(() => process.exit(1));
});
