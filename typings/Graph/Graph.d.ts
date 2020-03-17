import { SubGraph } from "./SubGraph";
export declare class Graph {
    private name;
    private addressess;
    private bundles;
    private edges;
    private outputColors;
    private renderColors;
    constructor(name: string);
    SubGraphAddition(subgraph: SubGraph): void;
    SubGraphSubtraction(subgraph: SubGraph, keepedges?: boolean): void;
    private calculateEdges;
    ExportToDOT(): void;
    GetDOTString(): string;
    GetAddresses(): string[];
    GetUnspentAddresses(): string[];
    GetBundles(): string[];
}
