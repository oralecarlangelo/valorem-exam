import { Handler } from "aws-lambda";
import pool from "../config/database";

// Handler to test the database connection
export const testConnection: Handler = async () => {
  try {
    // Get a connection from the pool
    const connection = await pool.getConnection();

    connection.release();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Database connection successful." }),
    };
  } catch (error: any) {
    console.error("Error connecting to the database:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to connect to the database.",
        error: error.message,
      }),
    };
  }
};
