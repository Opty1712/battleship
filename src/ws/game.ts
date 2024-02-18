import { IncomingVariants, Ship, ShotStatus, Winner } from "./types";

type User = { name: string; password: string };
type ShipMatrix = Array<Array<number>>;
type ShipsById = Record<number, Ship>;
type Shots = Array<Array<1 | 0>>;
type Game = {
  shipMatrix: ShipMatrix;
  shipsById: ShipsById;
  shots: Shots;
  killed: number;
};

let roomsCounter = 0;
let gamesCounter = 0;

const winners = new Map<number, number>();
const users = new Map<number, User>();
const rooms = new Map<number, Array<number>>();

const games = new Map<number, Map<number, Game>>();

export const addUser = (playerID: number, name: string, password: string) => {
  const user = checkIsUserExists(name, password);

  if (user === null) {
    users.set(playerID, { name, password });
  }

  return user || playerID;
};

const checkIsUserExists = (name: string, password: string) => {
  const usersArray = Array.from(users);
  let nameMatched = "";
  let foundUserId: null | number = null;

  usersArray.forEach(([playerId, user]) => {
    if (user.name === name) {
      nameMatched = name;
    }

    if (user.name === name && user.password === password) {
      foundUserId = playerId;
    }
  });

  if (typeof foundUserId === "number") {
    return foundUserId;
  }

  if (nameMatched) {
    return "incorrectPassword";
  }

  return null;
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
      name: getPlayer(userId).name,
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
  shipMatrix: ShipMatrix,
  shipsById: ShipsById
) => {
  const data = games.get(gameId);

  data.set(playerID, {
    shipMatrix,
    shipsById,
    shots: createShotsMatrix(),
    killed: 0,
  });

  games.set(gameId, data);
};

export const initUserInGame = (
  playerID: number,
  gameId: number,
  ships: Array<Ship>
) => {
  const { shipMatrix, shipsById } = getShipsData(ships);
  addUserToGame(playerID, gameId, shipMatrix, shipsById);
  winners.set(playerID, 0);
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

const createShotsMatrix = () => {
  return [...new Array(10)].map(() => [...new Array(10)].fill(0));
};

const getShipsData = (ships: Array<Ship>) => {
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

export const makeAttack = ({
  gameId,
  playerID,
  x,
  y,
}: Attack): { status: ShotStatus; isGameFinished: boolean } => {
  const gameData = games.get(gameId);
  const selfData = gameData.get(playerID);
  selfData.shots[x][y] = 1;

  const enemyId = getEnemyIdFromGame(gameId, playerID);
  const enemyData = gameData.get(enemyId);
  const shipId = enemyData.shipMatrix[x][y];

  const status = getShipStatus(
    shipId,
    selfData.shots,
    enemyData.shipsById[shipId]
  );

  const isGameFinished = updateGameProgress(selfData, status, playerID);

  return { status, isGameFinished };
};

const getShipStatus = (
  shipId: number,
  shots: Shots,
  ship: Ship
): ShotStatus => {
  if (shipId === 0) {
    return "miss";
  }

  const { direction, length, position } = ship;
  const { x, y } = position;

  for (let i = 0; i < length; i++) {
    const point = shots[x + (direction ? 0 : i)][y + (direction ? i : 0)];

    if (!point) {
      return "shot";
    }
  }

  return "killed";
};

const updateGameProgress = (
  game: Game,
  status: ShotStatus,
  playerID: number
) => {
  const totalShips = 10;

  if (status === "killed") {
    game.killed++;
  }

  const isGameFinished = game.killed === totalShips;

  if (isGameFinished) {
    const data = winners.get(playerID);
    winners.set(playerID, data + 1);
  }

  return isGameFinished;
};

export const getWinners = () => {
  const winnersArray: Array<Winner> = Array.from(winners).map(
    ([playerId, wins]) => {
      return { name: users.get(playerId).name, wins };
    }
  );

  return winnersArray;
};
