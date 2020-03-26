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

type AddressHash = string;
type BundleHash = string;
type TransactionHash = string;

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

//TODO: REMOVE
async function _tmpQueryAddress(addr : string) {
    let promises : Promise<string[]>[] = [];
    promises.push(NestedAddress(addr));
    while(promises.length) {
        let returnedPromiseValue = await Promise.race(promises).catch((err: Error) => console.log("Top Error:" +err));
        if(returnedPromiseValue != undefined) {
            for(let i=0; i < returnedPromiseValue.length; i++) {
                promises.push(NestedAddress(returnedPromiseValue[i]));
            }
        }
    }
}

async function NestedAddress(addr : string) : Promise<string[]> {
    return new Promise<string[]>(() =>{

    });
}

//TODO: Revalidate the need for store?
/**
 * Queries a Bundle and returns a promise for all the addresses in the query direction.
 * @param bundle Bundlehash to be queried
 * @param queryDirection The direction in time for which the query is done
 * @param store Explore the bundle. This doesn't put any results in the managers, just verifies if the bundle exists. 
 * @param refresh Query again, even if the data has previously been queried to make sure it is up-to-date.  
 */
async function QueryNestedBundle(bundle : BundleHash, queryDirection : DIRECTION, store : boolean, refresh : boolean) : Promise<AddressHash[]> {
    return new Promise<AddressHash[]>((resolve, reject) => {
        console.log("Started Bundle " + bundle);
        BundleManager.GetInstance().AddBundle(bundle, refresh, queryDirection, store)
        .then((addresses : AddressHash[]) => {
            //Filter out addresses already loaded before and duplicates - but only when we don't explore
            if(store) {
                addresses = addresses.filter((addr, index) => {
                    return (AddressManager.GetInstance().GetAddressItem(addresses[index])==undefined && addresses.indexOf(addr) === index);
                });
            }
            resolve(addresses);
        })
        .catch((err : Error) => reject(err));
    });
}

/**
 * Queries an array of bundles and returns an array of promises of an array of addresses. In short it promises all addresses in the query direction of all the bundles in an array. 
 * @param bundles Array of bundlehashes to be queried
 * @param queryDirection The direction in time for which the query is done
 * @param store Explore the bundles. This doesn't put any results in the managers, just verifies if the bundle exists. 
 * @param refresh Query again, even if the data has previously been queried to make sure it is up-to-date.  
 */
export function QueryNestedBundles(bundles : BundleHash[], queryDirection : DIRECTION = DIRECTION.FORWARD, store : boolean = true, refresh : boolean = false) : Promise<AddressHash[]>[] {
    //Loop over the Bundles
    let bundlePromises : Promise<AddressHash[]>[] = [];
    for(let k = 0; k < bundles.length; k++) {
        //Query the Bundles
        bundlePromises.push(QueryNestedBundle(bundles[k], queryDirection, store, refresh ));
    }
    //Return all promises
    return bundlePromises;
}

/**
 * Queries an address and returns a promise for all the addresses in the query direction. This is a promise for an array of promises for an array of addresses. 
 * @param addr The address to be queried
 * @param queryDirection The direction in time for which the query is done
 * @param refresh Query again, even if the data has previously been queried to make sure it is up-to-date.  
 * @param callback Callback function to provide updates on the amount of transactions tracked. 
 * @param currentDepth 
 */
async function QueryNestedAddress(addr : AddressHash, queryDirection : DIRECTION, refresh : boolean, callback: (processedTXCount : number, foundTXCount : number, depth: number) => void, currentDepth : number) : Promise<Promise<AddressHash[]>[]> {
    return new Promise<Promise<AddressHash[]>[]>( async (resolve, reject) => {
        console.log("Started Addr " + addr);
        AddressManager.GetInstance().AddAddress(addr, refresh, queryDirection)
        .then(async (newBundles : string[]) => {
            if(newBundles.length) {
                resolve( QueryNestedBundles(newBundles, queryDirection, undefined, refresh));
            } else {
                resolve( [] );
            }
        })           
        .catch((err : Error) => { console.log("Top Address Error: " +err); reject(); });
    });
}

export async function QueryNestedAddresses(addresses : AddressHash[], queryDirection : DIRECTION, refresh : boolean, callback: (processedTXCount : number, foundTXCount : number, depth: number) => void, currentDepth : number) : Promise<AddressHash[]> {
    return new Promise<AddressHash[]> (async (resolve, reject) => {
        let promises : Promise<AddressHash[]>[] = [];
        let promisesOfPromises : Promise<number|void>[] = [];
        let addressesInQueue : string[] = [];
        

        //Local functions
        let QueryNextAddress = async function(addresses : string[]) {
            //Promise.ALL before return and trace those in seperate array
            addressesInQueue = addressesInQueue.concat(addresses);

            for(let i=0; i < addresses.length; i++) {
                let prom = new Promise<number>((resolve, reject) => {
                    QueryNestedAddress(addresses[i], queryDirection, refresh, callback, 0).then((result : Promise<AddressHash[]>[]) => {
                        //All promises from the bundles to give addresses
                        for(let k=0; k < result.length; k++) {
                            promises.push(result[k]);
                            addressesInQueue.splice(addressesInQueue.indexOf(addresses[i]), 1);
                            
                            /*promises.push(<Promise<AddressHash[]>>result[k].then((newAddrs : AddressHash[]) => {
                                return () => new Promise<AddressHash[]>((inner_resolve) => {
                                    setTimeout(() => inner_resolve(newAddrs))
                                });
                            }));*/
                        }
                        resolve(result.length);
                    }).catch((err : Error) => console.log("Top Error: " + err));
                }).then((count : number) => {
                    console.log("Prom of Prom finished: " + addresses[i] + "with " + count);
                    let index = promisesOfPromises.indexOf(prom);
                    promisesOfPromises.splice(index, 1);
                })
                promisesOfPromises.push(prom);
            }
        }

        //Populate the first array of promises
        QueryNextAddress(addresses);
        
        while(promises.length || promisesOfPromises.length) {
            console.log("Prom " + promises.length);
            console.log("PromOfProm" + promisesOfPromises.length);
            if(promises.length == 0) {
                await Promise.race(promisesOfPromises);
                console.log("Awaiting finished, program can continue");
                continue;
            }

            //Race the promises until we have a winner. The map allows us to find a way to remove the promise from the array
            const { result, idx } = await Promise.race(
                promises.map((promise, idx) => promise.then((result) => {
                    return { result, idx };
                }))
            );
            //Remove promise from the race as it is completed
            promises = promises.filter((_, i) => i !== idx);

            //Query more addresses
            if(result !== undefined) {
                QueryNextAddress(result);
            }
        }
        resolve();
    });
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