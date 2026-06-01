const mysql = require("mysql2/promise");

const MYSQL_HOST = "127.0.0.1";
const MYSQL_PORT = 3306;
const MYSQL_USER = "root";
const MYSQL_PASSWORD = "";
const MYSQL_DATABASE = "sims";
const MYSQL_CONNECTION_LIMIT = 10;

const dbConfig = {
  host: MYSQL_HOST,
  port: MYSQL_PORT,
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: MYSQL_CONNECTION_LIMIT,
  queueLimit: 0,
};

let pool;

const ensureDatabase = async () => {
  const connection = await mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
  });
  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await connection.end();
};

const getPool = () => {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
};

const query = async (sql, params = []) => {
  const [rows] = await getPool().query(sql, params);
  return rows;
};

const execute = async (sql, params = []) => {
  const [result] = await getPool().execute(sql, params);
  return result;
};

const createTables = async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      username VARCHAR(100) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_users_username (username)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS spare_parts (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      name VARCHAR(150) NOT NULL,
      category VARCHAR(150) NOT NULL,
      quantity INT UNSIGNED NOT NULL DEFAULT 0,
      unit_price DECIMAL(12,2) NOT NULL,
      total_price DECIMAL(12,2) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_spare_parts_name_category (name, category)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS stock_ins (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      spare_part_id INT UNSIGNED NOT NULL,
      stock_in_quantity INT UNSIGNED NOT NULL,
      stock_in_date DATETIME NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_stock_ins_part_date (spare_part_id, stock_in_date),
      CONSTRAINT fk_stock_ins_spare_part
        FOREIGN KEY (spare_part_id) REFERENCES spare_parts (id)
        ON DELETE RESTRICT ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS stock_outs (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      spare_part_id INT UNSIGNED NOT NULL,
      stock_out_quantity INT UNSIGNED NOT NULL,
      stock_out_unit_price DECIMAL(12,2) NOT NULL,
      stock_out_total_price DECIMAL(12,2) NOT NULL,
      stock_out_date DATETIME NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_stock_outs_part_date (spare_part_id, stock_out_date),
      CONSTRAINT fk_stock_outs_spare_part
        FOREIGN KEY (spare_part_id) REFERENCES spare_parts (id)
        ON DELETE RESTRICT ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS sessions (
      session_id VARCHAR(128) NOT NULL,
      expires BIGINT UNSIGNED NOT NULL,
      data MEDIUMTEXT NOT NULL,
      PRIMARY KEY (session_id),
      KEY idx_sessions_expires (expires)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
};

const connectDatabase = async () => {
  await ensureDatabase();
  await getPool().query("SELECT 1");
  await createTables();
  console.log(`MySQL connected (${dbConfig.database} database)`);
};

module.exports = { connectDatabase, execute, getPool, query };
