<template>
<v-app>
  <v-content >
    <v-contianer>
      <v-layout align-center justify-center>
        <div style="padding: 50px">
          <card />
        </div>
        <div style="padding: 50px">
          <connectionStatus />
        </div>
      </v-layout>
      
    </v-contianer>
    <PlayerControls @volume-change="volumeHandler" />
  </v-content>

  </v-app>
</template>

<script>
// @ is an alias to /src
import card from "@/components/roomName.vue"
import connectionStatus from "@/components/connection.vue"
import PlayerControls from "@/components/media.vue"
// import {init, logMessage, checkstream, enablePlayback, manualPlay, updateVolume, disconnectStream} from '@/assets/app.js';
export default {
  name: "user",
  data: () => ({
    volume: 50
  }),
  components: {
    card,
    connectionStatus,
    PlayerControls
  },
  methods: {
        volumeHandler(volume) {
          this.volume = volume
        }
      }
};
</script>

<style>
  
</style>
