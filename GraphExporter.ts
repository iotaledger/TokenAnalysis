import { AddressManager } from "./AddressManager";
import { involvedAddress } from "./involvedAddress";
import { BundleManager } from "./BundleManager";
import { involvedBundle } from "./involvedBundle";
import { involvedTransaction } from "./involvedTransaction";
import { TransactionManager } from "./TransactionManager";
const fs = require('fs');

function valueLabel(value : number) : string {
    let negative = (value<0);
    value = Math.abs(value);
    let label;
    if(value < 1000) {
       label = value + " i";
    } else if (value < 1000000) {
        label = Math.floor(value/1000) + "." + Math.floor((value%1000)/10) + " Ki";
    } else if (value < 1000000000) {
        label = Math.floor(value/1000000) + "." + Math.floor((value%1000000)/10000) + " Mi";
    } else {// if (value < 1000000000000) {
        label = Math.floor(value/1000000000) + "." + Math.floor((value%1000000000)/10000000) + " Gi";
    }
    if(negative) {
        label = "-" + label;
    }
    return label;
}

function timestampLabel(timestamp : number) : string {
    let date = new Date(timestamp * 1000);
    return date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
}

export class GraphExporter {
    private addresses : Map<string, involvedAddress>;
    private bundles : Map<string, involvedBundle>;
    private edges : Map<string, involvedTransaction>;
    private name : string;

    constructor(name : string) {
        this.name = name;
        this.addresses = new Map<string,involvedAddress>();
        this.bundles = new Map<string, involvedBundle>();
        this.edges = new Map<string, involvedTransaction>();
    }

    public AddAll() {
        //Store all
        this.addresses = AddressManager.GetInstance().GetAddresses();
        this.bundles = BundleManager.GetInstance().GetBundles();
        this.calculateEdges();
    }

    public AddAddressSubGraph(addr : string) {
        let addressesToCheck : string[] = [addr];

        //Create a List of all nodes (Addresses & Bundles)
        while(addressesToCheck.length) {
            const currentAddresses = [...addressesToCheck];
            addressesToCheck = [];

            //Loop over the addresses
            for(let i=0; i < currentAddresses.length; i++) {
                let inMemAddr = AddressManager.GetInstance().GetAddressItem(currentAddresses[i]);
                if(inMemAddr) {
                    inMemAddr = <involvedAddress>inMemAddr;
                    this.addresses.set(currentAddresses[i], inMemAddr);
                    //Loop over the Bundles
                    let outBundles = inMemAddr.GetOutBundles();
                    for(let k=0; k < outBundles.length; k++) {
                        let outBundle = BundleManager.GetInstance().GetBundleItem(outBundles[k]);
                        //Prevent adding unknowns and duplicates
                        if(outBundle && !this.bundles.has(outBundles[k])) {
                            this.bundles.set(outBundles[k], outBundle);
                            addressesToCheck = addressesToCheck.concat(outBundle.GetOutAddresses());
                        } else {
                            console.log("Unknown or duplicate");
                        }
                    }
                }
            }
            //Remove addresses we already processed and duplicates
            addressesToCheck.filter((addr, index) => {
                return !this.addresses.has(addr) && addressesToCheck.indexOf(addr) === index;
            });
        }

        this.calculateEdges();
    }

    private calculateEdges() {
        //Create a list of edges
        const transactions = TransactionManager.GetInstance().GetTransactions();
        transactions.forEach((value : involvedTransaction, key : string) => {
            //Check if the nodes are included
            let inputHash = value.GetInput();
            let outputHash = value.GetOutput();
            if((this.addresses.has(inputHash) || this.bundles.has(inputHash)) && (this.addresses.has(outputHash) || this.bundles.has(outputHash))) {
                this.edges.set(key, value);
            }
        });
    }

    public ExportToDOT() {
        //Initialize the data
        console.log("Started writing to file.gv");
        let fileString : string = "";

        //Opening
        fileString = fileString.concat("digraph " + this.name + " {\n");
        fileString = fileString.concat("rankdir=LR;\n");

        //Define all addresses without balance
        fileString = fileString.concat("node [shape=box]\n");
        this.addresses.forEach((value : involvedAddress, key : string) =>{
            if(value.IsSpent()) {
                fileString = fileString.concat("\"" + key + "\"[label=\"" + key.substr(0,3) + "..." +  key.substr(key.length-3,3) + "\"]\n");
            }
        });

        //Render all addresses with balance
        fileString = fileString.concat("node [style=filled, color=\"green\"]\n");
        this.addresses.forEach((value : involvedAddress, key : string) =>{
            if(!value.IsSpent()) {
                fileString = fileString.concat("\"" + key + "\"[label=\"" + key.substr(0,3) + "..." + key.substr(key.length-3,3) + "\\n"+ valueLabel(value.GetCurrentValue()) +"\"]\n");
            }
        });

        //Define all bundles
        fileString = fileString.concat("node [shape=ellipse, style=unfilled, color=\"black\"]\n");
        this.bundles.forEach((value : involvedBundle, key : string) => {
            fileString = fileString.concat("\"" + key + "\"[label=\"" + timestampLabel(value.GetTimestamp()) + "\"]\n");
        });

        //Add all edges
        this.edges.forEach((value : involvedTransaction, key : string ) => {
            fileString = fileString.concat("\"" + value.GetInput() + "\" -> \"" + value.GetOutput() + "\"");
            fileString = fileString.concat("[label=\""+ valueLabel(value.GetValue()) +"\"];\n")
        });

        //Closing
        fileString = fileString.concat("}");

        //Write to file
        fs.writeFile("DOT/" + this.name + ".gv", fileString, (err : Error) => {
            if(err) console.log("Error writing file: " + this.name + ":" + err);
            else {
                console.log("Succesfully saved " + this.name);
            }
        });
    }

    public ExportToCSV(folder : string) {
        //Initialize
        let fileString = "";

        //Save Transactions
        this.edges.forEach((value : involvedTransaction, key : string) => {
            fileString = fileString.concat("tx;" + key + ";" + value.GetInput() + ';' + value.GetOutput() + ";" + value.GetValue() + ";" + value.GetTag() + "\n");
        });

        //Save Addresses
        this.addresses.forEach((value : involvedAddress, key : string) => {
            //Initial Values
            fileString = fileString.concat("addr;" + key + ";" + value.GetTimestamp() + ";" + value.GetCurrentValue());
            
            //Arrays
            fileString = fileString.concat(";" + JSON.stringify(value.GetInTxs()));
            fileString = fileString.concat(";" + JSON.stringify(value.GetOutTxs()));

            //Finish
            fileString = fileString.concat("\n");
        });

        //Save Bundles
        this.bundles.forEach((value : involvedBundle, key : string) => {
            //Initial Values
            fileString = fileString.concat("bundle;" + key + ";" + value.GetTimestamp());

            //Arrays
            fileString = fileString.concat(";" + JSON.stringify(value.GetInTxs()));
            fileString = fileString.concat(";" + JSON.stringify(value.GetOutTxs()));

            //Finish
            fileString = fileString.concat("\n");
        });

        //Store to File
        fs.writeFile( folder + "/" + this.name + ".csv", fileString, (err : Error) => {
            if(err) console.log("Error writing file: " + this.name + ":" + err);
            else {
                console.log("Succesfully saved " + this.name);
            }
        });
    }
}