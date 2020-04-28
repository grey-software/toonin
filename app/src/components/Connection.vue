<template>
  <q-card
    max-width="400"
    max-height="500px"
  >
    <q-card-section class="headline">Connection Status</q-card-section>
    <div
      id="timeline-container"
    >
      <q-timeline justify-center :layout="layout">
        <q-timeline-entry
          :color="room != '' ? 'green' : 'red'"
          fill-dot
          side="left"
          title="Waiting"
        />

        <q-timeline-entry
          :color="room != '' ? 'green' : 'red'"
          fill-dot
          side="right"
          title="Room found"
        />

        <q-timeline-entry
          :color="connectedStatus == 'connected' ? 'green' : 'red'"
          fill-dot
          side="left"
          title="Connected"
        />

        <q-timeline-entry
          :color="playing ? 'green' : 'red'"
          fill-dot
          side="right"
          title="Playing"
        />
      </q-timeline>
    </div>
  </q-card>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'connection',
  computed: {
    layout () {
      return this.$q.screen.lt.sm ? 'dense' : (this.$q.screen.lt.md ? 'comfortable' : 'loose')
    },
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
</style>
