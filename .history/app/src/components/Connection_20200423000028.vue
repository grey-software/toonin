<template>
  <q-card
    class="mx-auto"
    max-width="400"
    max-height="500px"
  >
    <q-card-title class="headline">Connection Status</q-card-title>
    <div
      style="float: left; margin-top: 5%; margin-right: 0%;"
      id="timeline-container"
    >
      <q-timeline>
        <q-timeline-item
          :color="room != '' ? '#4CAF50' : '#F44336'"
          fill-dot
        >
          <q-card
            style="width: 250px;"
            class="statusCard"
          >
            <a class="statusCardRightText">Waiting</a>
          </q-card>
        </q-timeline-item>

        <q-timeline-item
          :color="room != '' ? '#4CAF50' : '#F44336'"
          fill-dot
        >
          <q-card class="statusCard">
            <a class="statusCardLeftText">Room found</a>
          </q-card>
        </q-timeline-item>

        <q-timeline-item
          :color="connectedStatus == 'connected' ? '#4CAF50' : '#F44336'"
          fill-dot
        >
          <q-card class="statusCard">
            <a class="statusCardRightText">Connected</a>
          </q-card>
        </q-timeline-item>

        <q-timeline-item
          :color="playing ? '#4CAF50' : '#F44336'"
          fill-dot
        >
          <q-card class="statusCard">
            <a class="statusCardLeftText">Playing</a>
          </q-card>
        </q-timeline-item>
      </q-timeline>
    </div>
  </q-card>
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
