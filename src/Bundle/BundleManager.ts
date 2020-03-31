import { Bundle } from "./Bundle";
import { DIRECTION } from "../DataProcessing/Query";

/**
 * A singleton class which manages all loaded bundles.
 * If any address was loaded before, it can be skipped and returned directly. 
 */
export class BundleManager {
    private static instance : BundleManager;
    private bundles : Map<string, Bundle>;

    private constructor() {
        this.bundles = new Map<string, Bundle>();
    }

    /**
     * Manually adds a bundle to the manager without any queries.
     * @param bundle The bundle container to add.
     */
    public LoadBundle(bundle : Bundle) {
        this.bundles.set(bundle.GetBundleHash(), bundle);
    }

    /**
     * Queries a bundle and create the bundle container and adds it to this manager. 
     * @param bundleHash The bundle hash to be queried
     * @param refresh A boolean value to set if the address should be queried again, even if it is already known. This makes sure any new transactions are found aswell.
     * @param loadDirection The direction is which the address is queried in time. Forward returns output addresses, while backward returns input addresses.
     * @param store A boolean value to set if the bundle should be stored in the manager. This allows exploring bundles without interrupting a later search as completed. 
     */
    public async AddBundle(bundleHash : string, refresh : boolean = false, loadDirection : DIRECTION = DIRECTION.FORWARD, store : boolean = true) : Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            //Load the Bundles
            if(!this.bundles.has(bundleHash) || refresh) {
                let bundle : Bundle = new Bundle(bundleHash);
                bundle.Query()
                .then((exists : boolean) => {
                    if(!exists) {
                        resolve([]);
                        return;
                    }
                    //Add Bundle to the list
                    if(store)
                        this.bundles.set(bundleHash, bundle);                    

                    //Return the next addresses to process
                    if(loadDirection == DIRECTION.FORWARD) {
                        resolve(bundle.GetOutAddresses());
                    } else if(loadDirection == DIRECTION.BACKWARD) {
                        resolve(bundle.GetInAddresses());
                    }
                })
                .catch((err : Error) => reject(err));
            } else {
                if(!store) {
                    if(loadDirection == DIRECTION.FORWARD) {
                        resolve(this.bundles.get(bundleHash)?.GetOutAddresses());
                    } else if(loadDirection == DIRECTION.BACKWARD) {
                        resolve(this.bundles.get(bundleHash)?.GetInAddresses());
                    }
                } else {
                    resolve([]);
                }
            }
        });
    }


    public static GetInstance() : BundleManager {
        if(!this.instance) {
            this.instance = new BundleManager();
        }
        return this.instance;
    }

    public GetBundleItem(bundleHash : string) : Bundle|undefined {
        return this.bundles.get(bundleHash);
    }

    public GetBundles() : Map<string, Bundle> {
        return this.bundles;
    }
}