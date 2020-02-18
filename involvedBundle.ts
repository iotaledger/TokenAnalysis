import { Query, GetInclusionStates } from "./query";
import { Transaction } from "@iota/core";

interface Tx {
    tag : string,
    addr : string,
    value : number,
    timestamp : number
}

export class involvedBundle {
    private hash : string;
    private inAddresses : string[];
    private outAddresses : string[];
    private totalSpend : number;
    private involvedTxs : Map<string, Tx>;

    constructor(bundleHash : string) {
        this.hash = bundleHash;
        this.totalSpend = 0;
        this.inAddresses = [];
        this.outAddresses = [];
        this.involvedTxs = new Map<string, Tx>();
    }

    public async Query() : Promise<void>{
        return new Promise<void>((resolve, reject) => {
            Query({bundles:[this.hash]})
            .then((transactions : Transaction[]) => {
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
                        this.involvedTxs.set(transactions[i].hash, {
                            tag : transactions[i].tag,
                            addr : transactions[i].address,
                            value : transactions[i].value,
                            timestamp : transactions[i].timestamp
                        });
                        //Sort Transactions as in or out
                        if(transactions[i].value > 0) {
                            this.totalSpend += transactions[i].value;
                            this.outAddresses.push(transactions[i].hash);
                        } else {
                            this.inAddresses.push(transactions[i].hash);
                        }
                    }
                    console.log(JSON.stringify(this));
                })
                .catch((err : Error) => reject(err));
            })
            .catch((err : Error) => { reject("Bundles error "+ this.hash + " :" + err); });
        });
    }

    public GetOutAddresses() : string[] {
        return this.outAddresses;
    }

    public GetInAddresses() : string[] {
        return this.inAddresses;
    }
}