import { involvedAddress } from "./involvedAddress";
import { involvedBundle } from "./involvedBundle";
import { involvedTransaction } from "./involvedTransaction";
import { TransactionManager } from "./TransactionManager";
import { AddressManager } from "./AddressManager";
import { BundleManager } from "./BundleManager";
import { DatabaseManager } from "./DatabaseManager";

export class SubGraph {
    private addresses : Map<string, involvedAddress>;
    private bundles : Map<string, involvedBundle>;
    private edges : Map<string, involvedTransaction>;
    private name : string;
    private endpointColor ?: string;
    private renderColor ?: string;

    constructor(name : string, endpointColor : string = "#eda151", renderColor : string = "#4bf2b5") {
        this.name = name;
        this.addresses = new Map<string,involvedAddress>();
        this.bundles = new Map<string, involvedBundle>();
        this.edges = new Map<string, involvedTransaction>();
        this.endpointColor = endpointColor;
        this.renderColor = renderColor;
    }

    public AddAll() {
        //Store all
        this.addresses = AddressManager.GetInstance().GetAddresses();
        this.bundles = BundleManager.GetInstance().GetBundles();
        this.calculateEdges();
    }

    public AddAddress(addr : string) {
        let addressesToCheck : string[] = [addr];

        //Create a List of all nodes (Addresses & Bundles)
        while(addressesToCheck.length) {
            const currentAddresses = [...addressesToCheck];
            addressesToCheck = [];

            //Loop over the addresses
            for(let i=0; i < currentAddresses.length; i++) {
                let inMemAddr = AddressManager.GetInstance().GetAddressItem(currentAddresses[i]);
                if(inMemAddr) {
                    inMemAddr = <involvedAddress>inMemAddr;
                    this.addresses.set(currentAddresses[i], inMemAddr);
                    //Loop over the Bundles
                    let outBundles = inMemAddr.GetOutBundles();
                    for(let k=0; k < outBundles.length; k++) {
                        let outBundle = BundleManager.GetInstance().GetBundleItem(outBundles[k]);
                        //Prevent adding unknowns and duplicates
                        if(outBundle && !this.bundles.has(outBundles[k])) {
                            this.bundles.set(outBundles[k], outBundle);
                            addressesToCheck = addressesToCheck.concat(outBundle.GetOutAddresses());
                        }
                    }
                }
            }
            //Remove addresses we already processed and duplicates
            addressesToCheck = addressesToCheck.filter((addr, index) => {
                return !this.addresses.has(addr) && addressesToCheck.indexOf(addr) === index;
            });
        }

        this.calculateEdges();
    }

    public ExportToDOT() {
        DatabaseManager.ExportToDOT(this.name, [this.addresses], [this.bundles], this.edges, [this.endpointColor], [this.renderColor]);
    }

    private calculateEdges() {
        //Create a list of edges
        const transactions = TransactionManager.GetInstance().GetTransactions();
        transactions.forEach((value : involvedTransaction, key : string) => {
            //Check if the nodes are included
            let inputHash = value.GetInput();
            let outputHash = value.GetOutput();
            if((this.addresses.has(inputHash) || this.bundles.has(inputHash)) && (this.addresses.has(outputHash) || this.bundles.has(outputHash))) {
                this.edges.set(key, value);
            }
        });
    }

    public GetAddresses() : Map<string,involvedAddress> {
        return this.addresses;
    }

    public GetBundles() : Map<string, involvedBundle> {
        return this.bundles;
    }

    public GetEdges() : Map<string, involvedTransaction> {
        return this.edges;
    }

    public GetEndpointColor() : string | undefined {
        return this.endpointColor;
    }

    public GetRenderColor() : string | undefined {
        return this.renderColor;
    }
}