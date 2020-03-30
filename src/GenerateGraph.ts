import { DIRECTION, QueryAddress, QueryBundles, QueryTransactions } from "./DataProcessing/Query";
import { RenderType, Request } from "./DataProcessing/GraphToQuery";
import { Graph } from "./Graph/Graph";
import { SubGraph } from "./Graph/SubGraph";
import { SettingsManager } from "./SettingsManager";

export async function GenerateGraph( settings : Request ) : Promise<Graph> {
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
                await QueryAddress(graph.addressesToSearch[i], SettingsManager.GetInstance().GetMaxQueryDepth(), undefined, undefined, true, (processedTXCount:number, foundTXCount : number, depth:number) => {
                    console.log(processedTXCount + "/" + foundTXCount + " with depth " + depth);
                });

                //Add to Subgraph
                subGraph.AddAddress(graph.addressesToSearch[i]);
            }

            //Optional Caching
            if(settings.caching) {
                subGraph.CacheAllAddresses();
            }

            //Add Subgraph to main graph and optionally render
            if(settings.seperateRender) {
                subGraph.ExportToDOT();
            }
            if(graph.renderType == RenderType.ADD) {
                combinedGraph.SubGraphAddition(subGraph);
            } else if (graph.renderType == RenderType.SUBTRACT) {
                combinedGraph.SubGraphSubtraction(subGraph, true);
            }
        }

        //Combined
        combinedGraph.ExportToDOT();
        resolve(combinedGraph);
    });
    
}