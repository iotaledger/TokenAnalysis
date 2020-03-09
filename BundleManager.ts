import { involvedBundle } from "./involvedBundle";
import { AddressManager } from "./AddressManager";
import { DIRECTION } from "./query";
import { involvedTransaction } from "./involvedTransaction";
import { TransactionManager } from "./TransactionManager";


export class BundleManager {
    private static instance : BundleManager;
    private bundles : Map<string, involvedBundle>;

    private constructor() {
        this.bundles = new Map<string, involvedBundle>();
    }

    public LoadBundle(bundle : involvedBundle) {
        this.bundles.set(bundle.GetBundleHash(), bundle);
    }

    public async AddBundle(bundleHash : string, loadDirection : DIRECTION = DIRECTION.FORWARD, store : boolean = true) : Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            //Load the Bundles
            if(!this.bundles.has(bundleHash)) {
                let bundle : involvedBundle = new involvedBundle(bundleHash);
                bundle.Query()
                .then(() => {
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

    public GetBundleItem(bundleHash : string) : involvedBundle|undefined {
        return this.bundles.get(bundleHash);
    }

    public GetBundles() : Map<string, involvedBundle> {
        return this.bundles;
    }
}