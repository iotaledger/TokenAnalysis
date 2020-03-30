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
 * Request
 * @description Interface which is used as a base for the GenerateGraph function.
 */
export interface Request {
    /**
     * Name of the output files. Must be unique otherwise it might overwrite previous created files
     */
    name : string,
    /**
     * Determine if it should render the Subgraphs aswell in a file under the subgraphs name. Takes extra execution time.
     */
    seperateRender : boolean,
    /**
     * Caching {Node.js execution only} of the transactions between requests and sessions. 
     */
    caching : boolean,
    /**
     * Array of the graphs to include in the process.
     */
    graphs : GraphToQuery[],
}