

import { ServiceFactory } from "../Factories/serviceFactory";
import { ApiClient } from '../Services/apiClient';
import { domain } from '../settings-default';
import { getBundleHashFromTransaction, QueryAddress } from "../DataProcessing/query"
import { IAddress } from "../Models/zmqService/IAddress";
import { ISubscriptions } from "../Models/ISubscriptions";


let subscriptions: ISubscriptions[] = [];

export namespace Watchdog {

    export const monitor: any = async (address: string[]) => {

        const apiClient = ServiceFactory.get<ApiClient>("api");

        let previousEvent: string[] = []
        const response = await apiClient.zmqSubscribeAddress(
            {
                address: address
            },
            async (event: string, data: IAddress) => {
                // Process every bundle once
                if (!previousEvent.includes(event)) {
                    previousEvent.push(event)

                    const bundleHash: string = await getBundleHashFromTransaction(data.transaction.toString())
                    const newAdresses: string[] = await QueryAddress(event, 1)


                    //       const newAdress: string[] = await QueryBundles([bundleHash])

                    //Call function for graph 
                    Watchdog.monitor(newAdresses)

                    //Unsubscribe from previous Address
                    if (bundleHash) {
                        const subID = subscriptions.find(o => o.event === event)
                        if (subID) {
                            Watchdog.forget([subID.subscriptionId])
                        }
                    }
                }
            });
        if (response.subscriptionIds) {
            for (let i = 0; i < response.subscriptionIds.length; i++) {
                subscriptions.push({ event: address[i], subscriptionId: response.subscriptionIds[i] });
            }
        }
        console.log("subscribed to:", subscriptions)
    }


    export const forget: any = async (subscriptionId: string[]) => {
        const apiClient = ServiceFactory.get<ApiClient>("api");
        const response = await apiClient.zmqUnsubscribe(
            {
                subscriptionIds: subscriptionId
            });
        if (response.success) {
            console.log("Successfully unfollowed " + subscriptionId)
        }

    }

    export const forgetall: any = async () => {
        const apiClient = ServiceFactory.get<ApiClient>("api");

        for (let i = 0; i < subscriptions.length; i++) {

            const response = await apiClient.zmqUnsubscribe(
                {
                    subscriptionIds: [subscriptions[i].subscriptionId]
                });
            if (response.success) {
                console.log("Successfully unfollowed " + subscriptions[i].subscriptionId)
            }
        }

    }

}