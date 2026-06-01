import { query } from "../config/db.js";

export const create = async (req, res) => {
  try {
    if (!req.body.customerNumber) return res.status(400).json({ message: "Customer Number is required." });
    if (!req.body.firstName) return res.status(400).json({ message: "First Name is required." });
    if (!req.body.lastName) return res.status(400).json({ message: "Last Name is required." });
    if (!req.body.telephone) return res.status(400).json({ message: "Telephone is required." });
    if (!req.body.address) return res.status(400).json({ message: "Address is required." });
    const values = [req.body.customerNumber, req.body.firstName, req.body.lastName, req.body.telephone, req.body.address];
    await query("INSERT INTO customers (customer_number, first_name, last_name, telephone, address) VALUES (?, ?, ?, ?, ?)", values);
    return res.status(201).json({ message: "Customer added successfully." });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Customer already exists." });
    }
    return res.status(500).json({ message: "Failed to add customer." });
  }
};

export const getAll = async (_req, res) => {
  try {
    const rows = await query("SELECT * FROM customers ORDER BY customer_number DESC");
    return res.json(rows);
  } catch {
    return res.status(500).json({ message: "Failed to fetch customer records." });
  }
};