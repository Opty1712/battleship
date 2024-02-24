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

export type IncomingVariants = {
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

  attack: {
    type: "attack";
    data: { x: number; y: number; gameId: number; indexPlayer: number };
  };

  randomAttack: {
    type: "randomAttack";
    data: { gameId: number; indexPlayer: number };
  };

  single_play: { type: "single_play"; data: "" };
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

  turn: {
    type: "turn";
    data: {
      currentPlayer: number;
    };
  };

  attack: {
    type: "attack";
    data: {
      position: {
        x: number;
        y: number;
      };
      currentPlayer: number;
      status: ShotStatus;
    };
  };

  finish: {
    type: "finish";
    data: {
      winPlayer: number;
    };
  };

  update_winners: {
    type: "update_winners";
    data: Array<Winner>;
  };
};

export type Winner = {
  name: string;
  wins: number;
};

export type OutgoingMessage<
  K extends keyof OutgoingVariants = keyof OutgoingVariants
> = OutgoingVariants[K];

export type OutgoingQueueMessage = {
  message: OutgoingMessage;
  sendToPlayers?: Array<number>;
};
export type OutgoingQueue = Array<OutgoingQueueMessage>;

export type ShotStatus = "miss" | "killed" | "shot";
