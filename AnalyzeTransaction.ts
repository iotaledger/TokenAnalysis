import { maxQueryDepth, command } from "./settings";
import { AddressManager } from "./AddressManager";
import { BundleManager } from "./BundleManager";
import { DIRECTION } from "./query";
import { GraphExporter } from "./GraphExporter";
import { DatabaseManager } from "./DatabaseManager";

//Init
async function ExecuteCommands() {
    //Query Commands
    DatabaseManager.ImportFromCSV("Database", command.name);
    //Convert Bundle commands into addresses
    command.addressesToSearch = command.addressesToSearch.concat(await QueryBundles(command.bundlesToSearch));
    for(let i=0; i < command.addressesToSearch.length; i++){ 
        DatabaseManager.ImportFromCSV("Cache", command.addressesToSearch[i]);
        await QueryAddress(command.addressesToSearch[i]);

        //Cache Results
        let cacheExporter = new GraphExporter(command.addressesToSearch[i]);
        cacheExporter.AddAddressSubGraph(command.addressesToSearch[i]);
        cacheExporter.ExportToCSV("Cache");
    }

    //Export commands
    let exporter = new GraphExporter(command.name);
    exporter.AddAll();
    exporter.ExportToDOT();
    exporter.ExportToCSV("Database");
}

/*function LoadInitialAddresses() {
    let addr = StartAddresses[0];
    DatabaseManager.ImportFromCSV(addr);
    QueryAddress(addr)
    .then(() => {
        let exporter = new GraphExporter(addr);
        exporter.AddAll();
        exporter.ExportToDOT();
        exporter.ExportToCSV();
    });
}*/

async function QueryAddress(addr : string, queryDirection : DIRECTION = DIRECTION.FORWARD) {
    //Variables
    let nextAddressesToQuery : string[] = [addr];
    let counter = 0;

    //Keep querying until max depth or end found
    while(nextAddressesToQuery.length && counter < maxQueryDepth) {
        const addressesToQuery = [...nextAddressesToQuery];
        nextAddressesToQuery = [];
        let addrPromises : Promise<void>[] = [];
        let bundlePromises : Promise<void>[] = [];

        //Loop over all addresses
        for(let i=0; i < addressesToQuery.length; i++) {
            //Query the Addresses
            addrPromises.push(AddressManager.GetInstance().AddAddress(addressesToQuery[i], queryDirection)
            .then(async (newBundles : string[]) => {
                bundlePromises.push(QueryBundles(newBundles, queryDirection)
                .then((nextAddresses : string[]) => {
                    nextAddressesToQuery = nextAddressesToQuery.concat(nextAddresses);
                })
                .catch((err : Error) => console.log("Top Bundle Error: "+err)));                
            })
            .catch((err : Error) => console.log("Top Address Error: " +err)));
        }
        //Wait for all Addresses to finish
        await Promise.all(addrPromises);
        await Promise.all(bundlePromises);
        console.log("Iterration " + counter);
        console.log(JSON.stringify(nextAddressesToQuery));

        //Increment Depth
        counter++;
    }
}

async function QueryBundles(bundles : string[], queryDirection : DIRECTION = DIRECTION.FORWARD) : Promise<string[]> {
    return new Promise<string[]>(async (resolve, reject) => {
        //Loop over the Bundles
        let nextAddressesToQuery : string[] = [];
        let bundlePromise : Promise<void>[] = [];
        for(let k = 0; k < bundles.length; k++) {
            //Query the Bundles
            bundlePromise.push(BundleManager.GetInstance().AddBundle(bundles[k], queryDirection)
            .then((addresses : string[]) => {
                nextAddressesToQuery = nextAddressesToQuery.concat(addresses);
            })
            .catch((err : Error) => reject(err)));
        }
        //Wait for all Bundles to finish
        await Promise.all(bundlePromise);

        //Filter out addresses already loaded before and duplicates
        nextAddressesToQuery = nextAddressesToQuery.filter((addr, index) => {
            return (AddressManager.GetInstance().GetAddressItem(nextAddressesToQuery[index])==undefined && nextAddressesToQuery.indexOf(addr) === index);
        });

        resolve(nextAddressesToQuery);
    });
}

ExecuteCommands();


