import mysql from "mysql2/promise";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure SSL: if ca.pem exists, use strict CA verification; otherwise require SSL with rejectUnauthorized: false so Aiven SSL requirement is satisfied
let sslConfig = { rejectUnauthorized: false };
if (process.env.DB_SSL_CA) {
  const caPath = path.isAbsolute(process.env.DB_SSL_CA)
    ? process.env.DB_SSL_CA
    : path.resolve(__dirname, process.env.DB_SSL_CA);

  if (fs.existsSync(caPath)) {
    try {
      sslConfig = {
        ca: fs.readFileSync(caPath),
        rejectUnauthorized: true,
      };
    } catch (err) {
      console.error(`[DB SSL Warning] Failed to read SSL CA file at ${caPath}:`, err.message);
    }
  }
}

// Create MySQL connection pool configured for Aiven Cloud MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: sslConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Helper function to query database
export const query = async (sql, params = []) => {
  const [results] = await pool.query(sql, params);
  return [results];
};

export const getConnection = () => pool.getConnection();

export default {
  query,
  getConnection,
  pool,
};
