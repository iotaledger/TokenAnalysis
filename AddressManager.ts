import { involvedAddress } from "./involvedAddress";
import { BundleManager } from "./bundlemanager";
import { DIRECTION } from "./query";

export class AddressManager {
    private static instance : AddressManager;
    private addresses : Map<string, involvedAddress>;

    private constructor() {
        this.addresses = new Map<string, involvedAddress>();
    }

    public async AddAddress(addr : string, loadDirection : DIRECTION = DIRECTION.FORWARD) : Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            //Load the Addresses
            if(!this.addresses.has(addr)) {
                let newAddr : involvedAddress = new involvedAddress(addr);
                newAddr.Query()
                .then(() => {
                    //Add Address to the list
                    this.addresses.set(addr, newAddr);

                    //Stich Out -> In
                    const bundles = newAddr.GetInBundles();
                    for(let i=0; i < bundles.length; i++) {
                        const bundleItem = BundleManager.GetInstance().GetBundleItem(bundles[i]);
                        if(bundleItem) {
                            const outAddresses = bundleItem.GetInAddresses();
                            for(let k=0; k < outAddresses.length; k++) {
                                let addrItem = this.addresses.get(outAddresses[k]);
                                if(addrItem) {
                                    addrItem.AddOutAddress(addr);
                                }
                            }
                        }
                    }
                    //Return the next bundles to process
                    if(loadDirection == DIRECTION.FORWARD) {
                        resolve(newAddr.GetOutBundles());
                    } else if(loadDirection == DIRECTION.BACKWARD) {
                        resolve(newAddr.GetInBundles());
                    }
                })
                .catch((err : Error) => console.log(err));
            }
        });
    }

    public static GetInstance() : AddressManager {
        if(!this.instance) {
            this.instance = new AddressManager();
        }
        return this.instance;
    }

    public GetAddressItem(addr : string) : involvedAddress|undefined {
        return this.addresses.get(addr);
    }
}