<template>
  <div class="column items-center toonin-page-container q-px-md">
    <ConnectToRoom></ConnectToRoom>
    <div class="players-container">
      <div
        class="absolute row justify-center"
        style="width:100%;"
        v-show="connectedStatus == 'connected' && playing"
      >
        <transition
          name="fade"
          mode="out-in"
        >
          <audio-player
            v-if="audioStream && !videoStream"
            :stream="audioStream"
          ></audio-player>
          <video-player v-else />
        </transition>
      </div>
      <div
        v-if="!playing"
        class="player-button"
      >
        <q-btn
          class="toonin-play"
          fab
          color="primary"
          v-if="connectedStatus == 'connected'"
          @click="startPlaying"
        >
          <q-icon
            class="player-icon text-white"
            name="mdi-play"
          ></q-icon>
        </q-btn>
        <q-icon
          v-else
          class="player-icon"
          name="mdi-dots-horizontal"
        ></q-icon>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex"
import ConnectToRoom from "../components/ConnectToRoom"
import VideoPlayer from "../components/VideoPlayer"
import AudioPlayer from "../components/AudioPlayer"

export default {
  components: {
    ConnectToRoom,
    VideoPlayer,
    AudioPlayer
  },
  computed: {
    ...mapState(['connectedStatus', 'videoStream', 'playing', 'audioStream', 'volume']),
  },
  methods: {
    startPlaying () {
      this.$store.commit('SET_PLAYING', true)
    }
  },
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease-out;
}

.fade-enter,
.fade-leave-active {
  opacity: 0;
}
.players-container {
  position: relative;
  height: 337px;
}

.player-button {
  position: absolute;
  left: 45%;
  top: 36%;
}

.player-icon {
  font-size: 42px;
}
</style>

<style scoped>
@media only screen and (max-width: 599px) {
  .players-container {
    width: 343px;
  }
}

@media only screen and (min-width: 600px) {
  .players-container {
    width: 550px;
  }
}

</style>