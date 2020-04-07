export interface IZmqSubscriptionMessage {
    /**
     * The event.
     */
    event: string;

    /**
     * The event data.
     */
    data: any;
}
