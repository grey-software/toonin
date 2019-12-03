<template>
  <v-card
    class="mx-auto"
    max-width="400"
    max-height="600px"
    flat
  >
    <v-card-title v-show="connectedStatus=='disconnected' || connectedStatus=='failed'" class="headline" >Connect to Room</v-card-title>
    <v-card-title v-show="connectedStatus=='connected'" class="headline">Connected to Room {{room}}</v-card-title>
    <v-img max-height="300px" contain src="../assets/icon.png" style="margin-top: 1%; padding-top: 20px" />
    <v-card-text class="text--primary" >
      <v-text-field v-show="connectedStatus=='disconnected' || connectedStatus=='failed'" v-model="SET_ROOM" style="color: white;" :autofocus="true" placeholder="Room Key" outlined rounded/>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <div v-show="connectedStatus=='disconnected' || connectedStatus=='failed'">
        <Button @button-click="toonin" msg="Toonin"/>
      </div>
      <div v-show="connectedStatus=='connected'">
        <Button @button-click="disconnect" msg="Disconnect"/>
      </div>
      <v-spacer></v-spacer>
    </v-card-actions>
  </v-card>
</template>

<script>
import Button from "@/components/button.vue";
import { mapState} from 'vuex'
const SUCCESSFUL = "connected";
const DISCONNECTED = "disconnected";
const FAILED = "failed";
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
  name: "ConnectTo",
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
    toonin() {
      this.connectToRoom();
    },
    connectToRoom() {
      this.$store.dispatch("UPDATE_PEERID", this.$socket.client.id);
      this.$store.dispatch("UPDATE_ROOM", this.SET_ROOM);
      this.setSocketListeners();
      this.$socket.client.emit('new peer', this.SET_ROOM);
      
    },
    evaluateHosts(hostPool) { return { hostFound: true, selectedHost: hostPool[0].socketID }; },
    setSocketListeners() {
      /*eslint no-console: ["error", { allow: ["log"] }] */
      this.$socket.$subscribe('room null', () => {
        this.SET_ROOM = "";
        this.$store.dispatch("UPDATE_ROOM", "");
      });

      this.$socket.$subscribe("host pool", (hostPool) => {
        console.log("recieved host pool to evaluate");
        var evalResult = this.evaluateHosts(hostPool.potentialHosts);
        evalResult.room = hostPool.room;
        if(evalResult.hostFound) {
            console.log("sending eval result");
            this.$socket.client.emit("host eval res", { evalResult: evalResult });
        }
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

      this.rtcConn.onconnectionstatechange = () => {
        if (this.rtcConn.connectionState === SUCCESSFUL) {
          this.$store.dispatch("UPDATE_CONNECTED_STATUS", SUCCESSFUL);
          this.SET_ROOM = "";
        }

        if (
          this.rtcConn.connectionState == DISCONNECTED ||
          this.rtcConn.connectionState == FAILED
        ) {
          this.$store.dispatch("UPDATE_CONNECTED_STATUS", DISCONNECTED);
          this.$store.dispatch("UPDATE_ROOM", "");
          this.$store.dispatch("UPDATE_PEERID", null);
          this.$store.dispatch("UPDATE_STREAM_TITLE", "");
          this.$store.dispatch("UPDATE_PLAYING", false);
          this.$store.dispatch("UPDATE_RTCCONN", null);

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
          this.$store.dispatch("UPDATE_CONNECTED_STATUS", SUCCESSFUL);
          this.$store.dispatch("UPDATE_PLAYING", false);
          this.$store.dispatch("UPDATE_STREAM", incomingStream);
        } else {
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
      } catch (err) {
        this.logMessage();
      }
    },
    logMessage() {
      // continue regardless of error
    },
    disconnect() {
      this.rtcConn.close();
      this.$store.dispatch("UPDATE_STREAM", null);
      this.$store.dispatch("UPDATE_CONNECTED_STATUS", DISCONNECTED);
      this.$store.dispatch("UPDATE_ROOM", "");
      this.$store.dispatch("UPDATE_PEERID", null);
      this.$store.dispatch("UPDATE_STREAM_TITLE", "");
      this.$store.dispatch("UPDATE_PLAYING", false);
      this.$store.dispatch("UPDATE_RTCCONN", null);
    }

  },
  computed: {
    ...mapState(['room', 'rtcConn', 'streamTitle', 'playing', 'connectedStatus', 'peerID', 'stream'])
  },
  mounted: function() {
    if(this.$route.params.room){
      this.SET_ROOM = this.$route.params.room;
      setTimeout(() => this.toonin(), 500);
    }
  }
}
</script>

<style>
    div.v-text-field {
      width: 100%;
      margin-right: 0%;
    }
</style>
