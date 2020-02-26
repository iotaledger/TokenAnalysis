export class GraphToQuery {
    public name : string;
    public renderType : RenderType;
    public inputColor : string|undefined;
    public renderColor : string|undefined;
    public TxsToSearch : string[];
    public bundlesToSearch : string[];
    public addressesToSearch : string[];   

    constructor(name : string, renderType : RenderType, inputColor ?: string, renderColor ?: string, TxsToSearch : string[] = [], BundlesToSearch : string[] = [], AddressesToSearch : string[] = []) {
        this.name = name;
        this.renderType = renderType;
        this.inputColor = inputColor;
        this.renderColor = renderColor;
        this.TxsToSearch = TxsToSearch;
        this.bundlesToSearch = BundlesToSearch;
        this.addressesToSearch = AddressesToSearch;
    }
}

export enum RenderType {
    ADD,
    SUBTRACT,
    NONE
}

export interface Command {
    name : string,
    seperateRender : boolean,
    outputAllTxs : boolean, /*  */
    outputAllBundles : boolean, /* */
    outputAllAddresses : boolean, /* */
    outputAllPositiveAddresses : boolean, /* */
    graphs : GraphToQuery[],
}