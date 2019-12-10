<template>
  <v-app>
    <v-content>
      <v-container>
        <v-layout row wrap align-center justify-center>
          <div style="padding: 5px">
            <connect-to-room />
          </div>
          <div style="padding: 5px">
            <connection-status />
          </div>
        </v-layout>
      </v-container>
      <v-container>
        <player-controls @volume-change="volumeHandler" />
        <Title />
      </v-container>

      <br><br>

      <video-player></video-player>
    </v-content>
    <v-footer app>
      <v-spacer></v-spacer>
      <span>&copy; Toonin 2019</span>
    </v-footer>
  </v-app>
</template>

<script>
import ConnectToRoom from "@/components/ConnectToRoom.vue";
import ConnectionStatus from "@/components/Connection.vue";
import PlayerControls from "@/components/PlayerControls.vue";
import Title from "@/components/Title.vue";
import VideoPlayer from "@/components/VideoPlayer.vue";
export default {
  name: "Home",
  data: () => ({
    volume: 50
  }),
  components: {
    ConnectToRoom,
    ConnectionStatus,
    PlayerControls,
    Title,
    VideoPlayer
  },
  methods: {
    volumeHandler(volume) {
      this.volume = volume;
    }
  }
};
</script>

<style>
</style>
