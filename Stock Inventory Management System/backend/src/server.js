
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const { connectDatabase, execute, query } = require("./config/db");

const PORT = 5001;                                    // Backend runs on this port
const SESSION_SECRET = "change-sims-secret";            // Used to sign session cookies
const FRONTEND_URL = "http://localhost:5174";           // Frontend dev server URL


class MySQLSessionStore extends session.Store {

  // Retrieve a session by its ID
  async get(sid, callback) {
    try {
      const rows = await query(
        "SELECT data, expires FROM sessions WHERE session_id = ? LIMIT 1",
        [sid]
      );
      const row = rows[0];

      // If session does not exist or has expired, destroy it
      if (!row || Number(row.expires) <= Date.now()) {
        if (row) {
          await this.destroy(sid, () => {});
        }
        return callback(null, null);
      }

      // Return the session data
      return callback(null, JSON.parse(row.data));
    } catch (error) {
      return callback(error);
    }
  }

  // Save a session (insert or update)
  async set(sid, sess, callback) {
    try {
      const expires = sess.cookie?.expires
        ? new Date(sess.cookie.expires).getTime()
        : Date.now() + 86400000;

      await execute(
        `INSERT INTO sessions (session_id, expires, data)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE expires = VALUES(expires), data = VALUES(data)`,
        [sid, expires, JSON.stringify(sess)]
      );
      return callback(null);
    } catch (error) {
      return callback(error);
    }
  }

  // Delete a session
  async destroy(sid, callback) {
    try {
      await execute("DELETE FROM sessions WHERE session_id = ?", [sid]);
      return callback(null);
    } catch (error) {
      return callback(error);
    }
  }

  // Update the expiry time of a session
  async touch(sid, sess, callback) {
    try {
      const expires = sess.cookie?.expires
        ? new Date(sess.cookie.expires).getTime()
        : Date.now() + 86400000;

      await execute(
        "UPDATE sessions SET expires = ? WHERE session_id = ?",
        [expires, sid]
      );
      return callback(null);
    } catch (error) {
      return callback(error);
    }
  }
}

// ============================================================
// Authentication Middleware
// This function checks if a user is logged in before allowing
// access to protected routes.
// ============================================================
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  return next();
};

// ============================================================
// Utility Functions
// ============================================================

// Recalculate total price = quantity * unit price
const recalcPartTotals = (part) => {
  part.totalPrice = part.quantity * part.unitPrice;
};

// Check if password meets the strong password requirements:
// - At least 8 characters
// - Contains an uppercase letter
// - Contains a lowercase letter
// - Contains a number
const strongPasswordError = (password) => {
  const p = String(password || "");
  if (p.length < 8) {
    return "Password must be at least 8 characters (strong password required)";
  }
  if (!/[A-Z]/.test(p)) {
    return "Password must include an uppercase letter";
  }
  if (!/[a-z]/.test(p)) {
    return "Password must include a lowercase letter";
  }
  if (!/[0-9]/.test(p)) {
    return "Password must include a number";
  }
  return null;
};

// Trim whitespace from a string
const normalize = (value) => String(value || "").trim();

// ============================================================
// User Model Functions
// ============================================================

// Convert a database row into a User object
const toUser = (row) => {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    username: row.username,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
    updatedAt: row.updated_at,

    // Save changes back to the database
    async save() {
      await execute(
        "UPDATE users SET username = ?, password_hash = ? WHERE id = ?",
        [this.username, this.passwordHash, this.id]
      );
      return this;
    },
  };
};

// Find a user by their username
const findOneUser = async ({ username }) => {
  const rows = await query(
    "SELECT * FROM users WHERE username = ? LIMIT 1",
    [username]
  );
  return toUser(rows[0]);
};

// Create a new user in the database
const createUser = async ({ username, passwordHash }) => {
  const result = await execute(
    "INSERT INTO users (username, password_hash) VALUES (?, ?)",
    [username, passwordHash]
  );
  return toUser({
    id: result.insertId,
    username,
    password_hash: passwordHash,
  });
};

// ============================================================
// Spare Part Model Functions
// ============================================================

const toNumber = (value) => Number(value || 0);

