import { Address } from "../Address/Address";
import { Bundle } from "../Bundle/Bundle";
import { Transaction } from "../Transactions/Transaction";
import { TransactionManager } from "../Transactions/TransactionManager";
import { AddressManager } from "../Address/AddressManager";
import { BundleManager } from "../Bundle/BundleManager";
import { DatabaseManager } from "../DataProcessing/DatabaseManager";

export class SubGraph {
    private addresses : Map<string, Address>;
    private bundles : Map<string, Bundle>;
    private edges : Map<string, Transaction>;
    private name : string;
    private endpointColor ?: string;
    private renderColor ?: string;

    constructor(name : string, endpointColor : string = "#eda151", renderColor : string = "#4bf2b5") {
        this.name = name;
        this.addresses = new Map<string,Address>();
        this.bundles = new Map<string, Bundle>();
        this.edges = new Map<string, Transaction>();
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
                    inMemAddr = <Address>inMemAddr;
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
        transactions.forEach((value : Transaction, key : string) => {
            //Check if the nodes are included
            let inputHash = value.GetInput();
            let outputHash = value.GetOutput();
            if((this.addresses.has(inputHash) || this.bundles.has(inputHash)) && (this.addresses.has(outputHash) || this.bundles.has(outputHash))) {
                this.edges.set(key, value);
            }
        });
    }

    public GetAddresses() : Map<string,Address> {
        return this.addresses;
    }

    public GetBundles() : Map<string, Bundle> {
        return this.bundles;
    }

    public GetEdges() : Map<string, Transaction> {
        return this.edges;
    }

    public GetEndpointColor() : string | undefined {
        return this.endpointColor;
    }

    public GetRenderColor() : string | undefined {
        return this.renderColor;
    }
}