import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiFetch } from "../api/client";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const roleOptions = [
  {
    value: "client",
    title: "Hire Talent",
    description: "I want to hire artists, place orders, and manage creative projects.",
    icon: "fa-briefcase"
  },
  {
    value: "freelancer",
    title: "Find Work",
    description: "I am an artist or freelancer and want to receive client projects.",
    icon: "fa-palette"
  }
];

export default function SignUp() {
  const query = useQuery();
  const roleFromQuery = query.get("role");
  const initialRole = roleOptions.some((option) => option.value === roleFromQuery) ? roleFromQuery : "";

  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (!role) {
      setError("Please choose Hire Talent or Find Work before creating your account.");
      return;
    }
    setLoading(true);
    try {
      const result = await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          password,
          role
        })
      });
      localStorage.setItem("ab_token", result.token);
      navigate("/welcome");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl">
        <Link to="/" className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#000000] rounded-lg flex items-center justify-center">
            <i className="fa-solid fa-palette text-2xl text-[#F5C518]"></i>
          </div>
          <h1 className="text-white text-xl font-semibold">
            Artisan<span className="text-[#F5C518]">Bridge</span>
          </h1>
        </Link>

        <div className="bg-white rounded-xl px-6 py-12 shadow-md">
          <h2 className="text-xl font-semibold mb-1">Create account</h2>
          <p className="text-sm text-gray-500 mb-5">
            Choose how you want to use ArtisanBridge, then finish your account.
          </p>

          <div className="mb-6 grid gap-3 md:grid-cols-2">
            {roleOptions.map((option) => {
              const selected = role === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRole(option.value)}
                  className={`rounded-lg border p-5 text-left transition ${
                    selected
                      ? "border-[#F5C518] bg-[#F5C518] text-black shadow-sm"
                      : "border-slate-200 bg-slate-50 text-slate-900 hover:border-[#F5C518] hover:bg-[#fff8d8]"
                  }`}
                >
                  <i className={`fa-solid ${option.icon} mb-4 text-xl`} />
                  <p className="font-semibold">{option.title}</p>
                  <p className={`mt-1 text-sm leading-6 ${selected ? "text-black/70" : "text-slate-500"}`}>
                    {option.description}
                  </p>
                </button>
              );
            })}
          </div>

          {error ? (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleRegister}>
            <div className="mb-4">
              <label className="text-sm font-medium">Name</label>
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-400 hover:bg-yellow-500 py-2 rounded-md font-medium transition disabled:opacity-60"
            >
              {loading ? "Please wait..." : role ? `Create ${role} account` : "Choose account type"}
            </button>
          </form>

          <p className="text-sm text-center text-gray-500 mt-5">
            Already have an account?{" "}
            <Link to="/signin" className="text-yellow-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
