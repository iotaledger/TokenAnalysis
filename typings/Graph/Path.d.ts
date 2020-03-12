import { Address } from "../Address/Address";
import { Transaction } from "../Transactions/Transaction";
import { Bundle } from "../Bundle/Bundle";
export declare class Path {
    private originalAddress;
    private addresses;
    private bundles;
    private edges;
    constructor(addr: string);
    UpdateEndpoints(): void;
    private AddAddrToPath;
    private calculateEdges;
    GetAddresses(): Map<string, Address>;
    GetBundles(): Map<string, Bundle>;
    GetTransactions(): Map<string, Transaction>;
}
