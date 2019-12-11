<template>
  <v-app class="toonin-container">
    <div class="title-container">
      <img class="title-icon" src="icon.png" />
      <span class="title-text">Toonin</span>
    </div>
    <transition name="fade" mode="out-in">
      <router-view></router-view>
    </transition>
  </v-app>
</template>

<script>
import { States } from "./app.js";
import HomeView from "./HomeView.vue";
import SharingView from "./SharingView.vue";

export default {
  components: {
    HomeView,
    SharingView
  },
  beforeCreate() {
    this.$store.dispatch("toggleScreenShare");
    this.$store.dispatch("requestState");
  },
  data() {
    return {
      message: "My new tab page",
      states: States
    };
  },
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
  height: 124px;
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

.fade-enter-active, .fade-leave-active {
  transition: opacity .3s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
