/* eslint-disable no-console */
<template>
  <v-card class="mx-auto" max-width="900px" :elevation="40">
    <v-card-title class="toonin-title">{{ cardTitle }}</v-card-title>
    <v-container fluid>
      <v-card class="mx-auto" max-width="854px">
        <video
          id="video"
          ref="videoPlayer"
          :srcObject.prop="videoSrc"
          @click="requestFullScreen"
          preload="auto"
          muted
          autoplay
          v-show="videoSrc !== null"
        ></video>
      </v-card>
      <v-img
        max-height="240px"
        contain
        src="../assets/icon.png"
        style="margin-top: 1%; padding-top: 20px"
        v-show="videoSrc == null"
      />
      <v-card-text class="text--primary">
        <v-text-field
          v-model="roomName"
          style="color: white;"
          autofocus
          label="Name your room"
          outlined
          rounded
          append-icon="mdi-cached"
          @click:append="randomRoomName"
          :error-messages="errorMessages"
          v-show="!connectedRoom"
        />
      </v-card-text>
      <v-card-actions>
        <span v-show="connectedRoom">
          <v-icon large color="primary">mdi-account</v-icon>
          <span class="label-room-name ml-3">{{ this.peerCounter }} peers</span>
        </span>
        <v-btn
          @click="copyIdToClipboard"
          icon
          color="primary"
          class="ml-3"
          v-show="connectedRoom"
        >
          <v-icon color="primary">mdi-content-copy</v-icon>
        </v-btn>
        <v-btn
          class="mx-2"
          @click="copyLinkToClipboard"
          icon
          color="primary"
          v-show="connectedRoom"
        >
          <v-icon left color="primary">mdi-earth</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          @click="startCapture"
          class="btn-share pr-4"
          height="42"
          outlined
          color="primary"
          rounded
          v-show="videoSrc == null"
          :disabled="!roomNameValid || tooninHappening"
        >
          <v-icon left>$vuetify.icons.toonin</v-icon>Share
        </v-btn>
        <v-btn
          @click="getUserVideo"
          disabled
          outlined
          color="primary"
          rounded
          icon
        >
          <v-icon v-if="userVideo" color="warning">mdi-video</v-icon>
          <v-icon v-else color="primary">mdi-video</v-icon>
        </v-btn>
        <v-btn
          @click="getUserAudio"
          disabled
          outlined
          rounded
          icon
          color="primary"
        >
          <v-icon v-if="userAudio" color="warning">mdi-microphone</v-icon>
          <v-icon v-else color="primary">mdi-microphone</v-icon>
        </v-btn>
        <v-btn
          @click="stopCapture"
          class="btn-share pr-4"
          height="42"
          outlined
          color="warning"
          rounded
          v-show="videoSrc !== null"
        >
          <v-icon>mdi-stop</v-icon>
          Disconnect
        </v-btn>
      </v-card-actions>
    </v-container>
  </v-card>
</template>

