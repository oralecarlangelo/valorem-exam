import { APIGatewayProxyEvent, Callback, Context } from "aws-lambda";
import { getTransactions } from "../handlers";
import * as transactionRepo from "../repositories/transaction.repository";

jest.mock("../repositories/transaction.repository");

describe("getTransactions Handler", () => {
  const mockGetTransactionsByUserId = jest.spyOn(
    transactionRepo,
    "getTransactionsByUserId"
  );

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return transactions for a valid user", async () => {
    // Mock data
    const mockTransactions = [
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
        amount: 10000,
        currency: "AUD",
        debit_credit: "credit",
      },
    ];

    mockGetTransactionsByUserId.mockResolvedValue(mockTransactions);

    // Mock event
    const event: Partial<APIGatewayProxyEvent> = {
      pathParameters: { userId: "user123" },
    };

    // Mock context and callback
    const context: Context = {} as any;
    const callback: Callback = () => {};

    // Call handler
    const result = await getTransactions(
      event as APIGatewayProxyEvent,
      context,
      callback
    );

    // Assertions
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({ transactions: mockTransactions });
  });

  it("should return 404 if no transactions found", async () => {
    mockGetTransactionsByUserId.mockResolvedValue([]);

    const event: Partial<APIGatewayProxyEvent> = {
      pathParameters: { userId: "user123" },
    };

    const context: Context = {} as any;
    const callback: Callback = () => {};

    const result = await getTransactions(
      event as APIGatewayProxyEvent,
      context,
      callback
    );

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body)).toEqual({
      error: "No transactions found for this user.",
    });
  });

  it("should return 500 on internal server error", async () => {
    mockGetTransactionsByUserId.mockRejectedValue(
      new Error("Internal Server Error")
    );

    const event: Partial<APIGatewayProxyEvent> = {
      pathParameters: { userId: "user123" },
    };

    const context: Context = {} as any;
    const callback: Callback = () => {};

    const result = await getTransactions(
      event as APIGatewayProxyEvent,
      context,
      callback
    );

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toEqual({ error: "Internal Server Error" });
  });
});
