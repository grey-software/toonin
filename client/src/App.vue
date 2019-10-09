<template>
  <v-app>
    <v-content>
      <v-text-field v-model="room" />
      <v-btn @click="checkstream">Toonin</v-btn>
      <div>
        <audio ref="audio" />
      </div>

      <div class="title">{{Timeline}}</div>
      <!-- <v-timeline>
        <v-timeline-item>Room Found</v-timeline-item>
        <v-timeline-item class="text-right">timeline item</v-timeline-item>
        <v-timeline-item>timeline item</v-timeline-item>
      </v-timeline> -->
    </v-content>
  </v-app>
</template>

<script>

import {init, toonin, logMessage, checkstream} from './app';

export default {
    name: "App",
    data: () => ({
      room: "",
      established: false,
      peerID: "",
      rtcConn: null,
      isPlaying: false,
      stream: null
    }),
    methods: {
      toonin,
      logMessage,
      checkstream
    },
    mounted: function() {
      init(this.$refs.audio);
    }
};
</script>
