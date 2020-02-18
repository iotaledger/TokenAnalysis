import { Query, GetInclusionStates } from "./query";

export interface Tx {
    tag : string,
    addr : string,
    value : number,
    timestamp : number
}

export class involvedBundle {
    private hash : string;
    private inAddresses : Map<string, string>;
    private outAddresses : Map<string, string>;
    private totalSpend : number;
    private involvedTxs : Map<string, Tx>;

    constructor(bundleHash : string) {
        this.hash = bundleHash;
        this.totalSpend = 0;
        this.inAddresses = new Map<string, string>();
        this.outAddresses = new Map<string, string>();
        this.involvedTxs = new Map<string, Tx>();
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
                        this.involvedTxs.set(transactions[i].hash, {
                            tag : transactions[i].tag,
                            addr : transactions[i].address,
                            value : transactions[i].value,
                            timestamp : transactions[i].timestamp
                        });

                        //Sort Transactions as in or out
                        if(transactions[i].value > 0) {
                            this.totalSpend += transactions[i].value;
                            this.outAddresses.set(transactions[i].address, transactions[i].hash);
                        } else {
                            this.inAddresses.set(transactions[i].address, transactions[i].hash);
                        }
                    }
                    resolve();
                })
                .catch((err : Error) => reject(err));
            })
            .catch((err : Error) => { reject("Bundles error "+ this.hash + " :" + err); });
        });
    }

    public hasTrinityTag() : boolean {
        this.involvedTxs.forEach((value) => {
            if(value.tag.substr(0,7) == "TRINITY") {
                return true;
            }
        });
        return false;
    }

    public GetOutAddresses() : string[] {
        return Array.from(this.outAddresses.keys());
    }

    public GetInAddresses() : string[] {
        return Array.from(this.inAddresses.keys());
    }

    public GetTX(addr : string) : Tx|undefined {
        let Tx = this.inAddresses.get(addr);
        if(!Tx) {
            this.outAddresses.get(addr);
        }
        return (Tx != undefined)?this.involvedTxs.get(Tx):undefined;
    }
}