<template>
  <v-app class="toonin-container">
    <div class="title-container">
      <img class="title-icon" src="icon.png" />
      <span class="title-text">Toonin</span>
    </div>
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
  </v-app>
</template>

<script>
import { mapState, mapMutations, mapActions } from "vuex";

export default {
  data() {
    return {
      message: "My new tab page"
    };
  },
  computed: {
    ...mapState(["roomNameInputErrorMessages", "roomNameValid", "roomName"])
  },
  methods: {
    ...mapActions([
      "startShare",
      "randomRoomName" //also supports payload `this.nameOfAction(amount)`
    ]),
    ...mapMutations([
      "setRoomName" //also supports payload `this.nameOfMutation(amount)`
    ])
  }
};
</script>

<style lang="css">
@import url("https://fonts.googleapis.com/css?family=Nunito+Sans:800&display=swap");

:root {
  --color-blue: #4296bd;
  --color-title-text: #f6d45a;
}

.toonin-container {
  width: 477px;
  height: 250px;
}

.title-container {
  width: 477px;
  height: 158px;
  background: url("title-background.png");
  background-size: 532px 158px;
  padding: 24px 32px;
  display: flex;
}

.body-container {
  padding: 30px 32px 0px 32px;
  display: flex;
  background-color: white;
}

.title-text {
  font-family: "Nunito Sans", sans-serif;
  font-size: 96px;
  color: var(--color-title-text);
  -webkit-text-stroke: 1px var(--color-blue);
}

.title-icon {
  width: 102px;
  height: 102px;
}

.v-input__slot {
  width: 263px !important;
}

.btn-share {
  margin-top: 6px;
}
</style>
