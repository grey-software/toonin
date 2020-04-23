<template>
  <q-content>
    <div>
      <q-layout
        row
        wrap
        align-center
        justify-center
      >
        <div style="padding: 5px">
          <connect-to-room />
        </div>
        <div style="padding: 5px">
          <connection-status />
        </div>
      </q-layout>
    </div>
    <div q-show="connectedStatus === 'connected'">
      <video-player></video-player>
      <br />
      <player-controls @volume-change="volumeHandler" />
      <Title />
    </div>
  </q-content>
</template>

<script>
import ConnectToRoom from '../components/ConnectToRoom.vue'
import ConnectionStatus from '../components/Connection.vue'
import PlayerControls from '../components/PlayerControls.vue'
import Title from '../components/Title.vue'
import VideoPlayer from '../components/VideoPlayer.vue'
import { mapState } from 'vuex'

export default {
  name: 'Home',
  data: () => ({
    volume: 50
  }),
  components: {
    ConnectToRoom,
    ConnectionStatus,
    PlayerControls,
    Title,
    VideoPlayer
  },
  methods: {
    volumeHandler (volume) {
      this.volume = volume
    }
  },
  computed: {
    ...mapState(['name', 'connectedStatus'])
  }
}
</script>

<style></style>
