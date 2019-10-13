import Vue from 'vue'
import Vuex from 'vuex'

import io from "socket.io-client";

const socket = io("http://www.toonin.ml:8100");

socket.on("src ice", iceData => {
  logMessage(
    `Received new ICE Candidate from src for peer: ${iceData.id} in room: ${iceData.room}`
  );
  logMessage(`I have id: ${socket.id} and room: ${this.state.roomID}`);
  if (iceData.room !== this.state.roomID || iceData.id !== socket.id) {
    logMessage("ICE Candidate not for me");
    return;
  }
  this.state.rtcConn
    .addIceCandidate(new RTCIceCandidate(iceData.candidate))
    .then(logMessage("Ice Candidate added successfully"))
    .catch(err => logMessage(`ERROR on addIceCandidate: ${err}`));
});

socket.on("src desc", descData => {
  logMessage(
    `Received description from src for peer: ${descData.id} in room: ${descData.room}`
  );
  logMessage(`I have id: ${socket.id} and room: ${this.state.roomID}`);
  if (descData.room !== this.state.roomID || descData.id !== socket.id) {
    logMessage("ICE Candidate not for me");
    return;
  }
  this.state.rtcConn
    .setRemoteDescription(new RTCSessionDescription(descData.desc))
    .then(() => {
      logMessage("Setting remote description success");
      this.createAnswer(descData.desc);
    });
});

Vue.use(Vuex)


const servers = {
  iceServers: [
    {
      urls: [
        "stun:stun.l.google.com:19302",
        "stun:stun2.l.google.com:19302",
        "stun:stun3.l.google.com:19302",
        "stun:stun4.l.google.com:19302"
      ]
    }
  ]
};


const checkStream = () => {
  fetch(ENDPOINT + this.state.roomID)
    .then(res => res.json())
    .then(res => this.checkStreamResult(res))
    .catch(err => logMessage(err));
}

export default new Vuex.Store({
  state: {

  },
  mutations: {

  },
  actions: {

  }
})
