import { involvedAddress } from "./involvedAddress";
import { involvedBundle } from "./involvedBundle";
import { AddressManager } from "./AddressManager";
import { BundleManager } from "./BundleManager";
import { TransactionManager } from "./TransactionManager";

const fs = require('fs');

export namespace DatabaseManager {
    export function ImportFromCSV(filename : string) {
        let name = "Database/" + filename + ".csv";
        if(fs.existsSync(name)) {
            fs.readFile(name, function(err : Error, data : Buffer) {
                if(err) console.log("Error reading file " + filename + ":" + err);
                else {
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
                            let newAddress : involvedAddress = new involvedAddress(singleDatapoints[1]);
                            newAddress.SetData(singleDatapoints[1], parseInt(singleDatapoints[2]), parseInt(singleDatapoints[3]), JSON.parse(singleDatapoints[4]), JSON.parse(singleDatapoints[5]));
                            AddressManager.GetInstance().LoadAddress(newAddress);
                        } else if(singleDatapoints[0] == "bundle") {
                            //Bundle Loading
                            let newBundle : involvedBundle = new involvedBundle(singleDatapoints[1]);
                            newBundle.SetData(singleDatapoints[1], parseInt(singleDatapoints[2]), JSON.parse(singleDatapoints[3]), JSON.parse(singleDatapoints[4]));
                            BundleManager.GetInstance().LoadBundle(newBundle);
                        }
                    }
                }
            });
        }
    }
}