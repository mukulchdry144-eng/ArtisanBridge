import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiFetch } from "../api/client";

const links = [
  { label: "Browse Artists", id: "top-artists" },
  { label: "Browse Artworks", id: "browse-artworks" },
  { label: "How It Works", id: "how-it-works" },
  { label: "Pricing", id: "pricing" }
];

const Navbar = () => {
  const [active, setActive] = useState(null);
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const menuRef = useRef(null);

  const dashboardPath =
    user?.role === "admin"
      ? "/admin"
      : user?.role === "freelancer"
        ? "/freelancer-dashboard"
        : "/client-dashboard";

  useEffect(() => {
    let mounted = true;
    const token = localStorage.getItem("ab_token");

    if (!token) {
      setUser(null);
      return undefined;
    }

    apiFetch("/api/auth/me")
      .then((data) => {
        if (mounted) setUser(data);
      })
      .catch(() => {
        localStorage.removeItem("ab_token");
        if (mounted) setUser(null);
      });

    return () => {
      mounted = false;
    };
  }, [pathname]);

  useEffect(() => {
    const handleClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const scrollToId = async (id) => {
    setActive(id);
    const landingPath = user ? "/welcome" : "/";
    if (pathname !== "/" && pathname !== "/welcome") {
      navigate(landingPath);
      await new Promise((r) => setTimeout(r, 150));
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const signOut = () => {
    localStorage.removeItem("ab_token");
    setUser(null);
    setMenuOpen(false);
    navigate("/");
  };

  const initial = (user?.name || user?.email || "U").slice(0, 1).toUpperCase();

  return (
    <nav className="flex items-center justify-between px-4 md:px-8 py-4 bg-[#E6E6F2] sticky top-0 left-0 w-full z-50 border-b-2 border-gray-200">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 cursor-pointer">
        <i className="fa-solid fa-palette text-2xl text-[#F5C518] bg-black rounded-md"></i>
        <span className="text-lg font-semibold">Artisan <span className="text-yellow-500">Bridge</span></span>
      </Link>

      {/* Links */}
      <ul className="hidden md:flex items-center gap-8 list-none">
        {links.map((link) => (
          <li
            key={link.id}
            className="relative group cursor-pointer"
            onClick={() => scrollToId(link.id)}
          >
            <span
              className={`text-sm transition-colors duration-300 ${
                active === link.id ? "text-yellow-600" : "text-gray-700 group-hover:text-yellow-600"
              }`}
            >
              {link.label}
            </span>
            <span
              className={`absolute -bottom-1 left-0 h-[1.5px] bg-yellow-600 transition-all duration-300 ${
                active === link.id ? "w-full" : "w-0 group-hover:w-full"
              }`}
            />
          </li>
        ))}
      </ul>

      {/* Buttons */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* <Link to="/admin/login">
          <button className="text-sm px-4 py-2 border border-gray-400 rounded-md transition-all duration-200 hover:border-black hover:bg-white">
            Admin
          </button>
        </Link> */}
        {user ? (
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="flex items-center gap-3 rounded-md border border-black bg-white px-3 py-2 text-sm font-semibold text-black transition-all duration-200 hover:border-[#F5C518] hover:shadow-sm"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-xs font-bold text-[#F5C518]">
                {initial}
              </span>
              <span className="max-w-[140px] truncate">{user.name || user.email}</span>
              <span className="rounded-full bg-[#F5C518] px-2 py-0.5 text-[11px] font-bold capitalize text-black">
                {user.role || "client"}
              </span>
              <i className={`fa-solid fa-chevron-down text-xs transition ${menuOpen ? "rotate-180" : ""}`} />
            </button>

            {menuOpen ? (
              <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl">
                <div className="border-b border-gray-100 bg-[#0a0f1e] px-4 py-4 text-white">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5C518] text-sm font-bold text-black">
                      {initial}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{user.name || "ArtisanBridge user"}</p>
                      <p className="truncate text-xs text-slate-300">{user.email}</p>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate(dashboardPath);
                    }}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-semibold text-gray-800 hover:bg-[#F5C518]/20"
                  >
                    <i className="fa-solid fa-gauge-high text-[#8a6500]" />
                    Dashboard
                  </button>
                  <button
                    type="button"
                    onClick={signOut}
                    className="mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-semibold text-red-700 hover:bg-red-50"
                  >
                    <i className="fa-solid fa-right-from-bracket" />
                    Sign out
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <>
            <Link to="/signin" className="hidden sm:block">
              <button className="text-sm px-4 py-2 border border-black rounded-md transition-all duration-200 hover:bg-yellow-400 hover:text-white hover:border-[#E6E6F2] hover:scale-105">
                Sign In
              </button>
            </Link>
            <Link to="/get-started">
              <button className="text-sm px-4 py-2 bg-black text-white rounded-md transition-all duration-200 hover:bg-yellow-400 hover:scale-105">
                Get Started
              </button>
            </Link>
          </>
        )}

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden flex items-center justify-center w-10 h-10 text-2xl text-gray-800 focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
        </button>

      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b border-gray-200 md:hidden flex flex-col px-6 py-4 gap-4 shadow-lg pb-6">
          {links.map((link) => (
            <div
              key={link.id}
              className={`text-base font-semibold cursor-pointer border-b border-gray-100 pb-2 ${active === link.id ? "text-yellow-600" : "text-gray-700"}`}
              onClick={() => {
                scrollToId(link.id);
                setMobileMenuOpen(false);
              }}
            >
              {link.label}
            </div>
          ))}
          {!user && (
            <Link to="/signin" className="sm:hidden block mt-2 text-base font-semibold text-gray-700 border-b border-gray-100 pb-2" onClick={() => setMobileMenuOpen(false)}>
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
