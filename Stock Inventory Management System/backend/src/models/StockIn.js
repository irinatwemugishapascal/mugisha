const { execute, query } = require("../config/db");

const toStockIn = (row) => {
  if (!row) return null;
  const record = {
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
  return record;
};

const create = async ({ sparePart, stockInQuantity, stockInDate }) => {
  const result = await execute(
    "INSERT INTO stock_ins (spare_part_id, stock_in_quantity, stock_in_date) VALUES (?, ?, ?)",
    [sparePart, stockInQuantity, stockInDate]
  );
  return toStockIn({
    id: result.insertId,
    spare_part_id: sparePart,
    stock_in_quantity: stockInQuantity,
    stock_in_date: stockInDate,
  });
};

const findAllWithPart = async () => {
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

const sumByPartAndDateRange = async (sparePartId, start, end) => {
  const rows = await query(
    "SELECT COALESCE(SUM(stock_in_quantity), 0) AS total FROM stock_ins WHERE spare_part_id = ? AND stock_in_date >= ? AND stock_in_date < ?",
    [sparePartId, start, end]
  );
  return Number(rows[0]?.total || 0);
};

module.exports = { create, findAllWithPart, sumByPartAndDateRange };
