import { botPlayerId, botShips, createGameWithBot } from "../game";
import { OutgoingQueue, OutgoingQueueMessage } from "../types";
import { handleAddShips } from "./addShips";

export const handleSinglePlay = (playerID: number) => {
  const queue: OutgoingQueue = [];
  const idGame = createGameWithBot(playerID);

  const gameCreationMessage: OutgoingQueueMessage = {
    message: {
      type: "create_game",
      data: {
        idGame,
        idPlayer: playerID,
      },
    },
    sendToPlayers: [playerID],
  };

  const shipsQueue = handleAddShips(botPlayerId, {
    type: "add_ships",
    data: {
      gameId: idGame,
      ships: botShips,
      indexPlayer: 0,
    },
  });

  queue.push(gameCreationMessage, ...shipsQueue);

  return queue;
};
