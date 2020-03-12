import { Transaction } from "./Transaction";
export declare class TransactionManager {
    private static instance;
    private transactions;
    private constructor();
    AddTransaction(input: string, output: string, value: number, tag: string, hash: string): Transaction;
    GetTransactionItem(hash: string): Transaction | undefined;
    GetTransactions(): Map<string, Transaction>;
    static GetInstance(): TransactionManager;
}
