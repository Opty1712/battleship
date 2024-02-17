import {
  addUser,
  addUserToRoom,
  createRoom,
  getWaitingRooms,
} from "./gameActions";
import { IncomingMessage, OutgoingQueue } from "./types";
import { parseMessage } from "./utils";

const outgoingCommands = {
  reg: "s c",
  update_winners: "c",
  create_game: "c",
  update_room: "c",
  start_game: "c",
  attack: "s c",
  turn: "c",
  finish: "c",
};

const command = (wsId: number, message: IncomingMessage) => {
  const queue: OutgoingQueue = [];

  switch (message.type) {
    case "reg": {
      const player = addUser(wsId, message.data.name);

      queue.push({
        message: {
          type: "reg",
          data: {
            name: message.data.name,
            index: player,
            error: false,
            errorText: "",
          },
        },
        sendToAll: false,
      });

      queue.push({
        message: {
          type: "update_room",
          data: getWaitingRooms(),
        },
        sendToAll: false,
      });

      return queue;
    }

    case "create_room": {
      const roomId = createRoom();

      queue.push({
        message: {
          type: "update_room",
          data: [{ roomId, roomUsers: [] }],
        },
        sendToAll: false,
      });

      return queue;
    }

    case "add_user_to_room": {
      addUserToRoom(wsId, message.data.indexRoom);

      queue.push({
        message: {
          type: "update_room",
          data: getWaitingRooms(),
        },
        sendToAll: false,
      });

      return queue;
    }
  }

  // add_user_to_room: "s",
  // add_ships: "s",
  // attack: "s c",
  // randomAttack: "s",
};

export const reactOnMessage = (wsId: number, received: string) => {
  const message = parseMessage(received);

  try {
    if (message) {
      return command(wsId, message);
    } else {
      console.error(`No command found in ${received}`);
    }
  } catch {
    console.error(`Can't parse command ${received}`);
  }
};
