import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../api/client";

const categories = ["Custom artwork", "Portrait", "Digital illustration", "Brand design", "Home decor", "Other"];
const budgets = ["Under $100", "$100 - $500", "$500 - $1,000", "$1,000+"];
const timelines = ["This week", "2 - 4 weeks", "1 - 2 months", "Flexible"];

export default function GetStarted() {
  const [selected, setSelected] = useState("hire");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    category: categories[0],
    budget: budgets[1],
    timeline: timelines[1],
    message: ""
  });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const role = selected === "hire" ? "client" : "freelancer";

  const updateForm = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleContinue = () => {
    navigate(`/signup?role=${encodeURIComponent(role)}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("");
    setLoading(true);

    try {
      await apiFetch("/api/inquiries", {
        method: "POST",
        body: JSON.stringify({ ...form, role })
      });
      setStatus("Request sent. The admin team and your email inbox have been notified.");
      setForm((current) => ({ ...current, message: "" }));
    } catch (err) {
      setError(err.message || "Could not send request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0f1624] px-4 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <Link to="/" className="mb-8 inline-flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-black">
            <i className="fa-solid fa-palette text-2xl text-[#F5C518]" />
          </span>
          <span className="text-xl font-semibold">
            Artisan<span className="text-[#F5C518]">Bridge</span>
          </span>
        </Link>

        <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="pt-4">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#F5C518]">
              Start with clarity
            </p>
            <h1 className="max-w-xl text-4xl font-bold leading-tight md:text-5xl">
              Tell us what you need and we will route it to the right side of ArtisanBridge.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
              Submit the request form for admin review, then create your account to manage your work inside the platform.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setSelected("hire")}
                className={`rounded-lg border p-5 text-left transition ${
                  selected === "hire"
                    ? "border-[#F5C518] bg-[#F5C518] text-black"
                    : "border-white/15 bg-white/5 text-white hover:bg-white/10"
                }`}
              >
                <i className="fa-solid fa-briefcase mb-4 text-xl" />
                <p className="font-semibold">Hire Talent</p>
                <p className={`mt-1 text-sm ${selected === "hire" ? "text-black/70" : "text-slate-400"}`}>
                  Request artwork, design, or handmade work.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelected("work")}
                className={`rounded-lg border p-5 text-left transition ${
                  selected === "work"
                    ? "border-[#F5C518] bg-[#F5C518] text-black"
                    : "border-white/15 bg-white/5 text-white hover:bg-white/10"
                }`}
              >
                <i className="fa-solid fa-palette mb-4 text-xl" />
                <p className="font-semibold">Find Work</p>
                <p className={`mt-1 text-sm ${selected === "work" ? "text-black/70" : "text-slate-400"}`}>
                  Introduce yourself as an artist or freelancer.
                </p>
              </button>
            </div>

            <button
              type="button"
              onClick={handleContinue}
              className="mt-5 inline-flex items-center rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-slate-100"
            >
              Create {role} account
              <i className="fa-solid fa-arrow-right ml-2" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 text-slate-950 shadow-2xl">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Project request</h2>
                <p className="mt-1 text-sm text-slate-500">This goes to the admin inbox and email log.</p>
              </div>
              <span className="rounded-full border border-[#F5C518]/40 bg-[#fff8d8] px-3 py-1 text-xs font-semibold text-[#8a6500]">
                {role}
              </span>
            </div>

            {status ? (
              <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {status}
              </div>
            ) : null}
            {error ? (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium">
                Name
                <input
                  value={form.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#F5C518] focus:ring-2 focus:ring-[#F5C518]/25"
                  placeholder="Your name"
                />
              </label>

              <label className="text-sm font-medium">
                Email
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateForm("email", e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#F5C518] focus:ring-2 focus:ring-[#F5C518]/25"
                  placeholder="you@example.com"
                  required
                />
              </label>

              <label className="text-sm font-medium">
                Phone
                <input
                  value={form.phone}
                  onChange={(e) => updateForm("phone", e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#F5C518] focus:ring-2 focus:ring-[#F5C518]/25"
                  placeholder="+91 98765 43210"
                />
              </label>

              <label className="text-sm font-medium">
                Category
                <select
                  value={form.category}
                  onChange={(e) => updateForm("category", e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#F5C518] focus:ring-2 focus:ring-[#F5C518]/25"
                >
                  {categories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium">
                Budget
                <select
                  value={form.budget}
                  onChange={(e) => updateForm("budget", e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#F5C518] focus:ring-2 focus:ring-[#F5C518]/25"
                >
                  {budgets.map((budget) => (
                    <option key={budget}>{budget}</option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium">
                Timeline
                <select
                  value={form.timeline}
                  onChange={(e) => updateForm("timeline", e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#F5C518] focus:ring-2 focus:ring-[#F5C518]/25"
                >
                  {timelines.map((timeline) => (
                    <option key={timeline}>{timeline}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="mt-4 block text-sm font-medium">
              Message
              <textarea
                value={form.message}
                onChange={(e) => updateForm("message", e.target.value)}
                className="mt-1 min-h-32 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#F5C518] focus:ring-2 focus:ring-[#F5C518]/25"
                placeholder="Tell us what you need, what style you like, or what kind of opportunity you want."
                required
              />
            </label>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex flex-1 items-center justify-center rounded-md bg-[#F5C518] px-4 py-3 text-sm font-bold text-black hover:bg-[#e0b000] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Sending..." : "Send request"}
                <i className="fa-solid fa-paper-plane ml-2" />
              </button>
              <button
                type="button"
                onClick={handleContinue}
                className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Continue to signup
              </button>
            </div>

            <p className="mt-4 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link to="/signin" className="font-semibold text-[#8a6500] hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}
