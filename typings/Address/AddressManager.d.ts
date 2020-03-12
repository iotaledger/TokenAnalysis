import { Address } from "./Address";
import { DIRECTION } from "../DataProcessing/query";
export declare class AddressManager {
    private static instance;
    private addresses;
    private constructor();
    LoadAddress(addr: Address): void;
    AddAddress(addr: string, refresh?: boolean, loadDirection?: DIRECTION): Promise<string[]>;
    static GetInstance(): AddressManager;
    GetAddressItem(addr: string): Address | undefined;
    GetAddresses(): Map<string, Address>;
}
