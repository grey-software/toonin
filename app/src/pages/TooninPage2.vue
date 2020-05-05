<template>
  <div class="column items-center">
    <ConnectToRoom2></ConnectToRoom2>
    <div class="video-container">
      <div class="absolute">
        <transition
          name="fade"
          mode="out-in"
        >
          <video-player v-show="connectedStatus == 'connected'" />
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
          class="player-icon text-primary"
          name="mdi-dots-horizontal"
        ></q-icon>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex"
import ConnectToRoom2 from "../components/ConnectToRoom2"
import VideoPlayer from "../components/VideoPlayer"
import PlayerControls from "../components/PlayerControls"

export default {
  components: {
    ConnectToRoom2,
    VideoPlayer,
    PlayerControls
  },
  computed: {
    ...mapState(['connectedStatus', 'playing'])
  },
  methods: {
    startPlaying () {
      this.$store.dispatch('UPDATE_PLAYING', true)
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
.video-container {
  position: relative;
  width: 599px;
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