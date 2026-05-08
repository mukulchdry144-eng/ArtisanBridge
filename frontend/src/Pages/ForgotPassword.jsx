import { useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api/client";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setStatus("");
    setLoading(true);

    try {
      const result = await apiFetch("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email })
      });
      setStatus(result.message || "Password help instructions have been sent.");
    } catch (err) {
      setError(err.message || "Could not send password help request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0f1624] px-4 py-12 text-white">
      <div className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <section>
          <Link to="/" className="mb-8 inline-flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-black">
              <i className="fa-solid fa-palette text-2xl text-[#F5C518]" />
            </span>
            <span className="text-xl font-semibold">
              Artisan<span className="text-[#F5C518]">Bridge</span>
            </span>
          </Link>

          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#F5C518]">
            Account recovery
          </p>
          <h1 className="max-w-xl text-4xl font-bold leading-tight md:text-5xl">
            Get help signing back into your workspace.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
            Enter the email connected to your account. We will send recovery guidance and notify the admin team.
          </p>
        </section>

        <section className="rounded-lg bg-white p-6 text-slate-950 shadow-2xl md:p-8">
          <div className="mb-6">
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-[#F5C518] text-black">
              <i className="fa-solid fa-key text-xl" />
            </span>
            <h2 className="text-2xl font-semibold">Forgot password</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              We will handle your request without showing whether an email exists on the platform.
            </p>
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

          <form onSubmit={handleSubmit}>
            <label className="block text-sm font-semibold text-slate-700">
              Email address
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#F5C518] focus:ring-2 focus:ring-[#F5C518]/25"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-5 inline-flex w-full items-center justify-center rounded-md bg-[#F5C518] px-4 py-3 text-sm font-bold text-black hover:bg-[#e0b000] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Sending..." : "Send recovery help"}
              <i className="fa-solid fa-paper-plane ml-2" />
            </button>
          </form>

          <div className="mt-5 flex flex-col gap-2 text-center text-sm sm:flex-row sm:justify-center">
            <Link to="/signin" className="font-semibold text-[#8a6500] hover:underline">
              Back to sign in
            </Link>
            <span className="hidden text-slate-300 sm:inline">|</span>
            <Link to="/signup" className="font-semibold text-slate-600 hover:text-slate-950 hover:underline">
              Create account
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
