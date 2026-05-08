const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "..", "data", "db.json");

let writeChain = Promise.resolve();

async function ensureDbFile() {
  await fs.promises.mkdir(path.dirname(DB_PATH), { recursive: true });
  try {
    await fs.promises.access(DB_PATH, fs.constants.F_OK);
  } catch {
    const initial = {
      counters: {
        userId: 1,
        todoId: 1,
        inquiryId: 1,
        emailId: 1,
        notificationId: 1,
        marketOrderId: 1,
        contactMessageId: 1
      },
      users: [],
      todos: [],
      inquiries: [],
      emailLogs: [],
      notifications: [],
      marketOrders: [],
      contactMessages: []
    };
    await fs.promises.writeFile(DB_PATH, JSON.stringify(initial, null, 2), "utf8");
  }
}

async function readDb() {
  await ensureDbFile();
  const raw = await fs.promises.readFile(DB_PATH, "utf8");
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") throw new Error("Invalid db.json");
    parsed.counters ||= { userId: 1, todoId: 1 };
    parsed.counters.inquiryId ||= 1;
    parsed.counters.emailId ||= 1;
    parsed.counters.notificationId ||= 1;
    parsed.counters.marketOrderId ||= 1;
    parsed.counters.contactMessageId ||= 1;
    parsed.users ||= [];
    parsed.todos ||= [];
    parsed.inquiries ||= [];
    parsed.emailLogs ||= [];
    parsed.notifications ||= [];
    parsed.marketOrders ||= [];
    parsed.contactMessages ||= [];
    return parsed;
  } catch {
    const reset = {
      counters: {
        userId: 1,
        todoId: 1,
        inquiryId: 1,
        emailId: 1,
        notificationId: 1,
        marketOrderId: 1,
        contactMessageId: 1
      },
      users: [],
      todos: [],
      inquiries: [],
      emailLogs: [],
      notifications: [],
      marketOrders: [],
      contactMessages: []
    };
    await fs.promises.writeFile(DB_PATH, JSON.stringify(reset, null, 2), "utf8");
    return reset;
  }
}

function writeDb(nextDb) {
  writeChain = writeChain.then(async () => {
    await ensureDbFile();
    const tmpPath = `${DB_PATH}.tmp`;
    await fs.promises.writeFile(tmpPath, JSON.stringify(nextDb, null, 2), "utf8");
    await fs.promises.rename(tmpPath, DB_PATH);
  });
  return writeChain;
}

async function mutateDb(mutator) {
  const db = await readDb();
  const result = await mutator(db);
  await writeDb(db);
  return result;
}

module.exports = {
  DB_PATH,
  mutateDb,
  readDb
};
