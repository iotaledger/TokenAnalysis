import { Address } from "../Address/Address";
import { Bundle } from "../Bundle/Bundle";
import { Transaction } from "../Transactions/Transaction";
export declare class SubGraph {
    private paths;
    private name;
    private endpointColor?;
    private renderColor?;
    constructor(name: string, endpointColor?: string, renderColor?: string);
    AddAddress(addr: string): void;
    UpdateAddresses(): void;
    ExportToDOT(): void;
    GetDOTString(): string;
    GetAddresses(): Map<string, Address>;
    GetBundles(): Map<string, Bundle>;
    GetEdges(): Map<string, Transaction>;
    GetEndpointColor(): string | undefined;
    GetRenderColor(): string | undefined;
    ExportAllTransactionHashes(folder: string): void;
    ExportAllBundleHashes(folder: string): void;
    ExportAllAddressHashes(folder: string): void;
    ExportAllUnspentAddressHashes(folder: string): void;
    private ExportArrayToFile;
}
