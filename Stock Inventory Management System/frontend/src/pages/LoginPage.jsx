import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/authApi";

function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    const u = username.trim();
    if (u.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }
    try {
      const r = await loginUser({ username: u, password });
      onLoginSuccess(r.data.username);
      navigate("/spare-part");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl border border-emerald-200 bg-white p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-emerald-900">SIMS Login</h1>
        <p className="mb-4 text-slate-600">Stock Inventory Management System</p>
        {error && <div className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-3">
          <input
            className="w-full rounded border px-3 py-2"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            minLength={3}
            required
          />
          <input
            type="password"
            className="w-full rounded border px-3 py-2"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full rounded bg-emerald-700 py-2 font-medium text-white hover:bg-emerald-800"
          >
            Login
          </button>
        </form>
        <div className="mt-4 space-y-1 text-sm">
          <Link to="/register" className="block text-emerald-800 hover:underline">
            Create account
          </Link>
          <Link to="/reset-password" className="block text-amber-800 hover:underline">
            Reset password
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
