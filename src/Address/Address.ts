import { Query, GetInclusionStates } from "../DataProcessing/query";
import { Transaction } from "@iota/core";
import { TransactionManager } from "../Transactions/TransactionManager";

export class Address {
    private addr : string;
    private timestamp : number;
    private currentValue : number;
    private inTxs : string[];
    private outTxs : string[];

    constructor(addr : string) {
        this.addr = addr;
        this.timestamp = 0;
        this.currentValue = 0;
        this.inTxs = [];
        this.outTxs = [];
    }

    public SetData(addr : string, timestamp : number, currentValue : number, inTxs : string[], outTxs : string[]) {
        this.addr = addr;
        this.timestamp = timestamp; 
        this.currentValue = currentValue;
        this.inTxs = inTxs;
        this.outTxs = outTxs;
    }

    public async Query() : Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            Query({addresses:[this.addr]})
            .then((transactions : Transaction[]) => {
                //Loop over the transactions
                let transactionHashes : string[] = [];
                for(let k=0; k < transactions.length; k++) {
                    transactionHashes.push(transactions[k].hash);
                }

                //Filter out unconfirmed transactions
                GetInclusionStates(transactionHashes)
                .then((inclusionResults) => {
                    //Remove Transactions are that are not confirmed
                    transactions = transactions.filter((transaction, index) => {
                        return (inclusionResults[index] && transactions[index].value != 0);
                    })
                    //Loop through confirmed transactions
                    for(let i=0; i < transactions.length; i++) {
                        if(transactions[i].value > 0) {
                            //Create the Transactions
                            let tx = TransactionManager.GetInstance().AddTransaction(transactions[i].bundle, this.addr, transactions[i].value, transactions[i].tag, transactions[i].hash);
                            this.inTxs.push(tx.GetTransactionHash());
                        } else {
                            //Create the Transactions
                            let tx = TransactionManager.GetInstance().AddTransaction(this.addr, transactions[i].bundle, transactions[i].value, transactions[i].tag, transactions[i].hash);
                            this.outTxs.push(tx.GetTransactionHash());
                        }
                        //Set the value of the addresses
                        this.timestamp = (this.timestamp > transactions[i].timestamp) ? this.timestamp : transactions[i].timestamp;
                        this.currentValue += transactions[i].value;
                    }
                    //Log
                    console.log("Processed: " + this.addr);  
                    resolve((transactions.length > 0));              
                })
                .catch((err : Error) => {
                    reject("Error for addr inclusions " + this.addr + ": " + err);
                });
            })
            .catch((err : Error) => {
                reject("Error for addr " + this.addr + ": " + err);
            });
        });   
    }

    public GetAddressHash() : string {
        return this.addr;
    }

    public IsSpent() : boolean {
        return (this.currentValue <= 0);
    }

    public GetCurrentValue() : number {
        return this.currentValue;
    }

    public GetInTxs() : string[] {
        return this.inTxs;
    }

    public GetOutTxs() : string[] {
        return this.outTxs;
    }

    public GetInBundles() : string[] {
        let inAddresses : string[] = [];
        for(let i=0; i < this.inTxs.length; i++) {
            let tx = TransactionManager.GetInstance().GetTransactionItem(this.inTxs[i]);
            if(tx) {
                inAddresses.push(tx.GetInput());
            }
        }
        return inAddresses;
    }

    public GetOutBundles() : string[] {
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