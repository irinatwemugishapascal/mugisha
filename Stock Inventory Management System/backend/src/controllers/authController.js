const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { strongPasswordError } = require("../utils/passwordPolicy");

const normalize = (value) => String(value || "").trim();

const register = async (req, res) => {
  try {
    const username = normalize(req.body.username);
    const password = String(req.body.password || "");
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    if (username.length < 3) {
      return res.status(400).json({ message: "Username must be at least 3 characters" });
    }
    const pwdErr = strongPasswordError(password);
    if (pwdErr) {
      return res.status(400).json({ message: pwdErr });
    }
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({ username, passwordHash });
    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const username = normalize(req.body.username);
    const password = String(req.body.password || "");
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    req.session.userId = user._id;
    req.session.username = user.username;
    return res.json({ message: "Login successful", username: user.username });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const currentUser = (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  return res.json({ username: req.session.username });
};

const logout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("sims.sid");
    res.json({ message: "Logged out" });
  });
};

const recoverPassword = async (req, res) => {
  try {
    const username = normalize(req.body.username);
    const newPassword = String(req.body.newPassword || "");
    if (!username || !newPassword) {
      return res.status(400).json({ message: "Username and new password are required" });
    }
    const pwdErr = strongPasswordError(newPassword);
    if (pwdErr) {
      return res.status(400).json({ message: pwdErr });
    }
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    return res.json({ message: "Password updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, currentUser, logout, recoverPassword };
