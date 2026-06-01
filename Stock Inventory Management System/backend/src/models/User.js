const { execute, query } = require("../config/db");

const toUser = (row) => {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    username: row.username,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    async save() {
      await execute("UPDATE users SET username = ?, password_hash = ? WHERE id = ?", [
        this.username,
        this.passwordHash,
        this.id,
      ]);
      return this;
    },
  };
};

const findOne = async ({ username }) => {
  const rows = await query("SELECT * FROM users WHERE username = ? LIMIT 1", [username]);
  return toUser(rows[0]);
};

const create = async ({ username, passwordHash }) => {
  const result = await execute("INSERT INTO users (username, password_hash) VALUES (?, ?)", [
    username,
    passwordHash,
  ]);
  return toUser({
    id: result.insertId,
    username,
    password_hash: passwordHash,
  });
};

module.exports = { create, findOne };
