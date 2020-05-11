<template>
    <audio
      ref="player"
      controls
      autoplay
    />
</template>
<script>
export default {
  props: {
    stream: {
      type: MediaStream,
    },
  },
  data () {
    return {
      media: null
    }
  },
  mounted () {
    const audioStream = new MediaStream([...this.stream.getAudioTracks()])
    this.$refs.player.srcObject = audioStream
    this.media = audioStream
  }
}
</script>

<style scoped>
audio {
  margin: 0px 24px;
  box-shadow: 5px 5px 20px rgba(0, 0, 0, 0.4);
  border-radius: 90px;
  transform: scale(1.05);
  left: 50%;
  top: 20%;
}
</style>