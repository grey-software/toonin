import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import VueSocketIOExt from "vue-socket.io-extended";
import io from "socket.io-client";

Vue.config.productionTip = false;

const ENDPOINT = "https://www.toonin.ml:8443/";

const socket = io(ENDPOINT, { secure: true });

Vue.use(VueSocketIOExt, socket, { store });

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount("#app");
