import Vue from "vue";
import Vuetify from "vuetify/lib";
import "material-design-icons-iconfont/dist/material-design-icons.css";
import TooninIcon from "../components/TooninIcon.vue"

Vue.use(Vuetify);

export default new Vuetify({
  icons: {
    iconfont: "mdi",
    values: {
      toonin: {
          component: TooninIcon, // you can use string here if component is registered globally
        },
  },
  }
});
