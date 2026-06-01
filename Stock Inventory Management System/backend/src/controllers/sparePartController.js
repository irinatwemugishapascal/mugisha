const SparePart = require("../models/SparePart");

const create = async (req, res) => {
  try {
    const { name, category, quantity, unitPrice } = req.body;
    if (!name || !category || quantity === undefined || unitPrice === undefined) {
      return res.status(400).json({ message: "Name, category, quantity, and unit price are required" });
    }
    const q = Number(quantity);
    const u = Number(unitPrice);
    if (Number.isNaN(q) || q < 0 || Number.isNaN(u) || u < 0) {
      return res.status(400).json({ message: "Invalid quantity or unit price" });
    }
    const t = q * u;
    const part = await SparePart.create({
      name: String(name).trim(),
      category: String(category).trim(),
      quantity: q,
      unitPrice: u,
      totalPrice: t,
    });
    return res.status(201).json(part);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "A spare part with this name and category already exists" });
    }
    return res.status(500).json({ message: error.message });
  }
};

const list = async (_req, res) => {
  try {
    const items = await SparePart.findAll();
    return res.json(items);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { create, list };
