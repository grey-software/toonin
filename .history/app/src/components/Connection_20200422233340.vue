<template>
  <v-card class="mx-auto" max-width="400" max-height="500px">
    <v-card-title class="headline">Connection Status</v-card-title>
    <div
      style="float: left; margin-top: 5%; margin-right: 0%;"
      id="timeline-container"
    >
      <v-timeline>
        <v-timeline-item :color="room != '' ? '#4CAF50' : '#F44336'" fill-dot>
          <v-card style="width: 250px;" class="statusCard">
            <a class="statusCardRightText">Waiting</a>
          </v-card>
        </v-timeline-item>

        <v-timeline-item :color="room != '' ? '#4CAF50' : '#F44336'" fill-dot>
          <v-card class="statusCard">
            <a class="statusCardLeftText">Room found</a>
          </v-card>
        </v-timeline-item>

        <v-timeline-item
          :color="connectedStatus == 'connected' ? '#4CAF50' : '#F44336'"
          fill-dot
        >
          <v-card class="statusCard">
            <a class="statusCardRightText">Connected</a>
          </v-card>
        </v-timeline-item>

        <v-timeline-item :color="playing ? '#4CAF50' : '#F44336'" fill-dot>
          <v-card class="statusCard">
            <a class="statusCardLeftText">Playing</a>
          </v-card>
        </v-timeline-item>
      </v-timeline>
    </div>
  </v-card>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'connection',
  props: {},
  components: {},
  methods: {
    consoleClick () {
      alert('Button clicked')
    }
  },
  computed: {
    ...mapState(['playing', 'connectedStatus', 'room'])
  }
}
</script>

<style>
#timelineHeader {
  font-size: 250%;
  font-weight: 300;
  margin-left: 33%;
}
.statusCard {
  padding: 5%;
  text-align: center;
}
</style>
