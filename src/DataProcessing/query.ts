import { maxTryCount, ProviderList } from "../settings";
import { composeAPI, Transaction } from "@iota/core";
import { AddressManager } from "../Address/AddressManager";
import { BundleManager } from "../Bundle/BundleManager";

//In time
export enum DIRECTION {
    NONE,
    FORWARD,
    BACKWARD
}

export interface QueryRequest {
    addresses ?: string[],
    bundles ?: string[]
}

export async function QueryTransactions(txs : string[]) : Promise<string[]> {
    let promises : Promise<void>[] = [];
    let addresses : string[] = [];
    for(let i=0; i <txs.length; i++) {
        promises.push(getReceivingAddress(txs[i])
        .then((bundle : string) => {
            addresses.push(bundle);
        })
        .catch((err : Error) => { console.log("QueryTx error") }));
    }
    await Promise.all(promises);
    return addresses;
}

export async function QueryAddress(addr : string, maxQueryDepth : number, queryDirection : DIRECTION = DIRECTION.FORWARD, refresh : boolean = false, callback: (processedTXCount : number, foundTXCount : number, depth : number) => void = () => {}) : Promise<string[]> {
    return new Promise<string[]>( async (resolve, reject) => {
        //Variables
        let nextAddressesToQuery : string[] = [addr];
        let endPoints : string[] = [];
        let depth = 0;
        let processedTXCount = 0;

        //Keep querying until max depth or end found
        while(nextAddressesToQuery.length && depth < maxQueryDepth) {
            const addressesToQuery = [...nextAddressesToQuery];
            nextAddressesToQuery = [];
            let addrPromises : Promise<void>[] = [];
            let bundlePromises : Promise<void>[] = [];

            //Loop over all addresses
            for(let i=0; i < addressesToQuery.length; i++) {
                //Query the Addresses
                addrPromises.push(AddressManager.GetInstance().AddAddress(addressesToQuery[i], refresh, queryDirection)
                .then(async (newBundles : string[]) => {
                    if(!newBundles.length) {
                        endPoints.push(addressesToQuery[i]);
                    } else {
                        bundlePromises.push(QueryBundles(newBundles, queryDirection, undefined, refresh)
                        .then((nextAddresses : string[]) => {
                            nextAddressesToQuery = nextAddressesToQuery.concat(nextAddresses);
                        })
                        .catch((err : Error) => { console.log("Top Bundle Error: "+err); reject(); }));
                    }
                })           
                .catch((err : Error) => { console.log("Top Address Error: " +err); reject(); }));
                }
                //Wait for all Addresses to finish
                await Promise.all(addrPromises);
                await Promise.all(bundlePromises);

            //Increment Depth
            processedTXCount += addressesToQuery.length;
            depth++;
            if(depth == maxQueryDepth) {
                endPoints = endPoints.concat(addressesToQuery);
            }

            //Report intermediate
            callback(processedTXCount, processedTXCount + nextAddressesToQuery.length, depth);
        }
        resolve(endPoints);
    });
}

export async function QueryBundles(bundles : string[], queryDirection : DIRECTION = DIRECTION.FORWARD, store : boolean = true, refresh : boolean = false) : Promise<string[]> {
    return new Promise<string[]>(async (resolve, reject) => {
        //Loop over the Bundles
        let nextAddressesToQuery : string[] = [];
        let bundlePromise : Promise<void>[] = [];
        for(let k = 0; k < bundles.length; k++) {
            //Query the Bundles
            bundlePromise.push(BundleManager.GetInstance().AddBundle(bundles[k], refresh, queryDirection, store)
            .then((addresses : string[]) => {
                nextAddressesToQuery = nextAddressesToQuery.concat(addresses);
            })
            .catch((err : Error) => reject(err)));
        }
        //Wait for all Bundles to finish
        await Promise.all(bundlePromise);

        //Filter out addresses already loaded before and duplicates - but only when we don't explore
        if(store) {
            nextAddressesToQuery = nextAddressesToQuery.filter((addr, index) => {
                return (AddressManager.GetInstance().GetAddressItem(nextAddressesToQuery[index])==undefined && nextAddressesToQuery.indexOf(addr) === index);
            });
        }
        resolve(nextAddressesToQuery);
    });
}

export async function Query(request : QueryRequest) : Promise<Transaction[]> {
    return new Promise<Transaction[]>(async (resolve, reject) => {
        for(let i=0; i < maxTryCount; i++) {
            let provider = ProviderList[Math.floor(Math.random()*ProviderList.length)];
            let iota = composeAPI({provider : provider});
            try {
                let result = await _Query(request, iota);
                resolve(result);
                return;
            }
            catch(err) {
                console.log("Error caught for node "+provider+": " + err);
                console.log("Request: " + JSON.stringify(request));
            }
        }
        reject("Rejected request as MaxTryCount is reached");
    });
}

async function _Query(request : QueryRequest, iota : any) : Promise<Transaction[]> {
    return new Promise<Transaction[]>((resolve, reject) => {
        iota.findTransactionObjects(request)
        .then((result : Transaction[]) => {
            resolve(result);
        })
        .catch((err : Error) => {
            reject(err);
        });
    });
}

export async function GetInclusionStates(transactions : string[]) : Promise<boolean[]> {
    return new Promise<boolean[]>(async (resolve, reject) => {
        for(let i=0; i < maxTryCount; i++) {
            let provider = ProviderList[Math.floor(Math.random()*ProviderList.length)];
            let iota = composeAPI({provider : provider});
            try {
                let result = await _GetInclusionStates(transactions, iota);
                resolve(result);
                return;
            }
            catch(err) {
                console.log("Error caught for node "+provider+" : " + err);
            }
        }
        reject("Rejected request as MaxTryCount is reached");
    });
}

async function _GetInclusionStates(transactions : string[], iota : any) : Promise<boolean[]> {
    return new Promise<boolean[]>(async (resolve, reject) => {
        iota.getLatestInclusion(transactions)
        .then((result : boolean[]) => {
            resolve(result);
        })
        .catch((err : Error) => {
            reject(err);
        });
    });
}

export async function getReceivingAddress(transactions : string) : Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
        for(let i=0; i < maxTryCount; i++) {
            let provider = ProviderList[Math.floor(Math.random()*ProviderList.length)];
            let iota = composeAPI({provider : provider});
            try {
                let result = await iota.getTransactionObjects(<readonly string[]>[transactions]);
                resolve(result[0].address);
                return;
            }
            catch(err) {
                console.log("Error caught for node "+provider+" : " + err);
            }
        }
        reject("Rejected request as MaxTryCount is reached");
    });
}

export async function getBundleHashFromTransaction(transactions : string) : Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
            let provider = ProviderList[Math.floor(Math.random()*ProviderList.length)];
            let iota = composeAPI({provider : provider});
            try {
                let result = await iota.getTransactionObjects(<readonly string[]>[transactions]);
                resolve(result[0].bundle);
                return;
            }
            catch(err) {
                console.log("Error caught for node "+provider+" : " + err);
            }
                reject("Rejected request as MaxTryCount is reached");
    });
}