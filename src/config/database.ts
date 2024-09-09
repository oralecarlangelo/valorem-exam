import * as dotenv from "dotenv";
import { createPool, Pool } from "mysql2/promise";

// Load environment variables from a .env file if available
dotenv.config();

const pool: Pool = createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "mydb",
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: Number(process.env.DB_QUEUE_LIMIT) || 0,
});

export default pool;
