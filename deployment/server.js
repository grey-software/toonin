"use strict";
var express = require("express")
var app = express();
var cors = require("cors");
app.use(cors());
var http = require("http").Server(app);
var io = require("socket.io")(http);
var vars = require("./vars");
const history = require('connect-history-api-fallback')
const RoomManager = require("./RoomManager").RoomManager;
const MAX_CLIENTS_PER_HOST = 3;

const roomManager = new RoomManager();

// var rooms = {};
const port = process.env.PORT || 8443;

// app.get('*',function(req,res,next){
//   if(req.headers['x-forwarded-proto']!='https')
//     res.redirect("https://" + req.headers.host + req.url)
//   else
//     next() /* Continue to other routes if we're not redirecting */
// });

//Socket create a new "room" and listens for other connections
io.on("connection", socket => {

  socket.on("create room", (req) => {
    roomManager.createRoom(socket, req.room, req.isDistributed);
  });

  socket.on("new peer", (roomID) => {
    const room = roomManager.getRoom(roomID);
    if(room){
      if(room.getConnectableNodes) {
        const potentialHosts = room.getConnectableNodes();
        console.log(potentialHosts);
        socket.emit("host pool", { potentialHosts, roomID });
      } else {
        socket.join(roomID, () => {
          console.log("Peer connected successfully to room: " + roomID);
  
          socket.to(roomID).emit("peer joined", {
            room: roomID, 
            id: socket.id
          });
  
        });
      }
      
    } else {
        console.log("invalid room");
        socket.emit("room null");
    }
    
  });

  socket.on("host eval res", (res) => {
    if(res.evalResult.hostFound) {
      const room = res.evalResult.room;
      console.log("Res room: " + room);

      socket.join(room, () => {
        console.log("Peer connected successfully to room: " + room);

        socket.to(room).emit("peer joined", {
          room, 
          id: socket.id, 
          hostID: res.evalResult.selectedHost 
        });

      });
    }
  });

  socket.on("src new ice", (iceData) => {
    console.log(`Received new ICE Candidate from src for peer: ${iceData.id} in room: ${iceData.room}`);
    socket.to(iceData.room).emit("src ice", iceData);
  });

  socket.on("peer new ice", (iceData) => {
    console.log(`Received new ICE Candidate from peer: ${iceData.id} in room: ${iceData.room}`);
    socket.to(iceData.room).emit("peer ice", iceData);
  });

  socket.on("src new desc", (descData) => {
    console.log(`Received description from src for peer: ${descData.id} in room: ${descData.room}`);
    socket.to(descData.room).emit("src desc", descData);
  });

  socket.on("peer new desc", (descData) => {
    console.log(`Received answer description from peer: ${descData.id} in room: ${descData.room}`);
    socket.to(descData.room).emit("peer desc", descData);

    const room = roomManager.getRoom(descData.room);
    if(room.addNode) {
      room.addNode(descData.id, MAX_CLIENTS_PER_HOST, descData.selectedHost);
    }
  });

  socket.on("title", (title) => {
    console.log(title)
    io.to(title.id).emit("title", title.title);
  });

  socket.on("logoff", (req) => {
    const room = roomManager.getRoom(req.room);
    if(room) {
      if(room.removeNode) {
        room.removeNode(socket, req.socketID, req.room, room);
      }

      if(socket.id === req.socketID) { socket.leave(req.room); }
    }
    
  });

  socket.on("disconnect room", (req) => {
    console.log("closing room " + req.room);
    
    roomManager.deleteRoom(req.room);
    console.log(roomManager.rooms);
    delete socket.rooms[req.room];

  })
});

app.get("/status", (req, res) => {
  res.send("Server is alive");
});

const staticFileMiddleware = express.static('../client/dist')

app.use(staticFileMiddleware)
app.use(history({
  disableDotRule: true,
  verbose: true
}))
app.use(staticFileMiddleware)

app.get('/', function (req, res) {
  res.render('../client/dist/index.html')
})

http.listen(port, () => {
  console.log("http listening on " +port);
})
