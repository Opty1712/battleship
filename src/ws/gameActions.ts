import { Ship } from "./types";

const users = new Map<number, string>();
const rooms = new Map<number, Array<number>>();
const games = new Map<number, Record<number, Array<Ship>>>();
const wins = {};
let roomsCounter = 0;
let gamesCounter = 0;

export const addUser = (wsId: number, name: string) => {
  users.set(wsId, name);

  return wsId;
};

export const getPlayer = (wsId: number) => {
  return users.get(wsId);
};

export const createRoom = () => {
  const roomId = roomsCounter++;
  rooms.set(roomId, []);

  return roomId;
};

export const addUserToRoom = (wsId: number, roomId: number) => {
  const roomUsers = rooms.get(roomId);

  if (!roomUsers.includes(wsId)) {
    rooms.set(roomId, [...roomUsers, wsId]);
  }
};

export const getUsersFromRoom = (roomId: number) => {
  return rooms.get(roomId);
};

export const getWaitingRooms = () => {
  const waitingRooms = Array.from(rooms).filter(
    ([_, roomUsers]) => roomUsers.length > 0
  );

  return waitingRooms.map(([roomId, roomUsers]) => ({
    roomId,
    roomUsers: roomUsers.map((userId) => ({
      name: getPlayer(userId),
      index: userId,
    })),
  }));
};

export const createGame = () => {
  const gameId = gamesCounter++;
  games.set(gameId, {});

  return gameId;
};

export const addUserToGame = (
  wsId: number,
  gameId: number,
  ships: Array<Ship>
) => {
  const data = games.get(gameId);
  games.set(gameId, { ...data, [wsId]: ships });
};

export const checkIsStartingGame = (gameId: number) => {
  return Object.keys(games.get(gameId)).length === 2;
};

export const getWinners = () => {
  return Object.values(wins);
};
