import { useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function LoginPage() {
  const { login, isAuthenticated, loading } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!form.username.trim() || !form.password) {
      setError("Username and password are required.");
      return;
    }
    try {
      if (mode === "register") {
        await api.post("/auth/register", form);
        setMessage("Account created. Please login.");
        setMode("login");
        return;
      }
      const { data } = await api.post("/auth/login", form);
      login(data.user, data.token);
    } catch (err) {
      setError(err.response?.data?.message || "Request failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <form onSubmit={submit} className="w-full max-w-md bg-card rounded-2xl shadow-xl p-8 border border-line">
        <div className="w-12 h-1 bg-accent rounded mb-4" />
        <h1 className="text-2xl font-bold text-ink">Sales Record Management</h1>
        <p className="text-muted text-sm mt-1">SalesPro Ltd — Huye</p>
        <div className="mt-6 space-y-3">
          <input className="w-full rounded-lg border border-line px-3 py-2.5" placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          <input className="w-full rounded-lg border border-line px-3 py-2.5" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        {message && <p className="mt-3 text-sm text-green-600">{message}</p>}
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button type="submit" className="mt-5 w-full rounded-lg bg-accent text-accent-text py-2.5 font-semibold">{mode === "login" ? "Sign In" : "Register"}</button>
        <button type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }} className="mt-3 w-full text-sm text-muted underline">
          {mode === "login" ? "Create account" : "Back to login"}
        </button>
      </form>
    </div>
  );
}
