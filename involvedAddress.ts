import { Query, GetInclusionStates, DIRECTION } from "./query";
import { Transaction } from "@iota/core";

export class involvedAddress {
    private addr : string;
    private timestamp : number;
    private currentValue : number;
    private inBundles : string[];
    private outBundles : string[];
    private inAddresses : string[];
    private outAddresses : string[];

    constructor(addr : string) {
        this.addr = addr;
        this.timestamp = 0;
        this.inBundles = [];
        this.outBundles = [];
        this.inAddresses = [];
        this.outAddresses = [];
        this.currentValue = 0;
    }

    public async Query() : Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            Query({addresses:[this.addr]})
            .then((transactions : Transaction[]) => {
                //Loop over the transactions
                let Bundles : Map<string, number> = new Map<string, number>();
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
                        //Add unique bundles
                        Bundles.set(transactions[i].bundle, transactions[i].value + (Bundles.has(transactions[i].bundle)?<number>Bundles.get(transactions[i].bundle):0));

                        //Set the value of the addresses
                        this.timestamp = (this.timestamp > transactions[i].timestamp) ? this.timestamp : transactions[i].timestamp;
                        this.currentValue += transactions[i].value;
                    }

                    //Loop through the Bundles
                    Bundles.forEach((value : number, key : string) => {
                        if(value > 0) {
                            this.inBundles.push(key);
                        } else if(value < 0) {
                            this.outBundles.push(key);
                        }
                    });

                    //Log
                    console.log("Processed: " + this.addr);  
                    resolve();              
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

    public IsSpent() : boolean {
        return (this.currentValue == 0);
    }

    public GetCurrentValue() : number {
        return this.currentValue;
    }

    public AddInAddress(addr: string) {
        this.inAddresses.push(addr);
    }

    public AddOutAddress(addr: string) {
        this.outAddresses.push(addr);
    }

    public GetOutBundles() : string[] {
        return this.outBundles;
    }

    public GetInBundles() : string[] {
        return this.inBundles;
    }
}

//Bundle Manager
//Destination - Receiver Addresses