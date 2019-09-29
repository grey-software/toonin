<template>
  <v-app>
    <v-content>
      <v-text-field v-model="room" />
      <v-btn @click="toonin">Toonin</v-btn>
      <div>
        <audio v-ref="audio" controls />
      </div>

      <div class="title">{{Timeline}}</div>
      <v-timeline>
        <v-timeline-item>Room Found</v-timeline-item>
        <v-timeline-item class="text-right">timeline item</v-timeline-item>
        <v-timeline-item>timeline item</v-timeline-item>
      </v-timeline>
    </v-content>
  </v-app>
</template>

<script>


export default {
  name: "App",
  components: {
    HelloWorld
  },
  data: () => ({
    room: "",
    candidates: [],
    established: false,
    rtcConn: null,
    isPlaying: false,
    stream: null
  }),
  methods: {
    toonin() {
      console.log(`Tuned in to room: ${this.room}`);
    }
  }
};
</script>
