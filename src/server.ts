import { Server } from "http";
import SocketIO from "socket.io";
import { zmqUnsubscribe } from "./routes/zmqUnsubscribe";
import { ZmqService } from "./Services/zmqService";


import { ServiceFactory } from "./Factories/serviceFactory";
import { zmqSubscribeAddress } from "./routes/zmqSubscribeAddress";
import { zmqConfig, port } from "./settings-default"


ServiceFactory.register("zmq", () => new ZmqService(zmqConfig.zmq));

const server = new Server();
const socketServer = SocketIO(server).listen(port);

socketServer.on("connection", (socket) => {
    socket.on("unsubscribe", (data) => socket.emit("unsubscribe", zmqUnsubscribe(zmqConfig, socket, data)));
    socket.on("subscribeAddress",(data) => socket.emit("subscribeAddress", zmqSubscribeAddress(zmqConfig, socket, data)));
});

