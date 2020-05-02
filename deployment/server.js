/* eslint-disable no-console */
"use strict";
var express = require("express");
var app = express();
var cors = require("cors");
app.use(cors());
var http = require("http").Server(app);
var io = require("socket.io")(http);
const history = require("connect-history-api-fallback");
const RoomManager = require("./RoomManager").RoomManager;
const MAX_CLIENTS_PER_HOST = 2;

const roomManager = new RoomManager();

const port = process.env.PORT || 8443;

app.get("*", function(req, res, next) {
  if (req.headers["x-forwarded-proto"] !== "https") {
    res.redirect("https://" + req.headers.host + req.url);
  } else {
    next(); /* Continue to other routes if we're not redirecting */
  }
});

//Socket create a new "room" and listens for other connections
io.on("connection", (socket) => {
  socket.on("create room", (req) => {
    roomManager.createRoom(socket, req.room, req.isDistributed);
  });

  socket.on("new peer", (roomID) => {
    const room = roomManager.getRoom(roomID);

    if (room) {
      if (room.room.getConnectableNodes) {
        const potentialHosts = room.room.getConnectableNodes();
        socket.emit("host pool", { potentialHosts, roomID });
      } else {
        socket.join(roomID, () => {
          console.log("Peer connected successfully to room: " + roomID);
          socket.to(roomID).emit("peer joined", {
            room: roomID,
            id: socket.id,
          });
        });
      }
    } else {
      console.log("invalid room");
      socket.emit("room null");
    }
  });

  socket.on("host eval res", (res) => {
    if (res.evalResult.hostFound) {
      const room = res.evalResult.room;
      console.log("Res room: " + room);

      socket.join(room, () => {
        console.log("Peer connected successfully to room: " + room);
        io.to(res.evalResult.selectedHost).emit("peer joined", {
          room,
          id: socket.id,
          hostID: res.evalResult.selectedHost,
        });
        socket.to(room).emit("chatFromServer", res.name + " has joined.");
        socket.emit("chatFromServer", "You have joined the room " + room + ".");
      });
    }
  });

  socket.on("src new ice", (iceData) => {
    console.log(
      `Received new ICE Candidate from src for peer: ${iceData.id} in room: ${iceData.room}`
    );
    socket.to(iceData.room).emit("src ice", iceData);
  });

  socket.on("peer new ice", (iceData) => {
    console.log(
      `Received new ICE Candidate from peer: ${iceData.id} in room: ${iceData.room}`
    );
    socket.to(iceData.room).emit("peer ice", iceData);
  });

  socket.on("src new desc", (descData) => {
    console.log(
      `Received description from src for peer: ${descData.id} in room: ${descData.room}`
    );
    socket.to(descData.room).emit("src desc", descData);
  });

  socket.on("peer new desc", (descData) => {
    console.log(
      `Received answer description from peer: ${descData.id} in room: ${descData.room}`
    );
    socket.to(descData.room).emit("peer desc", descData);
    if (descData.renegotiation) {
      const room = roomManager.getRoom(descData.room);
      if (room.room.addNode) {

        if(room.room.addNode(descData.id, MAX_CLIENTS_PER_HOST, descData.selectedHost)) {
          io.to(room.hostId).emit("incrementPeerCount")
        }
      }
    }
  });

  socket.on("title", (title) => {
    console.log(title);
    io.to(title.id).emit("title", title.title);
  });

  socket.on("logoff", (req) => {
    console.log("lofoff came in " + req.room) 
    const room = roomManager.getRoom(req.room);
    if (room) {
      if (room.room.removeNode) {
        var roomid = room.hostId;
        room.room.removeNode(socket, req.socketID, req.room, room.room);
        io.to(room.hostId).emit("decrementPeerCount");
        console.log("done sending to room " + roomid);
      }
      if (socket.id === req.socketID) {
        socket.leave(req.room);
      }
      socket.to(req.room).emit("chatFromServer", req.name + " has left.");
    }
  });

  socket.on("disconnect room", (req) => {
    if (roomManager.deleteRoom(socket.id)) {
      console.log("closing room " + req.room);
      socket.to(req.room).emit("chatFromServer", "room being closed.");
      // io.in(req.room).clients((err, clients) => {
      //   clients.forEach((element) => {
      //     io.sockets.connected.forEach(sc =>)
      //     io.sockets.connected[element].disconnect();
      //   });
      // });
      // console.log(io.in(req.room).clients.length);
    }
  });

  socket.on("disconnect", () => {
    console.log("user disconnected " + socket.id);
  });

  socket.on("message", (req) => {
    socket.to(req.room).emit("chatIncoming", req);
  });
});

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

app.get("/", function(req, res) {
  res.render("../app/dist/spa/index.html");
});

http.listen(port, () => {
  console.log("http listening on " + port);
});
