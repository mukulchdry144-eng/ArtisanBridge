import { Link } from "react-router-dom";

export default function DashboardSidebar({
  roleLabel,
  user,
  navItems,
  primaryStat,
  secondaryStat,
  onRefresh,
  onSignOut
}) {
  const initial = (user?.name || user?.email || roleLabel || "U").slice(0, 1).toUpperCase();

  return (
    <aside className="bg-[#111827] text-white lg:sticky lg:top-0 lg:h-screen">
      <div className="flex h-full flex-col px-5 py-6">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-black">
            <i className="fa-solid fa-palette text-xl text-[#F5C518]" />
          </span>
          <span className="text-lg font-semibold">
            Artisan<span className="text-[#F5C518]">Bridge</span>
          </span>
        </Link>

        <div className="mt-7 rounded-lg border border-white/10 bg-white/[0.06] p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F5C518] text-sm font-bold text-black">
              {initial}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user?.name || "ArtisanBridge user"}</p>
              <p className="truncate text-xs text-slate-400">{user?.email || roleLabel}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <SidebarMetric label={primaryStat?.label} value={primaryStat?.value} />
            <SidebarMetric label={secondaryStat?.label} value={secondaryStat?.value} />
          </div>
        </div>

        <nav className="mt-7 space-y-1">
          {navItems.map((item, index) => (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition ${
                index === 0
                  ? "bg-white/10 font-semibold text-white"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <i className={`fa-solid ${item.icon} w-5 ${index === 0 ? "text-[#F5C518]" : "text-slate-400"}`} />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.badge ? (
                <span className="rounded-full bg-[#F5C518] px-2 py-0.5 text-xs font-bold text-black">
                  {item.badge}
                </span>
              ) : null}
            </a>
          ))}
        </nav>

        <div className="mt-auto pt-7">
          <div className="rounded-lg border border-white/10 bg-black/20 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#F5C518]">
              {roleLabel}
            </p>
            <p className="mt-2 text-sm font-semibold">Workspace</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onRefresh}
              className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10"
            >
              <i className="fa-solid fa-rotate-right mr-2" />
              Refresh
            </button>
            <button
              type="button"
              onClick={onSignOut}
              className="rounded-md bg-[#F5C518] px-3 py-2 text-sm font-semibold text-black hover:bg-yellow-400"
            >
              <i className="fa-solid fa-right-from-bracket mr-2" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

function SidebarMetric({ label, value }) {
  return (
    <div className="rounded-md bg-black/20 px-3 py-2">
      <p className="text-xs text-slate-400">{label || "Metric"}</p>
      <p className="mt-1 truncate text-sm font-semibold text-white">{value ?? 0}</p>
    </div>
  );
}
