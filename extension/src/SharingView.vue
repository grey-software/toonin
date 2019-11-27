<template>
  <div class="body-container">
    <v-text-field
      :value="roomName"
      :readonly="true"
      @click:append="copyIdToClipboard"
      append-icon="mdi-content-copy"
      color="primary"
      label="Your Toonin ID"
      id="id-display-area"
      outlined
      rounded
    ></v-text-field>
    <v-btn @click="stopSharing" class="btn-share" height="42" outlined color="primary" rounded>
      <v-icon left>$vuetify.icons.toonin</v-icon>Stop Sharing
    </v-btn>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  name: "sharing-view",
  methods: {
    ...mapActions(["copyIdToClipboard"])
  },
  computed: {
    ...mapState(["roomName"])
  }
};
</script>

<style>
</style>