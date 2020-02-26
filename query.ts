import { maxTryCount, ProviderList } from "./settings";
import { composeAPI, Bundle, Transaction } from "@iota/core";
import {  } from "@iota/converter";

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

export async function getBundle(transactions : string) : Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
        for(let i=0; i < maxTryCount; i++) {
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
        }
        reject("Rejected request as MaxTryCount is reached");
    });
}