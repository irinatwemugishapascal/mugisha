const SparePart = require("../models/SparePart");
const StockIn = require("../models/StockIn");
const { recalcPartTotals } = require("../utils/sparePartHelpers");

const create = async (req, res) => {
  try {
    const { sparePartId, stockInQuantity, stockInDate } = req.body;
    if (!sparePartId || stockInQuantity === undefined || !stockInDate) {
      return res.status(400).json({ message: "Spare part, stock-in quantity, and date are required" });
    }
    const qty = Number(stockInQuantity);
    if (Number.isNaN(qty) || qty < 1) {
      return res.status(400).json({ message: "Stock-in quantity must be at least 1" });
    }
    const part = await SparePart.findById(sparePartId);
    if (!part) {
      return res.status(404).json({ message: "Spare part not found" });
    }
    part.quantity += qty;
    recalcPartTotals(part);
    await part.save();

    const record = await StockIn.create({
      sparePart: sparePartId,
      stockInQuantity: qty,
      stockInDate: new Date(stockInDate),
    });
    return res.status(201).json(record);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const list = async (_req, res) => {
  try {
    const list = await StockIn.findAllWithPart();
    return res.json(list);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { create, list };
