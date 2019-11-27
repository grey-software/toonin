<template>
<v-app>
  <v-content >
    <v-container>
      <v-layout row wrap align-center justify-center>
        <div style="padding: 5px">
          <card />
        </div>
        <div style="padding: 5px">
          <connectionStatus />
        </div>
      </v-layout>
      
    </v-container>
    <v-container>
      <PlayerControls @volume-change="volumeHandler" />
      <Title />
    </v-container>
    
  </v-content>

  </v-app>
</template>

<script>
import card from "@/components/roomName.vue"
import connectionStatus from "@/components/connection.vue"
import PlayerControls from "@/components/media.vue"
import Title from "@/components/title.vue"
export default {
  name: "user",
  data: () => ({
    volume: 50
  }),
  components: {
    card,
    connectionStatus,
    PlayerControls,
    Title
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
