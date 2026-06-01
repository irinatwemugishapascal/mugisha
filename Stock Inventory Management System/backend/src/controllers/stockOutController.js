const SparePart = require("../models/SparePart");
const StockOut = require("../models/StockOut");
const { recalcPartTotals } = require("../utils/sparePartHelpers");

const create = async (req, res) => {
  try {
    const { sparePartId, stockOutQuantity, stockOutUnitPrice, stockOutDate } = req.body;
    if (!sparePartId || stockOutQuantity === undefined || stockOutUnitPrice === undefined || !stockOutDate) {
      return res
        .status(400)
        .json({ message: "Spare part, quantity, unit price, and date are required" });
    }
    const qty = Number(stockOutQuantity);
    const unit = Number(stockOutUnitPrice);
    if (Number.isNaN(qty) || qty < 1) {
      return res.status(400).json({ message: "Invalid stock-out quantity" });
    }
    if (Number.isNaN(unit) || unit < 0) {
      return res.status(400).json({ message: "Invalid unit price" });
    }
    const part = await SparePart.findById(sparePartId);
    if (!part) {
      return res.status(404).json({ message: "Spare part not found" });
    }
    if (part.quantity < qty) {
      return res.status(400).json({ message: "Not enough quantity in stock" });
    }
    part.quantity -= qty;
    recalcPartTotals(part);
    await part.save();
    const total = qty * unit;
    const record = await StockOut.create({
      sparePart: sparePartId,
      stockOutQuantity: qty,
      stockOutUnitPrice: unit,
      stockOutTotalPrice: total,
      stockOutDate: new Date(stockOutDate),
    });
    return res.status(201).json(record);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const list = async (_req, res) => {
  try {
    const list = await StockOut.findAllWithPart();
    return res.json(list);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const current = await StockOut.findById(req.params.id);
    if (!current) {
      return res.status(404).json({ message: "Stock out not found" });
    }
    const part = await SparePart.findById(current.sparePart);
    if (!part) {
      return res.status(404).json({ message: "Spare part not found" });
    }
    part.quantity += current.stockOutQuantity;
    recalcPartTotals(part);

    const qty = Number(req.body.stockOutQuantity);
    const unit = Number(req.body.stockOutUnitPrice);
    const failRestore = async () => {
      part.quantity -= current.stockOutQuantity;
      recalcPartTotals(part);
      await part.save();
    };
    if (Number.isNaN(qty) || qty < 1) {
      await failRestore();
      return res.status(400).json({ message: "Invalid stock-out quantity" });
    }
    if (Number.isNaN(unit) || unit < 0) {
      await failRestore();
      return res.status(400).json({ message: "Invalid unit price" });
    }
    if (part.quantity < qty) {
      await failRestore();
      return res.status(400).json({ message: "Not enough quantity in stock" });
    }
    part.quantity -= qty;
    recalcPartTotals(part);
    await part.save();
    if (req.body.stockOutDate) {
      current.stockOutDate = new Date(req.body.stockOutDate);
    }
    current.stockOutQuantity = qty;
    current.stockOutUnitPrice = unit;
    current.stockOutTotalPrice = qty * unit;
    await current.save();
    return res.json(current);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const current = await StockOut.findById(req.params.id);
    if (!current) {
      return res.status(404).json({ message: "Stock out not found" });
    }
    const part = await SparePart.findById(current.sparePart);
    if (part) {
      part.quantity += current.stockOutQuantity;
      recalcPartTotals(part);
      await part.save();
    }
    await StockOut.removeById(req.params.id);
    return res.json({ message: "Stock out removed" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { create, list, update, remove };
