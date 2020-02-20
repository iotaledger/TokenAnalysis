import { Query, GetInclusionStates } from "./query";
import { AddressManager } from "./AddressManager";
import { TransactionManager } from "./TransactionManager";
import { involvedTransaction } from "./involvedTransaction";
import { involvedAddress } from "./involvedAddress";

export class involvedBundle {
    private hash : string;
    private timestamp : number;
    private inTxs : string[];
    private outTxs : string[];

    constructor(bundleHash : string) {
        this.hash = bundleHash;
        this.timestamp = 0;
        this.inTxs = [];
        this.outTxs = [];
    }

    public SetData(bundle : string, timestamp : number, inTxs : string[], outTxs : string[]) {
        this.hash = bundle;
        this.timestamp = timestamp; 
        this.inTxs = inTxs;
        this.outTxs = outTxs;
    }

    public async Query() : Promise<void>{
        return new Promise<void>((resolve, reject) => {
            Query({bundles:[this.hash]})
            .then((transactions) => {
                let transactionHashes : string[] = [];
                for(let k=0; k < transactions.length; k++) {
                    transactionHashes.push(transactions[k].hash);
                }

                GetInclusionStates(transactionHashes)
                .then((inclusionResults) => {
                    //Filter out unconfirmed and 0-value transactions
                    transactions = transactions.filter((transaction, index) => {
                        return (inclusionResults[index] && transactions[index].value != 0);
                    })

                    //Loop over the Transactions
                    for(let i = 0; i < transactions.length; i++) {

                        //Update timestamp to latest
                        this.timestamp = (this.timestamp > transactions[i].timestamp) ? this.timestamp : transactions[i].timestamp;

                        //Sort Transactions as in or out
                        if(transactions[i].value > 0) {
                            //Create the Transactions
                            let tx = TransactionManager.GetInstance().AddTransaction(this.hash, transactions[i].address, transactions[i].value, transactions[i].tag, transactions[i].hash);
                            this.outTxs.push(tx.GetTransactionHash());
                        } else {
                            //Create the Transactions
                            let tx = TransactionManager.GetInstance().AddTransaction(transactions[i].address, this.hash, transactions[i].value, transactions[i].tag, transactions[i].hash);
                            this.inTxs.push(tx.GetTransactionHash());
                        }
                    }
                    resolve();
                })
                .catch((err : Error) => reject(err));
            })
            .catch((err : Error) => { reject("Bundles error "+ this.hash + " :" + err); });
        });
    }

    public GetBundleHash() : string {
        return this.hash;
    }

    public hasTrinityTag() : boolean {
        for(let i=0; i < this.outTxs.length; i++) {
            if(TransactionManager.GetInstance().GetTransactionItem(this.outTxs[i])?.GetTag().substr(0,7) == "TRINITY") {
                return true;
            }
        }
        return false;
    }

    public GetOutTxs() : string[] {
        return this.outTxs;
    }

    public GetInTxs() : string[] {
        return this.inTxs;
    }

    public GetInAddresses() : string[] {
        let inAddresses : string[] = [];
        for(let i=0; i < this.inTxs.length; i++) {
            let tx = TransactionManager.GetInstance().GetTransactionItem(this.inTxs[i]);
            if(tx) {
                inAddresses.push(tx.GetInput());
            }
        }
        return inAddresses;
    }

    public GetOutAddresses() : string[] {
        let outAddresses : string[] = [];
        for(let i=0; i < this.outTxs.length; i++) {
            let tx = TransactionManager.GetInstance().GetTransactionItem(this.outTxs[i]);
            if(tx) {
                outAddresses.push(tx.GetOutput());
            }
        }
        return outAddresses;
    }

    public GetTimestamp() : number {
        return this.timestamp;
    }
}