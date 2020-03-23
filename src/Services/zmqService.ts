
import zmq from "zeromq";
import { IZmqConfiguration } from "../Models/IZmqConfiguration";
import { IAddress } from "../Models/zmqService/IAddress";
import { ZmqEvent } from "../Models/zmqService/zmqEvents";
import { v4 as uuid } from 'uuid';

/**
 * Class to handle ZMQ service.
 */
export class ZmqService {
    /**
     * The configuration for the service.
     */
    private readonly _config: IZmqConfiguration;

    /**
     * The connected socket.
     */
    private _socket?: zmq.Socket;

    /**
     * The callback for different events.
     */
    private readonly _subscriptions: {
        [event: string]: {
            /**
             * The id of the subscription.
             */
            id: string;
            /**
             * The callback for the subscription.
             * @param event The event for the subscription.
             * @param data The data for the event.
             */
            callback(event: string, data: any): void;
        }[];
    };

    /**
     * Create a new instance of ZmqService.
     * @param config The gateway for the zmq service.
     */
    constructor(config: IZmqConfiguration) {
        this._config = config;
        this._subscriptions = {};
    }


    /**
     * Subscribe to a specific event.
     * @param event The event to subscribe to.
     * @param callback The callback to call with data for the event.
     * @returns An id to use for unsubscribe.
     */
    public subscribeEvent(event: ZmqEvent, callback: (event: string, data: any) => void): string {
        return this.internalAddEventCallback(event, callback);
    }

    /**
     * Subscribe to address messages.
     * @param address The address to watch.
     * @param callback Callback to call with address data.
     * @returns An id to use for unsubscribe.
     */
    public subscribeAddress(address: string, callback: (event: string, data: IAddress) => void): string {
        if (!/^[A-Z9]{81}$/.test(address)) {
            throw new Error(`The parameter 'address' must be 81 trytes.`);
        }
        return this.internalAddEventCallback(address, callback);
    }

    /**
     * Unsubscribe from an event.
     * @param subscriptionId The id to unsubscribe.
     */
    public unsubscribe(subscriptionId: string): void {
        const keys = Object.keys(this._subscriptions);
        for (let i = 0; i < keys.length; i++) {
            const eventKey = keys[i];
            for (let j = 0; j < this._subscriptions[eventKey].length; j++) {
                if (this._subscriptions[eventKey][j].id === subscriptionId) {
                    this._subscriptions[eventKey].splice(j, 1);
                    if (this._subscriptions[eventKey].length === 0) {
                        if (this._socket){
                        this._socket.unsubscribe(eventKey);
                        }

                        delete this._subscriptions[eventKey];
                        if (Object.keys(this._subscriptions).length === 0) {
                            this.disconnect();
                        }
                    }
                    console.log("SubIds after unsubscribe", this._subscriptions)
                    return;
                }
            }
        }
    }

    /**
     * Connect the ZMQ service.
     */
    private connect(): void {
        try {
            if (!this._socket) {
                this._socket = zmq.socket("sub");
                this._socket.connect(this._config.endpoint);
                this._socket.on("message", (msg) => this.handleMessage(msg));

                const keys = Object.keys(this._subscriptions);
                for (let i = 0; i < keys.length; i++) {
                    this._socket.subscribe(keys[i]);
                }
            }
        } catch (err) {
            throw new Error(`Unable to connect to ZMQ.\n${err}`);
        }
    }

    /**
     * Disconnect the ZQM service.
     */
    private disconnect(): void {
        if (this._socket) {
            this._socket.close();
            this._socket = undefined;
        }
    }

    /**
     * Add a callback for the event.
     * @param event The event to add the callback for.
     * @param callback The callback to store for the event.
     * @returns The id of the subscription.
     */
    private internalAddEventCallback(event: string, callback: (event: string, data: any) => void): string {
        if (!this._subscriptions[event]) {
            this._subscriptions[event] = [];
            if (this._socket) {
                this._socket.subscribe(event);
            }
        }
        const id = uuid();
        this._subscriptions[event].push({ id, callback });

        this.connect();
        console.log("Connection ID", this._subscriptions)
        return id;
    }

    /**
     * Handle a message and send to any callbacks.
     * @param message The message to handle.
     */
    private handleMessage(message: Buffer): void {
        console.log("Message")
        const messageContent = message.toString();
        const messageParams = messageContent.split(" ");

        const event = messageParams[0];

        if (this._subscriptions[event]) {
            let data;
                    if (/^[A-Z9]{81}$/.test(event)) {
                        console.log("dd", messageParams)
                        data = <IAddress>{
                            address: messageParams[0],
                            transaction: messageParams[1],
                            milestoneIndex: parseInt(messageParams[2], 10)
                        };
                    }


            for (let i = 0; i < this._subscriptions[event].length; i++) {
                this._subscriptions[event][i].callback(event, data);
            }
        }
    }
}