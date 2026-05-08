import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/client";
import DashboardSidebar from "../components/DashboardSidebar";

const orderStatuses = ["requested", "in_progress", "delivered", "completed", "cancelled"];

function formatMoney(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function StatusBadge({ status }) {
  const tones = {
    requested: "bg-amber-50 text-amber-700 border-amber-200",
    in_progress: "bg-sky-50 text-sky-700 border-sky-200",
    delivered: "bg-violet-50 text-violet-700 border-violet-200",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
    new: "bg-amber-50 text-amber-700 border-amber-200",
    read: "bg-sky-50 text-sky-700 border-sky-200",
    replied: "bg-emerald-50 text-emerald-700 border-emerald-200",
    archived: "bg-slate-50 text-slate-600 border-slate-200"
  };

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${tones[status] || tones.new}`}>
      {String(status || "new").replace("_", " ")}
    </span>
  );
}

function StatCard({ icon, label, value, note, tone }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 truncate text-3xl font-semibold text-slate-950">{value}</p>
          {note ? <p className="mt-2 text-xs text-slate-500">{note}</p> : null}
        </div>
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md ${tone}`}>
          <i className={`fa-solid ${icon}`} />
        </span>
      </div>
    </section>
  );
}

function EmptyState({ children }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
      {children}
    </div>
  );
}

