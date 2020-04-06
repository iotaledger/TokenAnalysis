import { AddressManager } from "../Address/AddressManager";
import { BundleManager } from "../Bundle/BundleManager";
import { Address } from "../Address/Address";
import { TransactionManager } from "../Transactions/TransactionManager";
import { Transaction } from "../Transactions/Transaction";
import { Bundle } from "../Bundle/Bundle";
import { PathManager } from "./PathManager";
import { DatabaseManager } from "../DataProcessing/DatabaseManager";
const fs = require('fs');

export class Path {
    private originalAddress : string;
    private addresses : Map<string, Address>;
    private bundles : Map<string, Bundle>;
    private edges : Map<string, Transaction>;

    constructor(addr : string, maxDepth : number = 1000) {
        this.originalAddress = addr;
        this.addresses = new Map<string,Address>();
        this.bundles = new Map<string, Bundle>();
        this.edges = new Map<string, Transaction>();

        //Load initial path
        this.AddAddrToPath(addr, maxDepth);
        //Register
        PathManager.GetInstance().AddPath(this);
    }

    public AddAddrToPath(addr : string, maxDepth : number = 1000) {
        let addressesToCheck : string[] = [addr];

        //Create a List of all nodes (Addresses & Bundles)
        let counter = 0;
        while(addressesToCheck.length && counter < maxDepth ) {
            const currentAddresses = [...addressesToCheck];
            addressesToCheck = [];

            //Loop over the addresses
            for(let i=0; i < currentAddresses.length; i++) {
                let inMemAddr = AddressManager.GetInstance().GetAddressItem(currentAddresses[i]);
                if(inMemAddr) {
                    inMemAddr = <Address>inMemAddr;
                    this.addresses.set(currentAddresses[i], inMemAddr);
                    //Loop over the Bundles
                    let outBundles = inMemAddr.GetOutBundles();
                    for(let k=0; k < outBundles.length; k++) {
                        let outBundle = BundleManager.GetInstance().GetBundleItem(outBundles[k]);
                        //Prevent adding unknowns and duplicates
                        if(outBundle && !this.bundles.has(outBundles[k])) {
                            this.bundles.set(outBundles[k], outBundle);
                            addressesToCheck = addressesToCheck.concat(outBundle.GetOutAddresses());
                        }
                    }
                }
            }
            //Remove addresses we already processed and duplicates
            addressesToCheck = addressesToCheck.filter((addr, index) => {
                return !this.addresses.has(addr) && addressesToCheck.indexOf(addr) === index;
            });
            counter++;
        }

        this.calculateEdges();
        
    }

    private calculateEdges() {
        //Create a list of edges
        const transactions = TransactionManager.GetInstance().GetTransactions();
        transactions.forEach((value : Transaction, key : string) => {
            //Check if the nodes are included
            let inputHash = value.GetInput();
            let outputHash = value.GetOutput();
            if((this.addresses.has(inputHash) || this.bundles.has(inputHash)) && (this.addresses.has(outputHash) || this.bundles.has(outputHash))) {
                this.edges.set(key, value);
            }
        });
    }

    public Cache(folder : string) {
         //Initialize
         let fileString = "";

         //Save Transactions
         this.edges.forEach((value : Transaction, key : string) => {
             fileString = fileString.concat("tx;" + key + ";" + value.GetInput() + ';' + value.GetOutput() + ";" + value.GetValue() + ";" + value.GetTag() + "\n");
         });
 
         //Save Addresses
         this.addresses.forEach((value : Address, key : string) => {
             //Initial Values
             fileString = fileString.concat("addr;" + key + ";" + value.GetTimestamp() + ";" + value.GetCurrentValue());
             
             //Arrays
             fileString = fileString.concat(";" + JSON.stringify(value.GetInTxs()));
             fileString = fileString.concat(";" + JSON.stringify(value.GetOutTxs()));
 
             //Finish
             fileString = fileString.concat("\n");
         });
 
         //Save Bundles
         this.bundles.forEach((value : Bundle, key : string) => {
             //Initial Values
             fileString = fileString.concat("bundle;" + key + ";" + value.GetTimestamp());
 
             //Arrays
             fileString = fileString.concat(";" + JSON.stringify(value.GetInTxs()));
             fileString = fileString.concat(";" + JSON.stringify(value.GetOutTxs()));
 
             //Finish
             fileString = fileString.concat("\n");
         });
 
         //Store to File
         DatabaseManager.WriteToFile(folder + "/" + this.originalAddress + ".csv", fileString);
    }

    public GetAddresses() : Map<string, Address> {
        return this.addresses;
    }

    public GetBundles() : Map<string, Bundle> {
        return this.bundles;
    }

    public GetTransactions() : Map<string, Transaction> {
        return this.edges;
    }
}