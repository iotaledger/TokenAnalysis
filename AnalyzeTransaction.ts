import { maxQueryDepth, command } from "./settings";
import { AddressManager } from "./AddressManager";
import { BundleManager } from "./BundleManager";
import { DIRECTION, getBundle } from "./query";
import { GraphExporter } from "./GraphExporter";
import { DatabaseManager } from "./DatabaseManager";
import { RenderType } from "./GraphToQuery";
import { Graph } from "./Graph";
import { SubGraph } from "./SubGraph";

//Execution of the script
ExecuteCommands();

async function ExecuteCommands() {
    //Create the total Graph
    let combinedGraph : Graph = new Graph(command.name);


    for(let k=0; k < command.graphs.length; k++) {
        //Create the subgraph
        let graph = command.graphs[k];
        let subGraph : SubGraph = new SubGraph(graph.name, graph.inputColor, graph.renderColor);

        //Convert Transaction commands into bundles
        graph.bundlesToSearch = graph.bundlesToSearch.concat(await QueryTransactions(graph.TxsToSearch));
        
        //Convert Bundle commands into addresses
        graph.addressesToSearch = graph.addressesToSearch.concat(await QueryBundles(graph.bundlesToSearch, DIRECTION.BACKWARD, false));
        for(let i=0; i < graph.addressesToSearch.length; i++){ 
            DatabaseManager.ImportFromCSV("Cache", graph.addressesToSearch[i]);
            await QueryAddress(graph.addressesToSearch[i]);

            //Cache Results
            let cacheExporter = new GraphExporter(graph.addressesToSearch[i]);
            cacheExporter.AddAddressSubGraph(graph.addressesToSearch[i]);
            cacheExporter.ExportToCSV("Cache");

            //Add to Subgraph
            subGraph.AddAddress(graph.addressesToSearch[i]);
        }

        //Export commands
        //let exporter = new GraphExporter(graph.name);
        //exporter.AddAll();
        //Export(exporter);
        //console.log("Unspent value in end addresses from "+graph.name+": " + exporter.GetUnspentValue());

        //Add Subgraph to main graph and optionally render
        if(command.seperateRender) {
            subGraph.ExportToDOT();
        }
        if(graph.renderType == RenderType.ADD) {
            combinedGraph.SubGraphAddition(subGraph);
        } else if (graph.renderType == RenderType.SUBTRACT) {
            combinedGraph.SubGraphSubtraction(subGraph);
        }
    }

    //Combined
    combinedGraph.ExportToDOT();
}

async function QueryTransactions(txs : string[]) : Promise<string[]> {
    let promises : Promise<void>[] = [];
    let bundles : string[] = [];
    for(let i=0; i <txs.length; i++) {
        promises.push(getBundle(txs[i])
        .then((bundle : string) => {
            bundles.push(bundle);
        })
        .catch((err : Error) => { console.log("QueryTx error") }));
    }
    await Promise.all(promises);
    return bundles;
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
        let bundlePromises : Promise<void>[] = [];

        //Log Queue
        if(counter)
            console.log("Queue on iter "+counter+": " + JSON.stringify(nextAddressesToQuery));

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

        //Increment Depth
        counter++;
    }
}

async function QueryBundles(bundles : string[], queryDirection : DIRECTION = DIRECTION.FORWARD, store : boolean = true) : Promise<string[]> {
    return new Promise<string[]>(async (resolve, reject) => {
        //Loop over the Bundles
        let nextAddressesToQuery : string[] = [];
        let bundlePromise : Promise<void>[] = [];
        for(let k = 0; k < bundles.length; k++) {
            //Query the Bundles
            bundlePromise.push(BundleManager.GetInstance().AddBundle(bundles[k], queryDirection, store)
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

function Export(exporter : GraphExporter) {
    if(command.seperateRender) {
        exporter.ExportToDOT();
    }
    if(command.outputAllAddresses) {
        exporter.ExportAllAddressHashes("Database");
    }
    if(command.outputAllBundles) {
        exporter.ExportAllBundleHashes("Database");
    }
    if(command.outputAllTxs) {
        exporter.ExportAllTransactionHashes("Database");
    }
    if(command.outputAllPositiveAddresses) {
        exporter.ExportAllUnspentAddressHashes("Database");
    }
}

