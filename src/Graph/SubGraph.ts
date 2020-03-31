import { Address } from "../Address/Address";
import { Bundle } from "../Bundle/Bundle";
import { Transaction } from "../Transactions/Transaction";
import { DatabaseManager } from "../DataProcessing/DatabaseManager";
import { Path } from "./Path";

export class SubGraph {
    private paths : Map<string, Path>;
    private name : string;
    private endpointColor ?: string;
    private renderColor ?: string;

    constructor(name : string, endpointColor : string = "#eda151", renderColor : string = "#4bf2b5") {
        this.paths = new Map<string, Path>();
        this.name = name;
        this.endpointColor = endpointColor;
        this.renderColor = renderColor;
        
    }

    public AddAddress(addr : string, maxDepth : number = 1000) {
        if( !this.paths.has(addr) ) {
            this.paths.set(addr, new Path(addr, maxDepth));
        }
    }

    public CacheAllAddresses() {
        this.paths.forEach((value : Path) => {
            value.Cache("Cache");
        });
    }

    public ExportToDOT() {
        DatabaseManager.ExportToDOT(this.name, [this.GetAddresses()], [this.GetBundles()], this.GetEdges(), [this.endpointColor], [this.renderColor]);
    }

    public GetDOTString() : string {
        return DatabaseManager.GenerateDOT([this.GetAddresses()], [this.GetBundles()], this.GetEdges(), [this.endpointColor], [this.renderColor]);
    }

    public GetAddresses() : Map<string,Address> {
        let addrs = new Map<string, Address>();
        this.paths.forEach((value : Path, key : string) => {
            addrs = new Map<string, Address>([...Array.from(addrs.entries()), ...Array.from(value.GetAddresses())]);
        });
        return addrs;
    }

    public GetAllUnspentAddressHashes() : string[] {
       return Array.from(this.GetAddresses().values()).filter((value : Address) => {
            return !value.IsSpent();
        }).map((value : Address) => { return value.GetAddressHash()});
    }

    public GetBundles() : Map<string, Bundle> {
        let bundles = new Map<string, Bundle>();
        this.paths.forEach((value : Path, key : string) => {
            bundles = new Map<string, Bundle>([...Array.from(bundles.entries()), ...Array.from(value.GetBundles())]);
        });
        return bundles;
    }

    public GetEdges() : Map<string, Transaction> {
        let edges = new Map<string, Transaction>();
        this.paths.forEach((value : Path, key : string) => {
            edges = new Map<string, Transaction>([...Array.from(edges.entries()), ...Array.from(value.GetTransactions())]);
        });
        return edges;
    }

    public GetEndpointColor() : string | undefined {
        return this.endpointColor;
    }

    public GetRenderColor() : string | undefined {
        return this.renderColor;
    }
}