<script>
function makeid(length) {
  var result = "";
  var characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
const VALID_ROOM_REGEX = /^[a-z0-9_-]{4,16}$/;

const copyToClipboard = str => {
  const el = document.createElement("textarea");
  el.value = str;
  el.setAttribute("readonly", "");
  el.style.position = "absolute";
  el.style.left = "-9999px";
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
};
import { mapState } from "vuex";
import { StartShare } from "../host";
export default {
  name: "screen-cap",
  data: () => ({
    videoSrc: null,
    videoTag: null,
    roomName: "",
    roomNameInputErrorMessages: [],
    userVideo: null,
    userAudio: null
  }),
  computed: {
    cardTitle() {
      if (this.connectedRoom) {
        return `Personal room name is ${this.connectedRoom}`;
      }
      return "Create your room";
    },
    roomNameValid() {
      const valid = this.roomName.match(VALID_ROOM_REGEX);
      if (valid) {
        return true;
      } else {
        return false;
      }
    },
    errorMessages() {
      if (this.roomNameInputErrorMessages.length > 0) {
        return this.roomNameInputErrorMessages;
      } else if (this.connectedStatus === "connected") {
        return ["Already connected to a room."];
      } else {
        return [];
      }
    },
    tooninHappening() {
      if (this.connectedStatus === "connected") {
        return true;
      }
      return false;
    },
    peerCounter() {
      if (this.peers) {
        return this.peers.getPeerCount();
      } else {
        return 0;
      }
    },
    ...mapState(["connectedRoom", "connectedStatus", "sharing", "peers"])
  },
  watch: {
    videoSrc: function(newValue) {
      if (newValue) {
        this.shareVideo();
      } else {
        this.stopCapture();
      }
    }
  },
  methods: {
    shareVideo() {
      // eslint-disable-next-line no-console
      console.log("called shareVideo.");
      this.peers.getSocket().emit("create room", {
        room: this.roomName,
        isDistributed: true
      });
    },
    async startCapture() {
      var displayMediaOptions = {
        video: {
          cursor: "motion"
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        },
        videoConstraints: {
          mandatory: {
            minFrameRate: 60
          }
        }
      };
      let captureStream = null;
      try {
        captureStream = await navigator.mediaDevices.getDisplayMedia(
          displayMediaOptions
        );
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log(err);
        if (typeof window.orientation !== "undefined") {
          this.roomNameInputErrorMessages.push(
            "Error: screen capture not available on mobile devices."
          );
        }
        this.roomNameInputErrorMessages.push(
          "Error: screen capture not available. " + err.message
        );
      }
      if (captureStream) {
        this.$store.dispatch("UPDATE_PEERS", new StartShare(this, true));
        this.roomNameInputErrorMessages = [];
        this.videoSrc = captureStream;
        return captureStream;
      } else {
        return;
      }
    },
    stopCapture() {
      if (this.videoSrc) {
        let tracks = this.videoSrc.getTracks();

        tracks.forEach(track => track.stop());
        this.videoSrc = null;
      }
      this.disconnect();
    },
    async disconnect() {
      if (this.sharing) {
        await this.peers.removeAllPeersAndClose();
        this.$store.dispatch("UPDATE_CONNECTED_ROOM", null);
        this.$store.dispatch("UPDATE_SHARING", false);
        this.$store.dispatch("UPDATE_PEERS", null);
        this.roomName = "";
      }
    },
    requestFullScreen() {
      if (this.videoTag.requestFullscreen) {
        this.videoTag.requestFullscreen();
      } else if (this.videoTag.mozRequestFullScreen) {
        /* Firefox */
        this.videoTag.mozRequestFullScreen();
      } else if (this.videoTag.webkitRequestFullscreen) {
        /* Chrome, Safari and Opera */
        this.videoTag.webkitRequestFullscreen();
      } else if (this.videoTag.msRequestFullscreen) {
        /* IE/Edge */
        this.videoTag.msRequestFullscreen();
      }
    },
    randomRoomName() {
      const newname = makeid(8);
      this.roomName = newname;
    },
    copyLinkToClipboard() {
      copyToClipboard(`${window.location.origin}/${this.connectedRoom}`);
    },
    copyIdToClipboard() {
      copyToClipboard(this.connectedRoom);
    },
    async getUserAudio() {
      if (!this.userAudio) {
        let stream = null;

        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: true
          });
          /* use the stream */
        } catch (err) {
          // video: { facingMode: "user" }
          /* handle the error */
          // eslint-disable-next-line no-console
          console.log(err);
        }
        this.userAudio = stream;
      } else {
        let tracks = this.userAudio.getTracks();

        tracks.forEach(track => track.stop());
        this.userAudio = null;
        // eslint-disable-next-line no-console
        console.log("Audio off");
      }
    },
    async getUserVideo() {
      if (!this.userVideo) {
        let stream = null;

        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" }
          });
          /* use the stream */
        } catch (err) {
          // video: { facingMode: "user" }
          /* handle the error */
          // eslint-disable-next-line no-console
          console.log(err);
        }
        this.userVideo = stream;
      } else {
        let tracks = this.userVideo.getTracks();

        tracks.forEach(track => track.stop());
        this.userVideo = null;
        // eslint-disable-next-line no-console
        console.log("Video off");
      }
    }
  },
  mounted() {
    this.videoTag = this.$refs.videoPlayer;
    window.onunload = () => {
      if (this.sharing) {
        this.peers.socket.emit("disconnect room", { room: this.connectedRoom });
      }
    };
  }
};
</script>

<style>
#video {
  border: 1px solid #999;
  width: 100%;
  height: 480px;
}
</style>
