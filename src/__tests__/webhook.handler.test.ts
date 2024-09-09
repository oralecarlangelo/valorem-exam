import { APIGatewayProxyEvent, Callback, Context } from "aws-lambda";
import { ERROR_MESSAGES } from "../constants/constants"; // Import centralized constants
import { webhook } from "../handlers";
import * as transactionRepo from "../repositories/transaction.repository";
import * as walletRepo from "../repositories/wallet.repository";

// Mock dependencies
jest.mock("../helpers/hmac.helper");
jest.mock("../repositories/transaction.repository");
jest.mock("../repositories/wallet.repository");

describe("webhook Handler", () => {
  // Mock functions
  const mockVerifyHMAC = jest.spyOn(
    require("../helpers/hmac.helper"),
    "verifyHMAC"
  );
  const mockCreateTransaction = jest.spyOn(
    transactionRepo,
    "createTransaction"
  );
  const mockGetWalletByUserId = jest.spyOn(walletRepo, "getWalletByUserId");
  const mockCreateWallet = jest.spyOn(walletRepo, "createWallet");
  const mockUpdateWalletBalance = jest.spyOn(walletRepo, "updateWalletBalance");

  afterEach(() => {
    // Clear all mocks after each test
    jest.clearAllMocks();
  });

  it("should return 401 Unauthorized if HMAC verification fails", async () => {
    // Simulate HMAC verification failure
    mockVerifyHMAC.mockReturnValue(false);

    // Mock event with empty transactions array
    const event: Partial<APIGatewayProxyEvent> = {
      body: JSON.stringify({
        transactions: [],
      }),
    };

    const context: Context = {} as any;
    const callback: Callback = () => {};

    // Invoke handler
    const result = await webhook(
      event as APIGatewayProxyEvent,
      context,
      callback
    );

    // Assert expected results
    expect(result.statusCode).toBe(401);
    expect(JSON.parse(result.body)).toEqual({
      error: ERROR_MESSAGES.UNAUTHORIZED,
    });
  });

  it("should return 400 Bad Request on validation error", async () => {
    // Simulate HMAC verification success
    mockVerifyHMAC.mockReturnValue(true);

    // Mock event with invalid payload (missing required fields)
    const event: Partial<APIGatewayProxyEvent> = {
      body: JSON.stringify({}), // Invalid payload
    };

    const context: Context = {} as any;
    const callback: Callback = () => {};

    // Invoke handler
    const result = await webhook(
      event as APIGatewayProxyEvent,
      context,
      callback
    );

    // Assert expected results
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).error).toContain(
      ERROR_MESSAGES.VALIDATION_ERROR
    );
  });

  it("should process transactions and return 200 OK on success", async () => {
    // Simulate HMAC verification success
    mockVerifyHMAC.mockReturnValue(true);
    // Simulate wallet does not exist
    mockGetWalletByUserId.mockResolvedValue(null);
    // Simulate wallet creation
    mockCreateWallet.mockResolvedValue(undefined);
    // Simulate wallet update
    mockUpdateWalletBalance.mockResolvedValue(undefined);
    // Simulate transaction creation
    mockCreateTransaction.mockResolvedValue(undefined);

    // Mock event with a valid transaction
    const event: Partial<APIGatewayProxyEvent> = {
      body: JSON.stringify({
        transactions: [
          {
            id: "2",
            created_at: "2024-09-09T12:00:00Z",
            updated_at: "2024-09-09T12:00:00Z",
            description: "Sample transaction",
            type: "deposit",
            type_method: "payid",
            state: "successful",
            user_id: "user1234",
            user_name: "John Doe",
            amount: "100.00",
            currency: "AUD",
            debit_credit: "credit",
          },
        ],
      }),
    };

    const context: Context = {} as any;
    const callback: Callback = () => {};

    // Invoke handler
    const result = await webhook(
      event as APIGatewayProxyEvent,
      context,
      callback
    );

    // Assert expected results
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({ status: ERROR_MESSAGES.SUCCESS });
    expect(mockCreateWallet).toHaveBeenCalledWith("user1234");
    expect(mockUpdateWalletBalance).toHaveBeenCalledWith("user1234", 10000);
    expect(mockCreateTransaction).toHaveBeenCalledTimes(1);
  });

  it("should return 500 Internal Server Error on repository failure", async () => {
    // Simulate HMAC verification success
    mockVerifyHMAC.mockReturnValue(true);
    // Simulate an internal server error in repository
    mockGetWalletByUserId.mockRejectedValue(new Error("Internal Server Error"));

    // Mock event with a valid transaction
    const event: Partial<APIGatewayProxyEvent> = {
      body: JSON.stringify({
        transactions: [
          {
            id: "1",
            created_at: "2024-09-09T12:00:00Z",
            updated_at: "2024-09-09T12:00:00Z",
            description: "Sample transaction",
            type: "deposit",
            type_method: "payid",
            state: "successful",
            user_id: "user123",
            user_name: "John Doe",
            amount: "100.00",
            currency: "AUD",
            debit_credit: "credit",
          },
        ],
      }),
    };

    const context: Context = {} as any;
    const callback: Callback = () => {};

    // Invoke handler
    const result = await webhook(
      event as APIGatewayProxyEvent,
      context,
      callback
    );

    // Assert expected results
    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toEqual({
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  });
});
