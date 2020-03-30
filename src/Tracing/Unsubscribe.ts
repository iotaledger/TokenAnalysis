import { ServiceFactory } from "../Factories/serviceFactory";
import { ApiClient } from '../Services/apiClient';


export const unsubscribe: any = async (subscriptionId: string[]) => {
    const apiClient = ServiceFactory.get<ApiClient>("api");
    const response = await apiClient.zmqUnsubscribe(
        {
            subscriptionIds: subscriptionId
        });
    if (response.success) {
        console.log("Successfully unfollowed " + subscriptionId)
    }

}