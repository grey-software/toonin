<template>
  <v-card
    class="mx-auto"
    max-width="400"
    max-height="600px"
  >
    <v-card-title class="headline">Connect to Room</v-card-title>
    <v-img max-height="300px" contain src="../assets/icon.png" style="margin-top: 1%; padding-top: 20px" />
    <v-card-text class="text--primary">
      <v-text-field v-model="SET_ROOM" style="color: white;" :autofocus="true" placeholder="Room Key" outlined rounded/>
    </v-card-text>
    <v-card-actions>
      <Button @button-click="toonin" msg="Toonin"/>
      <Button hidden msg="Play"/>
      <Button hidden msg="Disconnect"/>
    </v-card-actions>
  </v-card>
</template>

<script>
import Button from "@/components/button.vue";
import { mapState} from 'vuex'
const SUCCESSFUL = "connected";
const DISCONNECTED = "disconnected";
const FAILED = "failed";
// const ENDPOINT = "https://www.toonin.ml:8443/";
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

export default {
  name: "card",
  props: {
    
  },
  data() {
    return {
      SET_ROOM: null
    }
  },
  components: {
    Button
  },
  methods: {
    consoleClick() {
      alert("Button clicked");
    },
    toonin() {
      // this.$store.dispatch("CONNECT_TO_ROOM", this.roomName);
      // this.$socket.client.emit('new peer', this.roomName);
      // this.$socket.$subscribe('src ice', payload => {
      //   this.$store.dispatch("ROOM_SET", payload.room);
      // });
      this.connectToRoom();
    },
    connectToRoom() {
      this.$store.dispatch("UPDATE_PEERID", this.$socket.client.id);
      this.$store.dispatch("UPDATE_ROOM", this.SET_ROOM);
      this.$socket.client.emit('new peer', this.SET_ROOM);
      this.setSocketListeners();
    },
    setSocketListeners() {
      this.$socket.$subscribe('room null', () => {
        this.SET_ROOM = "";
        this.$store.dispatch("UPDATE_ROOM", "");
      });
      this.$socket.$subscribe("src ice", iceData => {
        if (iceData.room !== this.room || iceData.id !== this.peerID) {
          return;
        }
        
        this.rtcConn.addIceCandidate(new RTCIceCandidate(iceData.candidate));
      });

      this.$socket.$subscribe("src desc", descData => {
        if (descData.room !== this.room || descData.id !== this.peerID) {
          return;
        }
        const rtc = new RTCPeerConnection(servers, {
          optional: [{ RtpDataChannels: true }]
        });
        this.$store.dispatch("UPDATE_RTCCONN", rtc);
        this.attachRTCliteners();
        this.rtcConn.setRemoteDescription(
          new RTCSessionDescription(descData.desc)
        ).then(() => {
          this.createAnswer();
        });
      });
    },
    createAnswer() {
      this.rtcConn.createAnswer().then(desc => {
        this.rtcConn
          .setLocalDescription(new RTCSessionDescription(desc))
          .then(this.sendAnswer(desc))
      });
    },
    sendAnswer(desc) {
      this.$socket.client.emit("peer new desc", {
              id: this.peerID,
              room: this.room,
              desc: desc
            })
    },
    attachRTCliteners() {
      this.rtcConn.onicecandidate = event => {
        if (!event.candidate) {
          return;
        }
        this.$socket.client.emit("peer new ice", {
          id: this.peerID,
          room: this.room,
          candidate: event.candidate
        });
      };

      // eslint-disable-next-line no-unused-vars
      this.rtcConn.onconnectionstatechange = _ev => {
        // var data = {};
        if (this.rtcConn.connectionState === SUCCESSFUL) {
          this.$store.dispatch("UPDATE_CONNECTED_STATUS", SUCCESSFUL);
          this.SET_ROOM = "";
        }

        if (
          this.rtcConn.connectionState == DISCONNECTED ||
          this.rtcConn.connectionState == FAILED
        ) {
          this.$store.dispatch("UPDATE_CONNECTED_STATUS", DISCONNECTED);
          this.$store.dispatch("UPDATE_STREAM_TITLE", "");
          this.$store.dispatch("UPDATE_PLAYING", false);

          // disconnectBtn.$refs.link.hidden = true;
        }
      };

      this.rtcConn.ondatachannel = event => {
        var channel = event.channel;
        channel.onmessage = this.onDataChannelMsg;
      };

      this.rtcConn.ontrack = () => {
        var incomingStream = new MediaStream([event.track]);

        var _iOSDevice = !!navigator.platform.match(
          /iPhone|iPod|iPad|Macintosh|MacIntel/
        );
        if (_iOSDevice) {
          // need to fix

          // playBtn.$refs.link.hidden = false;
          // audioElem.srcObject = incomingStream;
          // audioElem.onplay = () => {
          //   updateState({
          //     established: true,
          //     isPlaying: audioElem.srcObject.active,
          //     stream: incomingStream
          //   });
          // };
          this.$store.dispatch("UPDATE_CONNECTED_STATUS", SUCCESSFUL);
          this.$store.dispatch("UPDATE_PLAYING", false);
          this.$store.dispatch("UPDATE_STREAM", incomingStream);
        } else {
          // NEED TO FIX
          //
          // audioElem.srcObject = incomingStream;
          // audioElem.onplay = () => {
          //   updateState({
          //     established: true,
          //     isPlaying: audioElem.srcObject.active,
          //     stream: incomingStream
          //   });
          // };
          // audioElem.play().catch = err => {
          //   playBtn.$refs.link.hidden = false;
          // };
          this.$store.dispatch("UPDATE_CONNECTED_STATUS", SUCCESSFUL);
          this.$store.dispatch("UPDATE_PLAYING", true);
          this.$store.dispatch("UPDATE_STREAM", incomingStream);
        }

        // disconnectBtn.$refs.link.hidden = false;
      };
    },
    onDataChannelMsg(messageEvent) {
      // data channel to recieve the media title
      try {
        var mediaDescription = JSON.parse(messageEvent.data);
        this.$store.dispatch("UPDATE_STREAM_TITLE", mediaDescription.title);

        // if (state.streamTitle.length > 0) {
        //   titleTag.innerText = state.streamTitle;
        //   if (state.streamTitle.length <= 41) {
        //     titleTag.classList.remove("title-text");
        //     titleTag.classList.add("title-text-no-animation");
        //   } else {
        //     titleTag.classList.remove("title-text-no-animation");
        //     titleTag.classList.add("title-text");
        //   }
        // }
      } catch (err) {
        this.logMessage();
      }
    },
    logMessage() {
      // continue regardless of error
    }

  },
  computed: {
    ...mapState(['room', 'rtcConn', 'streamTitle', 'playing', 'connectedStatus', 'peerID'])
  }
}
</script>

<style>
    div.v-text-field {
      width: 100%;
      margin-right: 0%;
    }
</style>