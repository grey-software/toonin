/* eslint-disable no-console */
const NetworkTree = require("./NetworkTree").NetworkTree;
const bcrypt = require('bcrypt');
const winston = require('winston')
const MAX_CLIENTS_PER_HOST = 2;

const genRoomID = (rooms) => {
  for (; ;) {
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
  constructor(roomID, room, hostId, password) {
    this.roomID = roomID;
    this.room = room;
    this.hostId = hostId;
    this.hash = null
    if (password && password.length > 0) {
      this.createHash(password).then(res => {
        this.hash = res
      })
    }
  }

  async createHash (password) {
    return bcrypt.hash(password, 10).then(function (hash) {
      return hash
    });
  }

  async verifyPassword (password) {
    return bcrypt.compare(password, this.hash).then(function (result) {
      if (result) {
        return true
      } else {
        return false
      }
    });
  }

}

class RoomManager {
  constructor() {
    this.rooms = [];
  }

  /**
   * @param {SocketIO.Socket} socket
   * @param {string} roomID
   */
  createRoom (socket, roomID, isDistributed, password) {
    var newRoomID = "";
    winston.log('info', "Received request to create a new room ", {
      roomID: roomID
    });
    const hasCustomRoomName = roomID.length > 0;

    if (hasCustomRoomName) {
      if (this.getRoom(roomID)) {
        winston.log('info', "Room with name already exists", {
          roomID: roomID
        });
        socket.emit("room creation failed", "name already exists");
        return false
      } else {
        newRoomID = roomID;
        if (isDistributed) {
          this.rooms.push(
            new Room(
              newRoomID,
              new NetworkTree(socket.id, MAX_CLIENTS_PER_HOST),
              socket.id,
              password
            )
          );
        } else {
          this.rooms.push(new Room(newRoomID, {}));
        }

        socket.join(newRoomID, () => {
          socket.emit("room created", newRoomID);
        });
        return true
      }

      // if no custom room name, generate a random id
    } else {
      newRoomID = genRoomID(this.rooms);
      if (isDistributed) {
        this.rooms.push(
          new Room(
            newRoomID,
            new NetworkTree(socket.id, MAX_CLIENTS_PER_HOST),
            socket.id,
            password
          )
        );
      } else {
        this.rooms.push(new Room(newRoomID, {}));
      }
      socket.join(newRoomID, () => {
        socket.emit("room created", newRoomID);
      });
      return true
    }
  }

  /**
   * Return a Room Object
   * @param {String} roomID room id
   * @return {Room} Room if found or null
   */
  getRoom (roomID) {
    var returnRoom = this.rooms.filter((room) => room.roomID === roomID);
    if (returnRoom.length > 0) {
      return returnRoom[0];
    }
    return null;
  }

  /**
   * Delete a Room from Room Manager
   * @param {String} id Socket id
   */
  deleteRoom (id) {
    const size = this.rooms.length;
    this.rooms = this.rooms.filter((room) => room.hostId !== id);
    if (size > this.rooms.length) {
      return true;
    }
    return false;
  }
}

module.exports.RoomManager = RoomManager;
