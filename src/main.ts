import { maxQueryDepth, command } from "./settings";
import { DIRECTION, QueryAddress, QueryBundles, QueryTransactions } from "./DataProcessing/query";
import { GraphExporter } from "./DataProcessing/GraphExporter";
import { DatabaseManager } from "./DataProcessing/DatabaseManager";
import { RenderType, Settings } from "./DataProcessing/GraphToQuery";
import { Graph } from "./Graph/Graph";
import { SubGraph } from "./Graph/SubGraph";

//Execution of the script
GenerateGraph(command);

export async function GenerateGraph( settings : Settings ) : Promise<Graph> {
    return new Promise<Graph>( async (resolve, reject) => {
        //Create the total Graph
        let combinedGraph : Graph = new Graph(settings.name);

        for(let k=0; k < settings.graphs.length; k++) {
            //Create the subgraph
            let graph = settings.graphs[k];
            let subGraph : SubGraph = new SubGraph(graph.name, graph.inputColor, graph.renderColor);

            //Convert Transaction commands into bundles
            graph.addressesToSearch = graph.addressesToSearch.concat(await QueryTransactions(graph.TxsToSearch));
            
            //Convert Bundle commands into addresses
            graph.addressesToSearch = graph.addressesToSearch.concat(await QueryBundles(graph.bundlesToSearch, DIRECTION.BACKWARD, false));
            for(let i=0; i < graph.addressesToSearch.length; i++){ 
                DatabaseManager.ImportFromCSV("Cache", graph.addressesToSearch[i]);
                await QueryAddress(graph.addressesToSearch[i], maxQueryDepth);

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
            if(settings.seperateRender) {
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
        resolve(combinedGraph);
    });
    
}

export function Update() {

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

