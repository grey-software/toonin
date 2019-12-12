<template>
  <v-card class="mx-auto" max-width="400" max-height="600px" flat rounded :elevation="8">
    <v-card-title
      class="toonin-title"
    >{{cardTitle}}</v-card-title>
    <v-img
      max-height="240px"
      contain
      src="../assets/icon.png"
      style="margin-top: 1%; padding-top: 20px"
    />
    <v-card-text class="text--primary">
      <v-text-field
        v-show="connectedStatus=='disconnected' || connectedStatus=='failed'"
        v-model="roomName"
        style="color: white;"
        :autofocus="true"
        placeholder="Room Key"
        outlined
        rounded
      />
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn
        @click="handleTooninButtonClick"
        class="btn-share"
        height="42"
        outlined
        color="primary"
        rounded
      >
        <v-icon left>$vuetify.icons.toonin</v-icon>
        {{buttonStatus}}
      </v-btn>
      <v-spacer></v-spacer>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapState } from "vuex";
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
  name: "connect-to-room",
  props: {},
  data() {
    return {
      roomName: null
    };
  },
  methods: {
    handleTooninButtonClick() {
      if (this.connectedStatus == "connected") {
        this.disconnect();
      } else this.toonin();
    },
    toonin() {
      this.connectToRoom();
    },
    connectToRoom() {
      this.$store.dispatch("UPDATE_PEERID", this.$socket.client.id);
      this.$store.dispatch("UPDATE_ROOM", this.roomName);
      this.setSocketListeners();
      this.$socket.client.emit("new peer", this.roomName);
    },
    setSocketListeners() {
      this.$socket.$subscribe("room null", () => {
        this.roomName = "";
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
        this.rtcConn
          .setRemoteDescription(new RTCSessionDescription(descData.desc))
          .then(() => {
            this.createAnswer();
          });
      });
      this.$socket.$subscribe("title", title => {
        this.$store.dispatch("UPDATE_STREAM_TITLE", title);
      });
    },
    createAnswer() {
      this.rtcConn.createAnswer().then(desc => {
        this.rtcConn
          .setLocalDescription(new RTCSessionDescription(desc))
          .then(this.sendAnswer(desc));
      });
    },
    sendAnswer(desc) {
      this.$socket.client.emit("peer new desc", {
        id: this.peerID,
        room: this.room,
        desc: desc
      });
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
          this.roomName = "";
          this.rtcConn.createDataChannel('mediaDescription');
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
          this.$store.dispatch("UPDATE_AUDIO_STREAM", null);
          this.$store.dispatch("UPDATE_VIDEO_STREAM", null);

          // disconnectBtn.$refs.link.hidden = true;
        }
      };
      
      this.rtcConn.ondatachannel = event => {
        var channel = event.channel;
        channel.onmessage = this.onDataChannelMsg;
      };

      this.rtcConn.ontrack = (event) => {
        var incomingStream = new MediaStream([event.track]);

        var _iOSDevice = !!navigator.platform.match(
          /iPhone|iPod|iPad|Macintosh|MacIntel/
        );
        if (_iOSDevice) {
          this.$store.dispatch("UPDATE_CONNECTED_STATUS", SUCCESSFUL);
          this.$store.dispatch("UPDATE_PLAYING", false);
          if(incomingStream.getAudioTracks().length > 0) {
            this.$store.dispatch("UPDATE_AUDIO_STREAM", incomingStream);
          }
          else {
            this.$store.dispatch("UPDATE_VIDEO_STREAM", incomingStream);
          }
        } else {
          this.$store.dispatch("UPDATE_CONNECTED_STATUS", SUCCESSFUL);
          this.$store.dispatch("UPDATE_PLAYING", true);
          if(incomingStream.getAudioTracks().length > 0) {
            this.$store.dispatch("UPDATE_AUDIO_STREAM", incomingStream);
          }
          else {
            this.$store.dispatch("UPDATE_VIDEO_STREAM", incomingStream);
          }
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
      this.$store.dispatch("UPDATE_AUDIO_STREAM", null);
      this.$store.dispatch("UPDATE_VIDEO_STREAM", null);
      this.$store.dispatch("UPDATE_CONNECTED_STATUS", DISCONNECTED);
      this.$store.dispatch("UPDATE_ROOM", "");
      this.$store.dispatch("UPDATE_PEERID", null);
      this.$store.dispatch("UPDATE_STREAM_TITLE", "");
      this.$store.dispatch("UPDATE_PLAYING", false);
      this.$store.dispatch("UPDATE_RTCCONN", null);
    }
  },
  computed: {
    buttonStatus() {
      if (this.connectedStatus == "connected") {
        return "Disconnect";
      }
      return "Toonin";
    },
    cardTitle() {
      if (this.connectedStatus == "connected") {
        return `Connected to ${this.room}`;
      }
      return "Connect to a room";
    },
    ...mapState([
      "room",
      "rtcConn",
      "streamTitle",
      "playing",
      "connectedStatus",
      "peerID",
      "audioStream",
      "videoStream"
    ])
  },
  mounted: function() {
    if (this.$route.params.room) {
      this.roomName = this.$route.params.room;
      setTimeout(() => this.toonin(), 500);
    }
  }
};
</script>

<style>
div.v-text-field {
  width: 100%;
  margin-right: 0%;
}
</style>
