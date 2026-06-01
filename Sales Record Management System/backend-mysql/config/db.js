import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "SRMS",
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
});

export const query = async (sql, params = []) => {
  const [rows] = await pool.execute(sql, params);
  return rows;
};

export const connectDatabase = async () => {
  try {
    await query("SELECT 1");
    console.log("Database Connected Successfully");
    return true;
  } catch (error) {
    console.log("Database Connection Failed");
    console.error(error.message);
    return false;
  }
};

export default pool;
