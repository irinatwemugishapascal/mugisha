import { query } from "../config/db.js";
const ranges = { daily: "DATE({f}) = CURDATE()", weekly: "YEARWEEK({f}, 1) = YEARWEEK(CURDATE(), 1)", monthly: "YEAR({f}) = YEAR(CURDATE()) AND MONTH({f}) = MONTH(CURDATE())" };
export const getReports = async (req, res) => {
  try {
    const period = req.query.period || "daily";
    const clause = (ranges[period] || ranges.daily).replace(/{f}/g, "sales_date");
    const customers = await query("SELECT * FROM customers");
    const products = await query("SELECT * FROM products");
    const sales = await query(`SELECT * FROM sales WHERE ${clause}`);
    return res.json({ period, reports: { customers, products, sales } });
  } catch { return res.status(500).json({ message: "Failed to generate reports." }); }
};