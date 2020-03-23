//Base
export { Settings, RenderType, GraphToQuery } from "./DataProcessing/GraphToQuery";
export { GenerateGraph } from "./main";

//Data Structures
export { AddressManager } from "./Address/AddressManager";
export { Address } from "./Address/Address";
export { BundleManager } from "./Bundle/BundleManager";
export { Bundle } from "./Bundle/Bundle";
export { TransactionManager } from "./Transactions/TransactionManager";
export { Transaction } from "./Transactions/Transaction";

//Graphs
export { DatabaseManager } from "./DataProcessing/DatabaseManager";
export { GraphExporter } from "./DataProcessing/GraphExporter";
export { Graph } from "./Graph/Graph";
export { SubGraph } from "./Graph/SubGraph";
export { QueryAddress, QueryTransactions, QueryBundles, DIRECTION} from "./DataProcessing/query";


import { ServiceFactory } from "./Factories/serviceFactory";
import { ApiClient } from './Services/apiClient';
import { domain } from './settings-default';
import {  getBundleHashFromTransaction, QueryTransactions  } from "./DataProcessing/query"
import { IAddress } from "./models/zmqService/IAddress";



let subscriptions: { event: string, subscriptionId: string }[]= [];


const subscribe: any = async(address: string[]) => {

    ServiceFactory.register("api", () => new ApiClient(domain));
    const apiClient = ServiceFactory.get<ApiClient>("api");
    const response = await apiClient.zmqSubscribeAddress(
        {
            address: address
        },
        async (event: string, data: IAddress) => {
            console.log(event, data)
            const bundleHash: string = await getBundleHashFromTransaction(data.transaction.toString())
            console.log("New Bundle Hash", bundleHash)
            
            //Unsubscribe from Address
            if(bundleHash){
                const subID = subscriptions.find(o => o.event === event)
                if(subID){
                    unsubscribe([subID.subscriptionId])
                }
            }
        });


if (response.subscriptionIds) {
    for (let i = 0; i < response.subscriptionIds.length; i++) {
        subscriptions.push({ event: address[i] , subscriptionId: response.subscriptionIds[i] });
    }
}

console.log("subscribed to:", subscriptions)

}

subscribe(['U9MIJCOZMPMLFPNJPHDREWHPOULTZPJXTTTCVTHQUSVWFLRHSCNNWBAYWRRIQHCV9A9CMKXBGLVXNFTNB']);



subscribe(['U9MIJCOZMPMLFPNJPHDREWHPOULTZPJXTTTCVTHQUSVWFLRHSCNNWBAYWRRIQHCV9A9CMKXBGLVXNFTNB']);





const unsubscribe: any = async(subscriptionId: string[]) => {
    const apiClient = ServiceFactory.get<ApiClient>("api");
    const response = await apiClient.zmqUnsubscribe(
        {
            subscriptionIds: subscriptionId
        });

    console.log(response)

if (response.success) {
    console.log("Successfully unfollowed " + subscriptionId)
}

}
//findme()
