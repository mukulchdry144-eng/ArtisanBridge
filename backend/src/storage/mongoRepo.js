const dns = require("dns");
const mongoose = require("mongoose");

let models = null;

const ROLES = new Set(["client", "freelancer", "admin"]);
const STATUSES = new Set(["active", "inactive"]);
const INQUIRY_STATUSES = new Set(["new", "contacted", "qualified", "closed"]);
const ORDER_STATUSES = new Set(["requested", "in_progress", "delivered", "completed", "cancelled"]);
const CONTACT_STATUSES = new Set(["new", "read", "replied", "archived"]);
const EARNING_STATUSES = new Set(["in_progress", "delivered", "completed"]);

const ARTIST_FALLBACKS = [
  {
    category: "Illustration",
    specialty: "Editorial artwork",
    location: "Remote studio",
    baseRate: 4200,
    responseTime: "2 hours"
  },
  {
    category: "Brand design",
    specialty: "Logo systems",
    location: "Jaipur, IN",
    baseRate: 6800,
    responseTime: "4 hours"
  },
  {
    category: "Handmade craft",
    specialty: "Custom decor",
    location: "Delhi, IN",
    baseRate: 3500,
    responseTime: "1 day"
  },
  {
    category: "Digital painting",
    specialty: "Portrait commissions",
    location: "Bengaluru, IN",
    baseRate: 5200,
    responseTime: "3 hours"
  }
];

function normalizeRole(role) {
  const cleanRole = String(role || "client").trim().toLowerCase();
  return ROLES.has(cleanRole) ? cleanRole : "client";
}

function normalizeStatus(status) {
  const cleanStatus = String(status || "active").trim().toLowerCase();
  return STATUSES.has(cleanStatus) ? cleanStatus : "active";
}

function normalizeInquiryStatus(status) {
  const cleanStatus = String(status || "new").trim().toLowerCase();
  return INQUIRY_STATUSES.has(cleanStatus) ? cleanStatus : "new";
}

function normalizeOrderStatus(status) {
  const cleanStatus = String(status || "requested").trim().toLowerCase();
  return ORDER_STATUSES.has(cleanStatus) ? cleanStatus : "requested";
}

function normalizeContactStatus(status) {
  const cleanStatus = String(status || "new").trim().toLowerCase();
  return CONTACT_STATUSES.has(cleanStatus) ? cleanStatus : "new";
}

function dateKey(date) {
  return date.toISOString().slice(0, 10);
}

function monthKey(date) {
  return date.toISOString().slice(0, 7);
}

function monthLabel(date) {
  return date.toLocaleDateString("en", { month: "short" });
}

function isMongoId(value) {
  return mongoose.Types.ObjectId.isValid(String(value || ""));
}

