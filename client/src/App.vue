<template>
  <v-app id="app-container">
    <v-content id="v-content" @mousemove="enablePlayback">
      <v-text-field style="color: white;" v-model="room" :autofocus="true" placeholder="Room Key" 
      label="Connect" outlined rounded @keyup.enter="checkstream"/>
      <v-btn id="connect-btn" @click="checkstream" rounded>Toonin</v-btn><br><br>
      <v-btn ref="playBtn" @click="manualPlay" style="margin-left: 2%;" hidden rounded>Play</v-btn>
      <div>
        <audio ref="audio"/>
      </div>

      <img src='./icon.png' id="logo"/>

      <!--<div class="title">{{Timeline}}</div>-->
      
    </v-content>
  </v-app>
</template>

<style>

  @media screen and (max-width: 600px) {

    div.v-text-field {
      width: 45%;
    }

    img#logo {
      height: 30%; 
      margin-left: 17.5%; 
      margin-top: 35%;
    }
  }

  #v-content {
      margin-left: 4%; 
      margin-top: 4%;
  }

  #app-container {
    background-color: rgb(253, 253, 253);
  }

  .v-text-field {
      width: 25%;
  }

  #connect-btn {
      margin-left: 1.5%;
  }

  #logo {
      height: 35%; 
      margin-left: 40%; 
      margin-top: 6%;
  }
</style>

<script>

import {init, logMessage, checkstream, enablePlayback, manualPlay} from './app';

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
      logMessage,
      checkstream,
      enablePlayback,
      manualPlay
    },
    mounted: function() { init(this, this.$refs.audio, this.$refs.playBtn); }
};
</script>
