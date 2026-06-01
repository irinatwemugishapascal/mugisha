import { useEffect, useState } from "react";
import api from "../api/client.js";

const fields = [{"key":"invoiceNumber","col":"invoice_number","label":"Invoice Number","required":true},{"key":"salesDate","col":"sales_date","label":"Sales Date","type":"datetime-local","required":true},{"key":"paymentMethod","col":"payment_method","label":"Payment Method","required":true},{"key":"totalAmountPaid","col":"total_amount_paid","label":"Total Amount","type":"number","required":true},{"key":"customerNumber","col":"customer_number","label":"Customer Number","required":true},{"key":"productCode","col":"product_code","label":"Product Code","required":true}];

export default function SalesPage() {
  const empty = fields.reduce((acc, f) => ({ ...acc, [f.key]: "" }), {});
  const [form, setForm] = useState(empty);
  const [rows, setRows] = useState([]);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    try {
      const { data } = await api.get("/sales");
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
    try {
      if (editId) {
        await api.put(`/sales/${editId}`, form);
        setMessage("Sale updated.");
      } else {
        await api.post("/sales", form);
        setMessage("Sale added.");
      }
      setForm(empty);
      setEditId(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed.");
    }
  };

  const startEdit = (row) => {
    setEditId(row.invoice_number);
    const next = {};
    fields.forEach((f) => { next[f.key] = row[f.col] ?? ""; });
    setForm(next);
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await api.delete(`/sales/${id}`);
      load();
    } catch {
      setError("Delete failed.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-ink">Sales</h2>
        <p className="text-muted text-sm">Manage sale with full CRUD</p>
      </div>
      <form onSubmit={submit} className="bg-card rounded-xl border border-line p-6 grid gap-4 md:grid-cols-2">
        {fields.map((f) => (
          <label key={f.key} className="block text-sm">
            <span className="font-medium">{f.label}</span>
            
            <input type={f.type || "text"} className="mt-1 w-full rounded-lg border border-line px-3 py-2" value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
          </label>
        ))}
        <div className="md:col-span-2 flex gap-3">
          <button type="submit" className="rounded-lg bg-accent text-accent-text px-5 py-2 font-semibold">{editId ? "Update" : "Add"}</button>
          {editId && <button type="button" onClick={() => { setEditId(null); setForm(empty); }} className="rounded-lg border border-line px-5 py-2">Cancel</button>}
          {message && <span className="text-sm text-green-600 self-center">{message}</span>}
          {error && <span className="text-sm text-red-600 self-center">{error}</span>}
        </div>
      </form>
      <div className="bg-card rounded-xl border border-line overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface"><tr>{fields.map((f) => <th key={f.key} className="px-4 py-3 text-left">{f.label}</th>)}<th className="px-4 py-3">Actions</th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.invoice_number} className="border-t border-line">
                {fields.map((f) => <td key={f.key} className="px-4 py-3">{String(row[f.col] ?? "")}</td>)}
                <td className="px-4 py-3 space-x-2">
                  <button type="button" onClick={() => startEdit(row)} className="text-accent font-medium">Edit</button>
                  <button type="button" onClick={() => remove(row.invoice_number)} className="text-red-600 font-medium">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