function getModels() {
  if (models) return models;

  const userSchema = new mongoose.Schema(
    {
      email: { type: String, required: true, unique: true, index: true, trim: true, lowercase: true },
      passwordHash: { type: String, required: true },
      name: { type: String, default: "", trim: true },
      role: { type: String, enum: Array.from(ROLES), default: "client" },
      status: { type: String, enum: Array.from(STATUSES), default: "active" },
      lastLoginAt: { type: Date },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date }
    },
    { versionKey: false }
  );

  const todoSchema = new mongoose.Schema(
    {
      userId: { type: String, required: true, index: true },
      title: { type: String, required: true, trim: true },
      completed: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date }
    },
    { versionKey: false }
  );

  const inquirySchema = new mongoose.Schema(
    {
      name: { type: String, default: "", trim: true },
      email: { type: String, required: true, index: true, trim: true, lowercase: true },
      phone: { type: String, default: "", trim: true },
      role: { type: String, enum: Array.from(ROLES), default: "client" },
      category: { type: String, default: "", trim: true },
      budget: { type: String, default: "", trim: true },
      timeline: { type: String, default: "", trim: true },
      message: { type: String, default: "", trim: true },
      status: { type: String, enum: Array.from(INQUIRY_STATUSES), default: "new", index: true },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date }
    },
    { versionKey: false }
  );

  const emailLogSchema = new mongoose.Schema(
    {
      to: { type: String, required: true, index: true, trim: true },
      subject: { type: String, default: "", trim: true },
      body: { type: String, default: "" },
      type: { type: String, default: "general", index: true, trim: true },
      status: { type: String, default: "queued", index: true, trim: true },
      error: { type: String, default: "" },
      userId: { type: String },
      inquiryId: { type: String },
      createdAt: { type: Date, default: Date.now }
    },
    { versionKey: false }
  );

  const notificationSchema = new mongoose.Schema(
    {
      title: { type: String, default: "", trim: true },
      message: { type: String, default: "", trim: true },
      type: { type: String, default: "info", index: true, trim: true },
      audience: { type: String, default: "admin", index: true, trim: true },
      userId: { type: String },
      inquiryId: { type: String },
      readAt: { type: Date },
      createdAt: { type: Date, default: Date.now }
    },
    { versionKey: false }
  );

  const marketOrderSchema = new mongoose.Schema(
    {
      clientId: { type: String, required: true, index: true },
      artistId: { type: String, required: true, index: true },
      title: { type: String, required: true, trim: true },
      description: { type: String, default: "", trim: true },
      category: { type: String, default: "", trim: true },
      price: { type: Number, default: 0 },
      status: { type: String, enum: Array.from(ORDER_STATUSES), default: "requested", index: true },
      deliveryDate: { type: String, trim: true },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date }
    },
    { versionKey: false }
  );

  const contactMessageSchema = new mongoose.Schema(
    {
      clientId: { type: String, required: true, index: true },
      artistId: { type: String, required: true, index: true },
      subject: { type: String, default: "Project inquiry", trim: true },
      message: { type: String, required: true, trim: true },
      projectTitle: { type: String, default: "", trim: true },
      budget: { type: String, default: "", trim: true },
      timeline: { type: String, default: "", trim: true },
      status: { type: String, enum: Array.from(CONTACT_STATUSES), default: "new", index: true },
      readAt: { type: Date },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date }
    },
    { versionKey: false }
  );

  const User = mongoose.models.User || mongoose.model("User", userSchema);
  const Todo = mongoose.models.Todo || mongoose.model("Todo", todoSchema);
  const Inquiry = mongoose.models.Inquiry || mongoose.model("Inquiry", inquirySchema);
  const EmailLog = mongoose.models.EmailLog || mongoose.model("EmailLog", emailLogSchema);
  const Notification =
    mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
  const MarketOrder =
    mongoose.models.MarketOrder || mongoose.model("MarketOrder", marketOrderSchema);
  const ContactMessage =
    mongoose.models.ContactMessage || mongoose.model("ContactMessage", contactMessageSchema);

  models = { User, Todo, Inquiry, EmailLog, Notification, MarketOrder, ContactMessage };
  return models;
}

async function connect(uri, dbName) {
  if (!uri) throw new Error("MONGO_URI missing");
  if (mongoose.connection.readyState === 1) return;

  const dnsServers = String(process.env.MONGO_DNS_SERVERS || "")
    .split(",")
    .map((server) => server.trim())
    .filter(Boolean);
  if (dnsServers.length) {
    dns.setServers(dnsServers);
  }

  const options = {
    autoIndex: true,
    serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || 10000)
  };

  if (String(process.env.MONGO_FORCE_IPV4 || "").toLowerCase() === "true") {
    options.family = 4;
  }

  if (dbName) options.dbName = dbName;
  await mongoose.connect(uri, options);
  getModels();
}

function mapUser(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    email: doc.email,
    passwordHash: doc.passwordHash,
    name: doc.name || "",
    role: normalizeRole(doc.role),
    status: normalizeStatus(doc.status),
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
    lastLoginAt: doc.lastLoginAt ? new Date(doc.lastLoginAt).toISOString() : null
  };
}

function mapPublicUser(doc, todoCount = 0) {
  const user = mapUser(doc);
  if (!user) return null;
  delete user.passwordHash;
  user.todoCount = todoCount;
  return user;
}

function mapTodo(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    userId: doc.userId,
    title: doc.title,
    completed: Boolean(doc.completed),
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : undefined,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : undefined
  };
}

function mapInquiry(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    name: doc.name || "",
    email: doc.email || "",
    phone: doc.phone || "",
    role: normalizeRole(doc.role),
    category: doc.category || "",
    budget: doc.budget || "",
    timeline: doc.timeline || "",
    message: doc.message || "",
    status: normalizeInquiryStatus(doc.status),
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : null
  };
}

function mapEmailLog(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    to: doc.to || "",
    subject: doc.subject || "",
    body: doc.body || "",
    type: doc.type || "general",
    status: doc.status || "queued",
    error: doc.error || "",
    userId: doc.userId || null,
    inquiryId: doc.inquiryId || null,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null
  };
}

