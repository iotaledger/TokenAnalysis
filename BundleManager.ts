import { involvedBundle } from "./involvedBundle";
import { AddressManager } from "./AddressManager";

export class BundleManager {
    private static instance : BundleManager;
    private bundles : Map<string, involvedBundle>;

    private constructor() {
        this.bundles = new Map<string, involvedBundle>();
    }

    public async AddBundle(bundleHash : string) {
        //Load the Bundles
        if(!this.bundles.has(bundleHash)) {
            let bundle : involvedBundle = new involvedBundle(bundleHash);
            bundle.Query()
            .then(() => {
                //Add Bundle to the list
                this.bundles.set(bundleHash, bundle);

                //Stich In -> Out
                const ins = bundle.GetInAddresses();
                const outs = bundle.GetOutAddresses();
                for(let i=0; i<ins.length;i++) {
                    for(let k=0; k<outs.length; k++) {
                        let addrItem = AddressManager.GetInstance().GetAddressItem(ins[i]);
                        if(addrItem) {
                            addrItem.AddOutAddress(outs[k]);
                        }
                    }
                }
            })
            .catch((err : Error) => console.log(err));
        }
    }


    public static GetInstance() : BundleManager {
        if(!this.instance) {
            this.instance = new BundleManager();
        }
        return this.instance;
    }

    public GetBundleItem(bundleHash : string) : involvedBundle|undefined {
        return this.bundles.get(bundleHash);
    }
}