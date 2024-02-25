import { OutgoingQueue } from "../types";
import { parseMessage } from "../utils";
import { handleAddShips } from "./addShips";
import { handleAddUserToRoom } from "./addUserToRoom";
import { handleAttack } from "./attack";
import { handleCreateRoom } from "./createRoom";
import { handleReg } from "./reg";
import { handleSinglePlay } from "./singlePlay";

export const handleCommand = (playerID: number, received: string) => {
  const message = parseMessage(received);

  try {
    if (message) {
      const queue: OutgoingQueue = [];

      switch (message.type) {
        case "reg": {
          return handleReg(playerID, message);
        }

        case "create_room": {
          return handleCreateRoom();
        }

        case "add_user_to_room": {
          return handleAddUserToRoom(playerID, message);
        }

        case "add_ships": {
          return handleAddShips(playerID, message);
        }

        case "attack":
        case "randomAttack": {
          return handleAttack(playerID, message);
        }

        case "single_play": {
          return handleSinglePlay(playerID);
        }
      }
    } else {
      console.error(`No command found in ${received}`);
    }
  } catch (e) {
    console.log(`Running command failed: ${received}`);
    console.error(e);
  }
};