function mapNotification(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    title: doc.title || "",
    message: doc.message || "",
    type: doc.type || "info",
    audience: doc.audience || "admin",
    userId: doc.userId || null,
    inquiryId: doc.inquiryId || null,
    readAt: doc.readAt ? new Date(doc.readAt).toISOString() : null,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null
  };
}

function userDisplay(user) {
  if (!user) return { id: null, name: "Unknown user", email: "" };
  return {
    id: user.id,
    name: user.name || user.email || "Unnamed user",
    email: user.email || ""
  };
}

function artistProfile(user, stats = {}) {
  if (!user) return null;
  const numericId = Number(String(user.id || "").replace(/\D/g, "")) || 1;
  const fallback = ARTIST_FALLBACKS[(numericId - 1) % ARTIST_FALLBACKS.length];
  const profile = user.artistProfile || user.profile || {};
  const completedOrders = stats.completedOrders || 0;

  return {
    id: user.id,
    name: user.name || user.email || "Unnamed artist",
    email: user.email || "",
    role: "freelancer",
    status: normalizeStatus(user.status),
    joinedAt: user.createdAt || null,
    headline: profile.headline || `${fallback.specialty} specialist`,
    category: profile.category || fallback.category,
    specialty: profile.specialty || fallback.specialty,
    location: profile.location || fallback.location,
    responseTime: profile.responseTime || fallback.responseTime,
    baseRate: Number(profile.baseRate || fallback.baseRate),
    rating: Number(profile.rating || Math.min(5, 4.3 + completedOrders * 0.05).toFixed(1)),
    completedOrders,
    totalOrders: stats.totalOrders || 0,
    totalRevenue: stats.totalRevenue || 0,
    lastContactAt: stats.lastContactAt || null,
    bio:
      profile.bio ||
      "Available for custom projects, client commissions, and collaborative creative work."
  };
}

function mapMarketOrder(doc, usersById = new Map()) {
  if (!doc) return null;
  const order = {
    id: doc._id.toString(),
    clientId: doc.clientId,
    artistId: doc.artistId,
    title: doc.title || "",
    description: doc.description || "",
    category: doc.category || "",
    price: Number(doc.price || 0),
    status: normalizeOrderStatus(doc.status),
    deliveryDate: doc.deliveryDate || null,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : null
  };

  order.artist = artistProfile(usersById.get(String(order.artistId)));
  order.client = userDisplay(usersById.get(String(order.clientId)));
  return order;
}

function mapContactMessage(doc, usersById = new Map()) {
  if (!doc) return null;
  const message = {
    id: doc._id.toString(),
    clientId: doc.clientId,
    artistId: doc.artistId,
    subject: doc.subject || "",
    message: doc.message || "",
    projectTitle: doc.projectTitle || "",
    budget: doc.budget || "",
    timeline: doc.timeline || "",
    status: normalizeContactStatus(doc.status),
    readAt: doc.readAt ? new Date(doc.readAt).toISOString() : null,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : null
  };

  message.artist = artistProfile(usersById.get(String(message.artistId)));
  message.client = userDisplay(usersById.get(String(message.clientId)));
  return message;
}

function orderRevenue(order) {
  return EARNING_STATUSES.has(normalizeOrderStatus(order.status)) ? Number(order.price || 0) : 0;
}

function latestDate(values) {
  return values.filter(Boolean).sort((a, b) => String(b).localeCompare(String(a)))[0] || null;
}

function valueInMonth(value, key) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).startsWith(key);
  return monthKey(date) === key;
}

async function marketplaceUsersById() {
  const { User } = getModels();
  const users = await User.find({}).lean(false);
  return new Map(users.map((doc) => {
    const user = mapUser(doc);
    return [String(user.id), user];
  }));
}

function buildRecentActivity({ orders = [], messages = [], usersById = new Map(), mode }) {
  const orderEvents = orders.map((order) => {
    const view = mapMarketOrder(order, usersById);
    return {
      id: `order-${view.id}`,
      type: "order",
      title: mode === "freelancer" ? `Order from ${view.client.name}` : `Order placed with ${view.artist?.name || "artist"}`,
      description: view.title,
      amount: view.price,
      status: view.status,
      createdAt: view.createdAt
    };
  });

  const messageEvents = messages.map((message) => {
    const view = mapContactMessage(message, usersById);
    return {
      id: `message-${view.id}`,
      type: "message",
      title:
        mode === "freelancer"
          ? `Message from ${view.client.name}`
          : `Message sent to ${view.artist?.name || "artist"}`,
      description: view.subject || view.projectTitle || view.message,
      status: view.status,
      createdAt: view.createdAt
    };
  });

  return [...orderEvents, ...messageEvents]
    .filter((item) => item.createdAt)
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))
    .slice(0, 10);
}

