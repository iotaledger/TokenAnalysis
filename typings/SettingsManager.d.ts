export declare class SettingsManager {
    private static instance;
    private nodes;
    private restTime;
    private maxTryCount;
    private maxQueryDepth;
    private constructor();
    /**
     * @param restTime Determines how long a node is not used when it fails. RestTime is in milliseconds. {Default = 2000 ms}
     */
    SetRestTime(restTime: number): void;
    /**
     * @param maxQueryDepth The amount of layers a search is allowed to do before it returns prematurly. This prevents super long and endless queries.
     */
    SetMaxQueryDepth(maxQueryDepth: number): void;
    /**
     * Returns the amount of layers a search is allowed to do before it returns.
     */
    GetMaxQueryDepth(): number;
    /**
     * @param maxTryCount The amount of times a query must fail before it no longer tries. {Default = 3}
     */
    SetMaxTryCount(maxTryCount: number): void;
    /**
     * Returns the amount of times a query must fail before it no longer tries.
     */
    GetMaxTryCount(): number;
    /**
     * @param nodes Adds an array of node URLS (including ports) to the program. It randomly picks a node for every request.
     */
    AddNodes(nodes: string[]): void;
    GetRandomNode(): string;
    /**
     * Makes a node take a break for RestTime amount of milliseconds. This prevents a node from continuously throwing errors. Will ignore if it is the last node.
     * @param node The node URL to Rest
     */
    RestNode(node: string): void;
    /**
     * Singleton design. Returns the instance of SettingsManager. If it doesn't exists yet, it creates a new instance before returning it.
     */
    static GetInstance(): SettingsManager;
}
