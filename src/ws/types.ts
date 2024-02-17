import { WebSocket } from "ws";

/** Fixing wrong types pf websockets */
export interface FixedWebSocket extends WebSocket {
  id: number;
}

export type Ship = {
  position: {
    x: number;
    y: number;
  };
  direction: boolean;
  length: number;
  type: "small" | "medium" | "large" | "huge";
};

type IncomingVariants = {
  reg: {
    type: "reg";
    data: {
      name: string;
      password: string;
    };
  };

  create_room: { type: "create_room"; data: "" };

  add_user_to_room: { type: "add_user_to_room"; data: { indexRoom: number } };

  add_ships: {
    type: "add_ships";
    data: {
      gameId: number;
      ships: Array<Ship>;
      indexPlayer: number;
    };
  };
};

export type IncomingMessage<
  K extends keyof IncomingVariants = keyof IncomingVariants
> = IncomingVariants[K];

type OutgoingVariants = {
  reg: {
    type: "reg";
    data: {
      name: string;
      index: number;
      error: false;
      errorText: "";
    };
  };

  update_room: {
    type: "update_room";
    data: Array<{
      roomId: number;
      roomUsers: Array<{ name: string; index: number }>;
    }>;
  };

  create_game: {
    type: "create_game";
    data: {
      idGame: number;
      idPlayer: number;
    };
  };

  start_game: {
    type: "start_game";
    data: { ships: Array<Ship>; currentPlayerIndex: number };
  };
};

export type OutgoingMessage<
  K extends keyof OutgoingVariants = keyof OutgoingVariants
> = OutgoingVariants[K];

export type OutgoingQueueMessage = {
  message: OutgoingMessage;
  sendToAll: boolean;
};
export type OutgoingQueue = Array<OutgoingQueueMessage>;
