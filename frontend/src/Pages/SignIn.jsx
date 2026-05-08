import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../api/client";

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      localStorage.setItem("ab_token", result.token);
      if (result.user?.role === "admin") {
        navigate("/admin");
      } else if (result.user?.role === "freelancer") {
        navigate("/freelancer-dashboard");
      } else {
        navigate("/client-dashboard");
      }
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const goToSignup = () => {
    navigate("/signup");
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-4 pb-20 pt-10">
      <div className="w-full max-w-md">
        {/* logo */}
        <Link to="/" className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#000000] rounded-lg flex items-center justify-center">
            <i className="fa-solid fa-palette text-2xl text-[#F5C518]"></i>
          </div>
          <h1 className="text-white text-xl font-semibold">
            Artisan<span className="text-[#F5C518]">Bridge</span>
          </h1>
        </Link>

        {/* card */}
        <div className="bg-white rounded-xl px-6 py-12 shadow-md">
          <h2 className="text-xl font-semibold mb-1">Welcome back</h2>
          <p className="text-sm text-gray-500 mb-5">Sign in to continue</p>

          {error ? (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleLogin}>
            {/* email */}
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

            {/* password */}
            <div className="mb-4">
              <label className="text-sm font-medium">Password</label>

              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border rounded-md text-sm outline-none focus:ring-2 focus:ring-yellow-400"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* forgot password */}
            <div className="text-right mb-4">
              <Link
                to="/forgot-password"
                className="text-sm text-yellow-500 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-400 hover:bg-yellow-500 py-2 rounded-md font-medium transition disabled:opacity-60"
            >
              {loading ? "Please wait..." : "Sign In"}
            </button>
          </form>

          {/* signup */}
          <p className="text-sm text-center text-gray-500 mt-5">
            Don’t have an account?{" "}
            <button
              type="button"
              onClick={goToSignup}
              disabled={loading}
              className="text-yellow-600 hover:underline disabled:opacity-60"
            >
              Create one
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
