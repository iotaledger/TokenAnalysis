import { Transaction } from "./Transaction";

export class TransactionManager {
    private static instance : TransactionManager;
    private transactions : Map<string,Transaction>;

    private constructor() {
        this.transactions = new Map<string,Transaction>();
    }

    public AddTransaction(input : string, output : string, value : number, tag : string, hash : string) : Transaction {
        let tx : Transaction;
        if(!this.transactions.has(hash)) {
            tx = new Transaction(input, output, value, tag, hash);
            this.transactions.set(hash, tx);
        } else {
            tx = <Transaction>this.transactions.get(hash);
        }
        return tx;
    }

    public GetTransactionItem(hash : string) : Transaction|undefined {
        return this.transactions.get(hash);
    }

    public GetTransactions() : Map<string, Transaction> {
        return this.transactions;
    }

    public static GetInstance() {
        if(!this.instance) {
            this.instance = new TransactionManager();
        }
        return this.instance;
    }
}