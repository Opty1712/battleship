import {
  checkIsStartingGame,
  getEnemyIdFromGame,
  getUserInGame,
  initUserInGame,
} from "../game";
import {
  IncomingVariants,
  OutgoingQueue,
  OutgoingQueueMessage,
} from "../types";

export const handleAddShips = (
  playerID: number,
  message: IncomingVariants["add_ships"]
) => {
  const queue: OutgoingQueue = [];

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
};
