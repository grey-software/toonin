<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <img
          style="padding-right:15px"
          contain
          src="../assets/icon40.png"
        />
        <q-toolbar-title>
          Toonin
        </q-toolbar-title>
        <div>
          <q-btn
            @click="onDarkModeChange"
            :icon="mdi-light-bulb"
          >
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>
    <q-card
      class="mx-auto"
      max-width="900px"
      :elevation="20"
    >
      <q-card-title class="toonin-title justify-center">Welcome {{ name }}</q-card-title>
      <q-tabs
        centered
        slider-color="yellow"
        v-model="tab"
      >
        <v-tab>Connect</v-tab>
        <v-tab>Share Screen</v-tab>
        <v-tab>Chat</v-tab>
        <q-tab
          name="toonin"
          label="Toonin"
        />
        <q-tab
          name="screenCapture"
          label="Screen Capture"
        />
        <q-tab
          name="chat"
          label="Chat"
        />
      </q-tabs>
      <q-tab-panels
        v-model="tab"
        animated
      >
        <q-tab-panel name="toonin">
          <Home></Home>
        </q-tab-panel>
        <q-tab-panel name="screenCapture">
          <ScreenCap></ScreenCap>
        </q-tab-panel>
        <q-tab-panel name="chat">
          <Chat></Chat>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
    <q-page-container>
      <router-view />
    </q-page-container>
    <q-footer>
      <q-spacer></q-spacer>
      <span>
        &copy;
        <strong>Toonin</strong>
        - {{ new Date().getFullYear() }}
      </span>
    </q-footer>
  </q-layout>
</template>

<script>

export default {
  name: 'MainLayout',

  components: {

  },

  data () {
    return {
      tab: null
    }
  },
  methods: {
    onDarkModeChange () {
      this.$q.dark.toggle()
      window.localStorage.setItem('isDark', this.$q.dark.isActive ? 1 : 0)
    }
  },
  created () {
    window.localStorage.getItem('isDark') === 1 ? this.$q.dark.set(true) : this.$q.dark.set(false)
  }
}
</script>
