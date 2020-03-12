import { Address } from "../Address/Address";
import { Bundle } from "../Bundle/Bundle";
import { Transaction } from "../Transactions/Transaction";
import { DatabaseManager } from "../DataProcessing/DatabaseManager";
import { Path } from "./Path";
const fs = require('fs');

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

    public AddAddress(addr : string) {
        if( !this.paths.has(addr) ) {
            this.paths.set(addr, new Path(addr));
        }
    }

    public UpdateAddresses() {
        this.paths.forEach((value : Path, key : string) => {
            value.UpdateEndpoints();
        });
    }

    public ExportToDOT() {
        DatabaseManager.ExportToDOT(this.name, [this.GetAddresses()], [this.GetBundles()], this.GetEdges(), [this.endpointColor], [this.renderColor]);
    }

    public GetAddresses() : Map<string,Address> {
        let addrs = new Map<string, Address>();
        this.paths.forEach((value : Path, key : string) => {
            addrs = new Map<string, Address>([...Array.from(addrs.entries()), ...Array.from(value.GetAddresses())]);
        });
        return addrs;
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

    public ExportAllTransactionHashes(folder : string) {
        this.ExportArrayToFile(Array.from(this.GetEdges().keys()), "txhashes", folder);
    }

    public ExportAllBundleHashes(folder : string) {
        this.ExportArrayToFile(Array.from(this.GetBundles().keys()), "bundlehashes", folder);
    }

    public ExportAllAddressHashes(folder : string) {
        this.ExportArrayToFile(Array.from(this.GetAddresses().keys()), "addrhashes", folder);
    }

    public ExportAllUnspentAddressHashes(folder : string) {
        //Filters addresses that are spent and gets all hashes
        let addresses = Array.from(this.GetAddresses().values()).filter((value : Address) => {
            return !value.IsSpent();
        }).map((value : Address) => { return value.GetAddressHash()});
        this.ExportArrayToFile(addresses, "unspentaddrhashes", folder);
    }

    private ExportArrayToFile(data : string[], itemname : string, folder : string) {
        let fileString = "";
        for(let i=0; i<data.length;i++) {
            fileString = fileString.concat(data[i] + "\n");
        }
        let name = folder + "/" + itemname + "_" + this.name + ".txt";
        fs.writeFile(name , fileString, (err : Error) => {
            if(err) console.log("Error writing file: " + name + ":" + err);
            else {
                console.log("Succesfully saved " + name);
            }
        });
    }
}