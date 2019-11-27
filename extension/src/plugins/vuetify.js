import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import TooninIcon from '../components/TooninIcon.vue'


Vue.use(Vuetify)

const opts = {
    theme: {
        primary: '#4296bd',
        secondary: '#f6d45a',
    },
    icons: {
        values: {
            toonin: {
                component: TooninIcon, // you can use string here if component is registered globally
              },
        },
      },
}

export default new Vuetify(opts)
