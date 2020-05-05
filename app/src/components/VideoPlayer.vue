<template>
  <vue-plyr
    ref="plyr"
    :options="{ratio: '16:9', controls: playing ? playingControls : initialControls}"
    class="video-player"
  >
    <video
      crossorigin
      class="video-source"
      ref="videoPlayer"
      :srcObject.prop="playing ? combined : null"
      autoplay
    ></video>
  </vue-plyr>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'video-player',
  data () {
    return {
      videoTag: null,
      initialControls: [],
      playingControls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen']    }
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
    },
    player () {
      return this.$refs.plyr.player
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
.plyr--video {
  border-radius: 12px !important;
}

.video-player {
  border-radius: 16px;
  width: 599px;
}
</style>
