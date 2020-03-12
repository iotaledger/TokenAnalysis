import { Bundle } from "./Bundle";
import { DIRECTION } from "../DataProcessing/query";
export declare class BundleManager {
    private static instance;
    private bundles;
    private constructor();
    LoadBundle(bundle: Bundle): void;
    AddBundle(bundleHash: string, refresh?: boolean, loadDirection?: DIRECTION, store?: boolean): Promise<string[]>;
    static GetInstance(): BundleManager;
    GetBundleItem(bundleHash: string): Bundle | undefined;
    GetBundles(): Map<string, Bundle>;
}
