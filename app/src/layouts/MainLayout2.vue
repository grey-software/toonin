<template>
  <q-layout view="hHh lpR fFf">
    <div class="row items-center justify-center q-mt-lg">
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
    <ConnectionStatusTimeline />

    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script>
import ConnectionStatusTimeline from "../components/ConnectionStatusTimeline"
export default {
  components: {
    ConnectionStatusTimeline,
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
