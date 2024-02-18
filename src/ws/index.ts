import { WebSocketServer } from "ws";
import { reactOnMessage } from "./commands";
import { FixedWebSocket, OutgoingMessage } from "./types";
import { stringify } from "./utils";

let playerID = 1;

export const createWSServer = (port: number) => {
  const wsServer = new WebSocketServer({ port });

  wsServer.on("connection", (ws: FixedWebSocket) => {
    ws.id = playerID++;
    ws.on("error", console.error);

    ws.on("message", (data) => {
      const queue = reactOnMessage(ws.id, data.toString()) || [];

      queue.forEach((item) => {
        sendToAll(item.message, item.sendToPlayers);
      });
    });

    ws.send(JSON.stringify({ message: "welcome" }));
  });

  const sendToAll = (message: OutgoingMessage, playerIds?: Array<number>) => {
    wsServer.clients.forEach((client: FixedWebSocket) => {
      const isSending = !playerIds || playerIds.includes(client.id);

      if (isSending) {
        client.send(stringify(message));
      }
    });
  };

  console.log(`WS Server has started on port ${port}!`);
};
