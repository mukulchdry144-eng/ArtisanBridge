const net = require("net");
const tls = require("tls");
const { getRepo } = require("../storage/repo");

function adminEmail() {
  return (
    process.env.ADMIN_NOTIFY_EMAIL ||
    process.env.ADMIN_EMAIL ||
    process.env.SMTP_FROM ||
    "admin@artisanbridge.com"
  );
}

function emailEnabled() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_FROM);
}

function escapeLineDots(value) {
  return String(value || "").replace(/\r?\n\./g, "\r\n..");
}

function buildMessage({ from, to, subject, body }) {
  return [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=utf-8",
    "",
    escapeLineDots(body)
  ].join("\r\n");
}

function createReader(socket) {
  let buffer = "";
  const queue = [];

  socket.on("data", (chunk) => {
    buffer += chunk.toString("utf8");
    let index = buffer.indexOf("\n");
    while (index !== -1) {
      const line = buffer.slice(0, index + 1);
      buffer = buffer.slice(index + 1);
      queue.push(line);
      index = buffer.indexOf("\n");
    }
  });

  return async function readResponse() {
    const lines = [];
    const startedAt = Date.now();
    while (Date.now() - startedAt < 15000) {
      while (queue.length) {
        const line = queue.shift().trimEnd();
        lines.push(line);
        if (/^\d{3} /.test(line)) {
          const code = Number(line.slice(0, 3));
          if (code >= 400) throw new Error(lines.join(" "));
          return lines.join("\n");
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
    throw new Error("SMTP response timed out");
  };
}

function write(socket, command) {
  socket.write(`${command}\r\n`);
}

async function sendSmtp({ to, subject, body }) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || "").toLowerCase() === "true" || port === 465;
  const from = process.env.SMTP_FROM;
  const user = process.env.SMTP_USER || "";
  const pass = process.env.SMTP_PASS || "";
  let socket = secure
    ? tls.connect({ host, port, servername: host })
    : net.connect({ host, port });

  await new Promise((resolve, reject) => {
    socket.once("connect", resolve);
    socket.once("secureConnect", resolve);
    socket.once("error", reject);
  });

  let readResponse = createReader(socket);
  await readResponse();

  write(socket, `EHLO ${process.env.SMTP_HELO || "artisanbridge.local"}`);
  await readResponse();

  if (!secure && String(process.env.SMTP_STARTTLS || "true").toLowerCase() !== "false") {
    write(socket, "STARTTLS");
    await readResponse();
    socket = tls.connect({ socket, servername: host });
    await new Promise((resolve, reject) => {
      socket.once("secureConnect", resolve);
      socket.once("error", reject);
    });
    readResponse = createReader(socket);
    write(socket, `EHLO ${process.env.SMTP_HELO || "artisanbridge.local"}`);
    await readResponse();
  }

  if (user && pass) {
    write(socket, "AUTH LOGIN");
    await readResponse();
    write(socket, Buffer.from(user).toString("base64"));
    await readResponse();
    write(socket, Buffer.from(pass).toString("base64"));
    await readResponse();
  }

  write(socket, `MAIL FROM:<${from}>`);
  await readResponse();
  write(socket, `RCPT TO:<${to}>`);
  await readResponse();
  write(socket, "DATA");
  await readResponse();
  socket.write(`${buildMessage({ from, to, subject, body })}\r\n.\r\n`);
  await readResponse();
  write(socket, "QUIT");
  socket.end();
}

async function logAndSendEmail({ to, subject, body, type, userId, inquiryId }) {
  const repo = getRepo();
  let status = "queued";
  let error = "";

  if (emailEnabled()) {
    try {
      await sendSmtp({ to, subject, body });
      status = "sent";
    } catch (err) {
      status = "failed";
      error = err.message || "Email failed";
    }
  }

  return repo.createEmailLog({
    to,
    subject,
    body,
    type,
    userId,
    inquiryId,
    status,
    error
  });
}

async function notifyUserRegistration(user) {
  const repo = getRepo();
  await repo.createNotification({
    title: "New user registered",
    message: `${user.email} joined as ${user.role || "client"}.`,
    type: "signup",
    audience: "admin",
    userId: user.id
  });

  await logAndSendEmail({
    to: user.email,
    subject: "Welcome to ArtisanBridge",
    type: "welcome",
    userId: user.id,
    body: `Hi ${user.name || "there"},

Welcome to ArtisanBridge. Your ${user.role || "client"} account is ready.

You can now sign in and continue your journey on ArtisanBridge.`
  });

  await logAndSendEmail({
    to: adminEmail(),
    subject: "New ArtisanBridge user signup",
    type: "admin_signup",
    userId: user.id,
    body: `A new user joined ArtisanBridge.

Name: ${user.name || "Not provided"}
Email: ${user.email}
Role: ${user.role || "client"}`
  });
}

async function notifyInquiry(inquiry) {
  const repo = getRepo();
  await repo.createNotification({
    title: "New project inquiry",
    message: `${inquiry.name || inquiry.email} submitted a ${inquiry.category || "project"} inquiry.`,
    type: "inquiry",
    audience: "admin",
    inquiryId: inquiry.id
  });

  await logAndSendEmail({
    to: inquiry.email,
    subject: "We received your ArtisanBridge request",
    type: "inquiry_confirmation",
    inquiryId: inquiry.id,
    body: `Hi ${inquiry.name || "there"},

Thanks for reaching out to ArtisanBridge. We received your request and our team will review it soon.

Request summary:
Category: ${inquiry.category || "Not provided"}
Budget: ${inquiry.budget || "Not provided"}
Timeline: ${inquiry.timeline || "Not provided"}

Message:
${inquiry.message || "No message provided"}`
  });

  await logAndSendEmail({
    to: adminEmail(),
    subject: "New project inquiry on ArtisanBridge",
    type: "admin_inquiry",
    inquiryId: inquiry.id,
    body: `A new project inquiry was submitted.

Name: ${inquiry.name || "Not provided"}
Email: ${inquiry.email}
Phone: ${inquiry.phone || "Not provided"}
Role: ${inquiry.role || "client"}
Category: ${inquiry.category || "Not provided"}
Budget: ${inquiry.budget || "Not provided"}
Timeline: ${inquiry.timeline || "Not provided"}

Message:
${inquiry.message || "No message provided"}`
  });
}

module.exports = {
  logAndSendEmail,
  notifyUserRegistration,
  notifyInquiry
};
