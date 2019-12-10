<template>
  <video 
    id="vid"
    style="min-height: 400px; min-width: 400px; height: auto; width: auto;"
    :srcObject.prop="playing? videoStream : null"
    preload="auto"
    autoplay
  ></video>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "video-player",
  computed: {
    ...mapState(["videoStream", "playing"])
  },
};
</script>

<style>
</style>