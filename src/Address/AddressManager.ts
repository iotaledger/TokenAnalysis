import { Address } from "./Address";
import { DIRECTION } from "../DataProcessing/Query";
import { DatabaseManager } from "../DataProcessing/DatabaseManager";


export class AddressManager {
    private static instance : AddressManager;
    private addresses : Map<string, Address>;

    private constructor() {
        this.addresses = new Map<string, Address>();
    }

    public LoadAddress(addr : Address) {
        this.addresses.set(addr.GetAddressHash(), addr);
    }

    public async AddAddress(addr : string, refresh : boolean = false, useCache : boolean = false, loadDirection : DIRECTION = DIRECTION.FORWARD) : Promise<string[]> {
        return new Promise<string[]>( async (resolve, reject) => {
            //Check if the address was cached and load it
            if(useCache) {
                DatabaseManager.ImportFromCSV("Cache", addr);
            }

            //Load the Addresses
            if(!this.addresses.has(addr) || refresh) {
                let newAddr : Address = new Address(addr);
                newAddr.Query()
                .then((exists : boolean) => {
                    //Add Address to the list
                    if(!exists) {
                        resolve([]);
                        return;
                    }
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
                resolve(this.GetAddressItem(addr)?.GetOutBundles());
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