function buildActivity({ users, todos, inquiries, emailLogs }) {
  const userEvents = users.map((user) => ({
    id: `user-${user.id}`,
    type: "signup",
    title: "New user registered",
    description: `${user.name || user.email} joined as ${user.role}`,
    actor: user.email,
    createdAt: user.createdAt,
    tone: user.role === "freelancer" ? "blue" : "green"
  }));

  const todoEvents = todos.map((todo) => ({
    id: `todo-${todo.id}`,
    type: todo.completed ? "task_completed" : "task_created",
    title: todo.completed ? "Task completed" : "Task created",
    description: todo.title,
    actor: users.find((user) => String(user.id) === String(todo.userId))?.email || "Unknown user",
    createdAt: todo.updatedAt || todo.createdAt,
    tone: todo.completed ? "green" : "yellow"
  }));

  const inquiryEvents = inquiries.map((inquiry) => ({
    id: `inquiry-${inquiry.id}`,
    type: "inquiry",
    title: "New project inquiry",
    description: `${inquiry.category || "Project"} from ${inquiry.name || inquiry.email}`,
    actor: inquiry.email,
    createdAt: inquiry.createdAt,
    tone: "blue"
  }));

  const emailEvents = emailLogs.map((email) => ({
    id: `email-${email.id}`,
    type: "email",
    title: email.status === "sent" ? "Email sent" : "Email logged",
    description: email.subject,
    actor: email.to,
    createdAt: email.createdAt,
    tone: email.status === "failed" ? "red" : "slate"
  }));

  return [...userEvents, ...todoEvents, ...inquiryEvents, ...emailEvents]
    .filter((event) => event.createdAt)
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))
    .slice(0, 80);
}

async function findUserByEmail(email) {
  const { User } = getModels();
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const doc = await User.findOne({ email: normalizedEmail }).lean(false);
  return mapUser(doc);
}

async function findUserById(userId) {
  if (!isMongoId(userId)) return null;
  const { User } = getModels();
  const doc = await User.findById(userId).lean(false);
  return mapUser(doc);
}

async function createUser({ email, passwordHash, name, role }) {
  const { User } = getModels();
  try {
    const doc = await User.create({
      email,
      passwordHash,
      name: name || "",
      role: normalizeRole(role),
      status: "active"
    });
    return { user: mapUser(doc) };
  } catch (err) {
    if (err && err.code === 11000) return { conflict: true };
    throw err;
  }
}

async function upsertAdminUser({ email, passwordHash, name }) {
  const { User } = getModels();
  const normalizedEmail = String(email).trim().toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    existing.passwordHash = passwordHash;
    existing.name = name || existing.name || "Admin";
    existing.role = "admin";
    existing.status = "active";
    await existing.save();
    return { user: mapUser(existing), created: false };
  }

  const doc = await User.create({
    email: normalizedEmail,
    passwordHash,
    name: name || "Admin",
    role: "admin",
    status: "active"
  });
  return { user: mapUser(doc), created: true };
}

async function touchUserLogin(userId) {
  if (!isMongoId(userId)) return;
  const { User } = getModels();
  await User.updateOne({ _id: userId }, { $set: { lastLoginAt: new Date() } });
}

async function createInquiry({ name, email, phone, role, category, budget, timeline, message }) {
  const { Inquiry } = getModels();
  const doc = await Inquiry.create({
    name: String(name || "").trim(),
    email: String(email || "").trim().toLowerCase(),
    phone: String(phone || "").trim(),
    role: normalizeRole(role),
    category: String(category || "").trim(),
    budget: String(budget || "").trim(),
    timeline: String(timeline || "").trim(),
    message: String(message || "").trim(),
    status: "new"
  });
  return mapInquiry(doc);
}

