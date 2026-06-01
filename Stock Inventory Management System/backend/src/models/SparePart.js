const { execute, query } = require("../config/db");

const toNumber = (value) => Number(value || 0);

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
        "UPDATE spare_parts SET name = ?, category = ?, quantity = ?, unit_price = ?, total_price = ? WHERE id = ?",
        [this.name, this.category, this.quantity, this.unitPrice, this.totalPrice, this.id]
      );
      return this;
    },
  };
};

const create = async ({ name, category, quantity, unitPrice, totalPrice }) => {
  try {
    const result = await execute(
      "INSERT INTO spare_parts (name, category, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)",
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
    if (error.code === "ER_DUP_ENTRY") error.code = 11000;
    throw error;
  }
};

const findAll = async () => {
  const rows = await query("SELECT * FROM spare_parts ORDER BY name ASC");
  return rows.map(toSparePart);
};

const findById = async (id) => {
  const rows = await query("SELECT * FROM spare_parts WHERE id = ? LIMIT 1", [id]);
  return toSparePart(rows[0]);
};

module.exports = { create, findAll, findById };
