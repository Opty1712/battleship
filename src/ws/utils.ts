import { IncomingMessage, OutgoingMessage } from "./types";

export const parseMessage = (value: string): IncomingMessage | void => {
  try {
    const parsed = JSON.parse(value);

    if ("type" in parsed && "data" in parsed) {
      return {
        type: parsed.type,
        data: JSON.parse(parsed.data || "{}"),
      } as IncomingMessage;
    }
  } catch {
    console.error(`Can't JSON.parse ${value}`);
  }
};

export const stringify = (value: OutgoingMessage) => {
  try {
    return JSON.stringify({
      type: value.type,
      data: JSON.stringify(value.data),
      id: 0,
    });
  } catch {
    console.error(`Can't stringify ${value}`);
  }
};

export const getRandomInRange = (min: number, max: number) => {
  return Math.round(Math.random() * (max - min) + min);
};
