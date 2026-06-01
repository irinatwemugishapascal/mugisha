import { useEffect, useState } from "react";
import { getSpareParts } from "../api/sparePartsApi";
import { getStockIn, createStockIn } from "../api/stockInApi";

function StockInPage() {
  const [parts, setParts] = useState([]);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ sparePartId: "", stockInQuantity: "", stockInDate: "" });
  const [message, setMessage] = useState("");

  const load = async () => {
    const [pr, inRows] = await Promise.all([getSpareParts(), getStockIn()]);
    setParts(pr.data);
    setRows(inRows.data);
  };

  useEffect(() => {
    load().catch(() => setMessage("Load failed"));
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const q = Number(form.stockInQuantity);
    if (!form.sparePartId || !form.stockInDate) {
      setMessage("Select part and date");
      return;
    }
    try {
      await createStockIn({
        sparePartId: form.sparePartId,
        stockInQuantity: q,
        stockInDate: new Date(form.stockInDate).toISOString(),
      });
      setForm({ sparePartId: "", stockInQuantity: "", stockInDate: "" });
      setMessage("Stock in saved");
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Save failed");
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className="rounded-lg border border-blue-200 bg-white p-4 shadow">
        <h2 className="mb-3 text-lg font-semibold text-blue-900">Stock In (insert only)</h2>
        <form onSubmit={onSubmit} className="space-y-2">
          <select
            className="w-full rounded border px-3 py-2"
            value={form.sparePartId}
            onChange={(e) => setForm((f) => ({ ...f, sparePartId: e.target.value }))}
            required
          >
            <option value="">Spare part</option>
            {parts.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} — {p.category}
              </option>
            ))}
          </select>
          <input
            type="number"
            className="w-full rounded border px-3 py-2"
            placeholder="Quantity in"
            min="1"
            value={form.stockInQuantity}
            onChange={(e) => setForm((f) => ({ ...f, stockInQuantity: e.target.value }))}
            required
          />
          <input
            type="date"
            className="w-full rounded border px-3 py-2"
            value={form.stockInDate}
            onChange={(e) => setForm((f) => ({ ...f, stockInDate: e.target.value }))}
            required
          />
          <button
            type="submit"
            className="w-full rounded bg-blue-700 py-2 text-white hover:bg-blue-800"
          >
            Save
          </button>
        </form>
        {message && <p className="mt-2 text-sm text-slate-600">{message}</p>}
      </section>
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow">
        <h2 className="mb-3 text-lg font-semibold">History (read)</h2>
        <div className="max-h-96 overflow-auto text-sm">
          {rows.map((r) => (
            <div key={r._id} className="border-b border-slate-100 py-2">
              {r.sparePart?.name} +{r.stockInQuantity} @ {new Date(r.stockInDate).toLocaleDateString()}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default StockInPage;
