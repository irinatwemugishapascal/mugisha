import { Link, NavLink, Outlet } from "react-router-dom";

function AppLayout({ onLogout, username }) {
  const linkClass = ({ isActive }) =>
    `rounded-md px-3 py-2 text-sm font-medium transition ${
      isActive ? "bg-emerald-800 text-white" : "text-emerald-900 hover:bg-emerald-100"
    }`;

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <Link to="/spare-part" className="text-lg font-bold text-emerald-900">
            SIMS — Stock Inventory
          </Link>
          <div className="text-sm text-slate-600">User: {username}</div>
        </div>
        <nav className="mx-auto flex max-w-6xl flex-wrap gap-2 px-4 pb-4">
          <NavLink to="/spare-part" className={linkClass}>
            Spare Part
          </NavLink>
          <NavLink to="/stock-in" className={linkClass}>
            Stock In
          </NavLink>
          <NavLink to="/stock-out" className={linkClass}>
            Stock Out
          </NavLink>
          <NavLink to="/reports" className={linkClass}>
            Reports
          </NavLink>
          <button
            type="button"
            onClick={onLogout}
            className="ml-auto rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Logout
          </button>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl p-4">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
