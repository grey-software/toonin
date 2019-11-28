<template>
  <v-container class="sharing-container">
    <v-row class="ml-2">
      <v-col class="sharing-title-container">
        <!-- <v-icon x-large>$vuetify.icons.toonin</v-icon> -->
        <toonin-icon />
        <span class="label-room-name ml-3">Room Name:</span>
        <span class="text-room-name ml-2">{{roomName}}</span>
        <v-spacer />
        <v-tooltip top>
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" @click="copyIdToClipboard" icon color="primary" class="ml-3">
              <v-icon color="primary">mdi-content-copy</v-icon>
            </v-btn>
          </template>
          <span>Copy Name</span>
        </v-tooltip>
        <v-tooltip top>
          <template v-slot:activator="{ on }">
            <v-btn class="mx-2" @click="copyLinkToClipboard" v-on="on" icon color="primary">
              <v-icon left color="primary">mdi-earth</v-icon>
            </v-btn>
          </template>
          <span>Copy Link</span>
        </v-tooltip>
      </v-col>
    </v-row>
    <v-row class="ml-2">
      <v-col class="sharing-actions-container">
        <v-icon large color="primary">mdi-account</v-icon>
        <span class="label-room-name ml-3">{{peerCount}} peers</span>
        <v-spacer />
        <!-- <v-tooltip top>
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" @click="stopSharing" icon color="primary" class="ml-3">
              <v-icon color="primary">mdi-pause</v-icon>
            </v-btn>
          </template>
          <span>Copy Name</span>
        </v-tooltip>-->
        <v-btn text @click="stopSharing" color="primary">
          <v-icon class="mr-2" color="primary">mdi-stop</v-icon>Stop
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState, mapActions } from "vuex";
import TooninIcon from "./TooninIcon.vue";

export default {
  name: "sharing-view",
  components: {
    TooninIcon
  },
  methods: {
    ...mapActions(["copyIdToClipboard", "copyLinkToClipboard", "stopSharing"])
  },
  computed: {
    ...mapState(["roomName", "peerCount"])
  }
};
</script>

<style>
.sharing-container {
  height: 124px;
  background-color: #ffffff;
}

.sharing-title-container {
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sharing-actions-container {
  background-color: #ffffff;
  display: flex;
}

.label-room-name {
  font-family: Nunito Sans;
  font-style: normal;
  font-weight: 800;
  font-size: 24px;
  color: var(--color-blue);
}

.text-room-name {
  font-family: Nunito Sans;
  font-size: 24px;
  margin-top: 4px;
  color: var(--color-blue);
}
</style>