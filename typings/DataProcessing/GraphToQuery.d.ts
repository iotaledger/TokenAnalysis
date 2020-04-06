/**
 * Graph to query
 * @description Data structure
 */
export declare class GraphToQuery {
    name: string;
    renderType: RenderType;
    inputColor: string | undefined;
    renderColor: string | undefined;
    TxsToSearch: string[];
    bundlesToSearch: string[];
    addressesToSearch: string[];
    constructor(name: string, renderType: RenderType, inputColor?: string, renderColor?: string, TxsToSearch?: string[], BundlesToSearch?: string[], AddressesToSearch?: string[]);
}
export declare enum RenderType {
    ADD = 0,
    SUBTRACT = 1,
    NONE = 2
}
/**
 * Request
 * @description Interface which is used as a base for the GenerateGraph function.
 */
export interface Request {
    /**
     * Name of the output files. Must be unique otherwise it might overwrite previous created files
     */
    name: string;
    /**
     * Determine if it should render the Subgraphs aswell in a file under the subgraphs name. Takes extra execution time.
     */
    seperateRender: boolean;
    /**
     * Caching {Node.js execution only} of the transactions between requests and sessions.
     */
    caching: boolean;
    /**
     * Array of the graphs to include in the process.
     */
    graphs: GraphToQuery[];
}
