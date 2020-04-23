<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>

        <q-toolbar-title>
          Toonin
        </q-toolbar-title>

        <div>
          <q-btn
            @click="onDarkModeChange"
            :icon="mdi-lightbulb"
          >
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
