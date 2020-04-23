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
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>

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
      this.$q.dark.toggle()
      window.localStorage.setItem('isDark', this.$q.dark.isActive ? 1 : 0)
    }
  },
  created () {
    window.localStorage.getItem('isDark') === 1 ? this.$q.dark.set(true) : this.$q.dark.set(false)
  }
}
</script>
