import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../api/client";

export default function AdminLogin() {
  const [email, setEmail] = useState("admin@artisanbridge.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await apiFetch("/api/auth/admin-login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      localStorage.setItem("ab_token", result.token);
      navigate("/admin");
    } catch (err) {
      setError(err.message || "Admin login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#111827] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10">
        <section className="grid w-full gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
          <div className="max-w-2xl">
            <Link to="/" className="mb-8 inline-flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-black">
                <i className="fa-solid fa-palette text-2xl text-[#F5C518]" />
              </span>
              <span className="text-xl font-semibold">
                Artisan<span className="text-[#F5C518]">Bridge</span>
              </span>
            </Link>

            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#F5C518]">
              Admin console
            </p>
            <h1 className="max-w-xl text-4xl font-bold leading-tight md:text-5xl">
              Manage users, signups, and marketplace activity.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
              The panel is protected by an admin account, and every new user registration is stored in the database for review here.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200/10 bg-white p-6 text-slate-950 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold">Admin login</h2>
              <p className="mt-1 text-sm text-slate-500">Use the seeded admin account.</p>
            </div>

            {error ? (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#F5C518] focus:ring-2 focus:ring-[#F5C518]/30"
                  placeholder="admin@artisanbridge.com"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Password</label>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 pr-14 text-sm outline-none focus:border-[#F5C518] focus:ring-2 focus:ring-[#F5C518]/30"
                    placeholder="Enter admin password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500 hover:text-slate-900"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-[#F5C518] px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-[#e1b508] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Signing in..." : "Open Admin Panel"}
              </button>
            </form>

            <div className="mt-5 flex items-center justify-between text-sm">
              <Link to="/" className="text-slate-500 hover:text-slate-900">
                Back to site
              </Link>
              <Link to="/signin" className="font-medium text-[#9a7400] hover:underline">
                User login
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
