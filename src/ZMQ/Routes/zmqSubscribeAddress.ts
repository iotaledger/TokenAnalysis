import SocketIO from "socket.io";
import { ServiceFactory } from "../Factories/serviceFactory";
import { IZmqSubscribeResponse } from "../Models/api/IZmqSubscribeResponse";
import { IZmqSubscriptionMessage } from "../Models/api/IZmqSubscriptionMessage";
import { IConfiguration } from "../Models/IConfiguration";
import { ZmqService } from "../Services/zmqService";
import { IZmqSubscribeAddressRequest } from "../Models/api/IZmqSubscribeAddressRequest";

/**
 * Unsubscribe from zmq events.
 * @param config The configuration.
 * @param socket The websocket.
 * @param request The request.
 * @returns The response.
 */
export function zmqSubscribeAddress(config: IConfiguration, socket: SocketIO.Socket, request: IZmqSubscribeAddressRequest): IZmqSubscribeResponse {
    let response: IZmqSubscribeResponse;

    try {
        const subscriptionIds = [];

        if (request.address && request.address.length > 0) {
            const zmqService = ServiceFactory.get<ZmqService>("zmq");

            for (let i = 0; i < request.address.length; i++) {
                const subscriptionId = zmqService.subscribeAddress(request.address[i], (event, zmqData) => {
                    socket.emit("zmq", <IZmqSubscriptionMessage>{
                        event,
                        data: zmqData
                    });
                });
                subscriptionIds.push(subscriptionId);
            }
        }

        response = {
            success: true,
            message: "",
            subscriptionIds
        };
    } catch (err) {
        response = {
            success: false,
            message: err.toString()
        };
    }

    return response;
}

