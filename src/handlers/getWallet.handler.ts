import { Handler } from "aws-lambda";
import * as walletRepo from "../repositories/wallet.repository";

export const getWallet: Handler = async (req) => {
  const userId = req.pathParameters.userId;

  try {
    // Retrieve the wallet for the given user ID
    const wallet = await walletRepo.getWalletByUserId(userId);

    // Check if no wallet was found for the user
    if (!wallet) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "User wallet not found." }),
      };
    }

    // Return the wallet found
    return { statusCode: 200, body: JSON.stringify(wallet) };
  } catch (error) {
    // Handle unexpected errors
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
