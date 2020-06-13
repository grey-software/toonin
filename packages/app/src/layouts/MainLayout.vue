<template>
  <q-layout
    view="hHh lpR fFf"
    class="column items-center col-xs-12 col-sm-6 col-md-4"
  >
    <div class="row items-center q-mt-md">
      <div class="row items-baseline">
        <img
          class="title-icon q-mr-sm"
          src="../assets/icon.png"
        />
        <span class="title-text toonin-title q-mr-md">Toonin</span>
      </div>
      <q-btn
        flat
        fab
        round
        color="toonin"
        @click="onDarkModeChange"
      >
        <q-icon
          class="header-icon"
          v-if="!$q.dark.isActive"
          name="app:moon"
        />
        <q-icon
          class="header-icon"
          v-else
          name="app:sun"
        />
      </q-btn>
      <q-btn
        flat
        fab
        round
        type="a"
        href="https://www.github.com/grey-software/toonin"
        target="_blank"
      >
        <q-icon
          class="header-icon"
          :name="$q.dark.isActive ? 'app:github-dark' : 'app:github'"
        ></q-icon>
      </q-btn>
    </div>
    <q-tabs
      v-model="tab"
      class="toonin-tabs"
      narrow-indicator
      inline-label
      align="center"
      v-if="!$q.platform.is.mobile"
    >
      <q-tab
        label="Toonin"
        name="toonin"
        :icon="$q.dark.isActive ? 'app:toonin-dark' : 'app:toonin'"
      />
      <q-tab
        label="Share"
        name="share"
        icon="mdi-access-point"
      />
    </q-tabs>
    <q-tab-panels
      v-model="tab"
      animated
      class="toonin-tab-panels"
    >
      <q-tab-panel name="toonin">
        <TooninPage />
      </q-tab-panel>
      <q-tab-panel name="share">
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
import SharePage from '../pages/SharePage'
import TooninPage from '../pages/TooninPage'

export default {
  components: {
    SharePage,
    TooninPage
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
    },
    openGuide () {
      // TODO: Implement a modal that guides the user journey
    },

  },
  created () {
    console.log(this.$route.query.room)
    if (this.$route.query.room) {
      this.tab = 'toonin'
    }
  },
  mounted () {
    this.$q.dark.set(window.localStorage.getItem('isDark') === 'true')
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

.header-icon {
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

<style scoped>
.body--dark .toonin-tabs {
  color: #b9bbbe !important;
}

.body--dark .toonin-tab-panels {
  background: #2f3136;
}
</style>
<style scoped>
@media only screen and (max-width: 599px) {
  .header-icon {
    height: 28px;
    width: 28px;
  }

  .title-icon {
    width: 48px;
    height: 48px;
  }

  .title-text {
    font-size: 48px;
    color: #f6d45a;
    -webkit-text-stroke: 1px #4296bd;
  }
}
</style>
