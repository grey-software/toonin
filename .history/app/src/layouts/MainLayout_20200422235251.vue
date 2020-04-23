<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <!-- <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        /> -->

        <q-toolbar-title>
          Toonin
        </q-toolbar-title>

        <div>
          <q-btn
            @click="onDarkModeChange"
            :icon="mdi-lightbulb-outline"
          >
            <!-- <q-icon
              v-if="$vuetify.theme.dark"
              color="grey"
            >mdi-lightbulb-outline</q-icon>
            <q-icon
              v-else
              color="blue"
            >mdi-lightbulb-on-outline</q-icon> -->
          </q-btn>
        </div>

      </q-toolbar>
    </q-header>

    <!-- <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      content-class="bg-grey-1"
    >
      <q-list>
        <q-item-label
          header
          class="text-grey-8"
        >
          Essential Links
        </q-item-label>
        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer> -->

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
// import EssentialLink from 'components/EssentialLink'

export default {
  name: 'MainLayout',

  components: {

  },

  data () {
    return {

    }
  },
  methods: {
    onDarkModeChange () {
      console.log(this.$q.dark.isActive)
      this.$q.dark.toggle()
      // this.$vuetify.theme.dark
      //   ? (this.$vuetify.theme.dark = false)
      //   : (this.$vuetify.theme.dark = true);
      // window.localStorage.setItem('isDark', this.$vuetify.theme.dark ? 1 : 0);
    }
  }
}
</script>