async function listInquiries({ search = "", status = "" } = {}) {
  const { Inquiry } = getModels();
  const query = {};
  const searchTerm = String(search || "").trim();
  const statusFilter = String(status || "").trim().toLowerCase();

  if (searchTerm) {
    query.$or = [
      { email: { $regex: searchTerm, $options: "i" } },
      { name: { $regex: searchTerm, $options: "i" } },
      { category: { $regex: searchTerm, $options: "i" } },
      { message: { $regex: searchTerm, $options: "i" } }
    ];
  }
  if (statusFilter) query.status = statusFilter;

  const docs = await Inquiry.find(query).sort({ createdAt: -1 }).lean(false);
  return docs.map(mapInquiry);
}

async function updateInquiryAdmin(inquiryId, { status }) {
  if (!isMongoId(inquiryId)) return { notFound: true };
  const { Inquiry } = getModels();
  const update = {};
  if (status !== undefined) update.status = normalizeInquiryStatus(status);
  update.updatedAt = new Date();
  const doc = await Inquiry.findByIdAndUpdate(inquiryId, update, { new: true });
  if (!doc) return { notFound: true };
  return { inquiry: mapInquiry(doc) };
}

async function createEmailLog({ to, subject, body, type, status, error, userId, inquiryId }) {
  const { EmailLog } = getModels();
  const doc = await EmailLog.create({
    to: String(to || "").trim(),
    subject: String(subject || "").trim(),
    body: String(body || "").trim(),
    type: type || "general",
    status: status || "queued",
    error: error || "",
    userId: userId ? String(userId) : undefined,
    inquiryId: inquiryId ? String(inquiryId) : undefined
  });
  return mapEmailLog(doc);
}

async function listEmailLogs({ status = "" } = {}) {
  const { EmailLog } = getModels();
  const query = {};
  const statusFilter = String(status || "").trim().toLowerCase();
  if (statusFilter) query.status = statusFilter;
  const docs = await EmailLog.find(query).sort({ createdAt: -1 }).lean(false);
  return docs.map(mapEmailLog);
}

async function createNotification({ title, message, type, audience, userId, inquiryId }) {
  const { Notification } = getModels();
  const doc = await Notification.create({
    title: String(title || "").trim(),
    message: String(message || "").trim(),
    type: type || "info",
    audience: audience || "admin",
    userId: userId ? String(userId) : undefined,
    inquiryId: inquiryId ? String(inquiryId) : undefined
  });
  return mapNotification(doc);
}

async function listNotifications() {
  const { Notification } = getModels();
  const docs = await Notification.find({}).sort({ createdAt: -1 }).lean(false);
  return docs.map(mapNotification);
}

async function listUsers({ search = "", role = "", status = "" } = {}) {
  const { User, Todo } = getModels();
  const query = {};
  const searchTerm = String(search || "").trim();
  const roleFilter = String(role || "").trim().toLowerCase();
  const statusFilter = String(status || "").trim().toLowerCase();

  if (searchTerm) {
    query.$or = [
      { email: { $regex: searchTerm, $options: "i" } },
      { name: { $regex: searchTerm, $options: "i" } }
    ];
  }
  if (roleFilter) query.role = roleFilter;
  if (statusFilter) query.status = statusFilter;

  const docs = await User.find(query).sort({ createdAt: -1 }).lean(false);
  const counts = await Todo.aggregate([{ $group: { _id: "$userId", count: { $sum: 1 } } }]);
  const todoCounts = new Map(counts.map((item) => [String(item._id), item.count]));
  return docs.map((doc) => mapPublicUser(doc, todoCounts.get(doc._id.toString()) || 0));
}

async function updateUserAdmin(userId, { role, status }) {
  if (!isMongoId(userId)) return { notFound: true };
  const { User, Todo } = getModels();
  const update = {};
  if (role !== undefined) update.role = normalizeRole(role);
  if (status !== undefined) update.status = normalizeStatus(status);
  update.updatedAt = new Date();

  const doc = await User.findByIdAndUpdate(userId, update, { new: true });
  if (!doc) return { notFound: true };

  const todoCount = await Todo.countDocuments({ userId: doc._id.toString() });
  return { user: mapPublicUser(doc, todoCount) };
}

