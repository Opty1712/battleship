import { IncomingVariants, Ship } from "./types";

let roomsCounter = 0;
let gamesCounter = 0;

const wins = {};
const users = new Map<number, string>();
const rooms = new Map<number, Array<number>>();

const games = new Map<
  number,
  Map<
    number,
    { self: Array<Ship>; enemy: Array<Ship>; shots: Array<Array<1 | 0>> }
  >
>();

export const addUser = (playerID: number, name: string) => {
  users.set(playerID, name);

  return playerID;
};

export const getPlayer = (playerID: number) => {
  return users.get(playerID);
};

export const createRoom = () => {
  const roomId = roomsCounter++;
  rooms.set(roomId, []);

  return roomId;
};

export const addUserToRoom = (playerID: number, roomId: number) => {
  const roomUsers = rooms.get(roomId);

  if (!roomUsers.includes(playerID)) {
    rooms.set(roomId, [...roomUsers, playerID]);
  }
};

export const getUsersFromRoom = (roomId: number) => {
  return rooms.get(roomId);
};

export const getWaitingRooms = () => {
  const waitingRooms = Array.from(rooms).filter(
    ([_, roomUsers]) => roomUsers.length < 2
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
  games.set(gameId, new Map());

  return gameId;
};

const addUserToGame = (
  playerID: number,
  gameId: number,
  ships: Array<Ship>
) => {
  const data = games.get(gameId);
  data.set(playerID, { self: ships, enemy: [], shots: createShotsMatrix() });
  games.set(gameId, data);
};

export const initUserInGame = (
  playerID: number,
  gameId: number,
  ships: Array<Ship>
) => {
  addUserToGame(playerID, gameId, ships);
  const { shipMatrix, shipsById } = createShipsMatrix(ships);
};

export const checkIsStartingGame = (gameId: number) => {
  return games.get(gameId).size === 2;
};

export const getUserInGame = (gameId: number) => {
  return Array.from(games.get(gameId).keys());
};

export const getEnemyIdFromGame = (gameId: number, playerID: number) => {
  const users = getUserInGame(gameId);
  const enemyId = users.find((id) => id !== playerID);

  return enemyId;
};

export const getEnemyIdFromRoom = (roomId: number, playerID: number) => {
  const users = getUsersFromRoom(roomId);
  const enemyId = users.find((id) => id !== playerID);

  return enemyId;
};

export const deleteRoom = (roomId: number) => {
  rooms.delete(roomId);
};

type Attack = Omit<IncomingVariants["attack"]["data"], "indexPlayer"> & {
  playerID: number;
};

export const makeAttack = ({ gameId, playerID, x, y }: Attack) => {
  const data = games.get(gameId);
  const { shots } = data.get(playerID);
  shots[x][y] = 1;
  console.log(x, y, games.get(gameId).get(playerID).shots);
};

const createShotsMatrix = () => {
  return [...new Array(10)].map(() => [...new Array(10)].fill(0));
};

const createShipsMatrix = (ships: Array<Ship>) => {
  const shipMatrix = createShotsMatrix();
  const shipsById: Record<number, Ship> = {};

  ships.forEach((ship) => {
    const id = Math.random();
    shipsById[id] = ship;

    const { direction, length, position } = ship;
    const { x, y } = position;
    shipMatrix[x][y] = id;

    for (let i = 0; i < length; i++) {
      shipMatrix[x + (direction ? 0 : i)][y + (direction ? i : 0)] = id;
    }
  });

  return { shipMatrix, shipsById };
};
export const getWinners = () => {
  return Object.values(wins);
};
