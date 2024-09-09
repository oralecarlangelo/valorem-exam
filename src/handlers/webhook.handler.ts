import { Handler } from "aws-lambda";
import pool from "../config/database";
import {
  ERROR_MESSAGES,
  RESPONSE_MESSAGES,
  VALIDATION,
} from "../constants/constants";
import { verifyHMAC } from "../helpers/hmac.helper";
import * as transactionRepo from "../repositories/transaction.repository";
import * as walletRepo from "../repositories/wallet.repository";
import { Transaction } from "../types/transaction.type";

import * as Yup from "yup";

// Validation schema using constants
const transactionSchema = Yup.object({
  id: Yup.string().required("Transaction ID is required"),
  created_at: Yup.date().required("Created date is required"),
  updated_at: Yup.date().required("Updated date is required"),
  description: Yup.string().optional(),
  type: Yup.string()
    .oneOf(VALIDATION.TRANSACTION_TYPES, "Invalid transaction type")
    .required("Transaction type is required"),
  user_id: Yup.string().required("User ID is required"),
  user_name: Yup.string().optional(),
  amount: Yup.number()
    .positive("Amount must be a positive number")
    .required("Amount is required"),
  currency: Yup.string().required("Currency is required"),
  debit_credit: Yup.string()
    .oneOf(VALIDATION.DEBIT_CREDIT_TYPES, "Invalid debit/credit value")
    .required("Debit/Credit value is required"),
});

const notificationSchema = Yup.object({
  transactions: Yup.array()
    .of(transactionSchema)
    .min(1, "At least one transaction is required")
    .required("Transactions array is required"),
});

export const webhook: Handler = async (event) => {
  const req = JSON.parse(event.body || "{}");

  if (!verifyHMAC(event)) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: ERROR_MESSAGES.UNAUTHORIZED }),
    };
  }

  try {
    await notificationSchema.validate(req);
  } catch (validationError: any) {
    console.error(ERROR_MESSAGES.VALIDATION_ERROR, validationError.errors);
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: `${
          ERROR_MESSAGES.VALIDATION_ERROR
        }: ${validationError.errors.join(", ")}`,
      }),
    };
  }

  const notification = req;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    if (notification.transactions.length === 0) {
      throw new Error(ERROR_MESSAGES.NO_TRANSACTION);
    }
    for (const tx of notification.transactions) {
      const transaction: Transaction = {
        id: tx.id,
        created_at: tx.created_at,
        updated_at: tx.updated_at,
        description: tx.description,
        type: tx.type,
        type_method: tx.type_method,
        state: tx.state,
        user_id: tx.user_id,
        user_name: tx.user_name,
        amount: Math.round(parseFloat(tx.amount) * 100), // Convert to cents
        currency: tx.currency,
        debit_credit: tx.debit_credit,
      };

      // Check if wallet exists, if not create one
      let wallet = await walletRepo.getWalletByUserId(transaction.user_id);
      if (!wallet) {
        await walletRepo.createWallet(transaction.user_id);
        wallet = await walletRepo.getWalletByUserId(transaction.user_id);
      }

      // Check if the transaction already exists
      const existingTransaction = await transactionRepo.getTransactionById(
        transaction.id
      );
      if (existingTransaction) {
        console.error(
          `${ERROR_MESSAGES.TRANSACTION_EXISTS} with ID ${transaction.id}`
        );
        throw new Error(
          `${ERROR_MESSAGES.TRANSACTION_EXISTS} with ID ${transaction.id}.`
        );
      }

      if (!wallet) {
        console.error(`WALLET NOT FOUND`);
        throw new Error(ERROR_MESSAGES.WALLET_NOT_FOUND);
      }

      switch (transaction.type) {
        case "deposit":
          // Credit the wallet
          await walletRepo.updateWalletBalance(
            transaction.user_id,
            transaction.amount
          );
          break;

        case "withdraw":
        case "payment":
          // Check if the balance is sufficient for withdrawal or payment
          if (wallet.balance < transaction.amount) {
            console.error(
              `Insufficient balance for ${transaction.type} transaction for user ${transaction.user_id}`
            );
            throw new Error(ERROR_MESSAGES.INSUFFICIENT_BALANCE);
          }
          // Debit the wallet
          await walletRepo.updateWalletBalance(
            transaction.user_id,
            -transaction.amount
          );
          break;

        default:
          console.error(`Unsupported transaction type: ${transaction.type}`);
          throw new Error(ERROR_MESSAGES.UNSUPPORTED_TRANSACTION_TYPE);
      }

      // Persist the transaction
      await transactionRepo.createTransaction(transaction);
    }

    await connection.commit();
    return {
      statusCode: 200,
      body: JSON.stringify({ status: RESPONSE_MESSAGES.SUCCESS }),
    };
  } catch (error) {
    await connection.rollback();
    console.error("Error processing transaction:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR }),
    };
  } finally {
    connection.release();
  }
};
