<template>
  <v-card 
  style="height: 50%; width: 50%; margin-left: 25%; padding: 0%;" 
  :hidden="playing ? false : true"
  :elevation="20"
  >

    <video 
    ref="videoPlayer"
    style="margin: 0%; width: 100%; height: 100%;"
    :srcObject.prop="playing? videoStream : null"
    @click="requestFullScreen"
    preload="auto"
    autoplay
    ></video>

  </v-card>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "video-player",
  data() {
    return { videoTag: null };
  },
  computed: {
    ...mapState(["videoStream", "playing"])
  },
  methods: {
    requestFullScreen() {
      if (this.videoTag.requestFullscreen) {
        this.videoTag.requestFullscreen();
      } else if (this.videoTag.mozRequestFullScreen) { /* Firefox */
        this.videoTag.mozRequestFullScreen();
      } else if (this.videoTag.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
        this.videoTag.webkitRequestFullscreen();
      } else if (this.videoTag.msRequestFullscreen) { /* IE/Edge */
        this.videoTag.msRequestFullscreen();
      }
    }
  },
  mounted() { this.videoTag = this.$refs.videoPlayer; }
};
</script>

<style>
</style>