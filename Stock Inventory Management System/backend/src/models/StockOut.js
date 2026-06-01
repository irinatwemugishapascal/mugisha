const { execute, query } = require("../config/db");

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
        "UPDATE stock_outs SET spare_part_id = ?, stock_out_quantity = ?, stock_out_unit_price = ?, stock_out_total_price = ?, stock_out_date = ? WHERE id = ?",
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

const create = async ({ sparePart, stockOutQuantity, stockOutUnitPrice, stockOutTotalPrice, stockOutDate }) => {
  const result = await execute(
    "INSERT INTO stock_outs (spare_part_id, stock_out_quantity, stock_out_unit_price, stock_out_total_price, stock_out_date) VALUES (?, ?, ?, ?, ?)",
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

const findAllWithPart = async (order = "DESC") => {
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

const findById = async (id) => {
  const rows = await query("SELECT * FROM stock_outs WHERE id = ? LIMIT 1", [id]);
  return toStockOut(rows[0]);
};

const findByDateRangeWithPart = async (start, end) => {
  const rows = await query(
    `
      SELECT
        so.*,
        sp.id AS spare_part_id,
        sp.name AS spare_part_name,
        sp.category AS spare_part_category,
        1 AS spare_part
      FROM stock_outs so
      JOIN spare_parts sp ON sp.id = so.spare_part_id
      WHERE so.stock_out_date >= ? AND so.stock_out_date < ?
      ORDER BY so.stock_out_date ASC
    `,
    [start, end]
  );
  return rows.map(toStockOut);
};

const removeById = async (id) => {
  await execute("DELETE FROM stock_outs WHERE id = ?", [id]);
};

const sumByPartAndDateRange = async (sparePartId, start, end) => {
  const rows = await query(
    "SELECT COALESCE(SUM(stock_out_quantity), 0) AS total FROM stock_outs WHERE spare_part_id = ? AND stock_out_date >= ? AND stock_out_date < ?",
    [sparePartId, start, end]
  );
  return Number(rows[0]?.total || 0);
};

module.exports = {
  create,
  findAllWithPart,
  findByDateRangeWithPart,
  findById,
  removeById,
  sumByPartAndDateRange,
};