// Convert a database row into a SparePart object
const toSparePart = (row) => {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    name: row.name,
    category: row.category,
    quantity: toNumber(row.quantity),
    unitPrice: toNumber(row.unit_price),
    totalPrice: toNumber(row.total_price),
    createdAt: row.created_at,
    updatedAt: row.updated_at,

    async save() {
      await execute(
        `UPDATE spare_parts
         SET name = ?, category = ?, quantity = ?,
             unit_price = ?, total_price = ?
         WHERE id = ?`,
        [
          this.name,
          this.category,
          this.quantity,
          this.unitPrice,
          this.totalPrice,
          this.id,
        ]
      );
      return this;
    },
  };
};

// Create a new spare part
const createSparePart = async ({ name, category, quantity, unitPrice, totalPrice }) => {
  try {
    const result = await execute(
      `INSERT INTO spare_parts (name, category, quantity, unit_price, total_price)
       VALUES (?, ?, ?, ?, ?)`,
      [name, category, quantity, unitPrice, totalPrice]
    );
    return toSparePart({
      id: result.insertId,
      name,
      category,
      quantity,
      unit_price: unitPrice,
      total_price: totalPrice,
    });
  } catch (error) {
    // Convert MySQL duplicate entry error to a generic code
    if (error.code === "ER_DUP_ENTRY") {
      error.code = 11000;
    }
    throw error;
  }
};

// Get all spare parts (sorted by name)
const findAllSpareParts = async () => {
  const rows = await query("SELECT * FROM spare_parts ORDER BY name ASC");
  return rows.map(toSparePart);
};

// Find a spare part by its ID
const findSparePartById = async (id) => {
  const rows = await query(
    "SELECT * FROM spare_parts WHERE id = ? LIMIT 1",
    [id]
  );
  return toSparePart(rows[0]);
};

// ============================================================
// Stock-In Model Functions
// ============================================================

// Convert a database row into a StockIn object
const toStockIn = (row) => {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    sparePart: row.spare_part
      ? {
          _id: row.spare_part_id,
          id: row.spare_part_id,
          name: row.spare_part_name,
          category: row.spare_part_category,
        }
      : row.spare_part_id,
    stockInQuantity: Number(row.stock_in_quantity || 0),
    stockInDate: row.stock_in_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

// Create a new stock-in record
const createStockIn = async ({ sparePart, stockInQuantity, stockInDate }) => {
  const result = await execute(
    `INSERT INTO stock_ins (spare_part_id, stock_in_quantity, stock_in_date)
     VALUES (?, ?, ?)`,
    [sparePart, stockInQuantity, stockInDate]
  );
  return toStockIn({
    id: result.insertId,
    spare_part_id: sparePart,
    stock_in_quantity: stockInQuantity,
    stock_in_date: stockInDate,
  });
};

// Get all stock-in records with their associated spare part
const findAllStockInsWithPart = async () => {
  const rows = await query(`
    SELECT
      si.*,
      sp.id AS spare_part_id,
      sp.name AS spare_part_name,
      sp.category AS spare_part_category,
      1 AS spare_part
    FROM stock_ins si
    JOIN spare_parts sp ON sp.id = si.spare_part_id
    ORDER BY si.stock_in_date DESC
  `);
  return rows.map(toStockIn);
};

// Get total stock-in quantity for a spare part on a specific day
const sumStockInByPartAndDateRange = async (sparePartId, start, end) => {
  const rows = await query(
    `SELECT COALESCE(SUM(stock_in_quantity), 0) AS total
     FROM stock_ins
     WHERE spare_part_id = ?
       AND stock_in_date >= ?
       AND stock_in_date < ?`,
    [sparePartId, start, end]
  );
  return Number(rows[0]?.total || 0);
};

// ============================================================
// Stock-Out Model Functions
// ============================================================

// Convert a database row into a StockOut object
const toStockOut = (row) => {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    sparePart: row.spare_part
      ? {
          _id: row.spare_part_id,
          id: row.spare_part_id,
          name: row.spare_part_name,
          category: row.spare_part_category,
        }
      : row.spare_part_id,
    stockOutQuantity: Number(row.stock_out_quantity || 0),
    stockOutUnitPrice: Number(row.stock_out_unit_price || 0),
    stockOutTotalPrice: Number(row.stock_out_total_price || 0),
    stockOutDate: row.stock_out_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,

    async save() {
      await execute(
        `UPDATE stock_outs
         SET spare_part_id = ?, stock_out_quantity = ?,
             stock_out_unit_price = ?, stock_out_total_price = ?,
             stock_out_date = ?
         WHERE id = ?`,
        [
          typeof this.sparePart === "object" ? this.sparePart.id : this.sparePart,
          this.stockOutQuantity,
          this.stockOutUnitPrice,
          this.stockOutTotalPrice,
          this.stockOutDate,
          this.id,
        ]
      );
      return this;
    },
  };
};

