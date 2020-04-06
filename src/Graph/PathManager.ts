import { Path } from "./Path";
import { Address } from "../Address/Address";

/**
 * A manager to collect all paths. This allows live tracing to update all paths that have an address.
 */
export class PathManager {
    private static instance : PathManager;
    private paths : Path[];

    private constructor() {
        this.paths = [];
    }

    public AddPath(path : Path) {
        this.paths.push(path);
    }

    /**
     * Updates all paths that have this address included.
     * @param updatedAddr 
     */
    public UpdatePaths(updatedAddr : string) {
        for(let i=0; i < this.paths.length; i++) {
            if( Array.from(this.paths[i].GetAddresses().keys()).indexOf(updatedAddr) >= 0 ) {
                this.paths[i].AddAddrToPath(updatedAddr);
            }
        }
    }

    public static GetInstance() : PathManager {
        if(!this.instance) {
            this.instance = new PathManager();
        } 
        return this.instance;
    }

}