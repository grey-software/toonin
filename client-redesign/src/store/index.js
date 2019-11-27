/* eslint-disable no-console */
import Vue from "vue";
import Vuex from "vuex";
// import io from "socket.io-client";

Vue.use(Vuex);

// var data = {};

// const ENDPOINT = "https://www.toonin.ml:8443/";

// const SUCCESSFUL = "connected";
// const DISCONNECTED = "disconnected";
// const FAILED = "failed";

// const servers = {
//   iceServers: [
//     {
//       urls: [
//         "stun:stun.l.google.com:19302",
//         "stun:stun2.l.google.com:19302",
//         "stun:stun3.l.google.com:19302",
//         "stun:stun4.l.google.com:19302"
//       ]
//     }
//   ]
// };
// var socket = io(ENDPOINT, { secure: true });

const store = new Vuex.Store({
  state: {
    connectedStatus: "notConnected",
    room: "",
    streamTitle: "",
    volume: 50,
    playing: false,
    rtcConn: null,
    peerID: null,
    stream: null
  },
  mutations: {
    SET_CONNECTED_STATUS: (state, payload) => {
      state.connectedStatus = payload;
    },
    SET_ROOM: (state, payload) => {
      state.room = payload;
    },
    SET_STREAM_TITLE: (state, payload) => {
      state.streamTitle = payload;
    },
    SET_VOLUME: (state, payload) => {
      state.volume = payload;
    },
    SET_PLAYING: (state, payload) => {
      state.playing = payload;
    },
    SET_RTCCONN: (state, payload) => {
      state.rtcConn = payload;
    },
    SET_PEERID: (state, payload) => {
      state.peerID = payload;
    },
    SET_STREAM: (state, payload) => {
      state.stream = payload;
    }
  },
  actions: {
    UPDATE_CONNECTED_STATUS: (context, payload) => {
      context.commit("SET_CONNECTED_STATUS", payload);
    },
    UPDATE_ROOM: (context, payload) => {
      context.commit("SET_ROOM", payload);
    },
    UPDATE_STREAM_TITLE: (context, payload) => {
      context.commit("SET_STREAM_TITLE", payload);
    },
    UPDATE_VOLUME: (context, payload) => {
      context.commit("SET_VOLUME", payload);
    },
    UPDATE_PLAYING: (context, payload) => {
      context.commit("SET_PLAYING", payload);
    },
    UPDATE_RTCCONN: (context, payload) => {
      context.commit("SET_RTCCONN", payload);
    },
    UPDATE_PEERID: (context, payload) => {
      context.commit("SET_PEERID", payload);
    },
    UPDATE_STREAM: (context, payload) => {
      context.commit("SET_STREAM", payload);
    }
  },
  getters: {
    CONNECTEDSTATUS: state => {
      return state.connectedStatus;
    },
    ROOM: state => {
      return state.room;
    },
    STREAMTITLE: state => {
      return state.streamTitle;
    },
    VOLUME: state => {
      return state.volume;
    },
    PLAYING: state => {
      return state.playing;
    },
    RTCCONN: state => {
      return state.rtcConn;
    },
    PEERID: state => {
      return state.peerID;
    },
    STREAM: state => {
      return state.stream
    }
  }
});

// export function checkStreamResult(result, room) {
//   if (result === "SUCCESS") {
//     // updateState({ roomFound: true });
//     // logMessage("Active session with ID: " + state.room + " found!");
//     socket.emit("new peer", room);
//     const rtcConn = new RTCPeerConnection(servers, {
//       optional: [{ RtpDataChannels: true }]
//     });
//     data.SET_RTCCONN = rtcConn;
//     data.SET_ROOM = room;
//     data.SET_PEERID = socket.id;
//     setSocketListeners(socket);
//     attachRTCliteners(rtcConn);
//   } else {
//     data.SET_ROOM = "";
//     data.SET_CONNECTED_STATUS = FAILED;
//     return data;
//   }
// }

// export function logMessage(msg) {
//   console.log(msg);
// }

// export function setSocketListeners(socket) {
//   socket.on("src ice", iceData => {
//     logMessage(
//       `Received new ICE Candidate from src for peer: ${iceData.id} in room: ${iceData.room}`
//     );
//     logMessage(`I have id: ${socket.id} and room: ${data.SET_ROOM}`);
//     if (iceData.room !== data.SET_ROOM || iceData.id !== socket.id) {
//       logMessage("ICE Candidate not for me");
//       return;
//     }
//     data.SET_RTCCONN.addIceCandidate(new RTCIceCandidate(iceData.candidate))
//       .then(logMessage("Ice Candidate added successfully"))
//       .catch(err => logMessage(`ERROR on addIceCandidate: ${err}`));
//   });

