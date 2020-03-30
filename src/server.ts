import { Server } from "http";
import SocketIO from "socket.io";
import { zmqUnsubscribe } from "./Routes/zmqUnsubscribe";
import { ZmqService } from "./Services/zmqService";
import { ApiClient } from "./Services/apiClient";

import { ServiceFactory } from "./Factories/serviceFactory";
import { zmqSubscribeAddress } from "./Routes/zmqSubscribeAddress";
import { zmqConfig, port, domain} from "./settings-default"


ServiceFactory.register("zmq", () => new ZmqService(zmqConfig.zmq));
ServiceFactory.register("api", () => new ApiClient(domain));

const server = new Server();
const socketServer = SocketIO(server).listen(port);

socketServer.on("connection", (socket) => {
    socket.on("unsubscribe", (data) => socket.emit("unsubscribe", zmqUnsubscribe(zmqConfig, socket, data)));
    socket.on("subscribeAddress",(data) => socket.emit("subscribeAddress", zmqSubscribeAddress(zmqConfig, socket, data)));
});

