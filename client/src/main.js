import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import VueSocketIOExt from "vue-socket.io-extended";
import io from "socket.io-client";

Vue.config.productionTip = false;

// ATTN: Uncomment accordingly for local/remote dev
const ENDPOINT = "https://www.toonin.ml:8443/";
const socket = io(ENDPOINT, { secure: true });
// var socket = io("http://127.0.0.1:8100");

window.onunload = () => {
  if(store.getters.ROOM.length > 0) {
    socket.emit("logoff", { room: store.getters.ROOM, socketID: socket.id });
  }
  
};

Vue.use(VueSocketIOExt, socket, { store });

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount("#app");
