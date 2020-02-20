import { AddressManager } from "./AddressManager";
import { involvedAddress } from "./involvedAddress";
import { BundleManager } from "./BundleManager";
import { involvedBundle } from "./involvedBundle";
const fs = require('fs');

interface edge {
    begin : string,
    end : string,
    value : number
}

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

export class GraphExporter {
    private addresses : string[];
    private bundles : string[];
    private edges : edge[];
    private name : string;

    constructor(name : string, addr : string[]) {
        this.name = name;
        this.addresses = [];
        this.bundles = [];
        this.edges = [];

        for(let i=0; i<addr.length; i++) {
            this.AddAddressSubGraph(addr[i]);
        }
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
                    this.addresses.push(currentAddresses[i]);
                    //Loop over the Bundles
                    let outBundles = (<involvedAddress>inMemAddr).GetOutBundles();
                    for(let k=0; k < outBundles.length; k++) {
                        let outBundle = BundleManager.GetInstance().GetBundleItem(outBundles[k]);
                        //Prevent adding unknowns and duplicates
                        if(outBundle && this.bundles.indexOf(outBundles[k]) === -1) {
                            this.bundles.push(outBundles[k]);
                            addressesToCheck = addressesToCheck.concat(outBundle.GetOutAddresses());
                        } else {
                            console.log("Unknown or duplicate");
                        }
                    }
                }
            }
            //Remove addresses we already processed and duplicates
            addressesToCheck.filter((addr, index) => {
                return this.addresses.indexOf(addr) === undefined && addressesToCheck.indexOf(addr) === index;
            });
        }

        //Create a List of all edges
        for(let i=0; i < this.bundles.length; i++) {
            //Input Edges - Save to cast because we checked before
            let bundle = <involvedBundle>BundleManager.GetInstance().GetBundleItem(this.bundles[i]);
            let inAddr = bundle.GetInAddresses();
            for(let k=0; k < inAddr.length; k++) {
                let value = 0;
                let tx = bundle.GetTX(inAddr[k]);
                if(tx) {
                    value = tx.value;
                }
                if(AddressManager.GetInstance().GetAddressItem(inAddr[k])) {
                    this.edges.push({begin:inAddr[k], end:this.bundles[i], value:value});
                }
            }

            //Output Edges
            let outAddr = bundle.GetOutAddresses();
            for(let k=0; k < outAddr.length; k++) {
                let value = 0;
                let tx = bundle.GetTX(outAddr[k]);
                if(tx) {
                    value = tx.value;
                } 
                if(AddressManager.GetInstance().GetAddressItem(outAddr[k])) {
                    this.edges.push({begin:this.bundles[i], end:outAddr[k], value:value});
                }
            }
        }
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
        for(let i=0; i<this.addresses.length;i++) {
            if(AddressManager.GetInstance().GetAddressItem(this.addresses[i])?.IsSpent()) {
                fileString = fileString.concat("\"" + this.addresses[i] + "\"[label=\"" + this.addresses[i].substr(0,3) + "..." +  this.addresses[i].substr(this.addresses[i].length-3,3) + "\"]\n");
            }
        }

        //Render all addresses with balance
        fileString = fileString.concat("node [style=filled, color=\"green\"]\n");
        for(let i=0; i<this.addresses.length;i++) {
            let addr = <involvedAddress>AddressManager.GetInstance().GetAddressItem(this.addresses[i]);
            if(!addr.IsSpent()) {
                fileString = fileString.concat("\"" + this.addresses[i] + "\"[label=\"" + this.addresses[i].substr(0,3) + "..." +  this.addresses[i].substr(this.addresses[i].length-3,3) + "\\n"+ valueLabel(addr.GetCurrentValue()) +"\"]\n");
            }
        }

        //Define all bundles
        fileString = fileString.concat("node [shape=ellipse, style=unfilled, color=\"black\"]\n");
        for(let i=0; i<this.bundles.length;i++) {
            fileString = fileString.concat("\"" +this.bundles[i] + "\"[label=\"" + this.bundles[i].substr(0,3) + "..." +  this.bundles[i].substr(this.bundles[i].length-3,3) + "\"]\n");
        }

        //Add all edges
        for(let i=0; i<this.edges.length; i++) {
            fileString = fileString.concat("\"" + this.edges[i].begin + "\" -> \"" + this.edges[i].end + "\"");
            fileString = fileString.concat("[label=\""+ valueLabel(this.edges[i].value) +"\"];\n")
        }

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
}