const { mutateDb, readDb } = require("./db");

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

function toNumberIfNumeric(value) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "" && /^[0-9]+$/.test(value)) {
    return Number(value);
  }
  return value;
}

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

function sameId(a, b) {
  const aa = toNumberIfNumeric(a);
  const bb = toNumberIfNumeric(b);
  return aa === bb;
}

function countTodosByUser(todos) {
  return todos.reduce((counts, todo) => {
    const key = String(todo.userId);
    counts.set(key, (counts.get(key) || 0) + 1);
    return counts;
  }, new Map());
}

function publicUser(user, todoCounts = new Map()) {
  return {
    id: user.id,
    email: user.email,
    name: user.name || "",
    role: normalizeRole(user.role),
    status: normalizeStatus(user.status),
    createdAt: user.createdAt || null,
    lastLoginAt: user.lastLoginAt || null,
    todoCount: todoCounts.get(String(user.id)) || 0
  };
}

function publicInquiry(inquiry) {
  return {
    id: inquiry.id,
    name: inquiry.name || "",
    email: inquiry.email || "",
    phone: inquiry.phone || "",
    role: normalizeRole(inquiry.role),
    category: inquiry.category || "",
    budget: inquiry.budget || "",
    timeline: inquiry.timeline || "",
    message: inquiry.message || "",
    status: normalizeInquiryStatus(inquiry.status),
    createdAt: inquiry.createdAt || null,
    updatedAt: inquiry.updatedAt || null
  };
}

function publicEmailLog(email) {
  return {
    id: email.id,
    to: email.to || "",
    subject: email.subject || "",
    body: email.body || "",
    type: email.type || "general",
    status: email.status || "queued",
    error: email.error || "",
    userId: email.userId || null,
    inquiryId: email.inquiryId || null,
    createdAt: email.createdAt || null
  };
}

