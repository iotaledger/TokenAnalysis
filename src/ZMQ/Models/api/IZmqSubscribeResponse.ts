import { IResponse } from "./IResponse";

export interface IZmqSubscribeResponse extends IResponse {
    /**
     * The subscription ids created.
     */
    subscriptionIds?: string[];
}
