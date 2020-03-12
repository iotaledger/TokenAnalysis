import { SubGraph } from "./SubGraph";
import { Address } from "../Address/Address";
import { Bundle } from "../Bundle/Bundle";
import { Transaction } from "../Transactions/Transaction";
import { DatabaseManager } from "../DataProcessing/DatabaseManager";
import { TransactionManager } from "../Transactions/TransactionManager";

export class Graph {
    private name : string;
    private addressess : Map<string, Address>[];
    private bundles : Map<string, Bundle>[];
    private edges : Map<string, Transaction>;
    private outputColors : (string|undefined)[];
    private renderColors : (string|undefined)[];

    constructor(name : string) {
        this.name = name;
        this.addressess = [];
        this.bundles = [];
        this.edges = new Map<string, Transaction>();
        this.outputColors = [];
        this.renderColors = [];
    }

    public SubGraphAddition(subgraph : SubGraph) {
        //Just add the graph data
        this.addressess.push(subgraph.GetAddresses());
        this.bundles.push(subgraph.GetBundles());
        this.calculateEdges();
        this.outputColors.push(subgraph.GetEndpointColor());
        this.renderColors.push(subgraph.GetRenderColor());
    }

    public SubGraphSubtraction(subgraph : SubGraph) {
        //Loop through all existing graphs and remove overlap
        subgraph.GetAddresses().forEach((value : Address, key :string) => {
            for(let k=0; k < this.addressess.length; k++) {
                this.addressess[k].delete(key);
            }
        });
        subgraph.GetBundles().forEach((value : Bundle, key :string) => {
            for(let k=0; k < this.bundles.length; k++) {
                this.bundles[k].delete(key);
            }
        });
        //Add edge addresses for nicer render
        let edgeAddresses = new Map<string, Address>();
        subgraph.GetAddresses().forEach((value : Address, key :string) => {
            let inBundles = value.GetInBundles();
            inbundles: for(let m=0; m < inBundles.length; m++) {
                for(let k=0; k < this.bundles.length; k++) {
                    if(this.bundles[k].has(inBundles[m])) {
                        edgeAddresses.set(key, value);
                        break inbundles;
                    }
                }
            }
        });
        if(edgeAddresses.size > 0) {
            this.addressess.push(edgeAddresses);
            this.bundles.push(new Map<string, Bundle>());
            this.outputColors.push(subgraph.GetEndpointColor());
            this.renderColors.push(subgraph.GetRenderColor());
        }

        this.calculateEdges();
    }

    private calculateEdges() {
        //Combined list
        let combinedAddresses : Map<string, Address> = new Map<string, Address>();
        let combinedBundles : Map<string, Bundle> = new Map<string, Bundle>();
        for(let i=0; i < this.addressess.length; i++) {
            combinedAddresses = new Map([...Array.from(combinedAddresses.entries()), ...Array.from(this.addressess[i].entries())]);
            combinedBundles = new Map([...Array.from(combinedBundles.entries()), ...Array.from(this.bundles[i].entries())]);
        }

        //Reset Edges
        this.edges = new Map<string, Transaction>();

        //Create a list of edges
        const transactions = TransactionManager.GetInstance().GetTransactions();
        transactions.forEach((value : Transaction, key : string) => {
            //Check if the nodes are included
            let inputHash = value.GetInput();
            let outputHash = value.GetOutput();
            if((combinedAddresses.has(inputHash) || combinedBundles.has(inputHash)) && (combinedAddresses.has(outputHash) || combinedBundles.has(outputHash))) {
                this.edges.set(key, value);
            }
        });
    }

    public ExportToDOT() {
        DatabaseManager.ExportToDOT(this.name, this.addressess, this.bundles, this.edges, this.outputColors, this.renderColors);
    }

    public GetDOTString() : string {
        return DatabaseManager.ExportToDOT("", this.addressess, this.bundles, this.edges, this.outputColors, this.renderColors);
    }
}