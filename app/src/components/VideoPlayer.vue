<template>
  <q-card
    :hidden="playing ? false : true"
    :elevation="20"
    v-show="videoStream !== null"
    class="main-card"
  >
    <video
      class="video-player"
      ref="videoPlayer"
      v-show="videoStream !== null"
      :srcObject.prop="playing ? videoStream : null"
      @click="requestFullScreen"
      autoplay
    ></video>
  </q-card>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'video-player',
  data () {
    return { videoTag: null }
  },
  computed: {
    ...mapState(['videoStream', 'playing'])
  },
  methods: {
    requestFullScreen () {
      if (this.videoTag.requestFullscreen) {
        this.videoTag.requestFullscreen()
      } else if (this.videoTag.mozRequestFullScreen) {
        /* Firefox */
        this.videoTag.mozRequestFullScreen()
      } else if (this.videoTag.webkitRequestFullscreen) {
        /* Chrome, Safari and Opera */
        this.videoTag.webkitRequestFullscreen()
      } else if (this.videoTag.msRequestFullscreen) {
        /* IE/Edge */
        this.videoTag.msRequestFullscreen()
      }
    }
  },
  mounted () {
    this.videoTag = this.$refs.videoPlayer
  }
}
</script>

<style lang="sass" scoped>
.video-player
  border: 3px solid #999;
  width: 95%;
  height: 480px;
</style>
