"use strict";
var express= require("express");
const app = express();
var cors = require("cors");
app.use(cors());
var http = require("http").Server(app);
var io = require("socket.io")(http);
var vars = require("./vars");
const path = require('path')
const history = require('connect-history-api-fallback')
var rooms = {};
const port = process.env.PORT || 8443;
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// reduced the gen room id length to 6 characters (2, 15) -> (2, 5)
const genRoomID = () => {
  while (true) {
    const id =
      Math.random()
        .toString(36)
        .substring(2, 5) +
      Math.random()
        .toString(36)
        .substring(2, 5);
    if (!(id in rooms)) {
      rooms[id] = {};
      return id;
    }
  }
};

app.get('*',function(req,res,next){
  if(req.headers['x-forwarded-proto']!='https')
    res.redirect("https://" + req.headers.host + req.url)
  else
    next() /* Continue to other routes if we're not redirecting */
});

function createRoom(socket, roomName) {
    var newRoomID = "";
    console.log("Received request to create new room");
    const hasCustomRoomName = roomName.length > 0;
    if (hasCustomRoomName) {

      if (roomName in rooms) {
        socket.emit("room creation failed", "name already exists");
      } else {
        newRoomID = roomName;
        rooms[newRoomID] = {};
        socket.join(newRoomID, () => {
          socket.emit("room created", newRoomID);
          console.log(rooms);
        });
      }

      // if no custom room name, generate a random id
    } else {
      newRoomID = genRoomID();
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
  });

  socket.on("new peer", room => {
    if(rooms[room]){
      socket.join(room, () => {
        console.log("Peer connected successfully to room: " + room);
        console.log(socket.id + " now in rooms ", socket.rooms);
        socket.to(room).emit("peer joined", { room: room, id: socket.id });
      });
    } else {
      console.log("invalid room");
      socket.emit("room null");
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

  socket.on("title", title => {
    console.log(title)
    io.to(title.id).emit("title", title.title);
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

app.get("/status", (req, res) => {
  res.send("Server is alive");
  console.log(rooms);
});

const staticFileMiddleware = express.static('../app/dist')

app.use(staticFileMiddleware)
app.use(history({
  disableDotRule: true,
  verbose: true
}))
app.use(staticFileMiddleware)

app.get('/', function (req, res) {
  res.render('../app/dist/index.html')
})

http.listen(port, () => {
  console.log('https listening on '+port);
})