//   socket.on("src desc", descData => {
//     logMessage(
//       `Received description from src for peer: ${descData.id} in room: ${descData.room}`
//     );
//     logMessage(`I have id: ${socket.id} and room: ${data.SET_ROOM}`);
//     if (descData.room !== data.SET_ROOM || descData.id !== socket.id) {
//       logMessage("ICE Candidate not for me");
//       return;
//     }
//     data.SET_RTCCONN.setRemoteDescription(
//       new RTCSessionDescription(descData.desc)
//     ).then(() => {
//       logMessage("Setting remote description success");
//       createAnswer(descData.desc);
//     });
//   });
// }

// /**
//  * respond to the backend server with description 'desc'.
//  * This is called after receiving some msg from server.
//  *
//  * @param {any} desc
//  */
// function createAnswer() {
//   const roomID = this.$store.state.room;
//   this.$store.state.createAnswer().then(desc => {
//     this.$store.state.rtcConn
//       .setLocalDescription(new RTCSessionDescription(desc))
//       .then(function() {
//         logMessage("Local description from answer set");
//         socket.emit("peer new desc", {
//           id: socket.id,
//           room: roomID,
//           desc: desc
//         });
//       });
//   });
// }

// /**
//  * attach listeners for webRTC peer connection events
//  * @param {RTCPeerConnection} rtcConn RTCPeerConnection object to attach listeners to
//  */
// function attachRTCliteners(rtcConn) {
//   rtcConn.onicecandidate = event => {
//     if (!event.candidate) {
//       logMessage("No candidate for RTC connection");
//       return;
//     }
//     socket.emit("peer new ice", {
//       id: socket.id,
//       room: data.SET_ROOM,
//       candidate: event.candidate
//     });
//   };

//   // eslint-disable-next-line no-unused-vars
//   rtcConn.onconnectionstatechange = _ev => {
//     // var data = {};
//     if (rtcConn.connectionState === SUCCESSFUL) {
//       data.SET_CONNECTED_STATUS = SUCCESSFUL;
//     }

//     if (
//       rtcConn.connectionState == DISCONNECTED ||
//       rtcConn.connectionState == FAILED
//     ) {
//       data.SET_CONNECTED_STATUS = DISCONNECTED;
//       data.SET_STREAM_TITLE = "";
//       data.SET_PLAYING = false;

//       // disconnectBtn.$refs.link.hidden = true;
//     }
//   };

//   rtcConn.ondatachannel = event => {
//     var channel = event.channel;
//     channel.onmessage = onDataChannelMsg;
//   };

//   rtcConn.ontrack = () => {
//     logMessage("track added");
//     var incomingStream = new MediaStream([event.track]);

//     var _iOSDevice = !!navigator.platform.match(
//       /iPhone|iPod|iPad|Macintosh|MacIntel/
//     );
//     if (_iOSDevice) {
//       // need to fix

//       // playBtn.$refs.link.hidden = false;
//       // audioElem.srcObject = incomingStream;
//       // audioElem.onplay = () => {
//       //   updateState({
//       //     established: true,
//       //     isPlaying: audioElem.srcObject.active,
//       //     stream: incomingStream
//       //   });
//       // };
//       data.SET_CONNECTED_STATUS = SUCCESSFUL;
//       data.SET_PLAYING = false;
//       data.SET_STREAM = incomingStream;
//     } else {
//       // NEED TO FIX
//       //
//       // audioElem.srcObject = incomingStream;
//       // audioElem.onplay = () => {
//       //   updateState({
//       //     established: true,
//       //     isPlaying: audioElem.srcObject.active,
//       //     stream: incomingStream
//       //   });
//       // };
//       // audioElem.play().catch = err => {
//       //   playBtn.$refs.link.hidden = false;
//       // };
//       data.SET_CONNECTED_STATUS = SUCCESSFUL;
//       data.SET_PLAYING = true;
//       data.SET_STREAM = incomingStream;
//     }

//     // disconnectBtn.$refs.link.hidden = false;
//   };
// }

// function onDataChannelMsg(messageEvent) {
//   // data channel to recieve the media title
//   try {
//     var mediaDescription = JSON.parse(messageEvent.data);
//     data.SET_STREAM_TITLE = mediaDescription.title;

//     // if (state.streamTitle.length > 0) {
//     //   titleTag.innerText = state.streamTitle;
//     //   if (state.streamTitle.length <= 41) {
//     //     titleTag.classList.remove("title-text");
//     //     titleTag.classList.add("title-text-no-animation");
//     //   } else {
//     //     titleTag.classList.remove("title-text-no-animation");
//     //     titleTag.classList.add("title-text");
//     //   }
//     // }
//   } catch (err) {
//     logMessage(err);
//   }
// }

export default store;
