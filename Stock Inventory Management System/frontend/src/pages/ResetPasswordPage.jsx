import { useState } from "react";
import { Link } from "react-router-dom";
import { recoverPassword } from "../api/authApi";
import { strongPasswordError } from "../utils/passwordPolicy";

function ResetPasswordPage() {
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
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
    const pErr = strongPasswordError(newPassword);
    if (pErr) {
      setError(pErr);
      return;
    }
    try {
      const r = await recoverPassword({ username: u, newPassword });
      setMsg(r.data.message);
      setNewPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl border border-amber-200 bg-white p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-amber-900">Reset password</h1>
        {error && <div className="mb-2 text-sm text-red-700">{error}</div>}
        {msg && <div className="mb-2 text-sm text-green-800">{msg}</div>}
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
            placeholder="New password (strong)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={8}
            required
          />
          <button type="submit" className="w-full rounded bg-amber-600 py-2 text-white hover:bg-amber-700">
            Update password
          </button>
        </form>
        <Link to="/login" className="mt-3 inline-block text-sm text-blue-700 hover:underline">
          Back to login
        </Link>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
