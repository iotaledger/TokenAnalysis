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
     * Determine if it should output a .txt file will all involved transaction hashes.
     */
    outputAllTxs: boolean;
    /**
     * Determine if it should output a .txt file will all involved bundle hashes.
     */
    outputAllBundles: boolean;
    /**
     * Determine if it should output a .txt file will all involved addresses.
     */
    outputAllAddresses: boolean;
    /**
     * Determine if it should output a .txt file will all involved addresses with a positive value.
     */
    outputAllPositiveAddresses: boolean;
    /**
     * Array of the graphs to include in the process.
     */
    graphs: GraphToQuery[];
}
