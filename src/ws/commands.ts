import {
  addUser,
  addUserToGame,
  addUserToRoom,
  checkIsStartingGame,
  createGame,
  createRoom,
  getUsersFromRoom,
  getWaitingRooms,
} from "./gameActions";
import { IncomingMessage, OutgoingQueue, OutgoingQueueMessage } from "./types";
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
      const regMessage: OutgoingQueueMessage = {
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
      };

      const updatingRoomMessage: OutgoingQueueMessage = {
        message: {
          type: "update_room",
          data: getWaitingRooms(),
        },
        sendToAll: false,
      };

      queue.push(regMessage, updatingRoomMessage);

      return queue;
    }

    case "create_room": {
      const roomId = createRoom();

      const updatingRoomMessage: OutgoingQueueMessage = {
        message: {
          type: "update_room",
          data: [{ roomId, roomUsers: [] }],
        },
        sendToAll: true,
      };

      queue.push(updatingRoomMessage);

      return queue;
    }

    case "add_user_to_room": {
      addUserToRoom(wsId, message.data.indexRoom);

      const updatingRoomMessage: OutgoingQueueMessage = {
        message: {
          type: "update_room",
          data: getWaitingRooms(),
        },
        sendToAll: true,
      };

      queue.push(updatingRoomMessage);

      const users = getUsersFromRoom(message.data.indexRoom);
      const isCreatingGame = users.length === 2;

      if (isCreatingGame) {
        const idGame = createGame();

        const gameCreationMessage: OutgoingQueueMessage = {
          message: {
            type: "create_game",
            data: {
              idGame,
              idPlayer: wsId,
            },
          },
          sendToAll: true,
        };

        queue.push(gameCreationMessage);
      }

      return queue;
    }

    case "add_ships": {
      addUserToGame(wsId, message.data.gameId, message.data.ships);

      const isStartingGame = checkIsStartingGame(message.data.gameId);

      if (isStartingGame) {
        const startGameMessage: OutgoingQueueMessage = {
          message: {
            type: "start_game",
            data: { currentPlayerIndex: wsId, ships: message.data.ships },
          },
          sendToAll: true,
        };

        queue.push(startGameMessage);
      }

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