async function getAdminOverview() {
  const { Todo } = getModels();
  const users = await listUsers();
  const todos = await Todo.find({}).sort({ createdAt: -1 }).lean(false);
  const mappedTodos = todos.map(mapTodo);
  const inquiries = await listInquiries();
  const emailLogs = await listEmailLogs();
  const notifications = await listNotifications();
  const activity = buildActivity({ users, todos: mappedTodos, inquiries, emailLogs });
  const usersById = new Map(users.map((user) => [String(user.id), user]));
  const today = dateKey(new Date());
  const sevenDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const roleBreakdown = users.reduce(
    (counts, user) => {
      counts[user.role] = (counts[user.role] || 0) + 1;
      return counts;
    },
    { admin: 0, client: 0, freelancer: 0 }
  );

  const dailySignups = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(sevenDaysAgo.getTime() + index * 24 * 60 * 60 * 1000);
    const key = dateKey(day);
    return {
      date: key,
      count: users.filter((user) => String(user.createdAt || "").startsWith(key)).length
    };
  });

  const completedTodos = mappedTodos.filter((todo) => Boolean(todo.completed)).length;
  const recentTodos = mappedTodos.slice(0, 8).map((todo) => {
    const owner = usersById.get(String(todo.userId));
    return {
      id: todo.id,
      title: todo.title,
      completed: todo.completed,
      createdAt: todo.createdAt || null,
      user: owner
        ? { id: owner.id, email: owner.email, name: owner.name }
        : { id: todo.userId, email: "Unknown user", name: "" }
    };
  });

  return {
    stats: {
      totalUsers: users.length,
      clients: roleBreakdown.client || 0,
      freelancers: roleBreakdown.freelancer || 0,
      admins: roleBreakdown.admin || 0,
      activeUsers: users.filter((user) => user.status === "active").length,
      newUsersToday: users.filter((user) => String(user.createdAt || "").startsWith(today)).length,
      totalTodos: mappedTodos.length,
      completedTodos,
      openTodos: mappedTodos.length - completedTodos,
      totalInquiries: inquiries.length,
      newInquiries: inquiries.filter((inquiry) => inquiry.status === "new").length,
      emailsSent: emailLogs.filter((email) => email.status === "sent").length,
      emailsQueued: emailLogs.filter((email) => email.status === "queued").length,
      unreadNotifications: notifications.filter((notification) => !notification.readAt).length
    },
    roleBreakdown,
    dailySignups,
    users,
    recentUsers: users.slice(0, 8),
    recentTodos,
    inquiries,
    recentInquiries: inquiries.slice(0, 8),
    emailLogs,
    notifications,
    activity
  };
}

async function listArtists() {
  const { User, MarketOrder, ContactMessage } = getModels();
  const docs = await User.find({ role: "freelancer" }).sort({ createdAt: -1 }).lean(false);
  const users = docs.map(mapUser).filter((user) => normalizeStatus(user.status) === "active");
  const artistIds = users.map((user) => String(user.id));
  const [orders, messages] = await Promise.all([
    MarketOrder.find({ artistId: { $in: artistIds } }).lean(false),
    ContactMessage.find({ artistId: { $in: artistIds } }).lean(false)
  ]);

  return users
    .map((user) => {
      const artistOrders = orders.filter((order) => String(order.artistId) === String(user.id));
      const artistMessages = messages.filter((message) => String(message.artistId) === String(user.id));
      const completedOrders = artistOrders.filter((order) =>
        ["delivered", "completed"].includes(normalizeOrderStatus(order.status))
      ).length;

      return artistProfile(user, {
        completedOrders,
        totalOrders: artistOrders.length,
        totalRevenue: artistOrders.reduce((sum, order) => sum + orderRevenue(order), 0),
        lastContactAt: latestDate([
          ...artistOrders.map((order) => (order.createdAt ? new Date(order.createdAt).toISOString() : null)),
          ...artistMessages.map((message) => (message.createdAt ? new Date(message.createdAt).toISOString() : null))
        ])
      });
    })
    .sort((a, b) => {
      const score = (b.completedOrders || 0) - (a.completedOrders || 0);
      if (score !== 0) return score;
      return String(a.name).localeCompare(String(b.name));
    });
}

async function createContactMessage(clientId, { artistId, subject, message, projectTitle, budget, timeline }) {
  if (!isMongoId(artistId)) return { notFound: true };
  const { User, ContactMessage } = getModels();
  const artist = await User.findOne({ _id: artistId, role: "freelancer" });
  if (!artist) return { notFound: true };

  const doc = await ContactMessage.create({
    clientId: String(clientId),
    artistId: String(artistId),
    subject: String(subject || "").trim() || "Project inquiry",
    message: String(message || "").trim(),
    projectTitle: String(projectTitle || "").trim(),
    budget: String(budget || "").trim(),
    timeline: String(timeline || "").trim(),
    status: "new",
    updatedAt: new Date()
  });

  const usersById = await marketplaceUsersById();
  return { message: mapContactMessage(doc, usersById) };
}

