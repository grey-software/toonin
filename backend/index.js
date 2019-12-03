"use strict";
var app = require("express")();
var cors = require("cors");
app.use(cors());
var http = require("http").Server(app);
var io = require("socket.io")(http);
var vars = require("./vars");
var networkTree = require("./networkTree").networkTree;

var rooms = {};
const MAX_CLIENTS_PER_HOST = 8;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// reduced the gen room id length to 6 characters (2, 15) -> (2, 5)
const genRoomID = (socketID) => {
  while (true) {
    const id =
      Math.random()
        .toString(36)
        .substring(2, 5) +
      Math.random()
        .toString(36)
        .substring(2, 5);
    if (!(id in rooms)) {
      rooms[id] = new networkTree(socketID, MAX_CLIENTS_PER_HOST);
      return id;
    }
  }
};

/**
 * 
 * @param {SocketIO.Socket} socket 
 * @param {string} roomName 
 */
function createRoom(socket, roomName) {
    var newRoomID = "";
    console.log("Received request to create new room");
    const hasCustomRoomName = roomName.length > 0;

    if (hasCustomRoomName) {

      if (roomName in rooms) {
        socket.emit("room creation failed", "name already exists");
      } else {
        newRoomID = roomName;
        rooms[newRoomID] = new networkTree(socket.id, MAX_CLIENTS_PER_HOST);
        socket.join(newRoomID, () => {
          socket.emit("room created", newRoomID);
          console.log(rooms);
        });
      }

      // if no custom room name, generate a random id
    } else {
      newRoomID = genRoomID(socket.id);
      socket.join(newRoomID, () => {
        socket.emit("room created", newRoomID);
        console.log(rooms);
      });
    }

}

//Socket create a new "room" and listens for other connections
io.on("connection", socket => {

  socket.on("create room", (roomName) => {
    createRoom(socket, roomName);
    console.log(socket.rooms);
  });

  socket.on("new peer", room => {
    if(rooms[room]){

      var potentialHosts = rooms[room].getConnectableNodes();
      socket.emit("host pool", { potentialHosts: potentialHosts, room: room });
      // socket.join(room, () => {
      //   console.log("Peer connected successfully to room: " + room);
      //   console.log(socket.id + " now in rooms ", socket.rooms);
      //   socket.to(room).emit("peer joined", { room: room, id: socket.id });
      // });
    } else {
        console.log("invalid room");
        socket.emit("room null");
    }
    
  });

  socket.on("host eval res", (res) => {
    if(res.evalResult.hostFound) {

      var room = res.evalResult.room;
      console.log('res room: ' + room)

      socket.join(room, () => {
        console.log("Peer connected successfully to room: " + room);

        socket.to(room).emit("peer joined", { room: room, id: socket.id });
      });
    }
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

// clear rooms list through an http request with key as query
app.get("/clearRooms", (req, res) => {
  var key = req.query.key;
  if (key === vars.deleteKey) {
    rooms = {};
    res.status(200);
    res.send("Success! Rooms list reset");
  }
  else {
    res.status(403);
    res.send("Request Failed. Incorrect Key");
  }
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
  console.log(rooms);
});

http.listen(8100, () => {
  console.log("Signalling server started on port 8100");
});
