<template>
  <v-app>
    <v-app-bar app clipped-left>
      <img style="padding-right:15px" contain src="./assets/icon40.png" />
      <v-toolbar-title>Toonin</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-switch
        style="padding:15px; padding-top: 40px"
        :label="`Dark Mode`"
        v-model="$vuetify.theme.dark"
        ref="darkSwitch"
        @change="onDarkModeChange"
      ></v-switch>
    </v-app-bar>
    <v-content>
      <router-view></router-view>
    </v-content>
  </v-app>
</template>

<script>
export default {
  name: "App",
  data() {
    return {};
  },
  methods: {
    onDarkModeChange() { window.localStorage.setItem('isDark', this.$refs.darkSwitch.appIsDark ? 1 : 0); }
  },
  mounted: function() { 
    this.$refs.darkSwitch.$vuetify.theme.dark = window.localStorage.getItem('isDark') == 1 ? true : false;
  }
};
</script>
