<template>
  <v-app id="app-container" dark>
    <v-content id="v-content" @mousemove="enablePlayback">
      <v-text-field style="color: white;" v-model="room" :autofocus="true" placeholder="Room Key" 
      label="Connect" outlined rounded @keyup.enter="checkstream"/>

      <img src='./icon.png' style="width: 8%; float: right; margin-right: 4%; margin-top: -7%;"/>

      <v-btn id="connect-btn" @click="checkstream" rounded>Toonin</v-btn>
      <v-btn ref="playBtn" @click="manualPlay" style="margin-left: 2%;" rounded hidden>Play</v-btn>
      <v-btn ref="disconnectBtn" @click="disconnectStream" style="margin-left: 2%;" rounded hidden>Disconnect</v-btn>

      <div style="float: left; margin-top: 5%; margin-right: 0%;" id='timeline-container'>

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

      <!-- <img src='./icon.png' id="logo"/> -->
      <v-bottom-navigation id="bottomBar">
        <v-icon style="margin-left: 2%; margin-right: 0%; color: white;">mdi-volume-high</v-icon>
        <v-container fluid style="width: 20%; margin-left: -1%;">
          <v-slider
            v-model="volume"
            color="#E3F2FD"
            @change="updateVolume"
            style="margin-left: 5%;"
          ></v-slider>
        </v-container>

        <div class="title-container">
          <a class="title-text" style="font-size: 130%; font-weight: 300; color: white;" ref="title"></a>
        </div>

      </v-bottom-navigation>

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

    div.title-container {
      padding: 5%; 
      float: right; 
      margin-top: -23%; 
      margin-left: 5%;
      width: 50%;
      margin-right: 2%;
      overflow: hidden;
      white-space: nowrap;
    }

    a.title-text {
      display: inline-block;
      padding-left: 100%;
      animation: title-text 15s linear infinite;
    }
  }

  #v-content {
      margin-left: 4%; 
      margin-top: 4%;
  }

  /* #app-container {
    background-color: rgb(253, 253, 253);
  } */

  .v-text-field {
      width: 25%;
  }

  #bottomBar {
    width: 90%; 
    height: 20%;
    margin-left: 5.5%;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    position: fixed;
    float: bottom;
    background-color: #1976D2;
  }

  .title-container {
    padding: 1%; 
    margin-left: 5%;
    width: 40%;
    overflow: hidden;
    white-space: nowrap;
    margin-right: 30%;
    text-align: center;
  }

  .title-text {
    display: inline-block;
    padding-left: 100%;
    animation: title-text 12s linear infinite;
  }

  .title-text-no-animation {
    display: inline-block;
  }

  @keyframes title-text {
    0% {
      transform: translate(0, 0);
    }
    100% {
      transform: translate(-100%, 0);
    }
  }

  #connect-btn {
    margin-left: -23%;
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

  #timelineHeader {
    font-size: 250%;
    font-weight: 300;
    margin-left: 33%;
  }

</style>

<script>

import {init, logMessage, checkstream, enablePlayback, manualPlay, updateVolume, disconnectStream} from './app';

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
      streamTitle: "",
      volume: 100
    }),
    methods: {
      logMessage,
      checkstream,
      enablePlayback,
      manualPlay,
      updateVolume,
      disconnectStream
    },
    mounted: function() { init(this, this.$refs.audio, this.$refs.playBtn, this.$refs.title, this.$refs.disconnectBtn); }
};
</script>
