import { Transaction } from "./transaction.type";

export interface Wallet {
  balance: number;
  transactions: Transaction[];
}
