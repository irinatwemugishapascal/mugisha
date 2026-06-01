import { useEffect, useState } from "react";
import api from "../api/client.js";

const sections = [{"key":"customers","label":"Customers","cols":["Number","Name","Phone"],"keys":["customer_number","first_name","telephone"]},{"key":"products","label":"Products","cols":["Code","Name","Qty","Price"],"keys":["product_code","product_name","quantity_sold","unit_price"]},{"key":"sales","label":"Sales","cols":["Invoice","Date","Amount","Method"],"keys":["invoice_number","sales_date","total_amount_paid","payment_method"]}];

export default function ReportsPage() {
  const [period, setPeriod] = useState("daily");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const { data: res } = await api.get("/reports", { params: { period } });
      setData(res.reports);
    } catch {
      setError("Failed to load reports.");
    }
  };

  useEffect(() => { load(); }, [period]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-ink">Reports</h2>
          <p className="text-muted text-sm">Daily, weekly, and monthly summaries</p>
        </div>
        <select value={period} onChange={(e) => setPeriod(e.target.value)} className="rounded-lg border border-line px-3 py-2">
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="grid gap-6">
        {sections.map((s) => (
          <div key={s.key} className="bg-card rounded-xl border border-line overflow-x-auto">
            <h3 className="px-4 py-3 font-semibold border-b border-line bg-surface">{s.label}</h3>
            <table className="w-full text-sm">
              <thead><tr>{s.cols.map((c) => <th key={c} className="px-4 py-2 text-left">{c}</th>)}</tr></thead>
              <tbody>
                {(data?.[s.key] || []).map((row, i) => (
                  <tr key={i} className="border-t border-line">
                    {s.keys.map((k) => <td key={k} className="px-4 py-2">{String(row[k] ?? "")}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
