import {
  addUser,
  addUserToRoom,
  checkIsStartingGame,
  createGame,
  createRoom,
  deleteRoom,
  getEnemyIdFromGame,
  getEnemyIdFromRoom,
  getUserInGame,
  getUsersFromRoom,
  getWaitingRooms,
  getWinners,
  initUserInGame,
  makeAttack,
} from "./game";
import { IncomingMessage, OutgoingQueue, OutgoingQueueMessage } from "./types";
import { getRandomInRange, parseMessage } from "./utils";

const command = (playerID: number, message: IncomingMessage) => {
  const queue: OutgoingQueue = [];

  switch (message.type) {
    case "reg": {
      const player = addUser(
        playerID,
        message.data.name,
        message.data.password
      );

      if (typeof player === "number") {
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
          sendToPlayers: [playerID],
        };

        const updatingRoomMessage: OutgoingQueueMessage = {
          message: {
            type: "update_room",
            data: getWaitingRooms(),
          },
        };

        const winnersMessage: OutgoingQueueMessage = {
          message: {
            type: "update_winners",
            data: getWinners(),
          },
        };

        queue.push(regMessage, updatingRoomMessage, winnersMessage);

        return queue;
      }
    }

    case "create_room": {
      createRoom();

      const updatingRoomMessage: OutgoingQueueMessage = {
        message: {
          type: "update_room",
          data: getWaitingRooms(),
        },
      };

      queue.push(updatingRoomMessage);

      return queue;
    }

    case "add_user_to_room": {
      addUserToRoom(playerID, message.data.indexRoom);

      const updatingRoomMessage: OutgoingQueueMessage = {
        message: {
          type: "update_room",
          data: getWaitingRooms(),
        },
      };

      queue.push(updatingRoomMessage);

      const users = getUsersFromRoom(message.data.indexRoom);
      const isCreatingGame = users.length === 2;

      if (isCreatingGame) {
        const idGame = createGame();
        const enemyId = getEnemyIdFromRoom(message.data.indexRoom, playerID);
        deleteRoom(message.data.indexRoom);

        const gameCreationUser1Message: OutgoingQueueMessage = {
          message: {
            type: "create_game",
            data: {
              idGame,
              idPlayer: playerID,
            },
          },
          sendToPlayers: [playerID],
        };

        const gameCreationUser2Message: OutgoingQueueMessage = {
          message: {
            type: "create_game",
            data: {
              idGame,
              idPlayer: enemyId,
            },
          },
          sendToPlayers: [enemyId],
        };

        queue.push(gameCreationUser1Message, gameCreationUser2Message);
      }

      return queue;
    }

    case "add_ships": {
      initUserInGame(playerID, message.data.gameId, message.data.ships);
      const isStartingGame = checkIsStartingGame(message.data.gameId);

      if (isStartingGame) {
        const users = getUserInGame(message.data.gameId);

        const startUser1Message: OutgoingQueueMessage = {
          message: {
            type: "start_game",
            data: { currentPlayerIndex: playerID, ships: message.data.ships },
          },
          sendToPlayers: [playerID],
        };

        const enemyId = getEnemyIdFromGame(message.data.gameId, playerID);

        const startUser2Message: OutgoingQueueMessage = {
          message: {
            type: "start_game",
            data: {
              currentPlayerIndex: enemyId,
              ships: message.data.ships,
            },
          },
          sendToPlayers: [enemyId],
        };

        const startingUser = Math.random() > 0.5 ? users[0] : users[1];

        const turnMessage: OutgoingQueueMessage = {
          message: {
            type: "turn",
            data: { currentPlayer: startingUser },
          },
          sendToPlayers: [enemyId, playerID],
        };

        queue.push(startUser1Message, startUser2Message, turnMessage);
      }

      return queue;
    }

    case "attack":
    case "randomAttack": {
      const x =
        message.type === "attack" ? message.data.x : getRandomInRange(0, 9);
      const y =
        message.type === "attack" ? message.data.y : getRandomInRange(0, 9);

      const { isGameFinished, status } = makeAttack({
        gameId: message.data.gameId,
        x,
        y,
        playerID,
      });

      const enemyId = getEnemyIdFromGame(message.data.gameId, playerID);

      const attackStatusMessage: OutgoingQueueMessage = {
        message: {
          type: "attack",
          data: {
            currentPlayer: playerID,
            status,
            position: { x, y },
          },
        },
        sendToPlayers: [playerID, enemyId],
      };

      queue.push(attackStatusMessage);

      const nextPlayer = status === "miss" ? enemyId : playerID;

      if (isGameFinished) {
        const finishMessage: OutgoingQueueMessage = {
          message: {
            type: "finish",
            data: { winPlayer: playerID },
          },
          sendToPlayers: [enemyId, playerID],
        };

        const winnersMessage: OutgoingQueueMessage = {
          message: {
            type: "update_winners",
            data: getWinners(),
          },
        };

        queue.push(finishMessage, winnersMessage);
      } else {
        const turnMessage: OutgoingQueueMessage = {
          message: {
            type: "turn",
            data: { currentPlayer: nextPlayer },
          },
          sendToPlayers: [enemyId, playerID],
        };

        queue.push(turnMessage);
      }

      return queue;
    }
  }
};

export const reactOnMessage = (wsId: number, received: string) => {
  const message = parseMessage(received);

  try {
    if (message) {
      return command(wsId, message);
    } else {
      console.error(`No command found in ${received}`);
    }
  } catch (e) {
    console.log(`Running command failed: ${received}`);
    console.error(e);
  }
};
