import {
  botPlayerId,
  getEnemyIdFromGame,
  getWinners,
  makeAttack,
} from "../game";
import {
  IncomingVariants,
  OutgoingQueue,
  OutgoingQueueMessage,
} from "../types";
import { getRandomInRange } from "../utils";

export const handleAttack = (
  playerID: number,
  message: IncomingVariants["attack"] | IncomingVariants["randomAttack"]
) => {
  const queue: OutgoingQueue = [];

  const handlePlayerAttack = (x: number, y: number, playerID: number) => {
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

      if (nextPlayer === botPlayerId) {
        handleRandomAttack(botPlayerId);
      }
    }
  };

  const handleRandomAttack = (playerID: number) => {
    const x = getRandomInRange(0, 9);
    const y = getRandomInRange(0, 9);
    handlePlayerAttack(x, y, playerID);
  };

  const isRandomAttack = message.type === "randomAttack";

  if (isRandomAttack) {
    handleRandomAttack(playerID);
  } else {
    handlePlayerAttack(message.data.x, message.data.y, playerID);
  }

  console.log(queue);
  return queue;
};
