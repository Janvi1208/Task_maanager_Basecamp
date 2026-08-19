import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: "▤", end: true },
  { to: "/tasks", label: "Tasks", icon: "☰" },
];

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 shrink-0 bg-ink-950 text-slate-100 flex flex-col">
        <div className="px-5 py-5 border-b border-white/10">
          <p className="font-display font-semibold text-lg tracking-tight">
            Basecamp
          </p>
          <p className="text-xs text-white/50 mt-0.5">
            Internal Task Dashboard
          </p>
        </div>
        <nav
          className="flex-1 px-3 py-4 space-y-1"
          aria-label="Main navigation"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <span aria-hidden="true" className="font-mono">
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-white/10 text-xs text-white/40">
          v1.0.0 · demo build
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 shrink-0 bg-white border-b border-ink-200 flex items-center justify-between px-6">
          <div />
          <div className="flex items-center gap-3">
            <span className="text-sm text-ink-700">{user?.name}</span>
            <button
              type="button"
              onClick={async () => {
                await logout();
                navigate("/login", { replace: true });
              }}
              className="text-sm text-ink-600 hover:text-ink-900"
            >
              Log out
            </button>
            <div className="h-8 w-8 rounded-full bg-accent/15 text-accent-dark flex items-center justify-center text-sm font-semibold font-display">
              {user?.name?.charAt(0) || "?"}
            </div>
          </div>
        </header>
        <main className="flex-1 px-6 py-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
