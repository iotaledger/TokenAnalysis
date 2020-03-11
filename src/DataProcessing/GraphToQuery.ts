/**
 * Graph to query
 * @description Data structure 
 */
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

/**
 * Settings
 * @description Interface which is used as a base for the GenerateGraph function.
 */
export interface Settings {
    /**
     * Name of the output files. Must be unique otherwise it might overwrite previous created files
     */
    name : string,
    /**
     * Determine if it should render the Subgraphs aswell in a file under the subgraphs name. Takes extra execution time.
     */
    seperateRender : boolean,
    /**
     * Determine if it should output a .txt file will all involved transaction hashes.
     */
    outputAllTxs : boolean, 
    /**
     * Determine if it should output a .txt file will all involved bundle hashes.
     */
    outputAllBundles : boolean, 
    /**
     * Determine if it should output a .txt file will all involved addresses.
     */
    outputAllAddresses : boolean, 
    /**
     * Determine if it should output a .txt file will all involved addresses with a positive value.
     */
    outputAllPositiveAddresses : boolean,
    /**
     * Array of the graphs to include in the process.
     */
    graphs : GraphToQuery[],
}