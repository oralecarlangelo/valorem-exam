// API constants
export const ERROR_MESSAGES = {
  UNAUTHORIZED: "Unauthorized: Invalid HMAC value.",
  VALIDATION_ERROR: "Validation error",
  INTERNAL_SERVER_ERROR: "Internal Server Error",
  WALLET_NOT_FOUND: "Wallet not found.",
  INSUFFICIENT_BALANCE: "Insufficient balance",
  UNSUPPORTED_TRANSACTION_TYPE: "Unsupported transaction type",
  TRANSACTION_EXISTS: "Transaction already exists.",
  NO_TRANSACTION: "No Transaction",
  SUCCESS: "Transaction Success",
};

// HMAC Constants
export const HMAC = {
  SECRET: process.env.HMAC_SECRET || "", // Get the secret from the environment variable
  ALGORITHM: "HMAC_SHA256",
};

// Validation Constants
export const VALIDATION = {
  TRANSACTION_TYPES: ["deposit", "withdraw", "payment"],
  DEBIT_CREDIT_TYPES: ["credit", "debit"],
};

// Other constants
export const RESPONSE_MESSAGES = {
  SUCCESS: "success",
};
