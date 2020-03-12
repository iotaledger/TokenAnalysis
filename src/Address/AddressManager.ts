import { Address } from "./Address";
import { DIRECTION } from "../DataProcessing/query";


export class AddressManager {
    private static instance : AddressManager;
    private addresses : Map<string, Address>;

    private constructor() {
        this.addresses = new Map<string, Address>();
    }

    public LoadAddress(addr : Address) {
        this.addresses.set(addr.GetAddressHash(), addr);
    }

    public async AddAddress(addr : string, refresh : boolean = false, loadDirection : DIRECTION = DIRECTION.FORWARD) : Promise<string[]> {
        return new Promise<string[]>( async (resolve, reject) => {
            //Load the Addresses
            if(!this.addresses.has(addr) || refresh) {
                let newAddr : Address = new Address(addr);
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

    public GetAddressItem(addr : string) : Address|undefined {
        return this.addresses.get(addr);
    }

    public GetAddresses() : Map<string,Address> {
        return this.addresses;
    }
}