import { IZmqConfiguration } from "./IZmqConfiguration";

/**
 * Definition of configuration file.
 */
export interface IConfiguration {
    /**
     * The configuration for zmq endpoint.
     */
    zmq: IZmqConfiguration;
}
