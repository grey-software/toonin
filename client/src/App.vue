<template>
  <v-app>
    <v-toolbar>
      <img style="padding-right:15px" contain src="./assets/icon40.png" />
      <v-toolbar-title class="toonin-title">Toonin</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn @click="onDarkModeChange" icon>
        <v-icon v-if="$vuetify.theme.dark" color="grey"
          >mdi-lightbulb-outline</v-icon
        >
        <v-icon v-else color="blue">mdi-lightbulb-on-outline</v-icon>
      </v-btn>
    </v-toolbar>
    <v-content>
      <router-view></router-view>
    </v-content>
  </v-app>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {};
  },
  methods: {
    onDarkModeChange() {
      this.$vuetify.theme.dark
        ? (this.$vuetify.theme.dark = false)
        : (this.$vuetify.theme.dark = true);
      window.localStorage.setItem('isDark', this.$vuetify.theme.dark ? 1 : 0);
    },
  },
  mounted: function() {
    this.$vuetify.theme.dark =
      window.localStorage.getItem('isDark') == 1 ? true : false;
  },
};
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
