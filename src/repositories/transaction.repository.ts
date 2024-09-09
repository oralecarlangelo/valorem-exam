import { RowDataPacket } from "mysql2";
import pool from "../config/database";
import { Transaction } from "../types/transaction.type";

// Extending RowDataPacket to match Transaction fields for type safety
interface TransactionRow extends Transaction, RowDataPacket {}

function formatMySQLDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toISOString().slice(0, 19).replace("T", " ");
}

export const createTransaction = async (transaction: Transaction) => {
  const createdAt = formatMySQLDate(transaction.created_at);
  const updatedAt = formatMySQLDate(transaction.updated_at);

  await pool.query(
    "INSERT INTO Transactions (id, created_at, updated_at, description, type, type_method, state, user_id, user_name, amount, currency, debit_credit) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      transaction.id,
      createdAt,
      updatedAt,
      transaction.description,
      transaction.type,
      transaction.type_method,
      transaction.state,
      transaction.user_id,
      transaction.user_name,
      transaction.amount,
      transaction.currency,
      transaction.debit_credit,
    ]
  );
};

// Get transactions by user ID
export const getTransactionsByUserId = async (
  userId: string
): Promise<Transaction[]> => {
  // Properly type the result with TransactionRow[]
  const [rows] = await pool.query<TransactionRow[]>(
    "SELECT * FROM Transactions WHERE user_id = ?",
    [userId]
  );

  return rows; // Return the array of Transaction objects
};

// Check if a transaction exists by ID
export const getTransactionById = async (
  id: string
): Promise<Transaction | null> => {
  const [rows] = await pool.query<TransactionRow[]>(
    "SELECT * FROM Transactions WHERE id = ?",
    [id]
  );
  return rows.length > 0 ? rows[0] : null; // Return the transaction if found, or null
};

export const deleteTestTransactions = async () => {
  const query = "DELETE FROM Transactions WHERE user_id = 'user123'";
  await pool.query(query);
};