export default function FreelancerDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [activeMessage, setActiveMessage] = useState(null);
  const navigate = useNavigate();

  const loadDashboard = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await apiFetch("/api/dashboard/overview");
      if (data.user?.role === "client") {
        navigate("/client-dashboard", { replace: true });
        return;
      }
      if (data.user?.role === "admin") {
        navigate("/admin", { replace: true });
        return;
      }
      setDashboard(data);
    } catch (err) {
      setError(err.message || "Failed to load dashboard");
      if (err.status === 401) {
        localStorage.removeItem("ab_token");
        navigate("/signin");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const stats = dashboard?.stats || {};
  const orders = dashboard?.orders || [];
  const messages = dashboard?.messages || [];
  const recentOrders = dashboard?.recentOrders || [];
  const revenueReport = dashboard?.revenueReport || [];
  const recentActivity = dashboard?.recentActivity || [];
  const maxRevenue = Math.max(1, ...revenueReport.map((item) => Number(item.revenue || 0)));
  const maxVolume = Math.max(1, ...revenueReport.map((item) => Number(item.orders || 0) + Number(item.contacts || 0)));

  const sortedMessages = messages.slice().sort((a, b) => {
    if (a.status === "new" && b.status !== "new") return -1;
    if (a.status !== "new" && b.status === "new") return 1;
    return String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
  });

  const signOut = () => {
    localStorage.removeItem("ab_token");
    navigate("/signin");
  };

  const updateOrderStatus = async (orderId, status) => {
    setSavingId(String(orderId));
    setError("");
    try {
      await apiFetch(`/api/dashboard/orders/${orderId}`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      });
      await loadDashboard();
    } catch (err) {
      setError(err.message || "Failed to update order");
    } finally {
      setSavingId("");
    }
  };

  const openMessage = async (message) => {
    setActiveMessage(message);
    if (message.status !== "new") return;
    try {
      const updated = await apiFetch(`/api/dashboard/messages/${message.id}/read`, { method: "PATCH" });
      setActiveMessage(updated);
      await loadDashboard();
    } catch (err) {
      setError(err.message || "Failed to update message");
    }
  };

  const navItems = [
    { href: "#overview", label: "Overview", icon: "fa-gauge-high" },
    { href: "#reports", label: "Reports", icon: "fa-chart-line" },
    { href: "#messages", label: "Messages", icon: "fa-envelope", badge: stats.unreadMessages || 0 },
    { href: "#orders", label: "Orders", icon: "fa-bag-shopping", badge: stats.activeOrders || 0 },
    { href: "#activity", label: "Activity", icon: "fa-clock-rotate-left" }
  ];

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <DashboardSidebar
          roleLabel="Artist"
          user={dashboard?.user}
          navItems={navItems}
          primaryStat={{ label: "Revenue", value: formatMoney(stats.revenue) }}
          secondaryStat={{ label: "Orders", value: stats.totalOrders || 0 }}
          onRefresh={loadDashboard}
          onSignOut={signOut}
        />

        <section className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur md:px-8">
            <div className="mx-auto flex max-w-7xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Artist dashboard</p>
                <h1 className="mt-1 text-2xl font-semibold text-slate-950 md:text-3xl">
                  {dashboard?.user?.name ? `Studio report for ${dashboard.user.name}` : "Studio report"}
                </h1>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-[#F5C518]/40 bg-[#F5C518]/15 px-3 py-1.5 text-xs font-semibold text-[#7a5b00]">
                  {formatMoney(stats.revenue)} revenue
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">
                  {stats.unreadMessages || 0} unread messages
                </span>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">

        {error ? (
          <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {loading && !dashboard ? (
          <EmptyState>Loading freelancer dashboard...</EmptyState>
        ) : (
          <div className="space-y-6">
            <div id="overview" className="grid scroll-mt-24 gap-4 md:grid-cols-2 xl:grid-cols-5">
              <StatCard icon="fa-chart-line" label="Revenue" value={formatMoney(stats.revenue)} note="Booked from platform" tone="bg-emerald-50 text-emerald-700" />
              <StatCard icon="fa-bag-shopping" label="Total orders" value={stats.totalOrders || 0} note={`${stats.activeOrders || 0} active`} tone="bg-sky-50 text-sky-700" />
              <StatCard icon="fa-check" label="Completed" value={stats.completedOrders || 0} note="Delivered work" tone="bg-violet-50 text-violet-700" />
              <StatCard icon="fa-user-group" label="Clients" value={stats.clientsContacted || 0} note="Order and message clients" tone="bg-amber-50 text-amber-700" />
              <StatCard icon="fa-envelope" label="Unread" value={stats.unreadMessages || 0} note={`${messages.length} total messages`} tone="bg-rose-50 text-rose-700" />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
              <section id="reports" className="scroll-mt-24 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Growth graph</h2>
                    <p className="text-sm text-slate-500">Revenue, orders, and client contacts by month.</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Avg {formatMoney(stats.averageOrderValue)}
                  </span>
                </div>

                <div className="grid h-72 grid-cols-6 items-end gap-3">
                  {revenueReport.map((item) => {
                    const revenueHeight = Math.max(8, (Number(item.revenue || 0) / maxRevenue) * 100);
                    const volumeHeight = Math.max(8, ((Number(item.orders || 0) + Number(item.contacts || 0)) / maxVolume) * 100);

                    return (
                      <div key={item.month} className="flex h-full min-w-0 flex-col justify-end gap-2">
                        <div className="flex flex-1 items-end justify-center gap-1 rounded-md bg-slate-100 px-2 pt-3">
                          <span
                            className="block w-5 rounded-t-md bg-emerald-500"
                            style={{ height: `${revenueHeight}%` }}
                            title={`Revenue ${formatMoney(item.revenue)}`}
                          />
                          <span
                            className="block w-5 rounded-t-md bg-[#F5C518]"
                            style={{ height: `${volumeHeight}%` }}
                            title={`${item.orders} orders, ${item.contacts} contacts`}
                          />
                        </div>
                        <div className="text-center">
                          <p className="truncate text-xs font-semibold">{item.label}</p>
                          <p className="truncate text-xs text-slate-500">{formatMoney(item.revenue)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section id="messages" className="scroll-mt-24 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold">Client messages</h2>
                <div className="mt-4 space-y-3">
                  {sortedMessages.length === 0 ? (
                    <p className="text-sm text-slate-500">No client messages yet.</p>
                  ) : (
                    sortedMessages.slice(0, 6).map((message) => (
                      <button
                        key={message.id}
                        type="button"
                        onClick={() => openMessage(message)}
                        className="block w-full rounded-lg border border-slate-200 p-3 text-left hover:bg-slate-50"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{message.client?.name || "Client"}</p>
                            <p className="mt-1 truncate text-xs text-slate-500">{message.subject || message.projectTitle}</p>
                          </div>
                          <StatusBadge status={message.status} />
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{message.message}</p>
                        <p className="mt-2 text-xs text-slate-400">{formatDate(message.createdAt)}</p>
                      </button>
                    ))
                  )}
                </div>
              </section>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
              <section id="orders" className="scroll-mt-24 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Orders</h2>
                    <p className="text-sm text-slate-500">Client, price, timing, and status controls.</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {orders.length} total
                  </span>
                </div>

                {orders.length === 0 ? (
                  <EmptyState>No orders yet.</EmptyState>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <article key={order.id} className="rounded-lg border border-slate-200 p-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-base font-semibold">{order.title}</h3>
                              <StatusBadge status={order.status} />
                            </div>
                            <p className="mt-2 text-sm leading-6 text-slate-600">{order.description || "No description added."}</p>
                          </div>
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <p className="text-xl font-semibold text-slate-950">{formatMoney(order.price)}</p>
                            <select
                              value={order.status}
                              disabled={savingId === String(order.id)}
                              onChange={(event) => updateOrderStatus(order.id, event.target.value)}
                              className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm font-semibold capitalize outline-none focus:border-[#F5C518]"
                            >
                              {orderStatuses.map((status) => (
                                <option key={status} value={status}>
                                  {status.replace("_", " ")}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-4">
                          <Detail label="Client" value={order.client?.name || "Unknown client"} />
                          <Detail label="Client email" value={order.client?.email || "Not available"} />
                          <Detail label="Order time" value={formatDate(order.createdAt)} />
                          <Detail label="Delivery date" value={order.deliveryDate || "Not set"} />
                          <Detail label="Category" value={order.category || "General"} />
                          <Detail label="Artist email" value={order.artist?.email || dashboard?.user?.email} />
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <div className="space-y-6">
                <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="text-lg font-semibold">Revenue report</h2>
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full min-w-[520px] text-left text-sm">
                      <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                        <tr>
                          <th className="py-3 font-semibold">Month</th>
                          <th className="py-3 font-semibold">Revenue</th>
                          <th className="py-3 font-semibold">Orders</th>
                          <th className="py-3 font-semibold">Contacts</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {revenueReport.map((item) => (
                          <tr key={item.month}>
                            <td className="py-3 font-semibold">{item.label}</td>
                            <td className="py-3 text-slate-700">{formatMoney(item.revenue)}</td>
                            <td className="py-3 text-slate-700">{item.orders}</td>
                            <td className="py-3 text-slate-700">{item.contacts}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="text-lg font-semibold">Recent orders</h2>
                  <div className="mt-4 space-y-3">
                    {recentOrders.length === 0 ? (
                      <p className="text-sm text-slate-500">No recent orders yet.</p>
                    ) : (
                      recentOrders.map((order) => (
                        <div key={order.id} className="rounded-lg border border-slate-200 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold">{order.title}</p>
                              <p className="mt-1 truncate text-xs text-slate-500">{order.client?.name}</p>
                            </div>
                            <StatusBadge status={order.status} />
                          </div>
                          <p className="mt-2 text-sm font-semibold">{formatMoney(order.price)}</p>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </div>
            </div>

            <section id="activity" className="scroll-mt-24 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold">Recent activity</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {recentActivity.length === 0 ? (
                  <p className="text-sm text-slate-500">No activity yet.</p>
                ) : (
                  recentActivity.map((item) => (
                    <div key={item.id} className="grid grid-cols-[38px_1fr] gap-3 rounded-lg border border-slate-200 p-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                        <i className={`fa-solid ${item.type === "order" ? "fa-bag-shopping" : "fa-message"}`} />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{item.title}</p>
                        <p className="mt-1 truncate text-xs text-slate-500">{item.description}</p>
                        <p className="mt-1 text-xs text-slate-400">{formatDate(item.createdAt)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}
          </div>
        </section>
      </div>

      {activeMessage ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-500">Client message</p>
                <h2 className="mt-1 truncate text-xl font-semibold">{activeMessage.subject || activeMessage.projectTitle}</h2>
                <p className="mt-1 text-sm text-slate-500">{formatDate(activeMessage.createdAt)}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveMessage(null)}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50"
                aria-label="Close"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                <Detail label="Client" value={activeMessage.client?.name || "Unknown client"} />
                <Detail label="Client email" value={activeMessage.client?.email || "Not available"} />
                <Detail label="Project" value={activeMessage.projectTitle || "Not specified"} />
                <Detail label="Budget" value={activeMessage.budget || "Not specified"} />
                <Detail label="Timeline" value={activeMessage.timeline || "Not specified"} />
                <Detail label="Status" value={String(activeMessage.status || "new").replace("_", " ")} />
              </div>

              <div className="rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                {activeMessage.message}
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setActiveMessage(null)}
                  className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
                {activeMessage.client?.email ? (
                  <a
                    href={`mailto:${activeMessage.client.email}`}
                    className="rounded-md bg-slate-950 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    <i className="fa-solid fa-reply mr-2" />
                    Reply
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function Detail({ label, value }) {
  return (
    <p>
      <span className="font-semibold text-slate-900">{label}:</span>{" "}
      <span className="text-slate-600">{value || "Not available"}</span>
    </p>
  );
}
