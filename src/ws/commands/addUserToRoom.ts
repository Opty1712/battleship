import {
  addUserToRoom,
  createGame,
  deleteRoom,
  getEnemyIdFromRoom,
  getUsersFromRoom,
  getWaitingRooms,
} from "../game";
import {
  IncomingVariants,
  OutgoingQueue,
  OutgoingQueueMessage,
} from "../types";

export const handleAddUserToRoom = (
  playerID: number,
  message: IncomingVariants["add_user_to_room"]
) => {
  const queue: OutgoingQueue = [];

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
};
