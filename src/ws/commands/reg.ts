import { addUser, getWaitingRooms, getWinners } from "../game";
import {
  IncomingVariants,
  OutgoingQueue,
  OutgoingQueueMessage,
} from "../types";

export const handleReg = (
  playerID: number,
  message: IncomingVariants["reg"]
) => {
  const queue: OutgoingQueue = [];
  const player = addUser(playerID, message.data.name, message.data.password);

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
};