function publicNotification(notification) {
  return {
    id: notification.id,
    title: notification.title || "",
    message: notification.message || "",
    type: notification.type || "info",
    audience: notification.audience || "admin",
    userId: notification.userId || null,
    inquiryId: notification.inquiryId || null,
    readAt: notification.readAt || null,
    createdAt: notification.createdAt || null
  };
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

function publicMarketOrder(order, usersById = new Map()) {
  const artist = usersById.get(String(order.artistId));
  const client = usersById.get(String(order.clientId));

  return {
    id: order.id,
    clientId: order.clientId,
    artistId: order.artistId,
    title: order.title || "",
    description: order.description || "",
    category: order.category || "",
    price: Number(order.price || 0),
    status: normalizeOrderStatus(order.status),
    deliveryDate: order.deliveryDate || null,
    createdAt: order.createdAt || null,
    updatedAt: order.updatedAt || null,
    artist: artistProfile(artist),
    client: userDisplay(client)
  };
}

function publicContactMessage(message, usersById = new Map()) {
  const artist = usersById.get(String(message.artistId));
  const client = usersById.get(String(message.clientId));

  return {
    id: message.id,
    clientId: message.clientId,
    artistId: message.artistId,
    subject: message.subject || "",
    message: message.message || "",
    projectTitle: message.projectTitle || "",
    budget: message.budget || "",
    timeline: message.timeline || "",
    status: normalizeContactStatus(message.status),
    readAt: message.readAt || null,
    createdAt: message.createdAt || null,
    updatedAt: message.updatedAt || null,
    artist: artistProfile(artist),
    client: userDisplay(client)
  };
}

function marketplaceUsersById(users) {
  return new Map((users || []).map((user) => [String(user.id), user]));
}

function orderRevenue(order) {
  return EARNING_STATUSES.has(normalizeOrderStatus(order.status)) ? Number(order.price || 0) : 0;
}

function latestDate(values) {
  return values.filter(Boolean).sort((a, b) => String(b).localeCompare(String(a)))[0] || null;
}

function buildRecentActivity({ orders = [], messages = [], usersById = new Map(), mode }) {
  const orderEvents = orders.map((order) => {
    const view = publicMarketOrder(order, usersById);
    return {
      id: `order-${order.id}`,
      type: "order",
      title: mode === "freelancer" ? `Order from ${view.client.name}` : `Order placed with ${view.artist?.name || "artist"}`,
      description: view.title,
      amount: view.price,
      status: view.status,
      createdAt: view.createdAt
    };
  });

  const messageEvents = messages.map((message) => {
    const view = publicContactMessage(message, usersById);
    return {
      id: `message-${message.id}`,
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

async function findUserByEmail(email) {
  const db = await readDb();
  return db.users.find((u) => u.email === email) || null;
}

async function findUserById(userId) {
  const db = await readDb();
  return db.users.find((u) => sameId(u.id, userId)) || null;
}

async function createUser({ email, passwordHash, name, role }) {
  const result = await mutateDb((db) => {
    const exists = db.users.find((u) => u.email === email);
    if (exists) return { conflict: true };

    const id = db.counters.userId++;
    const user = {
      id,
      email,
      passwordHash,
      name: name || "",
      role: normalizeRole(role),
      status: "active",
      createdAt: new Date().toISOString(),
      lastLoginAt: null
    };
    db.users.push(user);
    return { user };
  });

  if (result.conflict) return { conflict: true };
  return { user: result.user };
}

async function upsertAdminUser({ email, passwordHash, name }) {
  const result = await mutateDb((db) => {
    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = db.users.find((u) => u.email === normalizedEmail);
    const now = new Date().toISOString();

    if (existing) {
      existing.passwordHash = passwordHash;
      existing.name = name || existing.name || "Admin";
      existing.role = "admin";
      existing.status = "active";
      existing.updatedAt = now;
      return { user: existing, created: false };
    }

    const id = db.counters.userId++;
    const user = {
      id,
      email: normalizedEmail,
      passwordHash,
      name: name || "Admin",
      role: "admin",
      status: "active",
      createdAt: now,
      lastLoginAt: null
    };
    db.users.push(user);
    return { user, created: true };
  });

  return result;
}

async function touchUserLogin(userId) {
  await mutateDb((db) => {
    const user = db.users.find((u) => sameId(u.id, userId));
    if (user) user.lastLoginAt = new Date().toISOString();
    return {};
  });
}

async function createInquiry({ name, email, phone, role, category, budget, timeline, message }) {
  const result = await mutateDb((db) => {
    const id = db.counters.inquiryId++;
    const inquiry = {
      id,
      name: String(name || "").trim(),
      email: String(email || "").trim().toLowerCase(),
      phone: String(phone || "").trim(),
      role: normalizeRole(role),
      category: String(category || "").trim(),
      budget: String(budget || "").trim(),
      timeline: String(timeline || "").trim(),
      message: String(message || "").trim(),
      status: "new",
      createdAt: new Date().toISOString()
    };
    db.inquiries.push(inquiry);
    return { inquiry };
  });

  return publicInquiry(result.inquiry);
}

async function listInquiries({ search = "", status = "" } = {}) {
  const db = await readDb();
  const searchTerm = String(search || "").trim().toLowerCase();
  const statusFilter = String(status || "").trim().toLowerCase();

  return (db.inquiries || [])
    .map(publicInquiry)
    .filter((inquiry) => {
      const matchesSearch =
        !searchTerm ||
        inquiry.name.toLowerCase().includes(searchTerm) ||
        inquiry.email.toLowerCase().includes(searchTerm) ||
        inquiry.category.toLowerCase().includes(searchTerm) ||
        inquiry.message.toLowerCase().includes(searchTerm);
      const matchesStatus = !statusFilter || inquiry.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
}

async function updateInquiryAdmin(inquiryId, { status }) {
  const result = await mutateDb((db) => {
    const inquiry = db.inquiries.find((item) => sameId(item.id, inquiryId));
    if (!inquiry) return { notFound: true };
    if (status !== undefined) inquiry.status = normalizeInquiryStatus(status);
    inquiry.updatedAt = new Date().toISOString();
    return { inquiry };
  });

  if (result.notFound) return { notFound: true };
  return { inquiry: publicInquiry(result.inquiry) };
}

async function createEmailLog({ to, subject, body, type, status, error, userId, inquiryId }) {
  const result = await mutateDb((db) => {
    const id = db.counters.emailId++;
    const emailLog = {
      id,
      to: String(to || "").trim(),
      subject: String(subject || "").trim(),
      body: String(body || "").trim(),
      type: type || "general",
      status: status || "queued",
      error: error || "",
      userId: userId || null,
      inquiryId: inquiryId || null,
      createdAt: new Date().toISOString()
    };
    db.emailLogs.push(emailLog);
    return { emailLog };
  });

  return publicEmailLog(result.emailLog);
}

async function listEmailLogs({ status = "" } = {}) {
  const db = await readDb();
  const statusFilter = String(status || "").trim().toLowerCase();

  return (db.emailLogs || [])
    .map(publicEmailLog)
    .filter((email) => !statusFilter || email.status === statusFilter)
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
}

async function createNotification({ title, message, type, audience, userId, inquiryId }) {
  const result = await mutateDb((db) => {
    const id = db.counters.notificationId++;
    const notification = {
      id,
      title: String(title || "").trim(),
      message: String(message || "").trim(),
      type: type || "info",
      audience: audience || "admin",
      userId: userId || null,
      inquiryId: inquiryId || null,
      readAt: null,
      createdAt: new Date().toISOString()
    };
    db.notifications.push(notification);
    return { notification };
  });

  return publicNotification(result.notification);
}

async function listNotifications() {
  const db = await readDb();
  return (db.notifications || [])
    .map(publicNotification)
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
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
    actor: users.find((user) => sameId(user.id, todo.userId))?.email || "Unknown user",
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

async function listUsers({ search = "", role = "", status = "" } = {}) {
  const db = await readDb();
  const todoCounts = countTodosByUser(db.todos || []);
  const searchTerm = String(search || "").trim().toLowerCase();
  const roleFilter = String(role || "").trim().toLowerCase();
  const statusFilter = String(status || "").trim().toLowerCase();

  return db.users
    .map((user) => publicUser(user, todoCounts))
    .filter((user) => {
      const matchesSearch =
        !searchTerm ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.name.toLowerCase().includes(searchTerm);
      const matchesRole = !roleFilter || user.role === roleFilter;
      const matchesStatus = !statusFilter || user.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    })
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
}

async function updateUserAdmin(userId, { role, status }) {
  const result = await mutateDb((db) => {
    const user = db.users.find((u) => sameId(u.id, userId));
    if (!user) return { notFound: true };

    if (role !== undefined) user.role = normalizeRole(role);
    if (status !== undefined) user.status = normalizeStatus(status);
    user.updatedAt = new Date().toISOString();
    return { user };
  });

  if (result.notFound) return { notFound: true };
  const db = await readDb();
  const todoCounts = countTodosByUser(db.todos || []);
  return { user: publicUser(result.user, todoCounts) };
}

async function getAdminOverview() {
  const db = await readDb();
  const users = await listUsers();
  const todos = db.todos || [];
  const inquiries = await listInquiries();
  const emailLogs = await listEmailLogs();
  const notifications = await listNotifications();
  const activity = buildActivity({ users, todos, inquiries, emailLogs });
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

  const completedTodos = todos.filter((todo) => Boolean(todo.completed)).length;
  const recentTodos = todos
    .slice()
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))
    .slice(0, 8)
    .map((todo) => {
      const owner = usersById.get(String(todo.userId));
      return {
        id: todo.id,
        title: todo.title,
        completed: Boolean(todo.completed),
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
      totalTodos: todos.length,
      completedTodos,
      openTodos: todos.length - completedTodos,
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
  const db = await readDb();
  const users = db.users || [];
  const orders = db.marketOrders || [];
  const messages = db.contactMessages || [];

  return users
    .filter((user) => normalizeRole(user.role) === "freelancer" && normalizeStatus(user.status) === "active")
    .map((user) => {
      const artistOrders = orders.filter((order) => sameId(order.artistId, user.id));
      const artistMessages = messages.filter((message) => sameId(message.artistId, user.id));
      const completedOrders = artistOrders.filter((order) =>
        ["delivered", "completed"].includes(normalizeOrderStatus(order.status))
      ).length;

      return artistProfile(user, {
        completedOrders,
        totalOrders: artistOrders.length,
        totalRevenue: artistOrders.reduce((sum, order) => sum + orderRevenue(order), 0),
        lastContactAt: latestDate([
          ...artistOrders.map((order) => order.createdAt),
          ...artistMessages.map((message) => message.createdAt)
        ])
      });
    })
    .sort((a, b) => {
      const scoreA = (b.completedOrders || 0) - (a.completedOrders || 0);
      if (scoreA !== 0) return scoreA;
      return String(a.name).localeCompare(String(b.name));
    });
}

async function createContactMessage(clientId, { artistId, subject, message, projectTitle, budget, timeline }) {
  const result = await mutateDb((db) => {
    const artist = db.users.find(
      (user) => sameId(user.id, artistId) && normalizeRole(user.role) === "freelancer"
    );
    if (!artist) return { notFound: true };

    const id = db.counters.contactMessageId++;
    const now = new Date().toISOString();
    const contactMessage = {
      id,
      clientId: toNumberIfNumeric(clientId),
      artistId: toNumberIfNumeric(artistId),
      subject: String(subject || "").trim() || "Project inquiry",
      message: String(message || "").trim(),
      projectTitle: String(projectTitle || "").trim(),
      budget: String(budget || "").trim(),
      timeline: String(timeline || "").trim(),
      status: "new",
      readAt: null,
      createdAt: now,
      updatedAt: now
    };
    db.contactMessages.push(contactMessage);
    return { contactMessage };
  });

  if (result.notFound) return { notFound: true };
  const db = await readDb();
  return { message: publicContactMessage(result.contactMessage, marketplaceUsersById(db.users)) };
}

async function createMarketOrder(
  clientId,
  { artistId, title, description, category, price, deliveryDate }
) {
  const result = await mutateDb((db) => {
    const artist = db.users.find(
      (user) => sameId(user.id, artistId) && normalizeRole(user.role) === "freelancer"
    );
    if (!artist) return { notFound: true };

    const id = db.counters.marketOrderId++;
    const now = new Date().toISOString();
    const order = {
      id,
      clientId: toNumberIfNumeric(clientId),
      artistId: toNumberIfNumeric(artistId),
      title: String(title || "").trim(),
      description: String(description || "").trim(),
      category: String(category || artist.artistProfile?.category || "").trim(),
      price: Number(price || 0),
      status: "requested",
      deliveryDate: deliveryDate || null,
      createdAt: now,
      updatedAt: now
    };
    db.marketOrders.push(order);
    return { order };
  });

  if (result.notFound) return { notFound: true };
  const db = await readDb();
  return { order: publicMarketOrder(result.order, marketplaceUsersById(db.users)) };
}

async function updateMarketOrder(userId, orderId, { status }) {
  const result = await mutateDb((db) => {
    const order = db.marketOrders.find(
      (item) =>
        sameId(item.id, orderId) && (sameId(item.clientId, userId) || sameId(item.artistId, userId))
    );
    if (!order) return { notFound: true };

    if (status !== undefined) order.status = normalizeOrderStatus(status);
    order.updatedAt = new Date().toISOString();
    return { order };
  });

  if (result.notFound) return { notFound: true };
  const db = await readDb();
  return { order: publicMarketOrder(result.order, marketplaceUsersById(db.users)) };
}

async function markContactMessageRead(userId, messageId) {
  const result = await mutateDb((db) => {
    const message = db.contactMessages.find(
      (item) => sameId(item.id, messageId) && sameId(item.artistId, userId)
    );
    if (!message) return { notFound: true };

    if (!message.readAt) message.readAt = new Date().toISOString();
    message.status = message.status === "new" ? "read" : normalizeContactStatus(message.status);
    message.updatedAt = new Date().toISOString();
    return { message };
  });

  if (result.notFound) return { notFound: true };
  const db = await readDb();
  return { message: publicContactMessage(result.message, marketplaceUsersById(db.users)) };
}

async function getClientDashboard(clientId) {
  const db = await readDb();
  const usersById = marketplaceUsersById(db.users || []);
  const orders = (db.marketOrders || []).filter((order) => sameId(order.clientId, clientId));
  const messages = (db.contactMessages || []).filter((message) => sameId(message.clientId, clientId));
  const artists = await listArtists();
  const contactedArtistIds = new Set([
    ...orders.map((order) => String(order.artistId)),
    ...messages.map((message) => String(message.artistId))
  ]);

  const contactedArtists = Array.from(contactedArtistIds)
    .map((artistId) => {
      const artist = artists.find((item) => String(item.id) === artistId);
      if (!artist) return null;
      const artistOrders = orders.filter((order) => String(order.artistId) === artistId);
      const artistMessages = messages.filter((message) => String(message.artistId) === artistId);
      const lastMessage = artistMessages
        .slice()
        .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))[0];

      return {
        ...artist,
        ordersPlaced: artistOrders.length,
        messagesSent: artistMessages.length,
        lastContactAt: latestDate([
          ...artistOrders.map((order) => order.createdAt),
          ...artistMessages.map((message) => message.createdAt)
        ]),
        lastMessage: lastMessage ? publicContactMessage(lastMessage, usersById) : null
      };
    })
    .filter(Boolean)
    .sort((a, b) => String(b.lastContactAt || "").localeCompare(String(a.lastContactAt || "")));

  const viewedOrders = orders
    .map((order) => publicMarketOrder(order, usersById))
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));

  const viewedMessages = messages
    .map((message) => publicContactMessage(message, usersById))
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));

  const activeOrders = viewedOrders.filter((order) =>
    ["requested", "in_progress", "delivered"].includes(order.status)
  );

  return {
    role: "client",
    stats: {
      totalOrders: viewedOrders.length,
      activeOrders: activeOrders.length,
      completedOrders: viewedOrders.filter((order) => order.status === "completed").length,
      contactedArtists: contactedArtists.length,
      totalSpent: viewedOrders
        .filter((order) => order.status !== "cancelled")
        .reduce((sum, order) => sum + Number(order.price || 0), 0),
      pendingResponses: viewedMessages.filter((message) => message.status === "new").length
    },
    orders: viewedOrders,
    messages: viewedMessages,
    contactedArtists,
    artists,
    recentActivity: buildRecentActivity({ orders, messages, usersById, mode: "client" })
  };
}

async function getFreelancerDashboard(artistId) {
  const db = await readDb();
  const usersById = marketplaceUsersById(db.users || []);
  const orders = (db.marketOrders || []).filter((order) => sameId(order.artistId, artistId));
  const messages = (db.contactMessages || []).filter((message) => sameId(message.artistId, artistId));
  const viewedOrders = orders
    .map((order) => publicMarketOrder(order, usersById))
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
  const viewedMessages = messages
    .map((message) => publicContactMessage(message, usersById))
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
  const clientIds = new Set([
    ...orders.map((order) => String(order.clientId)),
    ...messages.map((message) => String(message.clientId))
  ]);
  const now = new Date();
  const monthlyGrowth = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
    const key = monthKey(date);
    const monthOrders = orders.filter((order) => String(order.createdAt || "").startsWith(key));
    const monthMessages = messages.filter((message) => String(message.createdAt || "").startsWith(key));

    return {
      month: key,
      label: monthLabel(date),
      orders: monthOrders.length,
      contacts: monthMessages.length,
      revenue: monthOrders.reduce((sum, order) => sum + orderRevenue(order), 0)
    };
  });
  const revenue = orders.reduce((sum, order) => sum + orderRevenue(order), 0);

  return {
    role: "freelancer",
    stats: {
      totalOrders: viewedOrders.length,
      activeOrders: viewedOrders.filter((order) =>
        ["requested", "in_progress", "delivered"].includes(order.status)
      ).length,
      completedOrders: viewedOrders.filter((order) => order.status === "completed").length,
      clientsContacted: clientIds.size,
      unreadMessages: viewedMessages.filter((message) => message.status === "new").length,
      revenue,
      averageOrderValue: viewedOrders.length ? Math.round(revenue / viewedOrders.length) : 0
    },
    orders: viewedOrders,
    recentOrders: viewedOrders.slice(0, 6),
    messages: viewedMessages,
    monthlyGrowth,
    revenueReport: monthlyGrowth,
    recentActivity: buildRecentActivity({ orders, messages, usersById, mode: "freelancer" })
  };
}

async function listTodos(userId) {
  const uid = toNumberIfNumeric(userId);
  const result = await mutateDb((db) => {
    const todos = db.todos.filter((t) => sameId(t.userId, uid));
    return { todos };
  });
  return result.todos;
}

async function createTodo(userId, title) {
  const uid = toNumberIfNumeric(userId);
  const result = await mutateDb((db) => {
    const id = db.counters.todoId++;
    const todo = {
      id,
      userId: uid,
      title,
      completed: false,
      createdAt: new Date().toISOString()
    };
    db.todos.push(todo);
    return { todo };
  });
  return result.todo;
}

async function updateTodo(userId, todoId, { title, completed }) {
  const uid = toNumberIfNumeric(userId);
  const tid = toNumberIfNumeric(todoId);

  const result = await mutateDb((db) => {
    const todo = db.todos.find((t) => sameId(t.id, tid) && sameId(t.userId, uid));
    if (!todo) return { notFound: true };

    if (title !== undefined) {
      const nextTitle = String(title).trim();
      if (!nextTitle) return { badTitle: true };
      todo.title = nextTitle;
    }
    if (completed !== undefined) todo.completed = Boolean(completed);
    todo.updatedAt = new Date().toISOString();
    return { todo };
  });

  if (result.notFound) return { notFound: true };
  if (result.badTitle) return { badTitle: true };
  return { todo: result.todo };
}

async function deleteTodo(userId, todoId) {
  const uid = toNumberIfNumeric(userId);
  const tid = toNumberIfNumeric(todoId);

  const result = await mutateDb((db) => {
    const idx = db.todos.findIndex((t) => sameId(t.id, tid) && sameId(t.userId, uid));
    if (idx === -1) return { notFound: true };
    db.todos.splice(idx, 1);
    return { ok: true };
  });

  if (result.notFound) return { notFound: true };
  return { ok: true };
}

module.exports = {
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
