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

export class GMLExporter {
    public static ExportToGML(addr : string[]) {
        //Initialize the data
        console.log("Started writing to file");
        let fileString : string = "";
        let addressesToCheck : string[] = addr;

        let addresses : string[] = [];
        let bundles : string[] = [];
        let edges : edge[] = [];

        //Create a List of all nodes (Addresses & Bundles)
        while(addressesToCheck.length) {
            const currentAddresses = [...addressesToCheck];
            addressesToCheck = [];

            //Loop over the addresses
            for(let i=0; i < currentAddresses.length; i++) {
                let inMemAddr = AddressManager.GetInstance().GetAddressItem(currentAddresses[i]);
                if(inMemAddr) {
                    addresses.push(currentAddresses[i]);
                    //Loop over the Bundles
                    let outBundles = (<involvedAddress>inMemAddr).GetOutBundles();
                    for(let k=0; k < outBundles.length; k++) {
                        let outBundle = BundleManager.GetInstance().GetBundleItem(outBundles[k]);
                        //Prevent adding unknowns and duplicates
                        if(outBundle && bundles.indexOf(outBundles[k]) === undefined) {
                            bundles.push(outBundles[k]);
                            addressesToCheck.concat(outBundle.GetOutAddresses());
                        }
                    }
                }
            }
            //Remove addresses we already processed and duplicates
            addressesToCheck.filter((addr, index) => {
                return addresses.indexOf(addr) === undefined && addressesToCheck.indexOf(addr) === index;
            });
        }

        //Create a List of all edges
        for(let i=0; i < bundles.length; i++) {
            //Input Edges - Save to cast because we checked before
            let bundle = <involvedBundle>BundleManager.GetInstance().GetBundleItem(bundles[i]);
            let inAddr = bundle.GetInAddresses();
            for(let k=0; k < inAddr.length; k++) {
                let value = 0;
                let tx = bundle.GetTX(inAddr[k]);
                if(tx) {
                    value = tx.value;
                }
                edges.push({begin:inAddr[k], end:bundles[i], value:value});
            }

            //Output Edges
            let outAddr = bundle.GetOutAddresses();
            for(let k=0; k < inAddr.length; k++) {
                let value = 0;
                let tx = bundle.GetTX(inAddr[k]);
                if(tx) {
                    value = tx.value;
                }
                edges.push({begin:bundles[i], end:outAddr[k], value:value});
            }
        }

        //Standards
        fileString.concat("graph [\n");
        console.log(fileString);

        //Add all addresses
        for(let i=0; i < addresses.length; i++) {
            let inMemAddr = <involvedAddress>AddressManager.GetInstance().GetAddressItem(addresses[i]);
            fileString.concat("node [\n");
            fileString.concat("id "+addresses[i]+"\n");
            fileString.concat("label "+ addresses[i].substr(0,3) + "..." + addresses[i].substr(addresses[i].length-3, 3)+ "\n");
            fileString.concat("type addr");
            fileString.concat("value "+inMemAddr.GetCurrentValue()+"\n");
            fileString.concat("]\n");
        }
        console.log(fileString);

        //Add all Bundles
        for(let i=0; i < bundles.length; i++) {
            let inMemBundle = <involvedBundle>BundleManager.GetInstance().GetBundleItem(bundles[i]);
            fileString.concat("node [\n");
            fileString.concat("id "+bundles[i]+"\n");
            fileString.concat("label "+ bundles[i].substr(0,3) + "..." + bundles[i].substr(bundles[i].length-3, 3)+ "\n");
            fileString.concat("type bundle");
            fileString.concat("trinity "+inMemBundle.hasTrinityTag()+"\n");
            fileString.concat("]\n");
        }
        console.log(fileString);

        //Add all edges
        for(let i=0; i < edges.length; i++) {
            fileString.concat("edge [\n");
            fileString.concat("source "+edges[i].begin+"\n");
            fileString.concat("target "+edges[i].end+"\n");
            fileString.concat("label "+ edges[i].value+"\n");
            fileString.concat("]\n");
        }

        //Standard End
        fileString.concat("]\n");
        console.log(fileString);

        //Write to file
        fs.writeFile("GML/" + addr + ".GML", fileString, (err : Error) => {
            if(err) console.log("Error writing file: " + addr + ":" + err);
            else console.log("Succesfully saved " + addr);
        });
    }
}