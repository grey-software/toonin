<template>
  <v-app id="app-container">
    <v-content id="v-content" @mousemove="enablePlayback">
      <v-text-field style="color: white;" v-model="room" :autofocus="true" placeholder="Room Key" 
      label="Connect" outlined rounded @keyup.enter="checkstream"/>
      <v-btn id="connect-btn" @click="checkstream" rounded>Toonin</v-btn><br><br>
      <v-btn ref="playBtn" @click="manualPlay" style="margin-left: 2%;" hidden rounded>Play</v-btn>
      <div style="float: left; margin-top: 2%; margin-right: 0%;" id='timeline-container'>
        <a id="timelineHeader">Status</a>

        <v-timeline>

          <v-timeline-item :color="room != '' ? '#4CAF50' : '#F44336'" fill-dot>
            <v-card style="width: 250px;" class="statusCard">
              <a class="statusCardRightText">Waiting</a>
            </v-card>
          </v-timeline-item>

          <v-timeline-item :color="roomFound ? '#4CAF50' : '#F44336'" fill-dot>
            <v-card class="statusCard">
              <a class="statusCardLeftText">Room found</a>
            </v-card> 
          </v-timeline-item>

          <v-timeline-item :color="established ? '#4CAF50' : '#F44336'" fill-dot >
            <v-card class="statusCard">
              <a class="statusCardRightText">Connected</a>
            </v-card>  
          </v-timeline-item>

          <v-timeline-item :color="isPlaying ? '#4CAF50' : '#F44336'" fill-dot >
            <v-card class="statusCard">
              <a class="statusCardLeftText">Playing</a>
            </v-card>
          </v-timeline-item>

        </v-timeline>

      </div>
      
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
      height: 20%; 
      margin-left: 20.5%; 
      margin-top: 10%;
    }

    div#timeline-container {
      margin-left: 3%;
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
      margin-left: 15%; 
      margin-top: 6%;
  }

  .statusCard {
    padding: 5%;
    text-align: center;
  }

/*
  .statusCardRightText {
    margin-left: 10%;
    font-family: sans-serif;
    font-weight: 200;
  }

  .statusCardLeftText {
    margin-left: 5%;
    font-family: sans-serif;
    font-weight: 200;
  }
  */

  #timelineHeader {
    font-size: 250%;
    font-weight: 300;
    margin-left: 33%;
  }

</style>

<script>

import {init, logMessage, checkstream, enablePlayback, manualPlay} from './app';

export default {
    name: "App",
    data: () => ({
      room: "",
      established: false,
      roomFound: false,
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
