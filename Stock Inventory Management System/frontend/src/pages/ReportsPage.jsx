import { useState } from "react";
import { getDailyStockOut, getDailyStockStatus } from "../api/simsReportApi";

function ReportsPage() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [statusRows, setStatusRows] = useState([]);
  const [outRows, setOutRows] = useState([]);
  const [message, setMessage] = useState("");

  const run = async () => {
    setMessage("");
    try {
      const [a, b] = await Promise.all([getDailyStockStatus(date), getDailyStockOut(date)]);
      setStatusRows(a.data);
      setOutRows(b.data);
      if (!a.data.length && !b.data.length) setMessage("No data for this day");
    } catch {
      setMessage("Report failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-2">
        <div>
          <label className="text-sm text-slate-600">Date</label>
          <input
            type="date"
            className="block rounded border px-2 py-2"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <button
          type="button"
          className="rounded bg-emerald-800 px-4 py-2 text-white hover:bg-emerald-900"
          onClick={run}
        >
          Generate
        </button>
      </div>
      {message && <p className="text-sm text-slate-500">{message}</p>}

      <section className="rounded-lg border border-emerald-200 bg-white p-4 shadow">
        <h2 className="mb-3 text-lg font-semibold text-emerald-900">Daily stock status</h2>
        <p className="mb-2 text-sm text-slate-500">Spare name, stored, stock in / out (day), remaining (current stock)</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="bg-slate-100">
                <th className="p-2 text-left">Spare name</th>
                <th className="p-2 text-left">Category</th>
                <th className="p-2 text-right">Stored qty (current)</th>
                <th className="p-2 text-right">Stock in (day)</th>
                <th className="p-2 text-right">Stock out (day)</th>
                <th className="p-2 text-right">Remaining (current)</th>
              </tr>
            </thead>
            <tbody>
              {statusRows.map((r) => (
                <tr key={r.spareName + r.category} className="border-b">
                  <td className="p-2">{r.spareName}</td>
                  <td className="p-2">{r.category}</td>
                  <td className="p-2 text-right">{r.storedQuantity}</td>
                  <td className="p-2 text-right">{r.stockInQuantity}</td>
                  <td className="p-2 text-right">{r.stockOutQuantity}</td>
                  <td className="p-2 text-right">{r.remainingQuantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border border-blue-200 bg-white p-4 shadow">
        <h2 className="mb-3 text-lg font-semibold text-blue-900">Daily stock out report</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="bg-slate-100">
                <th className="p-2 text-left">Spare</th>
                <th className="p-2 text-right">Qty out</th>
                <th className="p-2 text-right">Unit</th>
                <th className="p-2 text-right">Total</th>
                <th className="p-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {outRows.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="p-2">{r.spareName}</td>
                  <td className="p-2 text-right">{r.stockOutQuantity}</td>
                  <td className="p-2 text-right">{r.stockOutUnitPrice}</td>
                  <td className="p-2 text-right">{r.stockOutTotalPrice}</td>
                  <td className="p-2">
                    {r.stockOutDate ? new Date(r.stockOutDate).toLocaleString() : ""}
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

export default ReportsPage;
