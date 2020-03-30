
export class SettingsManager {
    private static instance : SettingsManager;
    private nodes : string[];
    private restTime : number;
    private maxTryCount : number;
    private maxQueryDepth : number;

    private constructor() {
        this.nodes = [];
        this.restTime = 2000;
        this.maxTryCount = 3;
        this.maxQueryDepth = 100;
    }

    /**
     * @param restTime Determines how long a node is not used when it fails. RestTime is in milliseconds. {Default = 2000 ms}
     */
    public SetRestTime(restTime : number) {
        this.restTime = restTime;
    }

    /**
     * @param maxQueryDepth The amount of layers a search is allowed to do before it returns prematurly. This prevents super long and endless queries. 
     */
    public SetMaxQueryDepth(maxQueryDepth : number) {
        this.maxQueryDepth = maxQueryDepth;
    }

    /**
     * Returns the amount of layers a search is allowed to do before it returns.
     */
    public GetMaxQueryDepth() : number {
        return this.maxQueryDepth;
    }

    /**
     * @param maxTryCount The amount of times a query must fail before it no longer tries. {Default = 3}
     */
    public SetMaxTryCount(maxTryCount : number) {
        this.maxTryCount = maxTryCount;
    }

    /**
     * Returns the amount of times a query must fail before it no longer tries.
     */
    public GetMaxTryCount() : number {
        return this.maxTryCount;
    }

    /**
     * @param nodes Adds an array of node URLS (including ports) to the program. It randomly picks a node for every request.
     */
    public AddNodes(nodes : string[]) {
        this.nodes = this.nodes.concat(nodes);
    }

    public GetRandomNode() : string {
        return this.nodes[Math.floor(Math.random()*this.nodes.length)];
    }

    /**
     * Makes a node take a break for RestTime amount of milliseconds. This prevents a node from continuously throwing errors. Will ignore if it is the last node.
     * @param node The node URL to Rest
     */
    public RestNode(node : string) {
        if(this.nodes.length > 1) {
            let index = this.nodes.indexOf(node);
            let removedNodes = this.nodes.splice(index,1);
            if(removedNodes) {
                setTimeout(() => {
                    this.AddNodes(removedNodes);
                }, this.restTime);
            }
        }
    }

    /**
     * Singleton design. Returns the instance of SettingsManager. If it doesn't exists yet, it creates a new instance before returning it.
     */
    public static GetInstance() : SettingsManager {
        if(!this.instance) {
            this.instance = new SettingsManager();
        }
        return this.instance;
    }
}