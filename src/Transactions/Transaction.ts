
/**
 * Data container for a loaded IOTA transaction.
 * Only confirmed transactions are taken into account.
 */
export class Transaction {
    private input : string;
    private output : string;
    private value : number;
    private tag : string;
    private hash : string;

    constructor(input : string, output : string, value : number, tag : string, hash : string) {
        this.input = input;
        this.output = output;
        this.value = value;
        this.tag = tag;
        this.hash = hash;
    }

    public GetTag() : string {
        return this.tag;
    }

    public GetTransactionHash() : string {
        return this.hash;
    }    

    /**
     * Input address that has been spent
     */
    public GetInput() : string {
        return this.input;
    }

    /**
     * The output address were the tokens go
     */
    public GetOutput() : string {
        return this.output;
    }

    public GetValue() : number {
        return this.value;
    }
}