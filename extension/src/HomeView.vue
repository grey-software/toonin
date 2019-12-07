<template>
  <div class="body-container column">
    <div class="flex">
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
    <div class="flex">
      <v-text-field
        :value="tooninName"
        @change="tooninNameChange"
        :error-messages="roomNameInputErrorMessages"
        label="Enter Friend's room"
        color="primary"
        outlined
        rounded
        autofocus
      ></v-text-field>
      <v-btn
        @click="startTooning"
        class="btn-share"
        height="42"
        outlined
        color="primary"
        rounded
      >
        <v-icon left>$vuetify.icons.toonin</v-icon>Share
      </v-btn>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations } from "vuex";

export default {
  name: "home-view",
  computed: {
    ...mapState(["roomName", "roomNameValid", "roomNameInputErrorMessages"])
  },
  methods: {
    ...mapActions(["randomRoomName", "startShare", "startTooning"]),
    ...mapMutations(["setRoomName"])
  }
};
</script>

<style>
</style>