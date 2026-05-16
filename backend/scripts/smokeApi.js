const fs = require("fs");
const os = require("os");
const path = require("path");
const assert = require("assert/strict");

const dbPath = path.join(os.tmpdir(), `artisanbridge-smoke-${process.pid}.json`);

process.env.NODE_ENV = process.env.NODE_ENV || "development";
process.env.JWT_SECRET = "smoke_test_secret_change_me";
process.env.STORAGE_DRIVER = "file";
process.env.FILE_DB_PATH = dbPath;
process.env.MONGO_URI = "";
process.env.SMTP_HOST = "";
process.env.FRONTEND_ORIGINS = "http://localhost:3000,http://localhost:5173";

const bcrypt = require("bcryptjs");
const app = require("../src/app");
const { getRepo, initStorage } = require("../src/storage/repo");

async function listen() {
  return new Promise((resolve) => {
    const server = app.listen(0, () => resolve(server));
  });
}

async function close(server) {
  if (!server) return;
  await new Promise((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
}

function parseJson(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function makeRequester(baseUrl) {
  return async function request(method, route, { body, token, headers = {} } = {}) {
    const requestHeaders = { ...headers };

    if (body !== undefined) requestHeaders["Content-Type"] = "application/json";
    if (token) requestHeaders.Authorization = `Bearer ${token}`;

    const res = await fetch(`${baseUrl}${route}`, {
      method,
      headers: requestHeaders,
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    const payload = parseJson(await res.text());

    if (!res.ok) {
      const message = typeof payload === "object" && payload ? payload.error || payload.message : payload;
      throw new Error(`${method} ${route} failed with ${res.status}: ${message || res.statusText}`);
    }

    return { res, payload };
  };
}

async function main() {
  await initStorage();

  const repo = getRepo();
  const adminPassword = "admin1234";
  await repo.upsertAdminUser({
    email: "admin@artisanbridge.test",
    passwordHash: await bcrypt.hash(adminPassword, 10),
    name: "Smoke Admin"
  });

  const server = await listen();
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const request = makeRequester(baseUrl);
  const suffix = Date.now();

  try {
    const health = await request("GET", "/api/health", {
      headers: { Origin: "http://localhost:5173" }
    });
    assert.equal(health.payload.ok, true);
    assert.equal(health.res.headers.get("access-control-allow-origin"), "http://localhost:5173");
    console.log("ok health + CORS");

    const clientEmail = `client-${suffix}@example.test`;
    const freelancerEmail = `artist-${suffix}@example.test`;

    const clientRegister = await request("POST", "/api/auth/register", {
      body: {
        name: "Smoke Client",
        email: clientEmail,
        password: "password123",
        role: "client"
      }
    });
    const clientToken = clientRegister.payload.token;
    const clientId = clientRegister.payload.user.id;
    assert.equal(clientRegister.payload.user.role, "client");
    console.log("ok auth register client");

    const freelancerRegister = await request("POST", "/api/auth/register", {
      body: {
        name: "Smoke Artist",
        email: freelancerEmail,
        password: "password123",
        role: "freelancer"
      }
    });
    const freelancerToken = freelancerRegister.payload.token;
    const artistId = freelancerRegister.payload.user.id;
    assert.equal(freelancerRegister.payload.user.role, "freelancer");
    console.log("ok auth register freelancer");

    const login = await request("POST", "/api/auth/login", {
      body: { email: clientEmail, password: "password123" }
    });
    assert.equal(login.payload.user.email, clientEmail);
    console.log("ok auth login");

    const me = await request("GET", "/api/auth/me", { token: clientToken });
    assert.equal(me.payload.email, clientEmail);
    console.log("ok auth me");

    const forgot = await request("POST", "/api/auth/forgot-password", {
      body: { email: clientEmail }
    });
    assert.match(forgot.payload.message, /If an account exists/);
    console.log("ok forgot password");

    const inquiry = await request("POST", "/api/inquiries", {
      body: {
        name: "Smoke Request",
        email: "request@example.test",
        role: "client",
        category: "Portrait",
        budget: "$100 - $500",
        timeline: "2 - 4 weeks",
        message: "Smoke test project request"
      }
    });
    const inquiryId = inquiry.payload.id;
    assert.equal(inquiry.payload.status, "new");
    console.log("ok inquiries create");

    const todo = await request("POST", "/api/todos", {
      token: clientToken,
      body: { title: "Smoke todo" }
    });
    const todoId = todo.payload.id;
    assert.equal(todo.payload.completed, false);
    await request("GET", "/api/todos", { token: clientToken });
    await request("PATCH", `/api/todos/${todoId}`, {
      token: clientToken,
      body: { completed: true }
    });
    await request("DELETE", `/api/todos/${todoId}`, { token: clientToken });
    console.log("ok todos CRUD");

    const artists = await request("GET", "/api/dashboard/artists", { token: clientToken });
    assert.equal(artists.payload.length, 1);
    console.log("ok dashboard artists");

    const contact = await request("POST", "/api/dashboard/contact", {
      token: clientToken,
      body: {
        artistId,
        subject: "Smoke contact",
        message: "Hello from smoke test",
        projectTitle: "Smoke Project",
        budget: "5000",
        timeline: "Next month"
      }
    });
    const messageId = contact.payload.id;
    assert.equal(contact.payload.artistId, artistId);
    console.log("ok dashboard contact");

    const order = await request("POST", "/api/dashboard/orders", {
      token: clientToken,
      body: {
        artistId,
        title: "Smoke Order",
        description: "Smoke order description",
        category: "Illustration",
        price: 5000,
        deliveryDate: "2026-06-01"
      }
    });
    const orderId = order.payload.id;
    assert.equal(order.payload.status, "requested");
    console.log("ok dashboard order create");

    const clientDashboard = await request("GET", "/api/dashboard/overview", { token: clientToken });
    assert.equal(clientDashboard.payload.user.role, "client");
    assert.equal(clientDashboard.payload.orders.length, 1);
    console.log("ok client dashboard overview");

    const freelancerDashboard = await request("GET", "/api/dashboard/overview", {
      token: freelancerToken
    });
    assert.equal(freelancerDashboard.payload.user.role, "freelancer");
    assert.equal(freelancerDashboard.payload.messages.length, 1);
    console.log("ok freelancer dashboard overview");

    const readMessage = await request("PATCH", `/api/dashboard/messages/${messageId}/read`, {
      token: freelancerToken
    });
    assert.equal(readMessage.payload.status, "read");
    console.log("ok dashboard message read");

    const updatedOrder = await request("PATCH", `/api/dashboard/orders/${orderId}`, {
      token: freelancerToken,
      body: { status: "in_progress" }
    });
    assert.equal(updatedOrder.payload.status, "in_progress");
    console.log("ok dashboard order update");

    const adminLogin = await request("POST", "/api/auth/admin-login", {
      body: { email: "admin@artisanbridge.test", password: adminPassword }
    });
    const adminToken = adminLogin.payload.token;
    assert.equal(adminLogin.payload.user.role, "admin");
    console.log("ok admin login");

    const adminOverview = await request("GET", "/api/admin/overview", { token: adminToken });
    assert.ok(adminOverview.payload.stats.totalUsers >= 3);
    console.log("ok admin overview");

    await request("GET", "/api/admin/users", { token: adminToken });
    await request("PATCH", `/api/admin/users/${clientId}`, {
      token: adminToken,
      body: { status: "active" }
    });
    await request("GET", "/api/admin/inquiries", { token: adminToken });
    await request("PATCH", `/api/admin/inquiries/${inquiryId}`, {
      token: adminToken,
      body: { status: "contacted" }
    });
    await request("GET", "/api/admin/emails", { token: adminToken });
    await request("GET", "/api/admin/notifications", { token: adminToken });
    console.log("ok admin routes");
  } finally {
    await close(server);
    await fs.promises.rm(dbPath, { force: true });
  }
}

main().catch(async (err) => {
  console.error(err.message);
  await fs.promises.rm(dbPath, { force: true }).catch(() => {});
  process.exit(1);
});
