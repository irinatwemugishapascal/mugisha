import { query } from "../config/db.js";

export const create = async (req, res) => {
  try {
    if (!req.body.invoiceNumber) return res.status(400).json({ message: "Invoice Number is required." });
    if (!req.body.salesDate) return res.status(400).json({ message: "Sales Date is required." });
    if (!req.body.paymentMethod) return res.status(400).json({ message: "Payment Method is required." });
    if (req.body.totalAmountPaid === undefined || req.body.totalAmountPaid === "") return res.status(400).json({ message: "Total Amount is required." });
    if (!req.body.customerNumber) return res.status(400).json({ message: "Customer Number is required." });
    if (!req.body.productCode) return res.status(400).json({ message: "Product Code is required." });
    const values = [req.body.invoiceNumber, req.body.salesDate, req.body.paymentMethod, req.body.totalAmountPaid, req.body.customerNumber, req.body.productCode];
    await query("INSERT INTO sales (invoice_number, sales_date, payment_method, total_amount_paid, customer_number, product_code) VALUES (?, ?, ?, ?, ?, ?)", values);
    return res.status(201).json({ message: "Sale added successfully." });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Sale already exists." });
    }
    return res.status(500).json({ message: "Failed to add sale." });
  }
};

export const getAll = async (_req, res) => {
  try {
    const rows = await query("SELECT * FROM sales ORDER BY invoice_number DESC");
    return res.json(rows);
  } catch {
    return res.status(500).json({ message: "Failed to fetch sale records." });
  }
};

export const update = async (req, res) => {
  try {
    if (!req.body.invoiceNumber) return res.status(400).json({ message: "Invoice Number is required." });
    if (!req.body.salesDate) return res.status(400).json({ message: "Sales Date is required." });
    if (!req.body.paymentMethod) return res.status(400).json({ message: "Payment Method is required." });
    if (req.body.totalAmountPaid === undefined || req.body.totalAmountPaid === "") return res.status(400).json({ message: "Total Amount is required." });
    if (!req.body.customerNumber) return res.status(400).json({ message: "Customer Number is required." });
    if (!req.body.productCode) return res.status(400).json({ message: "Product Code is required." });
    const values = [req.body.invoiceNumber, req.body.salesDate, req.body.paymentMethod, req.body.totalAmountPaid, req.body.customerNumber, req.body.productCode, req.params.id];
    const result = await query("UPDATE sales SET invoice_number = ?, sales_date = ?, payment_method = ?, total_amount_paid = ?, customer_number = ?, product_code = ? WHERE invoice_number = ?", values);
    if (!result.affectedRows) {
      return res.status(404).json({ message: "Sale not found." });
    }
    return res.json({ message: "Sale updated successfully." });
  } catch {
    return res.status(500).json({ message: "Failed to update sale." });
  }
};

export const remove = async (req, res) => {
  try {
    const result = await query("DELETE FROM sales WHERE invoice_number = ?", [req.params.id]);
    if (!result.affectedRows) {
      return res.status(404).json({ message: "Sale not found." });
    }
    return res.json({ message: "Sale deleted successfully." });
  } catch {
    return res.status(500).json({ message: "Failed to delete sale." });
  }
};