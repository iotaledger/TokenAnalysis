import { StartAddresses, maxQueryDepth } from "./settings";
import { AddressManager } from "./AddressManager";
import { BundleManager } from "./BundleManager";
import { DIRECTION } from "./query";
import { GraphExporter } from "./GraphExporter";

//Init
function LoadInitialAddresses() {
    let addr = StartAddresses[0];
    QueryAddress(addr)
    .then(() => {
        console.log("Beep");
        let exporter = new GraphExporter(addr, [addr]);
        exporter.ExportToDOT();
    });
}

async function QueryAddress(addr : string, queryDirection : DIRECTION = DIRECTION.FORWARD) {
    //Variables
    let nextAddressesToQuery : string[] = [addr];
    let counter = 0;

    //Keep querying until max depth or end found
    while(nextAddressesToQuery.length && counter < maxQueryDepth) {
        const addressesToQuery = [...nextAddressesToQuery];
        nextAddressesToQuery = [];
        let addrPromises : Promise<void>[] = [];

        //Loop over all addresses
        for(let i=0; i < addressesToQuery.length; i++) {
            //Query the Addresses
            addrPromises.push(AddressManager.GetInstance().AddAddress(addressesToQuery[i], queryDirection)
            .then(async (newBundles : string[]) => {
                //Loop over the Bundles
                let bundlePromise : Promise<void>[] = [];
                for(let k = 0; k < newBundles.length; k++) {

                    //Query the Bundles
                    bundlePromise.push(BundleManager.GetInstance().AddBundle(newBundles[k], queryDirection)
                    .then((addresses : string[]) => {
                        nextAddressesToQuery = nextAddressesToQuery.concat(addresses);
                    })
                    .catch((err : Error) => console.log("Top Bundle Error: "+err)));
                }
                //Wait for all Bundles to finish
                await Promise.all(bundlePromise);

                //Filter out addresses already loaded before and duplicates
                nextAddressesToQuery = nextAddressesToQuery.filter((addr, index) => {
                    return (AddressManager.GetInstance().GetAddressItem(nextAddressesToQuery[index])==undefined && nextAddressesToQuery.indexOf(addr) === index);
                });
            })
            .catch((err : Error) => console.log("Top Address Error: " +err)));
        }
        //Wait for all Addresses to finish
        console.log("Waiting");
        await Promise.all(addrPromises);
        console.log("Iterration " + counter);
        console.log(JSON.stringify(nextAddressesToQuery));

        //Increment Depth
        counter++;
    }
}

LoadInitialAddresses();


