import { involvedAddress } from "./involvedAddress";
import { StartAddresses, maxQueryDepth } from "./settings";
import { AddressManager } from "./AddressManager";
import { BundleManager } from "./BundleManager";
import { DIRECTION } from "./query";

//Init
async function LoadInitialAddresses() {
    for(let i = 0; i < StartAddresses.length; i++) {
        QueryAddress(StartAddresses[i]);
    }
}

async function QueryAddress(addr : string, queryDirection : DIRECTION = DIRECTION.FORWARD) {
    //Variables
    let nextAddressesToQuery : string[] = [addr];
    let counter = 0;
    let newStuffFound : boolean = true;

    //Keep querying until max depth or end found
    while(newStuffFound && counter < maxQueryDepth) {
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
                    .catch((err : Error) => console.log(err)));
                }
                //Wait for all Bundles to finish
                await Promise.all(bundlePromise);

                //Filter out addresses already loaded before and duplicates
                nextAddressesToQuery = nextAddressesToQuery.filter((addr, index) => {
                    return (AddressManager.GetInstance().GetAddressItem(nextAddressesToQuery[index])==undefined && nextAddressesToQuery.indexOf(addr) === index);
                });
            })
            .catch((err : Error) => console.log(err)));
        }
        //Wait for all Addresses to finish
        await Promise.all(addrPromises);
        console.log("Iterration " + counter);

        //Increment Depth
        counter++;
    }
}

LoadInitialAddresses();