async function createMarketOrder(
  clientId,
  { artistId, title, description, category, price, deliveryDate }
) {
  if (!isMongoId(artistId)) return { notFound: true };
  const { User, MarketOrder } = getModels();
  const artist = await User.findOne({ _id: artistId, role: "freelancer" });
  if (!artist) return { notFound: true };

  const doc = await MarketOrder.create({
    clientId: String(clientId),
    artistId: String(artistId),
    title: String(title || "").trim(),
    description: String(description || "").trim(),
    category: String(category || "").trim(),
    price: Number(price || 0),
    status: "requested",
    deliveryDate: deliveryDate || undefined,
    updatedAt: new Date()
  });

  const usersById = await marketplaceUsersById();
  return { order: mapMarketOrder(doc, usersById) };
}

async function updateMarketOrder(userId, orderId, { status }) {
  if (!isMongoId(orderId)) return { notFound: true };
  const { MarketOrder } = getModels();
  const update = { updatedAt: new Date() };
  if (status !== undefined) update.status = normalizeOrderStatus(status);

  const doc = await MarketOrder.findOneAndUpdate(
    {
      _id: orderId,
      $or: [{ clientId: String(userId) }, { artistId: String(userId) }]
    },
    update,
    { new: true }
  );
  if (!doc) return { notFound: true };

  const usersById = await marketplaceUsersById();
  return { order: mapMarketOrder(doc, usersById) };
}

async function markContactMessageRead(userId, messageId) {
  if (!isMongoId(messageId)) return { notFound: true };
  const { ContactMessage } = getModels();
  const doc = await ContactMessage.findOneAndUpdate(
    { _id: messageId, artistId: String(userId) },
    {
      $set: {
        status: "read",
        readAt: new Date(),
        updatedAt: new Date()
      }
    },
    { new: true }
  );
  if (!doc) return { notFound: true };

  const usersById = await marketplaceUsersById();
  return { message: mapContactMessage(doc, usersById) };
}

async function getClientDashboard(clientId) {
  const { MarketOrder, ContactMessage } = getModels();
  const [orderDocs, messageDocs, artists, usersById] = await Promise.all([
    MarketOrder.find({ clientId: String(clientId) }).sort({ createdAt: -1 }).lean(false),
    ContactMessage.find({ clientId: String(clientId) }).sort({ createdAt: -1 }).lean(false),
    listArtists(),
    marketplaceUsersById()
  ]);
  const contactedArtistIds = new Set([
    ...orderDocs.map((order) => String(order.artistId)),
    ...messageDocs.map((message) => String(message.artistId))
  ]);

  const contactedArtists = Array.from(contactedArtistIds)
    .map((artistId) => {
      const artist = artists.find((item) => String(item.id) === artistId);
      if (!artist) return null;
      const artistOrders = orderDocs.filter((order) => String(order.artistId) === artistId);
      const artistMessages = messageDocs.filter((message) => String(message.artistId) === artistId);
      const lastMessage = artistMessages
        .slice()
        .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))[0];

      return {
        ...artist,
        ordersPlaced: artistOrders.length,
        messagesSent: artistMessages.length,
        lastContactAt: latestDate([
          ...artistOrders.map((order) => (order.createdAt ? new Date(order.createdAt).toISOString() : null)),
          ...artistMessages.map((message) => (message.createdAt ? new Date(message.createdAt).toISOString() : null))
        ]),
        lastMessage: lastMessage ? mapContactMessage(lastMessage, usersById) : null
      };
    })
    .filter(Boolean)
    .sort((a, b) => String(b.lastContactAt || "").localeCompare(String(a.lastContactAt || "")));

  const orders = orderDocs.map((order) => mapMarketOrder(order, usersById));
  const messages = messageDocs.map((message) => mapContactMessage(message, usersById));
  const activeOrders = orders.filter((order) =>
    ["requested", "in_progress", "delivered"].includes(order.status)
  );

  return {
    role: "client",
    stats: {
      totalOrders: orders.length,
      activeOrders: activeOrders.length,
      completedOrders: orders.filter((order) => order.status === "completed").length,
      contactedArtists: contactedArtists.length,
      totalSpent: orders
        .filter((order) => order.status !== "cancelled")
        .reduce((sum, order) => sum + Number(order.price || 0), 0),
      pendingResponses: messages.filter((message) => message.status === "new").length
    },
    orders,
    messages,
    contactedArtists,
    artists,
    recentActivity: buildRecentActivity({ orders: orderDocs, messages: messageDocs, usersById, mode: "client" })
  };
}

