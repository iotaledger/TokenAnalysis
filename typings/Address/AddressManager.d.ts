import { Address } from "./Address";
import { DIRECTION } from "../DataProcessing/Query";
export declare class AddressManager {
    private static instance;
    private addresses;
    private constructor();
    LoadAddress(addr: Address): void;
    AddAddress(addr: string, refresh?: boolean, useCache?: boolean, loadDirection?: DIRECTION): Promise<string[]>;
    static GetInstance(): AddressManager;
    GetAddressItem(addr: string): Address | undefined;
    GetAddresses(): Map<string, Address>;
}
