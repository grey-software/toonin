<template>
  <q-layout view="hHh lpR fFf">

    <q-header
      elevated
      class="bg-primary text-white"
      height-hint="98"
    >
      <q-toolbar>
        <q-toolbar-title class="toonin-title">
          <q-avatar>
            <img src="../assets/icon40.png">
          </q-avatar>
          Toonin
        </q-toolbar-title>
        <div>
          <q-btn
            flat
            round
            @click="onDarkModeChange"
            :icon="$q.dark.isActive ? 'mdi-lightbulb-outline' : 'mdi-lightbulb-on-outline'"
          >
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>
    <div style="padding: 100px" align="center" >
      <q-card class=" toonin-title my-card q-pa-md" v-if="name">
        <q-card-section>
        <div class="text-h4">Welcome, {{ name }}</div>
      </q-card-section>
        <q-tabs v-model="tab" class="text-teal">
          <q-tab label="Toonin" name="toonin" />
          <q-tab label="Share" v-if="!$q.platform.is.mobile" name="share" />
          <q-tab label="Chat" name="chat" >
            <q-badge v-if="unread>0" color="red" floating>{{ unread }}</q-badge>
          </q-tab>
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated>
          <q-tab-panel name="toonin">
            <TooninPage />
          </q-tab-panel>
          <q-tab-panel v-if="!$q.platform.is.mobile" name="share">
            <SharePage />
          </q-tab-panel>
          <q-tab-panel name="chat">
            <ChatPage />
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
      <Name v-else />
    </div>
    <q-footer
      elevated
      class="bg-grey-8 text-white"
    >
      <q-toolbar>
        <q-toolbar-title align="right">
          <span>
            &copy;
            <strong>Toonin</strong>
            - {{ new Date().getFullYear() }}
          </span>
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script>
import SharePage from '../pages/SharePage'
import TooninPage from '../pages/TooninPage'
import ChatPage from '../pages/ChatPage'
import Name from '../components/Name'
import { mapState } from 'vuex'
export default {
  data () {
    return {
      tab: 'share'
    }
  },
  components: {
    SharePage,
    TooninPage,
    ChatPage,
    Name
  },
  computed: {
    ...mapState(['name', 'unread'])
  },
  methods: {
    onDarkModeChange () {
      this.$q.dark.toggle()
      window.localStorage.setItem('isDark', this.$q.dark.isActive)
    }
  },
  mounted () {
    this.$q.dark.set(window.localStorage.getItem('isDark'))
  }
}
</script>

<style lang="sass">
.my-card
  width: 100%
  max-width: 1366px
  max-height: 1366px
.main-card
  width: 90%
  max-width: 900px
</style>
<style>
@import url('https://fonts.googleapis.com/css?family=Nunito+Sans:800&display=swap');
:root {
  --color-blue: #4296bd;
  --color-title-text: #f6d45a;
}
.toonin-title {
  font-family: 'Nunito Sans', sans-serif;
  font-size: 28px !important ;
  color: var(--color-blue);
}
</style>
