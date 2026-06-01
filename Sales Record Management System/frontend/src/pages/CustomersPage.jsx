import { useEffect, useState } from "react";
import api from "../api/client.js";

const fields = [{"key":"customerNumber","col":"customer_number","label":"Customer Number","required":true},{"key":"firstName","col":"first_name","label":"First Name","required":true},{"key":"lastName","col":"last_name","label":"Last Name","required":true},{"key":"telephone","col":"telephone","label":"Telephone","required":true},{"key":"address","col":"address","label":"Address","required":true}];

export default function CustomersPage() {
  const empty = fields.reduce((acc, f) => ({ ...acc, [f.key]: "" }), {});
  const [form, setForm] = useState(empty);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get("/customers");
      setRows(data);
    } catch {
      setError("Failed to load records.");
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await api.post("/customers", form);
      setMessage("Customer added successfully.");
      setForm(empty);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-ink">Customers</h2>
        <p className="text-muted text-sm">Add new customer records</p>
      </div>
      <form onSubmit={submit} className="bg-card rounded-xl border border-line p-6 grid gap-4 md:grid-cols-2">
        {fields.map((f) => (
          <label key={f.key} className="block text-sm">
            <span className="font-medium text-ink">{f.label}</span>
            <input
              type={f.type || "text"}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2"
              value={form[f.key]}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
            />
          </label>
        ))}
        <div className="md:col-span-2 flex gap-3 items-center">
          <button type="submit" disabled={loading} className="rounded-lg bg-accent text-accent-text px-5 py-2 font-semibold">{loading ? "Saving..." : "Add Customer"}</button>
          {message && <span className="text-sm text-green-600">{message}</span>}
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </form>
      <div className="bg-card rounded-xl border border-line overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left">
            <tr>{fields.map((f) => <th key={f.key} className="px-4 py-3">{f.label}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-t border-line">
                {fields.map((f) => <td key={f.key} className="px-4 py-3">{String(row[f.col] ?? "").slice(0, 40)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