// Create a new stock-out record
const createStockOut = async ({
  sparePart,
  stockOutQuantity,
  stockOutUnitPrice,
  stockOutTotalPrice,
  stockOutDate,
}) => {
  const result = await execute(
    `INSERT INTO stock_outs
       (spare_part_id, stock_out_quantity, stock_out_unit_price,
        stock_out_total_price, stock_out_date)
     VALUES (?, ?, ?, ?, ?)`,
    [sparePart, stockOutQuantity, stockOutUnitPrice, stockOutTotalPrice, stockOutDate]
  );
  return toStockOut({
    id: result.insertId,
    spare_part_id: sparePart,
    stock_out_quantity: stockOutQuantity,
    stock_out_unit_price: stockOutUnitPrice,
    stock_out_total_price: stockOutTotalPrice,
    stock_out_date: stockOutDate,
  });
};

// Get all stock-out records with their associated spare part
const findAllStockOutsWithPart = async (order = "DESC") => {
  const direction = order.toUpperCase() === "ASC" ? "ASC" : "DESC";
  const rows = await query(`
    SELECT
      so.*,
      sp.id AS spare_part_id,
      sp.name AS spare_part_name,
      sp.category AS spare_part_category,
      1 AS spare_part
    FROM stock_outs so
    JOIN spare_parts sp ON sp.id = so.spare_part_id
    ORDER BY so.stock_out_date ${direction}
  `);
  return rows.map(toStockOut);
};

// Find a stock-out record by ID
const findStockOutById = async (id) => {
  const rows = await query(
    "SELECT * FROM stock_outs WHERE id = ? LIMIT 1",
    [id]
  );
  return toStockOut(rows[0]);
};

// Get stock-out records within a date range
const findStockOutsByDateRangeWithPart = async (start, end) => {
  const rows = await query(
    `SELECT
       so.*,
       sp.id AS spare_part_id,
       sp.name AS spare_part_name,
       sp.category AS spare_part_category,
       1 AS spare_part
     FROM stock_outs so
     JOIN spare_parts sp ON sp.id = so.spare_part_id
     WHERE so.stock_out_date >= ? AND so.stock_out_date < ?
     ORDER BY so.stock_out_date ASC`,
    [start, end]
  );
  return rows.map(toStockOut);
};

// Delete a stock-out record by ID
const removeStockOutById = async (id) => {
  await execute("DELETE FROM stock_outs WHERE id = ?", [id]);
};

// Get total stock-out quantity for a spare part on a specific day
const sumStockOutByPartAndDateRange = async (sparePartId, start, end) => {
  const rows = await query(
    `SELECT COALESCE(SUM(stock_out_quantity), 0) AS total
     FROM stock_outs
     WHERE spare_part_id = ?
       AND stock_out_date >= ?
       AND stock_out_date < ?`,
    [sparePartId, start, end]
  );
  return Number(rows[0]?.total || 0);
};

// ============================================================
// Auth Controller Functions
// ============================================================

