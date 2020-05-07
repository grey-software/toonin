<template>
  <q-layout
    view="hHh lpR fFf"
    class="column items-center"
  >
    <div
      class="row justify-center items-center q-mt-md"
      style="width:599px;"
    >
      <div class="row items-baseline">
        <img
          class="title-icon q-mr-sm"
          src="../assets/icon.png"
        />
        <span class="title-text toonin-title q-mr-xl">Toonin</span>
      </div>
      <q-btn
        flat
        fab
        round
        color="toonin"
        @click="onDarkModeChange"
      >
        <q-icon
          class="is-36x36"
          v-if="!$q.dark.isActive"
          name="app:moon"
        />
        <q-icon
          class="is-36x36"
          v-else
          name="app:sun"
        />
      </q-btn>
      <q-btn
        flat
        fab
        round
        @click="openGuide"
      >
        <q-icon
          class="is-36x36"
          name="app:guide"
        ></q-icon>
      </q-btn>
      <q-btn
        flat
        fab
        round
        tyoe="a"
        href="https://www.github.com/grey-software/toonin"
      >
        <q-icon
          class="is-36x36"
          name="app:github"
        ></q-icon>
      </q-btn>
    </div>
    <q-tabs
      v-model="tab"
      class="toonin-tabs"
      narrow-indicator
      inline-label
      align="center"
    >
      <q-tab
        label="Toonin"
        name="toonin"
        icon="app:toonin"
      />
      <q-tab
        label="Share"
        v-if="!$q.platform.is.mobile"
        name="share"
        icon="mdi-access-point"
      />
    </q-tabs>
    <q-tab-panels
      v-model="tab"
      animated
    >
      <q-tab-panel name="toonin">
        <TooninPage2 />
      </q-tab-panel>
      <q-tab-panel
        v-if="!$q.platform.is.mobile"
        name="share"
      >
        <SharePage />
      </q-tab-panel>
    </q-tab-panels>

    <q-page-container>
      <transition
        name="fade"
        mode="out-in"
      >
        <router-view />
      </transition>
    </q-page-container>

  </q-layout>
</template>

<script>
import ConnectionStatusTimeline from "../components/ConnectionStatusTimeline"
import SharePage from '../pages/SharePage'
import TooninPage2 from '../pages/TooninPage2'

export default {
  components: {
    ConnectionStatusTimeline,
    SharePage,
    TooninPage2
  },
  data () {
    return {
      // tab: this.$q.platform.is.mobile ? 'toonin' : 'share'
      tab: 'toonin'
    }
  },
  methods: {
    onDarkModeChange () {
      this.$q.dark.toggle()
      window.localStorage.setItem('isDark', this.$q.dark.isActive)
    },
    openGuide () {
      // TODO: Implement a modal that guides the user journey
    },

  },
  mounted () {
    this.$q.dark.set(window.localStorage.getItem('isDark'))
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition-duration: 0.3s ease-out;
  transition-property: opacity;
}

.fade-enter,
.fade-leave-active {
  opacity: 0;
}

.title-container {
  display: flex;
}

.title-text {
  font-size: 69px;
  color: #f6d45a;
  -webkit-text-stroke: 1px #4296bd;
}
.title-icon {
  width: 64px;
  height: 64px;
}

.is-36x36 {
  height: 36px;
  width: 36px;
}
.q-tab-panel {
  padding: 0px;
}

.toonin-tabs {
  color: #4296bd;
}
</style>
