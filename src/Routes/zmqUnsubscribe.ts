import SocketIO from "socket.io";
import { ServiceFactory } from "../Factories/serviceFactory";
import { IResponse } from "../models/api/IResponse";
import { IZmqUnsubscribeRequest } from "../models/api/IZmqUnsubscribeRequest";
import { IConfiguration } from "../models/IConfiguration";
import { ZmqService } from "../Services/zmqService";

/**
 * Unsubscribe from zmq events.
 * @param config The configuration.
 * @param socket The websocket.
 * @param request The request.
 * @returns The response.
 */
export function zmqUnsubscribe(config: IConfiguration, socket: SocketIO.Socket, request: IZmqUnsubscribeRequest): IResponse {
    let response: IResponse;

    try {
        if (request.subscriptionIds && request.subscriptionIds.length > 0) {
            const zmqService = ServiceFactory.get<ZmqService>("zmq");


            for (let i = 0; i < request.subscriptionIds.length; i++) {
                zmqService.unsubscribe(request.subscriptionIds[i]);
            }
        }

        response = {
            success: true,
            message: ""
        };
    } catch (err) {
        response = {
            success: false,
            message: err.toString()
        };
    }

    return response;
}
