import { WebSocket } from "ws";

/** Fixing wrong types pf websockets */
export interface FixedWebSocket extends WebSocket {
  id: number;
}

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
};

export type OutgoingMessage<
  K extends keyof OutgoingVariants = keyof OutgoingVariants
> = OutgoingVariants[K];
// type:
//   | "reg"
//   | "update_winners"
//   | "create_game"
//   | "update_room"
//   | "start_game"
//   | "attack"
//   | "turn"
//   | "finish";
// data: {};

export type OutgoingQueue = Array<{
  message: OutgoingMessage;
  sendToAll: boolean;
}>;