// Register a new user account
const register = async (req, res) => {
  try {
    const username = normalize(req.body.username);
    const password = String(req.body.password || "");

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    if (username.length < 3) {
      return res.status(400).json({ message: "Username must be at least 3 characters" });
    }

    // Check password strength
    const pwdErr = strongPasswordError(password);
    if (pwdErr) {
      return res.status(400).json({ message: pwdErr });
    }

    // Check if username is already taken
    const existingUser = await findOneUser({ username });
    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }

    // Hash the password and save the user
    const passwordHash = await bcrypt.hash(password, 10);
    await createUser({ username, passwordHash });

    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Log in an existing user
const login = async (req, res) => {
  try {
    const username = normalize(req.body.username);
    const password = String(req.body.password || "");

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    // Look up the user
    const user = await findOneUser({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare the password with the stored hash
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Store user info in the session
    req.session.userId = user._id;
    req.session.username = user.username;

    return res.json({ message: "Login successful", username: user.username });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Return the currently logged-in user
const currentUser = (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  return res.json({ username: req.session.username });
};

// Log out and destroy the session
const logout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("sims.sid");
    res.json({ message: "Logged out" });
  });
};

// Reset the password for a user
const recoverPassword = async (req, res) => {
  try {
    const username = normalize(req.body.username);
    const newPassword = String(req.body.newPassword || "");

    // Validate input
    if (!username || !newPassword) {
      return res.status(400).json({ message: "Username and new password are required" });
    }

    // Check password strength
    const pwdErr = strongPasswordError(newPassword);
    if (pwdErr) {
      return res.status(400).json({ message: pwdErr });
    }

    // Find the user
    const user = await findOneUser({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the password
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ message: "Password updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ============================================================
// Spare Part Controller Functions
// ============================================================

// Create a new spare part
const createSparePartHandler = async (req, res) => {
  try {
    const { name, category, quantity, unitPrice } = req.body;

    // Validate required fields
    if (!name || !category || quantity === undefined || unitPrice === undefined) {
      return res
        .status(400)
        .json({ message: "Name, category, quantity, and unit price are required" });
    }

    const qty = Number(quantity);
    const unit = Number(unitPrice);

    if (Number.isNaN(qty) || qty < 0 || Number.isNaN(unit) || unit < 0) {
      return res.status(400).json({ message: "Invalid quantity or unit price" });
    }

    const total = qty * unit;
    const part = await createSparePart({
      name: String(name).trim(),
      category: String(category).trim(),
      quantity: qty,
      unitPrice: unit,
      totalPrice: total,
    });

    return res.status(201).json(part);
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "A spare part with this name and category already exists" });
    }
    return res.status(500).json({ message: error.message });
  }
};

// Get the list of all spare parts
const listSpareParts = async (_req, res) => {
  try {
    const items = await findAllSpareParts();
    return res.json(items);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ============================================================
// Stock-In Controller Functions
// ============================================================

// Record a stock-in transaction
const createStockInHandler = async (req, res) => {
  try {
    const { sparePartId, stockInQuantity, stockInDate } = req.body;

    // Validate required fields
    if (!sparePartId || stockInQuantity === undefined || !stockInDate) {
      return res
        .status(400)
        .json({ message: "Spare part, stock-in quantity, and date are required" });
    }

    const qty = Number(stockInQuantity);
    if (Number.isNaN(qty) || qty < 1) {
      return res.status(400).json({ message: "Stock-in quantity must be at least 1" });
    }

    // Find the spare part and update its quantity
    const part = await findSparePartById(sparePartId);
    if (!part) {
      return res.status(404).json({ message: "Spare part not found" });
    }

    part.quantity += qty;
    recalcPartTotals(part);
    await part.save();

    // Create the stock-in record
    const record = await createStockIn({
      sparePart: sparePartId,
      stockInQuantity: qty,
      stockInDate: new Date(stockInDate),
    });

    return res.status(201).json(record);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get the list of all stock-in records
const listStockIns = async (_req, res) => {
  try {
    const list = await findAllStockInsWithPart();
    return res.json(list);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ============================================================
// Stock-Out Controller Functions
// ============================================================

// Record a stock-out transaction
const createStockOutHandler = async (req, res) => {
  try {
    const { sparePartId, stockOutQuantity, stockOutUnitPrice, stockOutDate } = req.body;

    // Validate required fields
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

    // Find the spare part and check if enough stock is available
    const part = await findSparePartById(sparePartId);
    if (!part) {
      return res.status(404).json({ message: "Spare part not found" });
    }
    if (part.quantity < qty) {
      return res.status(400).json({ message: "Not enough quantity in stock" });
    }

    // Deduct the quantity from the spare part
    part.quantity -= qty;
    recalcPartTotals(part);
    await part.save();

    // Create the stock-out record
    const total = qty * unit;
    const record = await createStockOut({
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

// Get the list of all stock-out records
const listStockOuts = async (_req, res) => {
  try {
    const list = await findAllStockOutsWithPart();
    return res.json(list);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update an existing stock-out record
const updateStockOut = async (req, res) => {
  try {
    // Get the current stock-out record
    const current = await findStockOutById(req.params.id);
    if (!current) {
      return res.status(404).json({ message: "Stock out not found" });
    }

    // Restore the spare part's quantity to what it was before this stock-out
    const part = await findSparePartById(current.sparePart);
    if (!part) {
      return res.status(404).json({ message: "Spare part not found" });
    }

    part.quantity += current.stockOutQuantity;
    recalcPartTotals(part);

    // Validate the new values
    const qty = Number(req.body.stockOutQuantity);
    const unit = Number(req.body.stockOutUnitPrice);

    // Helper: restore the quantity back if validation fails
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

    // Apply the new values
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

// Delete a stock-out record and restore the quantity
const removeStockOut = async (req, res) => {
  try {
    const current = await findStockOutById(req.params.id);
    if (!current) {
      return res.status(404).json({ message: "Stock out not found" });
    }

    // Restore the spare part's quantity
    const part = await findSparePartById(current.sparePart);
    if (part) {
      part.quantity += current.stockOutQuantity;
      recalcPartTotals(part);
      await part.save();
    }

    await removeStockOutById(req.params.id);
    return res.json({ message: "Stock out removed" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ============================================================
// Report Controller Helper
// ============================================================

// Create start and end Date objects for a given date string
const dayRange = (dateStr) => {
  const d = new Date(String(dateStr));
  if (Number.isNaN(d.getTime())) return null;

  const start = new Date(d);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
};

// ============================================================
// Report Controller Functions
// ============================================================

// Get the daily stock status report
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

    const parts = await findAllSpareParts();
    const rows = [];

    for (const p of parts) {
      const stockInDay = await sumStockInByPartAndDateRange(
        p._id,
        range.start,
        range.end
      );
      const stockOutDay = await sumStockOutByPartAndDateRange(
        p._id,
        range.start,
        range.end
      );

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

// Get the daily stock-out report
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

    const list = await findStockOutsByDateRangeWithPart(range.start, range.end);

    const result = list.map((r) => ({
      id: r._id,
      spareName: r.sparePart?.name || "",
      category: r.sparePart?.category || "",
      stockOutQuantity: r.stockOutQuantity,
      stockOutUnitPrice: r.stockOutUnitPrice,
      stockOutTotalPrice: r.stockOutTotalPrice,
      stockOutDate: r.stockOutDate,
    }));

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ============================================================
// API Routes
// ============================================================
const router = express.Router();

// Auth routes
router.post("/auth/register", register);
router.post("/auth/login", login);
router.get("/auth/me", currentUser);
router.post("/auth/logout", logout);
router.post("/auth/recover", recoverPassword);

// Spare part routes (require login)
router.post("/spare-parts", requireAuth, createSparePartHandler);
router.get("/spare-parts", requireAuth, listSpareParts);

// Stock-in routes (require login)
router.post("/stock-in", requireAuth, createStockInHandler);
router.get("/stock-in", requireAuth, listStockIns);

// Stock-out routes (require login)
router.post("/stock-out", requireAuth, createStockOutHandler);
router.get("/stock-out", requireAuth, listStockOuts);
router.put("/stock-out/:id", requireAuth, updateStockOut);
router.delete("/stock-out/:id", requireAuth, removeStockOut);

// Report routes (require login)
router.get("/reports/daily-stock-status", requireAuth, dailyStockStatus);
router.get("/reports/daily-stockout", requireAuth, dailyStockOut);

// ============================================================
// Express App Setup
// ============================================================
const app = express();

// Allow requests from the frontend (different port during development)
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

// Parse JSON request bodies
app.use(express.json());

// Trust the first proxy (needed for session cookies behind a proxy)
app.set("trust proxy", 1);

// Configure sessions
app.use(
  session({
    name: "sims.sid",
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MySQLSessionStore(),
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 8, // 8 hours
    },
  })
);

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ message: "SIMS API is running" });
});

// Mount all API routes under /api
app.use("/api", router);

// ============================================================
// Start the Server
// ============================================================
connectDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`SIMS server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  });
