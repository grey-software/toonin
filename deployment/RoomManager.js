/* eslint-disable no-console */
const NetworkTree = require("./NetworkTree").NetworkTree;
const MAX_CLIENTS_PER_HOST = 2;

const genRoomID = (rooms) => {
  for (;;) {
    const id =
      Math.random()
        .toString(36)
        .substring(2, 5) +
      Math.random()
        .toString(36)
        .substring(2, 5);
    if (!(id in rooms)) {
      return id;
    }
  }
};

class Room {
  constructor(roomID, room, hostId) {
    this.roomID = roomID;
    this.room = room;
    this.hostId = hostId;
  }
}

class RoomManager {
  constructor() {
    this.rooms = [];
  }

  /**
   * @param {SocketIO.Socket} socket
   * @param {string} roomName
   */
  createRoom(socket, roomName, isDistributed) {
    var newRoomID = "";
    console.log("Received request to create new room " + roomName);
    const hasCustomRoomName = roomName.length > 0;

    if (hasCustomRoomName) {
      if (this.getRoom(roomName)) {
        socket.emit("room creation failed", "name already exists");
      } else {
        newRoomID = roomName;
        if (isDistributed) {
          this.rooms.push(
            new Room(
              newRoomID,
              new NetworkTree(socket.id, MAX_CLIENTS_PER_HOST),
              socket.id
            )
          );
        } else {
          this.rooms.push(new Room(newRoomID, {}));
        }

        socket.join(newRoomID, () => {
          socket.emit("room created", newRoomID);
        });
      }

      // if no custom room name, generate a random id
    } else {
      newRoomID = genRoomID(this.rooms);
      if (isDistributed) {
        this.rooms.push(
          new Room(
            newRoomID,
            new NetworkTree(socket.id, MAX_CLIENTS_PER_HOST),
            socket.id
          )
        );
      } else {
        this.rooms.push(new Room(newRoomID, {}));
      }
      socket.join(newRoomID, () => {
        socket.emit("room created", newRoomID);
      });
    }
  }

  getRoom(roomID) {
    var returnRoom = this.rooms.filter((room) => room.roomID === roomID);
    if (returnRoom.length > 0) {
      return returnRoom[0];
    }
    return null;
  }

  deleteRoom(id) {
    var size = this.rooms.length;
    this.rooms = this.rooms.filter((room) => room.hostId !== id);
    if (size > this.rooms.length) {
      return true;
    }
    return false;
  }
}

module.exports.RoomManager = RoomManager;
