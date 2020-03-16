export declare class Bundle {
    private hash;
    private timestamp;
    private inTxs;
    private outTxs;
    constructor(bundleHash: string);
    SetData(bundle: string, timestamp: number, inTxs: string[], outTxs: string[]): void;
    Query(): Promise<boolean>;
    GetBundleHash(): string;
    hasTrinityTag(): boolean;
    GetOutTxs(): string[];
    GetInTxs(): string[];
    GetInAddresses(): string[];
    GetOutAddresses(): string[];
    GetTimestamp(): number;
}
