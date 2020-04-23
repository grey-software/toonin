<template>
  <q-card class="controls-container mx-auto">
    <div
      class="row"
      class="controls-row px-4"
    >
      <v-col class="mt-5">
        <v-slider
          v-model="volume"
          prepend-icon="volume_up"
          @change="volChange"
          @click:prepend="mute"
        ></v-slider>
      </v-col>
      <v-col cols="3">
        <v-btn
          v-show="playing == false"
          :disabled="audioStream || videoStream ? false : true"
          outlined
          fab
          color="light-blue"
          @click="playTrack()"
        >
          <v-icon large>play_arrow</v-icon>
        </v-btn>
        <v-btn
          v-show="connectedStatus == 'connected' && playing == true"
          outlined
          fab
          color="light-blue"
          @click="pauseTrack()"
        >
          <v-icon large>pause</v-icon>
        </v-btn>
      </v-col>
      <audio
        :srcObject.prop="playing ? audioStream : null"
        style="display: none;"
        preload="auto"
        autoplay
        ref="audio"
      />
    </div>
  </q-card>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'player-controls',
  data () {
    return { audio: undefined }
  },
  methods: {
    pauseTrack () {
      this.$store.dispatch('UPDATE_PLAYING', false)
      this.audio.pause()
    },
    playTrack () {
      this.$store.dispatch('UPDATE_PLAYING', true)
      this.audio.play()
    },
    volChange (value) {
      this.audio.volume = value / 100
    },
    mute () {
      this.audio.volume = 0
      this.$store.dispatch('UPDATE_VOLUME', 0)
    }
  },
  computed: {
    ...mapState([
      'streamTitle',
      'connectedStatus',
      'audioStream',
      'videoStream',
      'playing'
    ]),
    volume: {
      get: function () {
        return this.$store.getters.VOLUME
      },
      set: function (value) {
        this.$store.dispatch('UPDATE_VOLUME', value)
      }
    }
  },
  mounted () {
    this.audio = this.$refs.audio
  }
}
</script>

<style scoped>
.controls-container {
  max-width: 400px;
  border-radius: 16px !important;
  align-items: center;
  justify-content: center;
  display: flex;
}

.controls-row {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
