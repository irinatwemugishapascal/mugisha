import { useEffect, useState } from "react";
import { getSpareParts } from "../api/sparePartsApi";
import { getStockOut, createStockOut, updateStockOut, deleteStockOut } from "../api/stockOutApi";

const empty = { sparePartId: "", stockOutQuantity: "", stockOutUnitPrice: "", stockOutDate: "" };

function StockOutPage() {
  const [parts, setParts] = useState([]);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");

  const load = async () => {
    const [pr, out] = await Promise.all([getSpareParts(), getStockOut()]);
    setParts(pr.data);
    setRows(out.data);
  };

  useEffect(() => {
    load().catch(() => setMessage("Load failed"));
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const q = Number(form.stockOutQuantity);
    const u = Number(form.stockOutUnitPrice);
    if (!editing) {
      try {
        await createStockOut({
          sparePartId: form.sparePartId,
          stockOutQuantity: q,
          stockOutUnitPrice: u,
          stockOutDate: new Date(form.stockOutDate).toISOString(),
        });
        setForm(empty);
        setMessage("Saved");
        load();
      } catch (err) {
        setMessage(err.response?.data?.message || "Failed");
      }
    } else {
      try {
        await updateStockOut(editing, {
          stockOutQuantity: q,
          stockOutUnitPrice: u,
          stockOutDate: new Date(form.stockOutDate).toISOString(),
        });
        setEditing(null);
        setForm(empty);
        setMessage("Updated");
        load();
      } catch (err) {
        setMessage(err.response?.data?.message || "Update failed");
      }
    }
  };

  const startEdit = (r) => {
    setEditing(r._id);
    setForm({
      sparePartId: r.sparePart?._id || r.sparePart,
      stockOutQuantity: r.stockOutQuantity,
      stockOutUnitPrice: r.stockOutUnitPrice,
      stockOutDate: r.stockOutDate
        ? new Date(r.stockOutDate).toISOString().slice(0, 10)
        : "",
    });
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this stock out?")) return;
    setMessage("");
    try {
      await deleteStockOut(id);
      if (editing === id) {
        setEditing(null);
        setForm(empty);
      }
      setMessage("Deleted");
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-amber-200 bg-white p-4 shadow">
        <h2 className="mb-3 text-lg font-semibold text-amber-900">Stock Out (create / list / update / delete)</h2>
        <form onSubmit={onSubmit} className="grid gap-2 md:grid-cols-2 lg:grid-cols-5">
          <select
            className="rounded border px-2 py-2"
            value={form.sparePartId}
            disabled={Boolean(editing)}
            onChange={(e) => setForm((f) => ({ ...f, sparePartId: e.target.value }))}
            required={!editing}
          >
            <option value="">Spare part</option>
            {parts.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            className="rounded border px-2 py-2"
            min="1"
            placeholder="Quantity"
            value={form.stockOutQuantity}
            onChange={(e) => setForm((f) => ({ ...f, stockOutQuantity: e.target.value }))}
            required
          />
          <input
            type="number"
            className="rounded border px-2 py-2"
            min="0"
            step="0.01"
            placeholder="Unit price"
            value={form.stockOutUnitPrice}
            onChange={(e) => setForm((f) => ({ ...f, stockOutUnitPrice: e.target.value }))}
            required
          />
          <input
            type="date"
            className="rounded border px-2 py-2"
            value={form.stockOutDate}
            onChange={(e) => setForm((f) => ({ ...f, stockOutDate: e.target.value }))}
            required
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 rounded bg-amber-600 px-2 py-2 text-white hover:bg-amber-700"
            >
              {editing ? "Update" : "Save"}
            </button>
            {editing && (
              <button
                type="button"
                className="rounded bg-slate-500 px-2 py-2 text-white"
                onClick={() => {
                  setEditing(null);
                  setForm(empty);
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
        {message && <p className="mt-2 text-sm text-slate-600">{message}</p>}
      </section>
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow">
        <h2 className="mb-3 font-semibold">All stock out records</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="bg-slate-100">
                <th className="p-2">Part</th>
                <th className="p-2">Qty</th>
                <th className="p-2">Unit $</th>
                <th className="p-2">Total</th>
                <th className="p-2">Date</th>
                <th className="p-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id} className="border-b">
                  <td className="p-2">{r.sparePart?.name || ""}</td>
                  <td className="p-2">{r.stockOutQuantity}</td>
                  <td className="p-2">{r.stockOutUnitPrice}</td>
                  <td className="p-2">{r.stockOutTotalPrice}</td>
                  <td className="p-2">
                    {r.stockOutDate ? new Date(r.stockOutDate).toLocaleDateString() : ""}
                  </td>
                  <td className="p-2">
                    <button
                      type="button"
                      className="mr-1 rounded bg-amber-100 px-2 py-0.5 text-amber-900"
                      onClick={() => startEdit(r)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="rounded bg-red-100 px-2 py-0.5 text-red-800"
                      onClick={() => onDelete(r._id)}
                    >
                      Del
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default StockOutPage;
