import { createRoom, getWaitingRooms } from "../game";
import { OutgoingQueue, OutgoingQueueMessage } from "../types";

export const handleCreateRoom = () => {
  const queue: OutgoingQueue = [];

  createRoom();

  const updatingRoomMessage: OutgoingQueueMessage = {
    message: {
      type: "update_room",
      data: getWaitingRooms(),
    },
  };

  queue.push(updatingRoomMessage);

  return queue;
};
