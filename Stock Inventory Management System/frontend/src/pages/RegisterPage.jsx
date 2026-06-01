import { useState } from "react";
import { Link } from "react-router-dom";
import { registerUser } from "../api/authApi";
import { strongPasswordError } from "../utils/passwordPolicy";

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    const u = username.trim();
    if (u.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }
    const pErr = strongPasswordError(password);
    if (pErr) {
      setError(pErr);
      return;
    }
    try {
      const r = await registerUser({ username: u, password });
      setMsg(r.data.message);
      setPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl border border-emerald-200 bg-white p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-emerald-900">Register</h1>
        <p className="mb-2 text-sm text-slate-500">
          Strong password: 8+ chars, uppercase, lowercase, number
        </p>
        {error && <div className="mb-2 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        {msg && <div className="mb-2 rounded bg-green-50 px-3 py-2 text-sm text-green-800">{msg}</div>}
        <form onSubmit={submit} className="space-y-3">
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
            minLength={8}
            required
          />
          <button type="submit" className="w-full rounded bg-emerald-600 py-2 text-white hover:bg-emerald-700">
            Register
          </button>
        </form>
        <Link to="/login" className="mt-3 inline-block text-sm text-blue-700 hover:underline">
          Back to login
        </Link>
      </div>
    </div>
  );
}

export default RegisterPage;
