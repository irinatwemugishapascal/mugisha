const SparePart = require("../models/SparePart");
const StockIn = require("../models/StockIn");
const StockOut = require("../models/StockOut");

const dayRange = (dateStr) => {
  const d = new Date(String(dateStr));
  if (Number.isNaN(d.getTime())) return null;
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
};

const dailyStockStatus = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: "date query (YYYY-MM-DD) is required" });
    }
    const range = dayRange(date);
    if (!range) {
      return res.status(400).json({ message: "Invalid date" });
    }
    const parts = await SparePart.findAll();
    const rows = [];
    for (const p of parts) {
      const stockInDay = await StockIn.sumByPartAndDateRange(p._id, range.start, range.end);
      const stockOutDay = await StockOut.sumByPartAndDateRange(p._id, range.start, range.end);
      rows.push({
        spareName: p.name,
        category: p.category,
        storedQuantity: p.quantity,
        stockInQuantity: stockInDay,
        stockOutQuantity: stockOutDay,
        remainingQuantity: p.quantity,
      });
    }
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const dailyStockOut = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: "date query (YYYY-MM-DD) is required" });
    }
    const range = dayRange(date);
    if (!range) {
      return res.status(400).json({ message: "Invalid date" });
    }
    const list = await StockOut.findByDateRangeWithPart(range.start, range.end);
    return res.json(
      list.map((r) => ({
        id: r._id,
        spareName: r.sparePart?.name || "",
        category: r.sparePart?.category || "",
        stockOutQuantity: r.stockOutQuantity,
        stockOutUnitPrice: r.stockOutUnitPrice,
        stockOutTotalPrice: r.stockOutTotalPrice,
        stockOutDate: r.stockOutDate,
      }))
    );
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { dailyStockStatus, dailyStockOut };
