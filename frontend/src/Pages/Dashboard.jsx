import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../api/client";

export default function Dashboard() {
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const routeByRole = async () => {
      try {
        const user = await apiFetch("/api/auth/me");
        if (!mounted) return;

        if (user.role === "admin") {
          navigate("/admin", { replace: true });
        } else if (user.role === "freelancer") {
          navigate("/freelancer-dashboard", { replace: true });
        } else {
          navigate("/client-dashboard", { replace: true });
        }
      } catch (err) {
        if (!mounted) return;
        setError(err.message || "Failed to load dashboard");
        if (err.status === 401) {
          localStorage.removeItem("ab_token");
          navigate("/signin", { replace: true });
        }
      }
    };

    routeByRole();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 text-slate-950">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
        <Link to="/" className="mx-auto mb-5 flex w-max items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-black">
            <i className="fa-solid fa-palette text-xl text-[#F5C518]" />
          </span>
          <span className="text-lg font-semibold">
            Artisan<span className="text-[#F5C518]">Bridge</span>
          </span>
        </Link>
        <h1 className="text-xl font-semibold">Opening your dashboard</h1>
        <p className="mt-2 text-sm text-slate-500">
          {error || "Checking your account role..."}
        </p>
      </section>
    </main>
  );
}
