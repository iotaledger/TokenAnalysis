export declare class GraphExporter {
    private addresses;
    private bundles;
    private edges;
    private name;
    constructor(name: string, inputColor?: string, renderColor?: string);
    AddAll(): void;
    AddAddressSubGraph(addr: string): void;
    private calculateEdges;
    ExportToDOT(): void;
    ExportToCSV(folder: string): void;
    ExportAllTransactionHashes(folder: string): void;
    ExportAllBundleHashes(folder: string): void;
    ExportAllAddressHashes(folder: string): void;
    ExportAllUnspentAddressHashes(folder: string): void;
    private ExportArrayToFile;
    GetUnspentValue(): number;
}
