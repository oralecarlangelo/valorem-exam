import { Handler } from "aws-lambda";
import * as transactionRepo from "../repositories/transaction.repository";

export const getTransactions: Handler = async (req) => {
  const userId = req.pathParameters.userId;

  try {
    const transactions = await transactionRepo.getTransactionsByUserId(userId);

    if (transactions?.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "No transactions found for this user." }),
      };
    }

    return { statusCode: 200, body: JSON.stringify({ transactions }) };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
