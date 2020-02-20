import { involvedAddress } from "./involvedAddress";
import { BundleManager } from "./BundleManager";
import { DIRECTION } from "./query";


export class AddressManager {
    private static instance : AddressManager;
    private addresses : Map<string, involvedAddress>;

    private constructor() {
        this.addresses = new Map<string, involvedAddress>();
    }

    public LoadAddress(addr : involvedAddress) {
        this.addresses.set(addr.GetAddressHash(), addr);
    }

    public async AddAddress(addr : string, loadDirection : DIRECTION = DIRECTION.FORWARD) : Promise<string[]> {
        return new Promise<string[]>( async (resolve, reject) => {
            //Load the Addresses
            if(!this.addresses.has(addr)) {
                let newAddr : involvedAddress = new involvedAddress(addr);
                newAddr.Query()
                .then(() => {
                    //Add Address to the list
                    this.addresses.set(addr, newAddr);

                    //Return the next bundles to process
                    if(loadDirection == DIRECTION.FORWARD) {
                        resolve(newAddr.GetOutBundles());
                    } else if(loadDirection == DIRECTION.BACKWARD) {
                        resolve(newAddr.GetInBundles());
                    }
                })
                .catch((err : Error) => reject(err));
            } else {
                //Addresses has already been loaded
                resolve([]);
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

    public GetAddresses() : Map<string,involvedAddress> {
        return this.addresses;
    }
}