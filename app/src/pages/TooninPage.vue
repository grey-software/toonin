<template>
  <div>
    <div>
      <q-layout
        class="row main-card"
        align="center"
        fixed-center
      >
        <div style="padding: 5px" class="col-xs-12 col-md-6">
          <connect-to-room />
        </div>
        <div style="padding: 5px" class="col-xs-12 col-md-6">
          <connection-status />
        </div>
        <div v-show="connectedStatus === 'connected'" style="padding: 30px" class="col-xs-12">
          <video-player></video-player>
        <br />
          <player-controls @volume-change="volumeHandler" />
        <Title />
      </div>
      </q-layout>
    </div>
  </div>
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
