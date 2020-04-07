import { ZmqEvent } from "../zmqService/zmqEvents";

export interface IZmqSubscribeRequest {
    /**
     * The events to subscribe to.
     */
    events: ZmqEvent[];
}
