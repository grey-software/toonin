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

      <q-tabs align="center">
        <q-route-tab
          to="/toonin"
          label="Toonin"
        />
        <q-route-tab
          to="/share"
          label="Share"
        />
        <q-route-tab
          to="/chat"
          label="Chat"
        />
      </q-tabs>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

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
export default {
  data () {
    return {
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
