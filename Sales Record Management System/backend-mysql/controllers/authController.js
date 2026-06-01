import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../config/db.js";

const signToken = (user) =>
  jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET || "exam_secret",
    { expiresIn: "8h" }
  );

export const register = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }
    const existing = await query("SELECT id FROM users WHERE username = ?", [username.trim()]);
    if (existing.length) {
      return res.status(409).json({ message: "Username already exists." });
    }
    const hash = await bcrypt.hash(password, 10);
    await query("INSERT INTO users (username, password) VALUES (?, ?)", [username.trim(), hash]);
    return res.status(201).json({ message: "Account created successfully." });
  } catch {
    return res.status(500).json({ message: "Server error during registration." });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }
    const rows = await query("SELECT * FROM users WHERE username = ?", [username.trim()]);
    if (!rows.length) {
      return res.status(401).json({ message: "Invalid credentials." });
    }
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials." });
    }
    return res.json({
      message: "Login successful.",
      token: signToken(user),
      user: { id: user.id, username: user.username },
    });
  } catch {
    return res.status(500).json({ message: "Server error during login." });
  }
};
