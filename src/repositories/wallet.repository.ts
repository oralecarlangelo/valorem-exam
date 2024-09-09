import { RowDataPacket } from "mysql2/promise";
import pool from "../config/database";
import { Wallet } from "../types/wallet.type";

// Extending RowDataPacket for Wallet typing
interface WalletRow extends Wallet, RowDataPacket {}

// Retrieve wallet by user ID
export const getWalletByUserId = async (
  userId: string
): Promise<Wallet | null> => {
  const [wallets] = await pool.query<WalletRow[]>(
    "SELECT * FROM Wallets WHERE user_id = ?",
    [userId]
  );

  return wallets.length > 0 ? wallets[0] : null; // Return the first wallet or null if not found
};

// Create a new wallet for a user
export const createWallet = async (userId: string): Promise<void> => {
  await pool.query("INSERT INTO Wallets (user_id, balance) VALUES (?, 0)", [
    userId,
  ]);
};

// Update wallet balance for a user
export const updateWalletBalance = async (
  userId: string,
  amountInCents: number
): Promise<void> => {
  await pool.query(
    "UPDATE Wallets SET balance = balance + ? WHERE user_id = ?",
    [amountInCents, userId]
  );
};
