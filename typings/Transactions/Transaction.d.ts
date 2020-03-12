export declare class Transaction {
    private input;
    private output;
    private value;
    private tag;
    private hash;
    constructor(input: string, output: string, value: number, tag: string, hash: string);
    GetTag(): string;
    GetTransactionHash(): string;
    GetInput(): string;
    GetOutput(): string;
    GetValue(): number;
}
