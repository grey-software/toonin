<template>
  <div class="body-container">
    <v-text-field
      :value="roomName"
      @change="setRoomName"
      append-icon="mdi-cached"
      @click:append="randomRoomName"
      :error-messages="roomNameInputErrorMessages"
      label="Name your room"
      color="primary"
      outlined
      rounded
      autofocus
    ></v-text-field>
    <v-btn
      :disabled="!roomNameValid"
      @click="startShare"
      class="btn-share"
      height="42"
      outlined
      color="primary"
      rounded
    >
      <v-icon left>$vuetify.icons.toonin</v-icon>Share
    </v-btn>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  name: "home-view",
  computed: {
    ...mapState(["roomName", "roomNameValid", "roomNameInputErrorMessages"])
  },
  methods: {
    ...mapActions(["setRoomName", "randomRoomName", "startShare"])
  }
};
</script>

<style>
</style>