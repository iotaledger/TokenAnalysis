import { Address } from "../Address/Address";
import { Bundle } from "../Bundle/Bundle";
import { AddressManager } from "../Address/AddressManager";
import { BundleManager } from "../Bundle/BundleManager";
import { TransactionManager } from "../Transactions/TransactionManager";
import { Transaction } from "../Transactions/Transaction";

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

function colorLabel(renderColor : string|undefined) : string {
    let colorString = "";
    if(renderColor) {
        colorString = ", style=filled, color=\"" + renderColor + "\"";
    } 
    return colorString;
}

export namespace DatabaseManager {
    export function ImportFromCSV(folder : string, filename : string) {
        let name = folder + "/" + filename + ".csv";
        if(fs.existsSync(name)) {
            const data = fs.readFileSync(name);
            let singleItems : string[] = data.toString().split("\n");
            //Load all items
            for(let i=0; i<singleItems.length; i++) {
                let line = singleItems[i];
                let singleDatapoints = line.split(";");
                
                if(singleDatapoints[0] == "tx") {
                    //Transaction loading
                    TransactionManager.GetInstance().AddTransaction(singleDatapoints[2], singleDatapoints[3], parseInt(singleDatapoints[4]), singleDatapoints[5], singleDatapoints[1]);
                } else if(singleDatapoints[0] == "addr") {
                        //Address Loading
                    let newAddress = new Address(singleDatapoints[1]);
                    newAddress.SetData(singleDatapoints[1], parseInt(singleDatapoints[2]), parseInt(singleDatapoints[3]), JSON.parse(singleDatapoints[4]), JSON.parse(singleDatapoints[5]));
                    AddressManager.GetInstance().LoadAddress(newAddress);
                } else if(singleDatapoints[0] == "bundle") {
                    //Bundle Loading
                    let newBundle : Bundle = new Bundle(singleDatapoints[1]);
                    newBundle.SetData(singleDatapoints[1], parseInt(singleDatapoints[2]), JSON.parse(singleDatapoints[3]), JSON.parse(singleDatapoints[4]));
                    BundleManager.GetInstance().LoadBundle(newBundle);
                }
            }
        }
    }

    export function ExportToDOT(filename : string, addresses : Map<string, Address>[], bundles : Map<string, Bundle>[], edges : Map<string, Transaction>, outputColors : (string|undefined)[], renderColors : (string|undefined)[]) {
        let name = "DOT/" + filename  + ".gv";

        //Loop over the subgraphs
        let subgraphcount = Math.min(addresses.length, bundles.length, outputColors.length, renderColors.length);

        //Initialize the data
        //console.log("Started writing to " + name);
        let fileString : string = "";

        //Opening
        fileString = fileString.concat("digraph \"" + filename + "\" {\n");
        fileString = fileString.concat("rankdir=LR;\n");

        //Render all Ending Addresses
        for(let i=0; i < subgraphcount; i++) {
            fileString = fileString.concat("node [shape=box " + colorLabel(outputColors[i]) + "]\n");
            addresses[i].forEach((value : Address, key :string) => {
                if(!value.IsSpent()) {
                    fileString = fileString.concat("\"" + key + "\"[label=\"" + key.substr(0,3) + "..." +  key.substr(key.length-3,3) + "\"]\n");
                }
            });
        }

        //Render the other Addresses
        for(let i=0; i < subgraphcount; i++) {
            fileString = fileString.concat("node [shape=box " + colorLabel(renderColors[i]) + "]\n");
            addresses[i].forEach((value : Address, key :string) => {
                if(value.IsSpent()) {
                    fileString = fileString.concat("\"" + key + "\"[label=\"" + key.substr(0,3) + "..." +  key.substr(key.length-3,3) + "\"]\n");
                }
            });
        }

        //Render the Bundles
        for(let i=0; i < subgraphcount; i++) {
            fileString = fileString.concat("node [shape=ellipse " + colorLabel(renderColors[i]) + "]\n");
            bundles[i].forEach((value : Bundle, key :string) => {
                fileString = fileString.concat("\"" + key + "\"[label=\"" + key.substr(0,3) + "..." + key.substr(key.length-3,3) + "\n " + timestampLabel(value.GetTimestamp()) + "\"]\n");
            });
        }

        //Render the edges
        edges.forEach((value : Transaction, key :string) => {
            fileString = fileString.concat("\"" + value.GetInput() + "\" -> \"" + value.GetOutput() + "\"");
            fileString = fileString.concat("[label=\""+ valueLabel(value.GetValue()) +"\"];\n")
        });

        //Closing
        fileString = fileString.concat("}");

        //Write to file
        fs.writeFile(name, fileString, (err : Error) => {
            if(err) console.log("Error writing file: " + name + ":" + err);
            else {
                //console.log("Succesfully saved " + name);
            }
        });
    }
}