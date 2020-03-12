export declare class Address {
    private addr;
    private timestamp;
    private currentValue;
    private inTxs;
    private outTxs;
    constructor(addr: string);
    SetData(addr: string, timestamp: number, currentValue: number, inTxs: string[], outTxs: string[]): void;
    Query(): Promise<void>;
    GetAddressHash(): string;
    IsSpent(): boolean;
    GetCurrentValue(): number;
    GetInTxs(): string[];
    GetOutTxs(): string[];
    GetInBundles(): string[];
    GetOutBundles(): string[];
    GetTimestamp(): number;
}
