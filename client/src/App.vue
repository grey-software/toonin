<template>
  <v-app>
    <v-content style="margin-left: 4%; margin-top: 4%;">
      <v-text-field v-model="room" :autofocus="true" placeholder="Room Key" 
      style="width: 40%;" label="Connect" outlined rounded />
      <v-btn @click="checkstream" style="margin-left: 1.5%;">Toonin</v-btn>
      <div>
        <audio ref="audio" />
      </div>

      <img src='./icon.png' style="height: 35%; margin-left: 40%; margin-top: 6%;"/>

      <!--<div class="title">{{Timeline}}</div>-->
      
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
      stream: null,
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
