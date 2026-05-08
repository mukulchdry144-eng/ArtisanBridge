import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiFetch } from "../api/client";

const navItems = [
  { key: "overview", label: "Overview", icon: "fa-gauge-high", path: "/admin" },
  { key: "users", label: "Users", icon: "fa-users", path: "/admin/users" },
  { key: "activity", label: "Activity", icon: "fa-chart-line", path: "/admin/activity" },
  { key: "messages", label: "Messages", icon: "fa-inbox", path: "/admin/messages" },
  { key: "emails", label: "Emails", icon: "fa-envelope", path: "/admin/emails" },
  { key: "settings", label: "Settings", icon: "fa-sliders", path: "/admin/settings" }
];

function formatDate(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function shortDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function Badge({ children, tone = "slate" }) {
  const tones = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    yellow: "bg-amber-50 text-amber-700 border-amber-200",
    blue: "bg-sky-50 text-sky-700 border-sky-200",
    violet: "bg-violet-50 text-violet-700 border-violet-200",
    slate: "bg-slate-50 text-slate-700 border-slate-200",
    red: "bg-red-50 text-red-700 border-red-200"
  };

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

function StatCard({ icon, label, value, note, tone }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{value ?? 0}</p>
        </div>
        <span className={`flex h-11 w-11 items-center justify-center rounded-md ${tone}`}>
          <i className={`fa-solid ${icon}`} />
        </span>
      </div>
      {note ? <p className="mt-3 text-xs text-slate-500">{note}</p> : null}
    </section>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}

function PageTitle({ eyebrow, title, description, actions }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{eyebrow}</p>
        <h1 className="mt-1 text-3xl font-semibold text-slate-950">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [messageSearch, setMessageSearch] = useState("");
  const [messageStatus, setMessageStatus] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const activeSection = location.pathname.split("/")[2] || "overview";
  const activeNav = navItems.some((item) => item.key === activeSection) ? activeSection : "overview";

  const loadOverview = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await apiFetch("/api/admin/overview");
      setOverview(data);
    } catch (err) {
      setError(err.message || "Failed to load admin data");
      if (err.status === 401 || err.status === 403) {
        localStorage.removeItem("ab_token");
        navigate("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  const signOut = () => {
    localStorage.removeItem("ab_token");
    navigate("/admin/login");
  };

  const users = useMemo(() => overview?.users || [], [overview]);
  const inquiries = useMemo(() => overview?.inquiries || [], [overview]);
  const emailLogs = useMemo(() => overview?.emailLogs || [], [overview]);
  const activity = useMemo(() => overview?.activity || [], [overview]);
  const notifications = useMemo(() => overview?.notifications || [], [overview]);
  const stats = overview?.stats || {};
  const maxDailySignup = Math.max(1, ...(overview?.dailySignups || []).map((item) => item.count));

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesSearch =
        !term ||
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term);
      const matchesRole = !roleFilter || user.role === roleFilter;
      const matchesStatus = !statusFilter || user.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const filteredInquiries = useMemo(() => {
    const term = messageSearch.trim().toLowerCase();
    return inquiries.filter((inquiry) => {
      const matchesSearch =
        !term ||
        inquiry.name.toLowerCase().includes(term) ||
        inquiry.email.toLowerCase().includes(term) ||
        inquiry.category.toLowerCase().includes(term) ||
        inquiry.message.toLowerCase().includes(term);
      const matchesStatus = !messageStatus || inquiry.status === messageStatus;
      return matchesSearch && matchesStatus;
    });
  }, [inquiries, messageSearch, messageStatus]);

  const updateUser = async (userId, updates) => {
    setError("");
    setSavingId(String(userId));
    try {
      await apiFetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify(updates)
      });
      await loadOverview();
    } catch (err) {
      setError(err.message || "Failed to update user");
    } finally {
      setSavingId("");
    }
  };

  const updateInquiry = async (inquiryId, updates) => {
    setError("");
    setSavingId(String(inquiryId));
    try {
      await apiFetch(`/api/admin/inquiries/${inquiryId}`, {
        method: "PATCH",
        body: JSON.stringify(updates)
      });
      await loadOverview();
    } catch (err) {
      setError(err.message || "Failed to update inquiry");
    } finally {
      setSavingId("");
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <PageTitle
        eyebrow="Admin overview"
        title="ArtisanBridge command center"
        description="Monitor user growth, requests, email delivery, and platform activity from one place."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon="fa-users" label="Total users" value={stats.totalUsers} tone="bg-sky-50 text-sky-700" />
        <StatCard icon="fa-inbox" label="New inquiries" value={stats.newInquiries} tone="bg-violet-50 text-violet-700" />
        <StatCard icon="fa-envelope" label="Emails logged" value={(stats.emailsSent || 0) + (stats.emailsQueued || 0)} tone="bg-amber-50 text-amber-700" />
        <StatCard icon="fa-user-check" label="Active users" value={stats.activeUsers} tone="bg-emerald-50 text-emerald-700" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">7 day signups</h2>
              <p className="text-sm text-slate-500">New account movement across the week.</p>
            </div>
            <Badge tone="blue">{stats.newUsersToday || 0} today</Badge>
          </div>
          <div className="mt-6 grid h-56 grid-cols-7 items-end gap-3">
            {(overview?.dailySignups || []).map((item) => (
              <div key={item.date} className="flex h-full flex-col justify-end gap-2">
                <div className="flex flex-1 items-end rounded-md bg-slate-100">
                  <span
                    className="block w-full rounded-md bg-[#F5C518]"
                    style={{ height: `${Math.max(8, (item.count / maxDailySignup) * 100)}%` }}
                  />
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold">{item.count}</p>
                  <p className="text-xs text-slate-500">{shortDate(item.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Role mix</h2>
          <div className="mt-4 space-y-3">
            {[
              ["Clients", stats.clients || 0, "bg-sky-500"],
              ["Freelancers", stats.freelancers || 0, "bg-violet-500"],
              ["Admins", stats.admins || 0, "bg-slate-900"]
            ].map(([label, value, color]) => (
              <div key={label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-semibold">{value}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <span
                    className={`block h-full rounded-full ${color}`}
                    style={{ width: `${Math.max(5, ((value || 0) / Math.max(1, stats.totalUsers || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <MiniList title="Recent inquiries" items={overview?.recentInquiries || []} path="/admin/messages" />
        <MiniList title="Recent users" items={overview?.recentUsers || []} path="/admin/users" />
        <ActivityList compact items={activity.slice(0, 5)} />
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <PageTitle
        eyebrow="Users"
        title="User management"
        description="Search users, review roles, check signups, and manage account status in a full-page view."
      />
      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_180px_180px]">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#F5C518] focus:ring-2 focus:ring-[#F5C518]/20"
              placeholder="Search by name or email"
            />
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#F5C518]">
              <option value="">All roles</option>
              <option value="client">Client</option>
              <option value="freelancer">Freelancer</option>
              <option value="admin">Admin</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#F5C518]">
              <option value="">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <UserTable users={filteredUsers} savingId={savingId} updateUser={updateUser} />
      </section>
    </div>
  );

  const renderActivity = () => (
    <div className="space-y-6">
      <PageTitle
        eyebrow="Activity"
        title="Live platform timeline"
        description="Every signup, inquiry, task, and email event is collected into one full activity page."
      />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon="fa-user-plus" label="Signups" value={stats.totalUsers} tone="bg-sky-50 text-sky-700" />
        <StatCard icon="fa-inbox" label="Requests" value={stats.totalInquiries} tone="bg-violet-50 text-violet-700" />
        <StatCard icon="fa-list-check" label="Tasks" value={stats.totalTodos} tone="bg-amber-50 text-amber-700" />
        <StatCard icon="fa-bell" label="Notifications" value={stats.unreadNotifications} tone="bg-emerald-50 text-emerald-700" />
      </div>
      <ActivityList items={activity} />
    </div>
  );

  const renderMessages = () => (
    <div className="space-y-6">
      <PageTitle
        eyebrow="Messages"
        title="Project request inbox"
        description="Requests submitted from the Get Started form land here, with status tracking and user details."
      />
      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_190px]">
            <input
              value={messageSearch}
              onChange={(e) => setMessageSearch(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#F5C518] focus:ring-2 focus:ring-[#F5C518]/20"
              placeholder="Search requests"
            />
            <select value={messageStatus} onChange={(e) => setMessageStatus(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#F5C518]">
              <option value="">All statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
        <InquiryList inquiries={filteredInquiries} savingId={savingId} updateInquiry={updateInquiry} />
      </section>
    </div>
  );

  const renderEmails = () => (
    <div className="space-y-6">
      <PageTitle
        eyebrow="Emails"
        title="Email delivery center"
        description="Welcome emails, admin alerts, and inquiry confirmations are tracked here."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon="fa-paper-plane" label="Sent" value={stats.emailsSent} tone="bg-emerald-50 text-emerald-700" />
        <StatCard icon="fa-clock" label="Queued" value={stats.emailsQueued} tone="bg-amber-50 text-amber-700" />
        <StatCard icon="fa-inbox" label="Total logs" value={emailLogs.length} tone="bg-sky-50 text-sky-700" />
      </div>
      <EmailTable emailLogs={emailLogs} />
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <PageTitle
        eyebrow="Settings"
        title="Admin configuration"
        description="Email delivery and admin account settings are controlled by backend environment variables."
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Email setup</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <p>Without SMTP, emails are saved as queued logs in this panel.</p>
            <p>With SMTP, emails are sent to the user and the admin notification address.</p>
          </div>
          <div className="mt-5 grid gap-2 text-sm">
            {["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "SMTP_FROM", "ADMIN_NOTIFY_EMAIL"].map((item) => (
              <div key={item} className="rounded-md bg-slate-50 px-3 py-2 font-mono text-xs text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Notifications</h2>
          <div className="mt-4 space-y-3">
            {notifications.length === 0 ? (
              <p className="text-sm text-slate-500">No notifications yet.</p>
            ) : (
              notifications.slice(0, 8).map((notification) => (
                <div key={notification.id} className="rounded-md border border-slate-100 p-3">
                  <p className="text-sm font-semibold">{notification.title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{notification.message}</p>
                  <p className="mt-2 text-xs text-slate-400">{formatDate(notification.createdAt)}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );

  const sectionMap = {
    overview: renderOverview,
    users: renderUsers,
    activity: renderActivity,
    messages: renderMessages,
    emails: renderEmails,
    settings: renderSettings
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="bg-[#111827] px-5 py-6 text-white">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-black">
              <i className="fa-solid fa-palette text-xl text-[#F5C518]" />
            </span>
            <span className="text-lg font-semibold">
              Artisan<span className="text-[#F5C518]">Bridge</span>
            </span>
          </Link>

          <nav className="mt-8 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => navigate(item.path)}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition ${
                  activeNav === item.key
                    ? "bg-white/10 font-semibold text-white"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <i className={`fa-solid ${item.icon} ${activeNav === item.key ? "text-[#F5C518]" : ""}`} />
                {item.label}
                {item.key === "messages" && stats.newInquiries ? (
                  <span className="ml-auto rounded-full bg-[#F5C518] px-2 py-0.5 text-xs font-bold text-black">
                    {stats.newInquiries}
                  </span>
                ) : null}
              </button>
            ))}
          </nav>

          <div className="mt-8 rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Admin</p>
            <p className="mt-2 text-sm font-semibold">Real operations panel</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Users, requests, activity, and email logs update from the database.
            </p>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur md:px-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-slate-500">Admin panel</p>
                <p className="text-xl font-semibold">ArtisanBridge back office</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={loadOverview}
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <i className="fa-solid fa-rotate-right mr-2" />
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={signOut}
                  className="rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  <i className="fa-solid fa-right-from-bracket mr-2" />
                  Sign out
                </button>
              </div>
            </div>
          </header>

          <div className="px-4 py-6 md:px-8">
            {error ? (
              <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {loading && !overview ? (
              <EmptyState text="Loading admin data..." />
            ) : (
              sectionMap[activeNav]()
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function MiniList({ title, items, path }) {
  const navigate = useNavigate();
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button onClick={() => navigate(path)} className="text-sm font-semibold text-[#8a6500] hover:underline">
          View all
        </button>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">No records yet.</p>
      ) : (
        <div className="space-y-3">
          {items.slice(0, 5).map((item) => (
            <div key={item.id} className="rounded-md border border-slate-100 p-3">
              <p className="truncate text-sm font-semibold">{item.name || item.email || item.title}</p>
              <p className="mt-1 truncate text-xs text-slate-500">{item.email || item.role || item.message}</p>
              <p className="mt-2 text-xs text-slate-400">{formatDate(item.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function UserTable({ users, savingId, updateUser }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3 font-semibold">User</th>
            <th className="px-4 py-3 font-semibold">Role</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Joined</th>
            <th className="px-4 py-3 font-semibold">Last login</th>
            <th className="px-4 py-3 font-semibold">Tasks</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {users.length === 0 ? (
            <tr>
              <td colSpan="6" className="px-4 py-8 text-center text-slate-500">No users found.</td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
                      {(user.name || user.email || "U").slice(0, 1).toUpperCase()}
                    </span>
                    <span>
                      <span className="block font-semibold">{user.name || "Unnamed user"}</span>
                      <span className="block text-xs text-slate-500">{user.email}</span>
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <select value={user.role} disabled={savingId === String(user.id)} onChange={(e) => updateUser(user.id, { role: e.target.value })} className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs font-semibold capitalize outline-none focus:border-[#F5C518]">
                    <option value="client">Client</option>
                    <option value="freelancer">Freelancer</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <select value={user.status} disabled={savingId === String(user.id)} onChange={(e) => updateUser(user.id, { status: e.target.value })} className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs font-semibold capitalize outline-none focus:border-[#F5C518]">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-slate-600">{formatDate(user.createdAt)}</td>
                <td className="px-4 py-3 text-slate-600">{formatDate(user.lastLoginAt)}</td>
                <td className="px-4 py-3 font-semibold">{user.todoCount || 0}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function InquiryList({ inquiries, savingId, updateInquiry }) {
  if (inquiries.length === 0) return <EmptyState text="No project requests found." />;
  return (
    <div className="grid gap-4 p-4 xl:grid-cols-2">
      {inquiries.map((inquiry) => (
        <article key={inquiry.id} className="rounded-lg border border-slate-200 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold">{inquiry.name || "Unnamed request"}</h3>
              <p className="mt-1 text-sm text-slate-500">{inquiry.email}</p>
              <p className="mt-1 text-xs text-slate-400">{formatDate(inquiry.createdAt)}</p>
            </div>
            <select value={inquiry.status} disabled={savingId === String(inquiry.id)} onChange={(e) => updateInquiry(inquiry.id, { status: e.target.value })} className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs font-semibold capitalize outline-none focus:border-[#F5C518]">
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
            <p><span className="font-semibold text-slate-900">Role:</span> {inquiry.role}</p>
            <p><span className="font-semibold text-slate-900">Phone:</span> {inquiry.phone || "Not provided"}</p>
            <p><span className="font-semibold text-slate-900">Category:</span> {inquiry.category || "Not provided"}</p>
            <p><span className="font-semibold text-slate-900">Budget:</span> {inquiry.budget || "Not provided"}</p>
            <p><span className="font-semibold text-slate-900">Timeline:</span> {inquiry.timeline || "Not provided"}</p>
          </div>
          <p className="mt-4 rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-700">{inquiry.message}</p>
          <a href={`mailto:${inquiry.email}`} className="mt-4 inline-flex items-center rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800">
            Reply by email
            <i className="fa-solid fa-arrow-up-right-from-square ml-2 text-xs" />
          </a>
        </article>
      ))}
    </div>
  );
}

function ActivityList({ items, compact = false }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">{compact ? "Recent activity" : "Activity stream"}</h2>
      <div className="mt-4 space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">No activity yet.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="grid grid-cols-[40px_1fr] gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                <i className={`fa-solid ${item.type === "email" ? "fa-envelope" : item.type === "inquiry" ? "fa-inbox" : item.type === "signup" ? "fa-user-plus" : "fa-list-check"}`} />
              </span>
              <div className="min-w-0 border-b border-slate-100 pb-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-xs text-slate-400">{formatDate(item.createdAt)}</p>
                </div>
                <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                <p className="mt-1 text-xs text-slate-400">{item.actor}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function EmailTable({ emailLogs }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Recipient</th>
              <th className="px-4 py-3 font-semibold">Subject</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {emailLogs.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-slate-500">No email logs yet.</td>
              </tr>
            ) : (
              emailLogs.map((email) => (
                <tr key={email.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold">{email.to}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{email.subject}</p>
                    {email.error ? <p className="mt-1 text-xs text-red-600">{email.error}</p> : null}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{email.type}</td>
                  <td className="px-4 py-3">
                    <Badge tone={email.status === "sent" ? "green" : email.status === "failed" ? "red" : "yellow"}>
                      {email.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(email.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
