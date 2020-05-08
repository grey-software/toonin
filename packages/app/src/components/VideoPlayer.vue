<template>
  <vue-plyr style="padding: 0%;">
    <video
      controls
      crossorigin
      class="video-player"
      ref="videoPlayer"
      v-show="videoStream !== null"
      :srcObject.prop="playing ? combined : null"
      @click="requestFullScreen"
      autoplay
    ></video>
  </vue-plyr>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'video-player',
  data () {
    return { videoTag: null }
  },
  computed: {
    ...mapState(['videoStream', 'playing', 'audioStream', 'volume']),
    combined () {
      if (this.audioStream && this.videoStream) {
        return new MediaStream([...this.videoStream.getVideoTracks(), ...this.audioStream.getAudioTracks()])
      }
      if (this.videoStream) {
        return new MediaStream([...this.videoStream.getVideoTracks()])
      }
      if (this.audioStream) {
        return null
      }
      return null
    }
  },
  watch: {
    volume () {
      this.videoTag.volume = this.volume / 100
    }
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

<style scoped>
.video-player {
  border: 1.5px solid #999;
  width: 100%;
  height: 480px;
}
</style>
