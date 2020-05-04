<template>
  <q-layout
    view="hHh lpR fFf"
    class="column items-center"
  >
    <div
      class="row justify-center items-center q-mt-lg"
      style="width:599px;"
    >
      <div class="row items-baseline ">
        <img
          class="title-icon q-mr-sm"
          src="../assets/icon.png"
        />
        <span class="title-text toonin-title q-mr-xl">Toonin</span>
      </div>
      <q-btn
        class="btn-dark-mode q-mx-sm"
        flat
        round
        @click="onDarkModeChange"
        :icon="$q.dark.isActive ? 'mdi-lightbulb-outline' : 'mdi-lightbulb-on-outline'"
      >
      </q-btn>
    </div>
    <q-tabs
      v-model="tab"
      class="text-teal"
      style="width:599px;"
    >
      <q-tab
        label="Toonin"
        name="toonin"
      />
      <q-tab
        label="Share"
        v-if="!$q.platform.is.mobile"
        name="share"
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
      tab: this.$q.platform.is.mobile ? 'toonin' : 'share'
    }
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

<style scoped>
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

.btn-dark-mode {
  height: 56px;
  width: 56px;
}
</style>
