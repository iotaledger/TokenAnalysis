import io from "socket.io-client";
import { IResponse } from "./../Models/api/IResponse";
import { IZmqSubscribeResponse } from "./../Models/api/IZmqSubscribeResponse";
import { IZmqSubscriptionMessage } from "./../Models/api/IZmqSubscriptionMessage";
import { IZmqUnsubscribeRequest } from "./../Models/api/IZmqUnsubscribeRequest";
import { IZmqSubscribeAddressRequest } from "./../Models/api/IZmqSubscribeAddressRequest";

/**
 * Class to handle api communications.
 */
export class ApiClient {
    /**
     * The endpoint for performing communications.
     */
    private readonly _endpoint: string;

    /**
     * The web socket to communicate on.
     */
    private readonly _socket: any;
    //SocketIOClient.Socket;

    /**
     * Create a new instance of ApiClient.
     * @param endpoint The endpoint for the api.
     */
    constructor(endpoint: string) {
        this._endpoint = endpoint;
        this._socket = io(this._endpoint);

    }

    /**
     * Perform a request to unsubscribe to zmq events.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async zmqUnsubscribe(request: IZmqUnsubscribeRequest): Promise<IResponse> {
        return new Promise<IResponse>((resolve, reject) => {
            try {
                this._socket.emit("unsubscribe", request);
                this._socket.on("unsubscribe", (subscribeResponse: IResponse) => {
                    resolve(subscribeResponse);
                });
            } catch (err) {
                resolve({
                    success: false,
                    message: `There was a problem communicating with the API.\n${err}`
                });
            }
        });
    }

    /**
     * Perform a request to subscribe to a certain address.
     * @param request The request to send.
     * @param callback Callback called with zmq data.
     * @returns The response from the request.
     */
    public async zmqSubscribeAddress(request: IZmqSubscribeAddressRequest, callback: (event: string, data: any) => void): Promise<IZmqSubscribeResponse> {
        return new Promise<IZmqSubscribeResponse>((resolve, reject) => {
            try {
                //subscribe to ZMQ messages
                this._socket.emit("subscribeAddress", request);
                this._socket.on("subscribeAddress", (subscribeResponse: IZmqSubscribeResponse) => {
                    resolve(subscribeResponse);
                });
                this._socket.on("zmq", (zmqResponse: IZmqSubscriptionMessage ) => {
                    callback(zmqResponse.event, zmqResponse.data);
                });
            } catch (err) {
                resolve({
                    success: false,
                    message: `There was a problem communicating with the API.\n${err}`
                });
            }
        });
    }
}