async function getFreelancerDashboard(artistId) {
  const { MarketOrder, ContactMessage } = getModels();
  const [orderDocs, messageDocs, usersById] = await Promise.all([
    MarketOrder.find({ artistId: String(artistId) }).sort({ createdAt: -1 }).lean(false),
    ContactMessage.find({ artistId: String(artistId) }).sort({ createdAt: -1 }).lean(false),
    marketplaceUsersById()
  ]);
  const orders = orderDocs.map((order) => mapMarketOrder(order, usersById));
  const messages = messageDocs.map((message) => mapContactMessage(message, usersById));
  const clientIds = new Set([
    ...orderDocs.map((order) => String(order.clientId)),
    ...messageDocs.map((message) => String(message.clientId))
  ]);
  const now = new Date();
  const monthlyGrowth = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
    const key = monthKey(date);
    const monthOrders = orderDocs.filter((order) => valueInMonth(order.createdAt, key));
    const monthMessages = messageDocs.filter((message) => valueInMonth(message.createdAt, key));

    return {
      month: key,
      label: monthLabel(date),
      orders: monthOrders.length,
      contacts: monthMessages.length,
      revenue: monthOrders.reduce((sum, order) => sum + orderRevenue(order), 0)
    };
  });
  const revenue = orderDocs.reduce((sum, order) => sum + orderRevenue(order), 0);

  return {
    role: "freelancer",
    stats: {
      totalOrders: orders.length,
      activeOrders: orders.filter((order) =>
        ["requested", "in_progress", "delivered"].includes(order.status)
      ).length,
      completedOrders: orders.filter((order) => order.status === "completed").length,
      clientsContacted: clientIds.size,
      unreadMessages: messages.filter((message) => message.status === "new").length,
      revenue,
      averageOrderValue: orders.length ? Math.round(revenue / orders.length) : 0
    },
    orders,
    recentOrders: orders.slice(0, 6),
    messages,
    monthlyGrowth,
    revenueReport: monthlyGrowth,
    recentActivity: buildRecentActivity({ orders: orderDocs, messages: messageDocs, usersById, mode: "freelancer" })
  };
}

async function listTodos(userId) {
  const { Todo } = getModels();
  const docs = await Todo.find({ userId }).sort({ createdAt: 1 }).lean(false);
  return docs.map(mapTodo);
}

async function createTodo(userId, title) {
  const { Todo } = getModels();
  const doc = await Todo.create({ userId, title, completed: false });
  return mapTodo(doc);
}

async function updateTodo(userId, todoId, { title, completed }) {
  if (!isMongoId(todoId)) return { notFound: true };
  const { Todo } = getModels();
  const update = {};
  if (title !== undefined) update.title = String(title).trim();
  if (completed !== undefined) update.completed = Boolean(completed);
  update.updatedAt = new Date();

  if (update.title !== undefined && !update.title) return { badTitle: true };

  const doc = await Todo.findOneAndUpdate({ _id: todoId, userId }, update, { new: true });
  if (!doc) return { notFound: true };
  return { todo: mapTodo(doc) };
}

async function deleteTodo(userId, todoId) {
  if (!isMongoId(todoId)) return { notFound: true };
  const { Todo } = getModels();
  const res = await Todo.deleteOne({ _id: todoId, userId });
  if (!res || res.deletedCount !== 1) return { notFound: true };
  return { ok: true };
}

module.exports = {
  connect,
  findUserByEmail,
  findUserById,
  createUser,
  upsertAdminUser,
  touchUserLogin,
  createInquiry,
  listInquiries,
  updateInquiryAdmin,
  createEmailLog,
  listEmailLogs,
  createNotification,
  listNotifications,
  listUsers,
  updateUserAdmin,
  getAdminOverview,
  listArtists,
  createContactMessage,
  createMarketOrder,
  updateMarketOrder,
  markContactMessageRead,
  getClientDashboard,
  getFreelancerDashboard,
  listTodos,
  createTodo,
  updateTodo,
  deleteTodo
};
