<template>
  <q-layout view="hHh lpR fFf">

    <q-header
      elevated
      class="bg-primary text-white"
      height-hint="98"
    >
      <q-toolbar>
        <q-toolbar-title>
          <q-avatar>
            <img src="../assets/icon40.png">
          </q-avatar>
          Toonin
        </q-toolbar-title>
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
        <q-toolbar-title>
          <q-avatar>
            <img src="https://cdn.quasar.dev/logo/svg/quasar-logo.svg">
          </q-avatar>
          Toonin
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
  }
}
</script>
