import { Server } from "http";
import SocketIO from "socket.io";
import { zmqUnsubscribe } from "./Routes/zmqUnsubscribe";
import { ZmqService } from "./Services/zmqService";
import { ApiClient } from "./Services/apiClient";
import { ServiceFactory } from "./Factories/serviceFactory";
import { zmqSubscribeAddress } from "./Routes/zmqSubscribeAddress";
import { SettingsManager } from "./DataProcessing/SettingsManager";


ServiceFactory.register("zmq", () => new ZmqService( SettingsManager.GetInstance().GetZmqConfig().zmq ));
ServiceFactory.register("api", () => new ApiClient(`http://localhost:${SettingsManager.GetInstance().GetZmqPort()}`));

const server = new Server();
const socketServer = SocketIO(server).listen(SettingsManager.GetInstance().GetZmqPort());

socketServer.on("connection", (socket) => {
    socket.on("unsubscribe", (data) => socket.emit("unsubscribe", zmqUnsubscribe(SettingsManager.GetInstance().GetZmqConfig(), socket, data)));
    socket.on("subscribeAddress",(data) => socket.emit("subscribeAddress", zmqSubscribeAddress(SettingsManager.GetInstance().GetZmqConfig(), socket, data)));
});

