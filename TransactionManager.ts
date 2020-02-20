import { involvedTransaction } from "./involvedTransaction";

export class TransactionManager {
    private static instance : TransactionManager;
    private transactions : Map<string,involvedTransaction>;

    private constructor() {
        this.transactions = new Map<string,involvedTransaction>();
    }

    public AddTransaction(input : string, output : string, value : number, tag : string, hash : string) : involvedTransaction {
        let tx : involvedTransaction;
        if(!this.transactions.has(hash)) {
            tx = new involvedTransaction(input, output, value, tag, hash);
            this.transactions.set(hash, tx);
        } else {
            tx = <involvedTransaction>this.transactions.get(hash);
        }
        return tx;
    }

    public GetTransactionItem(hash : string) : involvedTransaction|undefined {
        return this.transactions.get(hash);
    }

    public GetTransactions() : Map<string, involvedTransaction> {
        return this.transactions;
    }

    public static GetInstance() {
        if(!this.instance) {
            this.instance = new TransactionManager();
        }
        return this.instance;
    }
}