import { query } from "../config/db.js";

export const create = async (req, res) => {
  try {
    if (!req.body.productCode) return res.status(400).json({ message: "Product Code is required." });
    if (!req.body.productName) return res.status(400).json({ message: "Product Name is required." });
    if (req.body.quantitySold === undefined || req.body.quantitySold === "") return res.status(400).json({ message: "Quantity Sold is required." });
    if (req.body.unitPrice === undefined || req.body.unitPrice === "") return res.status(400).json({ message: "Unit Price is required." });
    const values = [req.body.productCode, req.body.productName, req.body.quantitySold, req.body.unitPrice];
    await query("INSERT INTO products (product_code, product_name, quantity_sold, unit_price) VALUES (?, ?, ?, ?)", values);
    return res.status(201).json({ message: "Product added successfully." });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Product already exists." });
    }
    return res.status(500).json({ message: "Failed to add product." });
  }
};

export const getAll = async (_req, res) => {
  try {
    const rows = await query("SELECT * FROM products ORDER BY product_code DESC");
    return res.json(rows);
  } catch {
    return res.status(500).json({ message: "Failed to fetch product records." });
  }
};