import { Address } from "./Address";
import { DIRECTION } from "../DataProcessing/Query";
import { DatabaseManager } from "../DataProcessing/DatabaseManager";

/**
 * A singleton class which manages all loaded addresses.
 * If any address was loaded before, it can be skipped and returned directly. 
 */
export class AddressManager {
    private static instance : AddressManager;
    private addresses : Map<string, Address>;

    private constructor() {
        this.addresses = new Map<string, Address>();
    }

    /**
     * Manually adds an address to the manager without any queries.
     * @param addr The address container to add.
     */
    public LoadAddress(addr : Address) {
        this.addresses.set(addr.GetAddressHash(), addr);
    }

    /**
     * Queries an address and create the address container and adds it to this manager. 
     * @param addr The address to query
     * @param refresh A boolean value to set if the address should be queried again, even if it is already known. This makes sure any new transactions are found aswell.
     * @param useCache A boolean value to set if the program should use the cache. This can be outdated info, but speeds up the result if anything was cached. 
     * @param loadDirection The direction is which the address is queried in time. Forward returns output bundles, while backward returns input bundles.
     */
    public async AddAddress(addr : string, refresh : boolean = false, useCache : boolean = false, loadDirection : DIRECTION = DIRECTION.FORWARD) : Promise<string[]> {
        return new Promise<string[]>( async (resolve, reject) => {
            //Check if the address was cached and load it
            if(!this.addresses.has(addr) && useCache) {
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