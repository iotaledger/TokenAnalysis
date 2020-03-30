import { Bundle } from "./Bundle";
import { DIRECTION } from "../DataProcessing/Query";

export class BundleManager {
    private static instance : BundleManager;
    private bundles : Map<string, Bundle>;

    private constructor() {
        this.bundles = new Map<string, Bundle>();
    }

    public LoadBundle(bundle : Bundle) {
        this.bundles.set(bundle.GetBundleHash(), bundle);
    }

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