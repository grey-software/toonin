import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import TooninIconComponent from '../components/TooninIconComponent.vue'


Vue.use(Vuetify)

const opts = {
    theme: {
        primary: '#4296bd',
        secondary: '#f6d45a',
    },
    icons: {
        values: {
            toonin: {
                component: TooninIconComponent, // you can use string here if component is registered globally
              },
        },
      },
}

export default new Vuetify(opts)
