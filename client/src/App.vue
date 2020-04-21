<template>
  <v-app>
    <v-toolbar>
      <img style="padding-right:15px" contain src="./assets/icon40.png" />
      <v-toolbar-title class="toonin-title">Toonin</v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- <v-toolbar-items class="hidden-sm-and-down">
        <v-divider inset vertical></v-divider>
        <v-btn text to="/">
          Connect
        </v-btn>

        <v-divider inset vertical></v-divider>

        <v-btn text to="/create">
          Create
        </v-btn>
        <v-divider inset vertical></v-divider>
      </v-toolbar-items> -->
      <v-btn @click="onDarkModeChange" icon>
        <v-icon v-if="$vuetify.theme.dark" color="grey"
          >mdi-lightbulb-outline</v-icon
        >
        <v-icon v-else color="blue">mdi-lightbulb-on-outline</v-icon>
      </v-btn>
      <!-- <v-menu class="hidden-md-and-up">
        <template v-slot:activator="{ on }" class="hidden-md-and-up">
          <v-btn icon v-on="on" class="hidden-md-and-up">
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item to="/">
            <v-list-item-title>Connect</v-list-item-title>
          </v-list-item>
          <v-list-item to="/create">
            <v-list-item-title>Create</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu> -->
    </v-toolbar>
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
    onDarkModeChange() {
      this.$vuetify.theme.dark
        ? (this.$vuetify.theme.dark = false)
        : (this.$vuetify.theme.dark = true);
      window.localStorage.setItem("isDark", this.$vuetify.theme.dark ? 1 : 0);
    }
  },
  mounted: function() {
    this.$vuetify.theme.dark =
      window.localStorage.getItem("isDark") == 1 ? true : false;
  }
};
</script>

<style>
@import url("https://fonts.googleapis.com/css?family=Nunito+Sans:800&display=swap");
:root {
  --color-blue: #4296bd;
  --color-title-text: #f6d45a;
}
.toonin-title {
  font-family: "Nunito Sans", sans-serif;
  font-size: 28px !important ;
  color: var(--color-blue);
}
</style>
