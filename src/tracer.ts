

import { ServiceFactory } from "./Factories/serviceFactory";
import { ApiClient } from './Services/apiClient';
import { domain } from './settings-default';
import {  getBundleHashFromTransaction, QueryBundles } from "./DataProcessing/query"
import { IAddress } from "./Models/zmqService/IAddress";



let subscriptions: { event: string, subscriptionId: string }[]= [];


const subscribe: any = async(address: string[]) => {

    ServiceFactory.register("api", () => new ApiClient(domain));
    const apiClient = ServiceFactory.get<ApiClient>("api");

    let previousBundle: string[] = []
    const response = await apiClient.zmqSubscribeAddress(
        {
            address: address
        },
        async (event: string, data: IAddress) => {
            console.log(event, data)
            const bundleHash: string = await getBundleHashFromTransaction(data.transaction.toString())
          //  console.log("New Bundle Hash", bundleHash)
            //console.log("n",previousBundle)
            if(!previousBundle.includes(bundleHash)){
            console.log("madeit")
            previousBundle.push(bundleHash) 
            const newAdress: string[] = await QueryBundles([bundleHash])

            //console.log("New Adress", newAdress)
            
            //Unsubscribe from Address
            if(bundleHash){
                const subID = subscriptions.find(o => o.event === event)
                if(subID){
                    unsubscribe([subID.subscriptionId])
                }
            }
            subscribe(newAdress)
        }
        });


if (response.subscriptionIds) {
    for (let i = 0; i < response.subscriptionIds.length; i++) {
        subscriptions.push({ event: address[i] , subscriptionId: response.subscriptionIds[i] });
    }
}

console.log("subscribed to:", subscriptions)

}

subscribe(['KVEHKJPUAXMPRHFSOOGOJDAYZBLYGHBUXGZEWZQFJGWFIMQLIE9LLNZBPPAHDRYUQPUYPDZ9GW9OEIPDD']);





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