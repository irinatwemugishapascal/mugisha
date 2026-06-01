import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const links = [{"to":"/","label":"Customer"},{"to":"/products","label":"Product"},{"to":"/sales","label":"Sales"},{"to":"/reports","label":"Reports"}];

export default function AppLayout() {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen bg-surface text-ink md:grid md:grid-cols-[260px_1fr]">
      <aside className="bg-sidebar text-sidebar-text md:min-h-screen border-b-4 border-accent md:border-b-0 md:border-r-4">
        <div className="px-5 py-6 border-b border-white/10">
          <p className="text-xs uppercase tracking-widest text-black">SalesPro Ltd — Huye</p>
          <h1 className="text-xl font-bold mt-1">SalesPro SRMS</h1>
        </div>
        <nav className="p-4 space-y-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `block rounded-lg px-4 py-2.5 text-sm font-medium transition ${isActive ? "bg-accent text-black-text shadow" : "hover:bg-grey/10"}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4">
          <button type="button" onClick={logout} className="w-full rounded-lg border border-grey-400 px-4 py-2 text-sm font-bold text-red-200 hover:bg-red-500/20">
            Logout
          </button>
        </div>
      </aside>
      <main className="p-6 md:p-10">
        <Outlet />
      </main>
    </div>
  );
}
