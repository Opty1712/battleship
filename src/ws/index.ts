import { WebSocketServer } from "ws";
import { reactOnMessage } from "./commands";
import { FixedWebSocket, OutgoingMessage } from "./types";
import { stringify } from "./utils";

let wsID = 0;

export const createWSServer = (port: number) => {
  const wsServer = new WebSocketServer({ port });

  wsServer.on("connection", (ws: FixedWebSocket) => {
    ws.id = wsID++;
    ws.on("error", console.error);

    ws.on("message", (data) => {
      const queue = reactOnMessage(ws.id, data.toString()) || [];

      queue.forEach((item) => {
        if (item.sendToAll) {
          sendToAll(item.message);
        } else {
          ws.send(stringify(item.message));
        }
      });
    });

    ws.send(JSON.stringify({ message: "welcome" }));
  });

  const sendToAll = (message: OutgoingMessage) => {
    wsServer.clients.forEach((client) => {
      client.send(stringify(message));
    });
  };

  console.log(`WS Server has started on port ${port}!`);
};
