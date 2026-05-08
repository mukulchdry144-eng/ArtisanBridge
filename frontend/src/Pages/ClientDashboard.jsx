import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/client";
import DashboardSidebar from "../components/DashboardSidebar";

const emptyContact = {
  projectTitle: "",
  subject: "",
  message: "",
  budget: "",
  timeline: ""
};

const emptyOrder = {
  title: "",
  description: "",
  category: "",
  price: "",
  deliveryDate: ""
};

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
  const label = String(status || "new").replace("_", " ");

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${tones[status] || tones.new}`}>
      {label}
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

export default function ClientDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [modalMode, setModalMode] = useState("");
  const [contactForm, setContactForm] = useState(emptyContact);
  const [orderForm, setOrderForm] = useState(emptyOrder);
  const navigate = useNavigate();

  const loadDashboard = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await apiFetch("/api/dashboard/overview");
      if (data.user?.role === "freelancer") {
        navigate("/freelancer-dashboard", { replace: true });
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
  const artists = dashboard?.artists || [];
  const contactedArtists = dashboard?.contactedArtists || [];
  const recentActivity = dashboard?.recentActivity || [];

  const topArtists = artists.slice(0, 6);

  const signOut = () => {
    localStorage.removeItem("ab_token");
    navigate("/signin");
  };

  const openContact = (artist) => {
    setSelectedArtist(artist);
    setModalMode("contact");
    setContactForm({
      ...emptyContact,
      subject: `Project inquiry for ${artist.specialty}`,
      budget: artist.baseRate ? String(artist.baseRate) : ""
    });
  };

  const openOrder = (artist) => {
    setSelectedArtist(artist);
    setModalMode("order");
    setOrderForm({
      ...emptyOrder,
      category: artist.category || "",
      price: artist.baseRate ? String(artist.baseRate) : ""
    });
  };

  const closeModal = () => {
    setSelectedArtist(null);
    setModalMode("");
    setContactForm(emptyContact);
    setOrderForm(emptyOrder);
  };

  const submitContact = async (event) => {
    event.preventDefault();
    if (!selectedArtist) return;
    setSaving(true);
    setError("");
    try {
      await apiFetch("/api/dashboard/contact", {
        method: "POST",
        body: JSON.stringify({
          artistId: selectedArtist.id,
          ...contactForm
        })
      });
      closeModal();
      await loadDashboard();
    } catch (err) {
      setError(err.message || "Failed to send message");
    } finally {
      setSaving(false);
    }
  };

  const submitOrder = async (event) => {
    event.preventDefault();
    if (!selectedArtist) return;
    setSaving(true);
    setError("");
    try {
      await apiFetch("/api/dashboard/orders", {
        method: "POST",
        body: JSON.stringify({
          artistId: selectedArtist.id,
          ...orderForm
        })
      });
      closeModal();
      await loadDashboard();
    } catch (err) {
      setError(err.message || "Failed to place order");
    } finally {
      setSaving(false);
    }
  };

  const navItems = [
    { href: "#overview", label: "Overview", icon: "fa-gauge-high" },
    { href: "#orders", label: "Orders", icon: "fa-bag-shopping", badge: stats.activeOrders || 0 },
    { href: "#artists", label: "Contacted artists", icon: "fa-user-group" },
    { href: "#marketplace", label: "Marketplace", icon: "fa-store" },
    { href: "#activity", label: "Activity", icon: "fa-clock-rotate-left" }
  ];

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <DashboardSidebar
          roleLabel="Client"
          user={dashboard?.user}
          navItems={navItems}
          primaryStat={{ label: "Orders", value: stats.totalOrders || 0 }}
          secondaryStat={{ label: "Artists", value: stats.contactedArtists || 0 }}
          onRefresh={loadDashboard}
          onSignOut={signOut}
        />

        <section className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur md:px-8">
            <div className="mx-auto flex max-w-7xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Client dashboard</p>
                <h1 className="mt-1 text-2xl font-semibold text-slate-950 md:text-3xl">
                  {dashboard?.user?.name ? `Welcome, ${dashboard.user.name}` : "Welcome to your workspace"}
                </h1>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-[#F5C518]/40 bg-[#F5C518]/15 px-3 py-1.5 text-xs font-semibold text-[#7a5b00]">
                  {stats.activeOrders || 0} active orders
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">
                  {stats.contactedArtists || 0} artists contacted
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
          <EmptyState>Loading client dashboard...</EmptyState>
        ) : (
          <div className="space-y-6">
            <div id="overview" className="grid scroll-mt-24 gap-4 md:grid-cols-2 xl:grid-cols-5">
              <StatCard icon="fa-bag-shopping" label="Orders placed" value={stats.totalOrders || 0} note={`${stats.activeOrders || 0} active`} tone="bg-sky-50 text-sky-700" />
              <StatCard icon="fa-user-group" label="Artists contacted" value={stats.contactedArtists || 0} note={`${stats.pendingResponses || 0} pending`} tone="bg-violet-50 text-violet-700" />
              <StatCard icon="fa-check" label="Completed" value={stats.completedOrders || 0} note="Finished work" tone="bg-emerald-50 text-emerald-700" />
              <StatCard icon="fa-wallet" label="Total spent" value={formatMoney(stats.totalSpent)} note="Booked orders" tone="bg-amber-50 text-amber-700" />
              <StatCard icon="fa-message" label="Messages" value={dashboard?.messages?.length || 0} note="Artist conversations" tone="bg-rose-50 text-rose-700" />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
              <section id="orders" className="scroll-mt-24 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Orders placed</h2>
                    <p className="text-sm text-slate-500">Artist, timing, status, budget, and project details.</p>
                  </div>
                  <StatusBadge status={orders[0]?.status || "requested"} />
                </div>

                {orders.length === 0 ? (
                  <EmptyState>No orders placed yet.</EmptyState>
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
                          <p className="text-xl font-semibold text-slate-950">{formatMoney(order.price)}</p>
                        </div>

                        <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-4">
                          <Detail label="Artist" value={order.artist?.name || "Unknown artist"} />
                          <Detail label="Artist email" value={order.artist?.email || "Not available"} />
                          <Detail label="Order time" value={formatDate(order.createdAt)} />
                          <Detail label="Delivery date" value={order.deliveryDate || "Not set"} />
                          <Detail label="Category" value={order.category || order.artist?.category || "General"} />
                          <Detail label="Specialty" value={order.artist?.specialty || "Custom work"} />
                          <Detail label="Location" value={order.artist?.location || "Remote"} />
                          <Detail label="Response time" value={order.artist?.responseTime || "Soon"} />
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <section id="activity" className="scroll-mt-24 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold">Recent activity</h2>
                <div className="mt-4 space-y-4">
                  {recentActivity.length === 0 ? (
                    <p className="text-sm text-slate-500">No activity yet.</p>
                  ) : (
                    recentActivity.map((item) => (
                      <div key={item.id} className="grid grid-cols-[38px_1fr] gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                          <i className={`fa-solid ${item.type === "order" ? "fa-bag-shopping" : "fa-message"}`} />
                        </span>
                        <div className="min-w-0 border-b border-slate-100 pb-3">
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

            <section id="artists" className="scroll-mt-24 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Artists contacted</h2>
                  <p className="text-sm text-slate-500">Contact count, order count, and latest message context.</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {contactedArtists.length} total
                </span>
              </div>

              {contactedArtists.length === 0 ? (
                <EmptyState>No contacted artists yet.</EmptyState>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {contactedArtists.map((artist) => (
                    <article key={artist.id} className="rounded-lg border border-slate-200 p-4">
                      <div className="flex items-start gap-3">
                        <Avatar name={artist.name} />
                        <div className="min-w-0">
                          <h3 className="truncate font-semibold">{artist.name}</h3>
                          <p className="truncate text-sm text-slate-500">{artist.specialty}</p>
                          <p className="mt-1 text-xs text-slate-400">{artist.email}</p>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                        <MiniMetric label="Messages" value={artist.messagesSent || 0} />
                        <MiniMetric label="Orders" value={artist.ordersPlaced || 0} />
                      </div>
                      <p className="mt-3 text-xs text-slate-500">Last contact: {formatDate(artist.lastContactAt)}</p>
                      {artist.lastMessage ? (
                        <p className="mt-3 rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-600">
                          {artist.lastMessage.message}
                        </p>
                      ) : null}
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section id="marketplace" className="scroll-mt-24 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Available artists</h2>
                  <p className="text-sm text-slate-500">Choose an artist to send a message or create an order.</p>
                </div>
                <span className="rounded-full bg-[#F5C518]/20 px-3 py-1 text-xs font-semibold text-[#7a5b00]">
                  {artists.length} freelancers
                </span>
              </div>

              {topArtists.length === 0 ? (
                <EmptyState>No freelancers available yet.</EmptyState>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {topArtists.map((artist) => (
                    <article key={artist.id} className="rounded-lg border border-slate-200 p-4">
                      <div className="flex items-start gap-3">
                        <Avatar name={artist.name} />
                        <div className="min-w-0">
                          <h3 className="truncate font-semibold">{artist.name}</h3>
                          <p className="truncate text-sm text-slate-500">{artist.headline}</p>
                          <p className="mt-1 text-xs text-slate-400">{artist.email}</p>
                        </div>
                      </div>
                      <div className="mt-4 grid gap-2 text-sm text-slate-600">
                        <Detail label="Category" value={artist.category} compact />
                        <Detail label="Specialty" value={artist.specialty} compact />
                        <Detail label="Base rate" value={formatMoney(artist.baseRate)} compact />
                        <Detail label="Rating" value={`${artist.rating}/5`} compact />
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => openContact(artist)}
                          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <i className="fa-solid fa-message mr-2" />
                          Contact
                        </button>
                        <button
                          type="button"
                          onClick={() => openOrder(artist)}
                          className="rounded-md bg-[#F5C518] px-3 py-2 text-sm font-semibold text-black hover:bg-yellow-400"
                        >
                          <i className="fa-solid fa-bag-shopping mr-2" />
                          Order
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
          </div>
        </section>
      </div>

      {selectedArtist && modalMode ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {modalMode === "contact" ? "Contact artist" : "Place order"}
                </p>
                <h2 className="mt-1 text-xl font-semibold">{selectedArtist.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{selectedArtist.specialty}</p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50"
                aria-label="Close"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {modalMode === "contact" ? (
              <form onSubmit={submitContact} className="space-y-4 p-5">
                <Input label="Project title" value={contactForm.projectTitle} onChange={(value) => setContactForm((prev) => ({ ...prev, projectTitle: value }))} />
                <Input label="Subject" value={contactForm.subject} onChange={(value) => setContactForm((prev) => ({ ...prev, subject: value }))} />
                <div className="grid gap-4 md:grid-cols-2">
                  <Input label="Budget" value={contactForm.budget} onChange={(value) => setContactForm((prev) => ({ ...prev, budget: value }))} />
                  <Input label="Timeline" value={contactForm.timeline} onChange={(value) => setContactForm((prev) => ({ ...prev, timeline: value }))} />
                </div>
                <Textarea label="Message" value={contactForm.message} onChange={(value) => setContactForm((prev) => ({ ...prev, message: value }))} required />
                <ModalActions saving={saving} onCancel={closeModal} submitLabel="Send message" icon="fa-paper-plane" />
              </form>
            ) : (
              <form onSubmit={submitOrder} className="space-y-4 p-5">
                <Input label="Order title" value={orderForm.title} onChange={(value) => setOrderForm((prev) => ({ ...prev, title: value }))} required />
                <div className="grid gap-4 md:grid-cols-3">
                  <Input label="Category" value={orderForm.category} onChange={(value) => setOrderForm((prev) => ({ ...prev, category: value }))} />
                  <Input label="Price" type="number" value={orderForm.price} onChange={(value) => setOrderForm((prev) => ({ ...prev, price: value }))} />
                  <Input label="Delivery date" type="date" value={orderForm.deliveryDate} onChange={(value) => setOrderForm((prev) => ({ ...prev, deliveryDate: value }))} />
                </div>
                <Textarea label="Description" value={orderForm.description} onChange={(value) => setOrderForm((prev) => ({ ...prev, description: value }))} />
                <ModalActions saving={saving} onCancel={closeModal} submitLabel="Place order" icon="fa-bag-shopping" />
              </form>
            )}
          </div>
        </div>
      ) : null}
    </main>
  );
}

function Detail({ label, value, compact = false }) {
  return (
    <p className={compact ? "flex items-center justify-between gap-3" : ""}>
      <span className="font-semibold text-slate-900">{label}:</span>{" "}
      <span className={compact ? "truncate text-right text-slate-600" : "text-slate-600"}>{value || "Not available"}</span>
    </p>
  );
}

function MiniMetric({ label, value }) {
  return (
    <div className="rounded-md bg-slate-50 px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function Avatar({ name }) {
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
      {(name || "A").slice(0, 1).toUpperCase()}
    </span>
  );
}

function Input({ label, value, onChange, type = "text", required = false }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#F5C518] focus:ring-2 focus:ring-[#F5C518]/20"
      />
    </label>
  );
}

function Textarea({ label, value, onChange, required = false }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <textarea
        value={value}
        required={required}
        rows={5}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#F5C518] focus:ring-2 focus:ring-[#F5C518]/20"
      />
    </label>
  );
}

function ModalActions({ saving, onCancel, submitLabel, icon }) {
  return (
    <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={onCancel}
        disabled={saving}
        className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={saving}
        className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
      >
        <i className={`fa-solid ${icon} mr-2`} />
        {saving ? "Saving..." : submitLabel}
      </button>
    </div>
  );
}
