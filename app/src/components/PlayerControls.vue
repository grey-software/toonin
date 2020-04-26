<template>
  <q-card class="controls-container">
      <q-card-actions style="padding: 20px" align="around">
        <div class="volume-slider">
          <q-item>
            <q-item-section side>
              <q-btn
                outlined
                flat
                @click="mute()"
                icon="volume_down"
              />
            </q-item-section>
            <q-slider
              v-model="volume"
              :min="0"
              :max="100"
              :step="1"
              label
            ></q-slider>
          </q-item>
        </div>
        <q-btn
          v-show="playing == false"
          :disabled="audioStream || videoStream ? false : true"
          outlined
          fab
          color="light-blue"
          @click="playTrack()"
        >
          <q-icon large name="play_arrow"></q-icon>
        </q-btn>
        <q-btn
          v-show="connectedStatus == 'connected' && playing == true"
          outlined
          fab
          color="light-blue"
          @click="pauseTrack()"
        >
          <q-icon large name="pause"></q-icon>
        </q-btn>
      </q-card-actions>
    <audio
        :srcObject.prop="playing ? audioStream : null"
        style="display: none;"
        preload="auto"
        autoplay
        ref="audio"
      />
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
        this.audio.volume = value / 100
        this.$store.dispatch('UPDATE_VOLUME', value)
      }
    }
  },
  mounted () {
    this.audio = this.$refs.audio
  }
}
</script>

<style lang="sass" scoped>
.controls-container
  max-width: 400px;
  border-radius: 16px !important;

.controls-row
  display: flex;
  align-items: center;

.volume-slider
  width: 80%
</style>
