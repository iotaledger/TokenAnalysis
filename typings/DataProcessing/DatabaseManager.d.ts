import { Address } from "../Address/Address";
import { Bundle } from "../Bundle/Bundle";
import { Transaction } from "../Transactions/Transaction";
export declare namespace DatabaseManager {
    function ImportFromCSV(folder: string, filename: string): void;
    function ExportToDOT(filename: string, addresses: Map<string, Address>[], bundles: Map<string, Bundle>[], edges: Map<string, Transaction>, outputColors: (string | undefined)[], renderColors: (string | undefined)[]): void;
}
