const users = new Map<number, string>();
const rooms = new Map<number, Array<number>>();
const wins = {};

export const addUser = (wsId: number, name: string) => {
  users.set(wsId, name);

  return wsId;
};

export const getPlayer = (wsId: number) => {
  return users.get(wsId);
};

export const createRoom = () => {
  const roomId = rooms.size;
  rooms.set(roomId, []);

  return roomId;
};

export const addUserToRoom = (wsId: number, roomId: number) => {
  const roomUsers = rooms.get(roomId);
  if (!roomUsers.includes(wsId)) {
    rooms.set(roomId, [...roomUsers, wsId]);
  }
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

export const getWinners = () => {
  return Object.values(wins);
};
