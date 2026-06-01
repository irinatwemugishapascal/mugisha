import { useEffect, useState } from "react";
import { getSpareParts, createSparePart } from "../api/sparePartsApi";

const initial = { name: "", category: "", quantity: "", unitPrice: "" };

function SparePartPage() {
  const [form, setForm] = useState(initial);
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState("");

  const load = () =>
    getSpareParts()
      .then((r) => setRows(r.data))
      .catch(() => setMessage("Failed to load parts"));

  useEffect(() => {
    load();
  }, []);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const q = Number(form.quantity);
    const u = Number(form.unitPrice);
    if (Number.isNaN(q) || q < 0 || Number.isNaN(u) || u < 0) {
      setMessage("Invalid numbers");
      return;
    }
    try {
      await createSparePart({
        name: form.name.trim(),
        category: form.category.trim(),
        quantity: q,
        unitPrice: u,
      });
      setForm(initial);
      setMessage("Saved");
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to save");
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className="rounded-lg border border-emerald-200 bg-white p-4 shadow">
        <h2 className="mb-3 text-lg font-semibold text-emerald-900">Spare Part (insert only)</h2>
        <form onSubmit={onSubmit} className="space-y-2">
          <input
            name="name"
            className="w-full rounded border px-3 py-2"
            placeholder="Name"
            value={form.name}
            onChange={onChange}
            required
          />
          <input
            name="category"
            className="w-full rounded border px-3 py-2"
            placeholder="Category"
            value={form.category}
            onChange={onChange}
            required
          />
          <input
            type="number"
            name="quantity"
            className="w-full rounded border px-3 py-2"
            placeholder="Quantity"
            min="0"
            value={form.quantity}
            onChange={onChange}
            required
          />
          <input
            type="number"
            name="unitPrice"
            className="w-full rounded border px-3 py-2"
            placeholder="Unit price"
            min="0"
            step="0.01"
            value={form.unitPrice}
            onChange={onChange}
            required
          />
          <button
            type="submit"
            className="w-full rounded bg-emerald-700 py-2 font-medium text-white hover:bg-emerald-800"
          >
            Save
          </button>
        </form>
        {message && <p className="mt-2 text-sm text-slate-600">{message}</p>}
      </section>
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow">
        <h2 className="mb-3 text-lg font-semibold">Parts list (read)</h2>
        <div className="max-h-96 overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-slate-100">
              <tr>
                <th className="p-2">Name</th>
                <th className="p-2">Category</th>
                <th className="p-2">Qty</th>
                <th className="p-2">Unit</th>
                <th className="p-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p._id} className="border-b">
                  <td className="p-2">{p.name}</td>
                  <td className="p-2">{p.category}</td>
                  <td className="p-2">{p.quantity}</td>
                  <td className="p-2">{p.unitPrice}</td>
                  <td className="p-2">{p.totalPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default SparePartPage;
