/* eslint-disable no-console */
"use strict";
const logger = require('./logger.js')
const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());
const http = require("http").Server(app);
const io = require("socket.io")(http);
const history = require("connect-history-api-fallback");
const RoomManager = require("./RoomManager").RoomManager;
const SocketManager = require("./SocketManager").SocketManager
const MAX_CLIENTS_PER_HOST = 2;

const roomManager = new RoomManager();
const socketManager = new SocketManager();

const port = process.env.PORT || 8443;

app.get("*", function (req, res, next) {
  if (req.headers["x-forwarded-proto"] !== "https") {
    res.redirect("https://" + req.headers.host + req.url);
  } else {
    next(); /* Continue to other routes if we're not redirecting */
  }
});

//Socket create a new "room" and listens for other connections
io.on("connection", (socket) => {
  socket.on("create room", (req) => {
    console.log(`Received request to create a new room: ${req}`)
    if (roomManager.createRoom(socket, req.room, req.isDistributed, req.password)) {
      socketManager.addSocket(socket, req.room)
    }
  });


  socket.on("new peer", (roomID) => {
    const room = roomManager.getRoom(roomID);
    logger.log('info', 'New peer.', {
      roomID: roomID
    })
    if (room) {
      if (room.hash) {
        socket.emit("require-password");
      } else {
        if (room.room.getConnectableNodes) {
          const potentialHosts = room.room.getConnectableNodes();
          socket.emit("host pool", { potentialHosts, roomID });
        } else {
          socket.join(roomID, () => {
            logger.log('info', 'Peer connected successfully to room.', {
              roomID: roomID
            })
            socket.to(roomID).emit("peer joined", {
              room: roomID,
              id: socket.id,
            });
          });
        }
      }
    } else {
      logger.log('info', 'Room not found.', {
        roomID: roomID
      })
      socket.emit("room null", {
        roomName: roomID
      });
    }
  });

  socket.on("new peer password", (req) => {
    const room = roomManager.getRoom(req.roomID);
    if (room) {
      if (room.hash && !req.password) {
        socket.emit("require-password");
      } else {
        room.verifyPassword(req.password).then((verified) => {
          if (verified) {
            if (room.room.getConnectableNodes) {
              const potentialHosts = room.room.getConnectableNodes();
              socket.emit("host pool", { potentialHosts, roomID: req.roomID });
            } else {
              socket.join(req.roomID, () => {
                logger.log('info', 'Peer connected successfully to room.', {
                  roomID: req.roomID
                })
                socket.to(req.roomID).emit("peer joined", {
                  room: req.roomID,
                  id: socket.id,
                });
              });
            }
          } else {
            socket.emit("require-password");
          }
        }).catch((e) => {
          logger.log('error', 'Error when verifying password', {
            error: e
          })
          socket.emit("require-password");
        });

      }
    } else {
      logger.log('info', 'Room not found.', {
        roomID: req.roomID
      })
      socket.emit("room null", {
        roomName: req.roomID
      });
    }
  });

  socket.on("host eval res", (res) => {
    if (res.evalResult.hostFound) {
      const room = res.evalResult.room;
      socket.join(room, () => {
        logger.log('info', "Peer connected successfully to room: ", {
          roomID: room
        });
        io.to(res.evalResult.selectedHost).emit("peer joined", {
          room,
          id: socket.id,
          hostID: res.evalResult.selectedHost,
        });
        socket.to(room).emit("chatFromServer", res.name + " has joined.");
        socket.emit("chatFromServer", "You have joined the room " + room + ".");
        socketManager.addSocket(socket, room, res.name)
      });
    }
  });

  socket.on("src new ice", (iceData) => {
    logger.log('debug',
      `Received new ICE Candidate from src for peer: ${iceData.id} in room: ${iceData.room}`
    );
    io.to(iceData.id).emit("src ice", iceData);
  });

  socket.on("peer new ice", (iceData) => {
    logger.log('debug',
      `Received new ICE Candidate for peer: ${iceData.id} in room: ${iceData.room}`
    );
    io.to(iceData.hostID).emit("peer ice", iceData);
  });

  socket.on("src new desc", (descData) => {
    logger.log('debug',
      `Received description from src for peer: ${descData.id} in room: ${descData.room}`
    );
    io.to(descData.id).emit("src desc", descData);
  });

  socket.on("peer new desc", (descData) => {
    logger.log('debug',
      `Received answer description from peer: ${descData.id} in room: ${descData.room}`
    );
    io.to(descData.selectedHost).emit("peer desc", descData);
    if (descData.renegotiation) {
      const room = roomManager.getRoom(descData.room);
      if (room.room.addNode) {
        if (room.room.addNode(descData.id, MAX_CLIENTS_PER_HOST, descData.selectedHost)) {
          io.to(room.hostId).emit("PeerCount", socketManager.getSocketCountInRoom(descData.room))
        }
      }
    }
  });

  socket.on("title", (title) => {
    io.to(title.id).emit("title", title.title);
  });

  socket.on("logoff", (req) => {
    logger.log('info', 'Log off request from ' + req.name)
    disconnectSocket(req, socket)
  });

  socket.on("disconnect room", (req) => {
    disconnectSocket(req, socket)
  });

  socket.on("disconnect", () => {
    const socketInfo = socketManager.getSocket(socket.id)
    const disconnectSuccessful = disconnectSocket(socketInfo, socket)
    logger.log('info', "User disconnected", {
      peerID: socket.id,
      disconnectSuccessful: disconnectSuccessful
    });
  });

  socket.on("message", (req) => {
    socket.to(req.room).emit("chatIncoming", req);
  });
});

/**
 * Handle socket disconnect
 * @param {Object} req request object from client.
 * @param {SocketIOClient.Socket} socket socket object.
 * @return {Boolean} Indicated if socket was deleted
 */
function disconnectSocket (req, socket) {
  if (roomManager.deleteRoom(socket.id)) {
    logger.log('info', "Closing room", { roomID: req.room });
    socket.to(req.room).emit("chatFromServer", "room being closed.");
    socketManager.removeSocket(socket.id)
    return true
  } else {
    if (req && req.room) {
      const room = roomManager.getRoom(req.room);
      if (room && room.room.removeNode) {
        room.room.removeNode(socket, socket.id, req.room, room.room);
        socketManager.removeSocket(socket.id)
        io.to(room.hostId).emit("PeerCount", socketManager.getSocketCountInRoom(req.room));
        socket.to(req.room).emit("chatFromServer", req.name + " has left.")
        logger.log('info', "Peer has left the room", { peerID: socket.id });
      }
      return true
    }
  }
  return false
}

app.get("/status", (req, res) => {
  res.send("Server is alive");
});

const staticFileMiddleware = express.static("../app/dist/spa");

app.use(staticFileMiddleware);
app.use(
  history({
    disableDotRule: true,
    verbose: true,
  })
);
app.use(staticFileMiddleware);

app.get("/", (req, res) => {
  res.render("../app/dist/spa/index.html");
});

http.listen(port, () => {
  logger.log('info', "HTTP server live", {
    port: port
  });
});
