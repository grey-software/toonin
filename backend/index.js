"use strict";
var app = require("express")();
var cors = require("cors");
app.use(cors());
var http = require("http").Server(app);
var io = require("socket.io")(http);
const rooms = {};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const genRoomID = () => {
  while (true) {
    const id =
      Math.random()
        .toString(36)
        .substring(2, 15) +
      Math.random()
        .toString(36)
        .substring(2, 15);
    if (!(id in rooms)) {
      rooms[id] = {};
      return id;
    }
  }
};

io.on("connection", socket => {
  socket.on("create room", () => {
    console.log("Received request to create new room");
    const newRoomID = genRoomID();
    socket.join(newRoomID, () => {
      socket.emit("room created", newRoomID);
    });
  });

  socket.on("new peer", room => {
    socket.join(room, () => {
      console.log("Peer connected successfully to room: " + room);
      console.log(socket.id + " now in rooms ", socket.rooms);
      socket.to(room).emit("peer joined", { room: room, id: socket.id });
    });
  });

  socket.on("src new ice", iceData => {
    console.log(`Received new ICE Candidate from src for peer: ${iceData.id} in room: ${iceData.room}`);
    socket.to(iceData.room).emit("src ice", iceData);
  });

  socket.on("peer new ice", iceData => {
    console.log(`Received new ICE Candidate from peer: ${iceData.id} in room: ${iceData.room}`);
    socket.to(iceData.room).emit("peer ice", iceData);
  });

  socket.on("src new desc", descData => {
    console.log(`Received description from src for peer: ${descData.id} in room: ${descData.room}`);
    socket.to(descData.room).emit("src desc", descData);
  });

  socket.on("peer new desc", descData => {
    console.log(`Received answer description from peer: ${descData.id} in room: ${descData.room}`);
    socket.to(descData.room).emit("peer desc", descData);
  });
});

app.get("/:roomID", (req, res) => {
  console.log(rooms);
  const roomID = req.params.roomID;
  if (roomID in rooms) {
    console.log("Room with id: " + roomID + " found!");
    return res.send(JSON.stringify("SUCCESS"));
  }
  console.log("ERROR: No room with id: " + roomID);
  return res.send(JSON.stringify("FAIL"));
});

app.get("/", (req, res) => {
  res.send("Server is alive");
});

http.listen(8100, () => {
  console.log("Signalling server started on port 8100");
});
